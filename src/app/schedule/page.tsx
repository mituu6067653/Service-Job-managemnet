import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon, Clock, User, MapPin } from 'lucide-react';
import Link from 'next/link';

export default async function SchedulePage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const jobs = await db.job.findMany({
    where: { businessId: session.businessId, isArchived: false },
    orderBy: { scheduledDate: 'asc' },
    include: { customer: true, technician: true },
  });

  return (
    <AppShell user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar & Scheduling</h1>
          <p className="text-sm text-slate-500">Daily appointment grid, technician slotting, and route dispatching</p>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:border-brand-300 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex flex-col items-center justify-center shrink-0">
                    <CalendarIcon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-brand-600">{job.jobCode}</span>
                      <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                      <Badge statusKey={job.status as any}>{job.status.replace('_', ' ')}</Badge>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <User className="w-3.5 h-3.5 text-slate-400" /> {job.customer.name}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.address}
                      </span>
                    </div>

                    <div className="text-xs text-brand-700 font-semibold flex items-center gap-1 pt-1">
                      <Clock className="w-3.5 h-3.5" /> Scheduled: {job.scheduledDate || 'Flexible'} ({job.scheduledTime || 'Slot TBD'})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">
                    Tech: {job.technician?.name || 'Unassigned'}
                  </span>
                  <Link href={`/jobs/${job.id}`}>
                    <button className="px-3 py-1.5 text-xs font-semibold rounded bg-brand-500 text-white hover:bg-brand-600 transition-colors">
                      Open Job
                    </button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
