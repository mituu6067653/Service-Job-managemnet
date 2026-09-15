import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { code: string } }) {
  const code = params.code.trim().toUpperCase();

  try {
    const job = await db.job.findFirst({
      where: {
        OR: [
          { jobCode: code },
          { customer: { phone: { contains: code } } },
        ],
        isArchived: false,
      },
      include: {
        customer: {
          select: { name: true, phone: true, address: true },
        },
        technician: {
          select: { name: true, phone: true, specialization: true },
        },
        invoices: {
          select: { invoiceNumber: true, totalAmount: true, paidAmount: true, status: true },
        },
      },
    });

    if (!job) {
      return NextResponse.json({ error: 'No active service job found for this code or phone number.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch job status' }, { status: 500 });
  }
}
