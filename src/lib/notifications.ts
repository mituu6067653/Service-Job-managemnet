import { db } from '@/lib/db';

export async function createNotification({
  businessId,
  title,
  message,
  type = 'INFO',
  link,
}: {
  businessId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT';
  link?: string;
}) {
  try {
    return await db.auditLog.create({
      data: {
        businessId,
        action: `NOTIFICATION_${type}`,
        entity: 'Notification',
        metadata: JSON.stringify({ title, message, link, read: false }),
      },
    });
  } catch (err) {
    console.error('Failed to create notification log:', err);
  }
}
