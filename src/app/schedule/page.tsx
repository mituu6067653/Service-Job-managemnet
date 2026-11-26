import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent } from '@/components/ui/card';
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
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Calendar & Scheduling</h1>
          <p className="text-xs sm:text-sm text-slate-500">Daily appointment grid, technician slotting, and route dispatching</p>
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-xs sm:text-sm text-slate-500">
                No scheduled jobs found. Dispatch a new job from the Job Engine.
              </CardContent>
            </Card>
          ) : (
            jobs.map((job: any) => (
              <Card key={job.id} className="hover:border-brand-300 transition-all">
                <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 flex flex-col items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono font-bold text-brand-600">{job.jobCode}</span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 break-words">{job.title}</h3>
                        <Badge statusKey={job.status as any}>{job.status.replace('_', ' ')}</Badge>
                      </div>

                      <div className="flex items-center gap-2 sm:gap-3 text-xs text-slate-600 flex-wrap">
                        <span className="flex items-center gap-1 font-semibold text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.customer.name}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {job.address}
                        </span>
                      </div>

                      <div className="text-xs text-brand-700 font-semibold flex items-center gap-1 pt-0.5 flex-wrap">
                        <Clock className="w-3.5 h-3.5 shrink-0" /> Scheduled: {job.scheduledDate || 'Flexible'} ({job.scheduledTime || 'Slot TBD'})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                    <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded font-medium">
                      Tech: {job.technician?.name || 'Unassigned'}
                    </span>
                    <Link href={`/jobs/${job.id}`}>
                      <button className="px-3.5 py-1.5 text-xs font-semibold rounded bg-brand-500 text-white hover:bg-brand-600 transition-colors shadow-sm">
                        Open Job
                      </button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
