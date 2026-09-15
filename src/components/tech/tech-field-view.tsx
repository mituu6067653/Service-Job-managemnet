'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Phone, MapPin, Navigation, Clock, CheckCircle2, Play, Wrench, AlertCircle } from 'lucide-react';

interface TechFieldViewProps {
  technicianName: string;
  assignedJobs: any[];
}

export function TechFieldView({ technicianName, assignedJobs: initialJobs }: TechFieldViewProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [activeJobId, setActiveJobId] = useState<string | null>(
    initialJobs.find((j) => j.status === 'IN_PROGRESS')?.id || initialJobs[0]?.id || null
  );
  const [workNotes, setWorkNotes] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusUpdate = async (jobId: string, nextStatus: string) => {
    setUpdatingId(jobId);
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, notes: workNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');

      setJobs(jobs.map((j) => (j.id === jobId ? data.job : j)));
      setWorkNotes('');
    } catch (err: any) {
      alert(`Error updating job: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const selectedJob = jobs.find((j) => j.id === activeJobId);

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-12">
      {/* Field Tech Header */}
      <div className="bg-slate-900 text-white p-5 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">Field Worker Portal</span>
          <h1 className="text-xl font-bold">{technicianName}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{jobs.length} Assigned Service Jobs Today</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
          <Wrench className="w-5 h-5" />
        </div>
      </div>

      {/* Assigned Jobs Selector */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">My Assigned Jobs</h2>
        {jobs.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-xs text-slate-500">
              No jobs assigned for today. All caught up!
            </CardContent>
          </Card>
        ) : (
          jobs.map((job) => {
            const isSelected = job.id === activeJobId;
            return (
              <div
                key={job.id}
                onClick={() => setActiveJobId(job.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-white border-brand-500 shadow-md ring-2 ring-brand-500/20'
                    : 'bg-slate-100 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-brand-600">{job.jobCode}</span>
                    <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                  </div>
                  <Badge statusKey={job.status as any}>{job.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1 line-clamp-1">{job.customer?.name} • {job.address}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Active Job Focused Field Worker View */}
      {selectedJob && (
        <Card className="border-2 border-brand-500 shadow-lg">
          <CardHeader className="bg-brand-50 border-b border-brand-100">
            <CardTitle className="text-sm font-bold text-brand-900 flex items-center justify-between">
              <span>ACTIVE JOB #{selectedJob.jobCode}</span>
              <Badge statusKey={selectedJob.status as any}>{selectedJob.status.replace('_', ' ')}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">{selectedJob.title}</h3>
              <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded border border-slate-100">
                {selectedJob.description}
              </p>
            </div>

            {/* Quick Customer Action Bar (Call & Directions) */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`tel:${selectedJob.customer?.phone}`}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Phone className="w-4 h-4" /> Call Customer
              </a>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(selectedJob.address)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                <Navigation className="w-4 h-4" /> Navigate GPS
              </a>
            </div>

            {/* Field Status Actions (Large Touch Targets - Design.md Section 16 Requirement) */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Update Service Progress
              </span>

              {selectedJob.status === 'ASSIGNED' || selectedJob.status === 'SCHEDULED' ? (
                <Button
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold"
                  isLoading={updatingId === selectedJob.id}
                  onClick={() => handleStatusUpdate(selectedJob.id, 'EN_ROUTE')}
                >
                  <Navigation className="w-4 h-4 mr-2" /> Start Travel (En Route)
                </Button>
              ) : selectedJob.status === 'EN_ROUTE' ? (
                <Button
                  className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold"
                  isLoading={updatingId === selectedJob.id}
                  onClick={() => handleStatusUpdate(selectedJob.id, 'IN_PROGRESS')}
                >
                  <Play className="w-4 h-4 mr-2" /> Arrived & Start Work (In Progress)
                </Button>
              ) : selectedJob.status === 'IN_PROGRESS' ? (
                <Button
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold"
                  isLoading={updatingId === selectedJob.id}
                  onClick={() => handleStatusUpdate(selectedJob.id, 'COMPLETED')}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Complete Work
                </Button>
              ) : (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded text-center flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Service Finished & Completed
                </div>
              )}
            </div>

            {/* Field Work Log Entry */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Add Field Work Log / Notes
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Replaced AC capacitor 45MFD, tested cooling at 18°C..."
                value={workNotes}
                onChange={(e) => setWorkNotes(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
