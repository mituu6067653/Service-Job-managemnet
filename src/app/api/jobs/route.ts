import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const jobSchema = z.object({
  customerId: z.string().min(1, 'Customer selection is required'),
  title: z.string().min(3, 'Job title is required'),
  description: z.string().min(5, 'Description is required'),
  address: z.string().min(3, 'Service address is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  technicianId: z.string().optional().or(z.literal('')),
  scheduledDate: z.string().optional(),
  scheduledTime: z.string().optional(),
  estimatedCost: z.number().min(0).default(0),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');

  const jobs = await db.job.findMany({
    where: {
      businessId: session.businessId,
      isArchived: false,
      status: status ? status : undefined,
    },
    orderBy: { createdAt: 'desc' },
    include: {
      customer: true,
      technician: true,
      serviceCatalog: true,
    },
  });

  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = jobSchema.parse(body);

    // Generate unique job code e.g. JOB-1003
    const count = await db.job.count({ where: { businessId: session.businessId } });
    const jobCode = `JOB-${1001 + count}`;

    const job = await db.job.create({
      data: {
        jobCode,
        businessId: session.businessId,
        customerId: validated.customerId,
        technicianId: validated.technicianId || null,
        title: validated.title,
        description: validated.description,
        address: validated.address,
        priority: validated.priority,
        scheduledDate: validated.scheduledDate || null,
        scheduledTime: validated.scheduledTime || null,
        estimatedCost: validated.estimatedCost,
        status: validated.technicianId ? 'ASSIGNED' : 'SCHEDULED',
      },
    });

    await db.auditLog.create({
      data: {
        businessId: session.businessId,
        userId: session.userId,
        action: 'CREATE_JOB',
        entity: 'Job',
        entityId: job.id,
        metadata: JSON.stringify({ jobCode, title: job.title }),
      },
    });

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
