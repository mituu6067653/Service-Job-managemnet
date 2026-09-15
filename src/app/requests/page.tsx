import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/layout/app-shell';
import RequestsClientView from './requests-client-view';

export default async function RequestsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const [requests, customers] = await Promise.all([
    db.serviceRequest.findMany({
      where: { businessId: session.businessId },
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    }),
    db.customer.findMany({
      where: { businessId: session.businessId, isArchived: false },
    }),
  ]);

  return (
    <AppShell user={session}>
      <RequestsClientView initialRequests={requests} customers={customers} />
    </AppShell>
  );
}
