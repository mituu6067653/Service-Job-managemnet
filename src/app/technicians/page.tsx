import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { isRoleAllowed } from '@/lib/permissions';
import { AppShell } from '@/components/layout/app-shell';
import TechClientView from './tech-client-view';

export default async function TechniciansPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Role Gate: Technicians page is ADMIN ONLY
  if (!isRoleAllowed(session.role, ['ADMIN'])) {
    redirect('/dashboard');
  }

  const technicians = await db.technician.findMany({
    where: { businessId: session.businessId, isActive: true },
    include: {
      jobs: {
        where: { isArchived: false },
        include: { customer: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <AppShell user={session}>
      <TechClientView initialTechnicians={technicians} />
    </AppShell>
  );
}
