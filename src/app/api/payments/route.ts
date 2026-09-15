import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const paymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice selection required'),
  amount: z.number().min(1, 'Payment amount must be greater than 0'),
  method: z.enum(['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'OTHER']).default('CASH'),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = paymentSchema.parse(body);

    const invoice = await db.invoice.findFirst({
      where: { id: validated.invoiceId, businessId: session.businessId },
    });

    if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

    const newPaidAmount = invoice.paidAmount + validated.amount;
    let newStatus = invoice.status;

    if (newPaidAmount >= invoice.totalAmount) {
      newStatus = 'PAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIALLY_PAID';
    }

    const [payment] = await db.$transaction([
      db.payment.create({
        data: {
          businessId: session.businessId,
          invoiceId: invoice.id,
          amount: validated.amount,
          method: validated.method,
          transactionId: validated.transactionId || null,
          notes: validated.notes || null,
        },
      }),
      db.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
      }),
    ]);

    await db.auditLog.create({
      data: {
        businessId: session.businessId,
        userId: session.userId,
        action: 'RECORD_PAYMENT',
        entity: 'Payment',
        entityId: payment.id,
        metadata: JSON.stringify({ amount: validated.amount, invoiceId: invoice.id }),
      },
    });

    return NextResponse.json({ success: true, payment, newPaidAmount, newStatus });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
