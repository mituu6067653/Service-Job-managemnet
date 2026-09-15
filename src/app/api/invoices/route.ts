import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Item description required'),
  quantity: z.number().min(1).default(1),
  unitPrice: z.number().min(0),
});

const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  jobId: z.string().optional().or(z.literal('')),
  taxPercent: z.number().min(0).default(18),
  discountAmount: z.number().min(0).default(0),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const invoices = await db.invoice.findMany({
    where: { businessId: session.businessId, isArchived: false },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      job: true,
      items: true,
      payments: true,
    },
  });

  return NextResponse.json({ invoices });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = createInvoiceSchema.parse(body);

    // Calculate subtotal server-side (Architecture 9 requirement)
    let subtotal = 0;
    const itemsData = validated.items.map((item) => {
      const itemTotal = item.quantity * item.unitPrice;
      subtotal += itemTotal;
      return {
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: itemTotal,
      };
    });

    const taxAmount = (subtotal - validated.discountAmount) * (validated.taxPercent / 100);
    const totalAmount = subtotal - validated.discountAmount + taxAmount;

    // Generate Invoice Number e.g. INV-1002
    const count = await db.invoice.count({ where: { businessId: session.businessId } });
    const invoiceNumber = `INV-${1001 + count}`;

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        businessId: session.businessId,
        customerId: validated.customerId,
        jobId: validated.jobId || null,
        subtotal,
        taxAmount,
        discountAmount: validated.discountAmount,
        totalAmount,
        paidAmount: 0,
        status: 'ISSUED',
        dueDate: validated.dueDate || null,
        notes: validated.notes || null,
        items: {
          create: itemsData,
        },
      },
      include: { items: true, customer: true },
    });

    await db.auditLog.create({
      data: {
        businessId: session.businessId,
        userId: session.userId,
        action: 'CREATE_INVOICE',
        entity: 'Invoice',
        entityId: invoice.id,
        metadata: JSON.stringify({ invoiceNumber, totalAmount }),
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
