import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { isRoleAllowed } from '@/lib/permissions';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Role Gate: Technicians cannot access Business Reports
  if (!isRoleAllowed(session.role, ['ADMIN', 'MANAGER'])) {
    redirect('/dashboard');
  }

  const businessId = session.businessId;

  const [totalJobs, completedJobs, cancelledJobs, revenueSum, unpaidSum] = await Promise.all([
    db.job.count({ where: { businessId, isArchived: false } }),
    db.job.count({ where: { businessId, isArchived: false, status: 'COMPLETED' } }),
    db.job.count({ where: { businessId, isArchived: false, status: 'CANCELLED' } }),
    db.payment.aggregate({
      where: { businessId },
      _sum: { amount: true },
    }),
    db.invoice.aggregate({
      where: { businessId, isArchived: false, status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
      _sum: { totalAmount: true, paidAmount: true },
    }),
  ]);

  const totalCollected = revenueSum._sum.amount || 0;
  const totalUnpaid = (unpaidSum._sum.totalAmount || 0) - (unpaidSum._sum.paidAmount || 0);

  return (
    <AppShell user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Analytics & Performance</h1>
          <p className="text-sm text-slate-500">Operational KPIs, revenue metrics, job fulfillment efficiency</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue Collected</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(totalCollected)}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outstanding Receivables</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(totalUnpaid)}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Job Completion Rate</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0}%
              </h3>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Cancellation Rate</p>
              <h3 className="text-2xl font-bold text-slate-700 mt-1">
                {totalJobs > 0 ? Math.round((cancelledJobs / totalJobs) * 100) : 0}%
              </h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
