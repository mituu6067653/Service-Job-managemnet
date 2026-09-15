import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const statusSchema = z.object({
  status: z.enum([
    'SCHEDULED',
    'ASSIGNED',
    'EN_ROUTE',
    'IN_PROGRESS',
    'ON_HOLD',
    'COMPLETED',
    'CANCELLED',
  ]),
  notes: z.string().optional(),
  finalCost: z.number().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = statusSchema.parse(body);

    const job = await db.job.findFirst({
      where: { id: params.id, businessId: session.businessId },
      include: { technician: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Strict Technician Ownership Check: Technician can ONLY update jobs assigned to them
    if (session.role === 'TECHNICIAN') {
      const techUser = await db.user.findUnique({
        where: { id: session.userId },
        include: { technician: true },
      });
      const techProfileId = techUser?.technician?.technicianId;

      const isAssignedToThisTech =
        job.technicianId === techProfileId ||
        (job.technician && job.technician.email === session.email);

      if (!isAssignedToThisTech) {
        return NextResponse.json(
          { error: 'FORBIDDEN: You can only update jobs assigned to your technician profile.' },
          { status: 403 }
        );
      }
    }

    const updated = await db.job.update({
      where: { id: job.id },
      data: {
        status: validated.status,
        notes: validated.notes ? `${job.notes || ''}\n${new Date().toLocaleTimeString()}: ${validated.notes}` : job.notes,
        finalCost: validated.finalCost !== undefined ? validated.finalCost : job.finalCost,
      },
    });

    await db.auditLog.create({
      data: {
        businessId: session.businessId,
        userId: session.userId,
        action: 'UPDATE_JOB_STATUS',
        entity: 'Job',
        entityId: job.id,
        metadata: JSON.stringify({ from: job.status, to: validated.status }),
      },
    });

    return NextResponse.json({ success: true, job: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update job status' }, { status: 500 });
  }
}
