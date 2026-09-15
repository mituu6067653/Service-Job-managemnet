import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { isRoleAllowed } from '@/lib/permissions';
import { AppShell } from '@/components/layout/app-shell';
import InvoiceClientView from './invoice-client-view';

export default async function InvoicesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Role Gate: Technicians cannot access Invoices & Financials
  if (!isRoleAllowed(session.role, ['ADMIN', 'MANAGER'])) {
    redirect('/dashboard');
  }

  const [invoices, customers, jobs] = await Promise.all([
    db.invoice.findMany({
      where: { businessId: session.businessId, isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: { customer: true, job: true, items: true, payments: true },
    }),
    db.customer.findMany({
      where: { businessId: session.businessId, isArchived: false },
    }),
    db.job.findMany({
      where: { businessId: session.businessId, isArchived: false },
    }),
  ]);

  return (
    <AppShell user={session}>
      <InvoiceClientView initialInvoices={invoices} customers={customers} jobs={jobs} />
    </AppShell>
  );
}
