import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const customerSchema = z.object({
  name: z.string().min(2, 'Customer name is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';

  const customers = await db.customer.findMany({
    where: {
      businessId: session.businessId,
      isArchived: false,
      OR: search
        ? [
            { name: { contains: search } },
            { phone: { contains: search } },
            { address: { contains: search } },
          ]
        : undefined,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
  });

  return NextResponse.json({ customers });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = customerSchema.parse(body);

    const customer = await db.customer.create({
      data: {
        businessId: session.businessId,
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        address: validated.address,
        notes: validated.notes || null,
      },
    });

    await db.auditLog.create({
      data: {
        businessId: session.businessId,
        userId: session.userId,
        action: 'CREATE_CUSTOMER',
        entity: 'Customer',
        entityId: customer.id,
        metadata: JSON.stringify({ name: customer.name }),
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
