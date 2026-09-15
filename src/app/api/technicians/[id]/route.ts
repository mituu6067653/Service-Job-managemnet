import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const updateTechSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  email: z.string().email().optional().or(z.literal('')),
  specialization: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = updateTechSchema.parse(body);

    const tech = await db.technician.findFirst({
      where: { id: params.id, businessId: session.businessId },
    });

    if (!tech) return NextResponse.json({ error: 'Technician not found' }, { status: 404 });

    const updated = await db.technician.update({
      where: { id: tech.id },
      data: validated,
    });

    await db.auditLog.create({
      data: {
        businessId: session.businessId,
        userId: session.userId,
        action: 'UPDATE_TECHNICIAN',
        entity: 'Technician',
        entityId: tech.id,
      },
    });

    return NextResponse.json({ success: true, technician: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update technician' }, { status: 500 });
  }
}
