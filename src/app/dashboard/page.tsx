import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { TechFieldView } from '@/components/tech/tech-field-view';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const businessId = session.businessId;

  // If user is a Technician, render the specialized Field Worker Mobile Portal (PRD 4.3 & Design.md Section 16)
  if (session.role === 'TECHNICIAN') {
    const techUser = await db.user.findUnique({
      where: { id: session.userId },
      include: { technician: true },
    });

    const techProfile = techUser?.technician?.technicianId;

    const assignedJobs = await db.job.findMany({
      where: {
        businessId,
        isArchived: false,
        OR: [
          { technicianId: techProfile || undefined },
          { technician: { email: session.email } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
    });

    return (
      <AppShell user={session}>
        <TechFieldView technicianName={session.name} assignedJobs={assignedJobs} />
      </AppShell>
    );
  }

  // Admin & Manager Dashboard View
  const [
    totalCustomers,
    totalJobs,
    pendingJobsCount,
    inProgressJobsCount,
    completedJobsCount,
    recentJobs,
    technicians,
    unpaidInvoicesSum,
  ] = await Promise.all([
    db.customer.count({ where: { businessId, isArchived: false } }),
    db.job.count({ where: { businessId, isArchived: false } }),
    db.job.count({ where: { businessId, isArchived: false, status: 'SCHEDULED' } }),
    db.job.count({ where: { businessId, isArchived: false, status: 'IN_PROGRESS' } }),
    db.job.count({ where: { businessId, isArchived: false, status: 'COMPLETED' } }),
    db.job.findMany({
      where: { businessId, isArchived: false },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { customer: true, technician: true },
    }),
    db.technician.findMany({
      where: { businessId, isActive: true },
      include: {
        jobs: {
          where: { isArchived: false, status: { in: ['SCHEDULED', 'IN_PROGRESS'] } },
        },
      },
    }),
    db.invoice.aggregate({
      where: { businessId, isArchived: false, status: { in: ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'OVERDUE'] } },
      _sum: { totalAmount: true, paidAmount: true },
    }),
  ]);

  const outstandingBalance =
    (unpaidInvoicesSum._sum.totalAmount || 0) - (unpaidInvoicesSum._sum.paidAmount || 0);

  return (
    <AppShell user={session}>
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-brand-600 to-brand-500 text-white p-6 rounded-xl shadow-md">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Good day, {session.name}</h1>
          <p className="text-brand-100 text-sm mt-1">
            Operational Overview for <span className="font-semibold text-white">{session.businessName}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/jobs"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-lg bg-white text-brand-600 hover:bg-brand-50 transition-colors shadow-sm"
          >
            + Create New Job
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">In-Progress Jobs</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{inProgressJobsCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
              <span className="font-semibold text-slate-700">{totalJobs}</span> total jobs logged
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Schedule</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{pendingJobsCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Awaiting technician route</p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Completed Jobs</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{completedJobsCount}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-3 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> High quality delivery rate
            </p>
          </CardContent>
        </Card>

        <Card className="hover:border-slate-300 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Pending Receivables</p>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(outstandingBalance)}</h3>
              </div>
              <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">Across issued invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Operational Section: Recent Jobs & Technician Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between w-full">
                <span className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-500" />
                  Recent Active Jobs
                </span>
                <Link href="/jobs" className="text-xs text-brand-600 hover:underline flex items-center gap-1 font-semibold">
                  View All Jobs <ArrowRight className="w-3 h-3" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {recentJobs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">No jobs registered yet.</div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentJobs.map((job: any) => (
                    <div key={job.id} className="p-4 hover:bg-slate-50/80 transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-brand-600">{job.jobCode}</span>
                          <h4 className="text-sm font-semibold text-slate-900">{job.title}</h4>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-2">
                          <span>Customer: <strong className="text-slate-700">{job.customer.name}</strong></span>
                          <span>•</span>
                          <span>Tech: <strong className="text-slate-700">{job.technician?.name || 'Unassigned'}</strong></span>
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge statusKey={job.status as any}>{job.status.replace('_', ' ')}</Badge>
                        <Link
                          href={`/jobs/${job.id}`}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Technician Workload Side Column */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-500" />
                Technician Workload
              </CardTitle>
            </CardHeader>
            <CardContent>
              {technicians.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No active technicians registered.</p>
              ) : (
                <div className="space-y-4">
                  {technicians.map((tech: any) => (
                    <div key={tech.id} className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900">{tech.name}</h4>
                        <p className="text-[11px] text-slate-500">{tech.specialization || 'Field Specialist'}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-brand-50 text-brand-700">
                          {tech.jobs.length} Active {tech.jobs.length === 1 ? 'Job' : 'Jobs'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
