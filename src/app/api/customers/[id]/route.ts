import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().min(5).optional(),
  notes: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = updateCustomerSchema.parse(body);

    const customer = await db.customer.findFirst({
      where: { id: params.id, businessId: session.businessId },
    });

    if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

    const updated = await db.customer.update({
      where: { id: customer.id },
      data: validated,
    });

    await db.auditLog.create({
      data: {
        businessId: session.businessId,
        userId: session.userId,
        action: 'UPDATE_CUSTOMER',
        entity: 'Customer',
        entityId: customer.id,
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const customer = await db.customer.findFirst({
    where: { id: params.id, businessId: session.businessId },
  });

  if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });

  // Soft delete (Rules 13)
  await db.customer.update({
    where: { id: customer.id },
    data: { isArchived: true },
  });

  await db.auditLog.create({
    data: {
      businessId: session.businessId,
      userId: session.userId,
      action: 'ARCHIVE_CUSTOMER',
      entity: 'Customer',
      entityId: customer.id,
    },
  });

  return NextResponse.json({ success: true, message: 'Customer archived' });
}
