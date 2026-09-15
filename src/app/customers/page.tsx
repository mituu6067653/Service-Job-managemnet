import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { isRoleAllowed } from '@/lib/permissions';
import { AppShell } from '@/components/layout/app-shell';
import CustomerClientView from './customer-client-view';

export default async function CustomersPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Role Gate: Technicians cannot access Customer Directory
  if (!isRoleAllowed(session.role, ['ADMIN', 'MANAGER'])) {
    redirect('/dashboard');
  }

  const customers = await db.customer.findMany({
    where: { businessId: session.businessId, isArchived: false },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
  });

  return (
    <AppShell user={session}>
      <CustomerClientView initialCustomers={customers} />
    </AppShell>
  );
}
