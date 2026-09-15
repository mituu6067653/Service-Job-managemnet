import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { isRoleAllowed } from '@/lib/permissions';
import { AppShell } from '@/components/layout/app-shell';
import JobDetailClientView from './job-detail-client-view';

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) redirect('/login');

  // Role Gate: Technicians cannot access Admin Job detail page
  if (!isRoleAllowed(session.role, ['ADMIN', 'MANAGER'])) {
    redirect('/dashboard');
  }

  const job = await db.job.findFirst({
    where: { id: params.id, businessId: session.businessId },
    include: {
      customer: true,
      technician: true,
      serviceCatalog: true,
      invoices: {
        include: { payments: true },
      },
    },
  });

  if (!job) notFound();

  const technicians = await db.technician.findMany({
    where: { businessId: session.businessId, isActive: true },
  });

  return (
    <AppShell user={session}>
      <JobDetailClientView job={job} technicians={technicians} />
    </AppShell>
  );
}
