import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const request = await db.serviceRequest.findFirst({
      where: { id: params.id, businessId: session.businessId },
      include: { customer: true },
    });

    if (!request) return NextResponse.json({ error: 'Service Request not found' }, { status: 404 });

    const count = await db.job.count({ where: { businessId: session.businessId } });
    const jobCode = `JOB-${1001 + count}`;

    const [job] = await db.$transaction([
      db.job.create({
        data: {
          jobCode,
          businessId: session.businessId,
          customerId: request.customerId,
          requestId: request.id,
          title: request.serviceType,
          description: request.description,
          address: request.location,
          priority: request.priority,
          scheduledDate: request.preferredDate || new Date().toISOString().split('T')[0],
          scheduledTime: request.preferredTime || '10:00 AM - 01:00 PM',
          status: 'SCHEDULED',
          estimatedCost: 1500,
        },
      }),
      db.serviceRequest.update({
        where: { id: request.id },
        data: { status: 'CONVERTED' },
      }),
    ]);

    await db.auditLog.create({
      data: {
        businessId: session.businessId,
        userId: session.userId,
        action: 'CONVERT_REQUEST_TO_JOB',
        entity: 'Job',
        entityId: job.id,
        metadata: JSON.stringify({ requestId: request.id, jobCode }),
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to convert request to job' }, { status: 500 });
  }
}
