import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

const requestSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  serviceType: z.string().min(2, 'Service type is required'),
  description: z.string().min(5, 'Description is required'),
  preferredDate: z.string().optional(),
  preferredTime: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const validated = requestSchema.parse(body);

    const request = await db.serviceRequest.create({
      data: {
        businessId: session.businessId,
        customerId: validated.customerId,
        serviceType: validated.serviceType,
        description: validated.description,
        preferredDate: validated.preferredDate || null,
        preferredTime: validated.preferredTime || null,
        location: validated.location,
        priority: validated.priority,
        status: 'NEW',
      },
      include: { customer: true },
    });

    return NextResponse.json({ success: true, request });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
  }
}
