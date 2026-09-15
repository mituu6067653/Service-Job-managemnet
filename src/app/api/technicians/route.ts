import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const techSchema = z.object({
  name: z.string().min(2, 'Technician name required'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email().optional().or(z.literal('')),
  specialization: z.string().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const technicians = await db.technician.findMany({
    where: { businessId: session.businessId, isActive: true },
    include: { jobs: true },
  });

  return NextResponse.json({ technicians });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = techSchema.parse(body);

    const technician = await db.technician.create({
      data: {
        businessId: session.businessId,
        name: validated.name,
        phone: validated.phone,
        email: validated.email || null,
        specialization: validated.specialization || null,
      },
    });

    return NextResponse.json({ success: true, technician });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to add technician' }, { status: 500 });
  }
}
