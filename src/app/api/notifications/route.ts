import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const notifications = await db.auditLog.findMany({
    where: {
      businessId: session.businessId,
      entity: 'Notification',
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const parsed = notifications.map((n: { id: string; action: string; metadata: string | null; createdAt: Date }) => {
    let meta = { title: n.action, message: '', read: false };
    try {
      meta = JSON.parse(n.metadata || '{}');
    } catch (e) {}
    return {
      id: n.id,
      title: meta.title || n.action,
      message: meta.message || '',
      createdAt: n.createdAt,
    };
  });

  return NextResponse.json({ notifications: parsed });
}
