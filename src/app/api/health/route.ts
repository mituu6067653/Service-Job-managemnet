import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Ping DB
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: 'HEALTHY',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      environment: process.env.NODE_ENV,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: 'UNHEALTHY', error: error.message },
      { status: 500 }
    );
  }
}
