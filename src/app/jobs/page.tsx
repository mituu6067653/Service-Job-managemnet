import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { isRoleAllowed } from '@/lib/permissions';
import { AppShell } from '@/components/layout/app-shell';
import JobClientView from './job-client-view';

export default async function JobsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Role Gate: Technicians cannot access Admin Job Control Engine
  if (!isRoleAllowed(session.role, ['ADMIN', 'MANAGER'])) {
    redirect('/dashboard');
  }

  const [jobs, customers, technicians] = await Promise.all([
    db.job.findMany({
      where: { businessId: session.businessId, isArchived: false },
      orderBy: { createdAt: 'desc' },
      include: { customer: true, technician: true, serviceCatalog: true },
    }),
    db.customer.findMany({
      where: { businessId: session.businessId, isArchived: false },
    }),
    db.technician.findMany({
      where: { businessId: session.businessId, isActive: true },
    }),
  ]);

  return (
    <AppShell user={session}>
      <JobClientView initialJobs={jobs} customers={customers} technicians={technicians} />
    </AppShell>
  );
}
