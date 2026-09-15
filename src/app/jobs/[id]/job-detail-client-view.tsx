'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  UserCheck,
  CheckCircle2,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface JobDetailClientViewProps {
  job: any;
  technicians: any[];
}

export default function JobDetailClientView({ job: initialJob, technicians }: JobDetailClientViewProps) {
  const [job, setJob] = useState(initialJob);
  const [status, setStatus] = useState(job.status);
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const statusSteps = ['SCHEDULED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    setUpdateMessage('');

    try {
      const res = await fetch(`/api/jobs/${job.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, notes }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status update failed');

      setJob(data.job);
      setStatus(data.job.status);
      setNotes('');
      setUpdateMessage('Job status updated successfully!');
    } catch (err: any) {
      setUpdateMessage(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const currentStepIndex = statusSteps.indexOf(job.status);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link href="/jobs" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Job Directory
        </Link>
        <Badge statusKey={job.status as any} className="text-xs px-3 py-1">
          {job.status.replace('_', ' ')}
        </Badge>
      </div>

      {/* Header Info */}
      <Card>
        <CardContent className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {job.jobCode}
              </span>
              <h1 className="text-xl font-bold text-slate-900">{job.title}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">Priority: <strong className="text-slate-700">{job.priority}</strong> • Scheduled: {job.scheduledDate || 'Flexible'}</p>
          </div>

          <div className="flex items-center gap-3">
            {job.invoices.length === 0 ? (
              <Link href={`/invoices?createForJob=${job.id}`}>
                <Button variant="primary">
                  <FileText className="w-4 h-4 mr-2" /> Generate Invoice
                </Button>
              </Link>
            ) : (
              <Link href={`/invoices`}>
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" /> View Invoice ({job.invoices[0].invoiceNumber})
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Workflow Timeline (Design.md Section 15 Requirement) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs uppercase font-bold tracking-wider text-slate-500">
            Job Lifecycle Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
            {statusSteps.map((step, idx) => {
              const isDone = currentStepIndex >= idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div
                  key={step}
                  className={`p-3 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-brand-500 text-white border-brand-600 shadow-sm'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-50 text-slate-400 border-slate-200'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{step.replace('_', ' ')}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Grid: Details & Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Customer & Service Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4 text-brand-500" />
                Customer & Location Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block">Customer Name</span>
                  <span className="font-semibold text-slate-900">{job.customer.name}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block">Contact Phone</span>
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {job.customer.phone}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-400 font-semibold uppercase block">Service Address</span>
                <span className="text-slate-800 flex items-start gap-1 mt-0.5">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" /> {job.address}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-500" />
                Work Details & Description
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Issue Description</span>
                <p className="p-3 rounded-md bg-slate-50 border border-slate-100 text-slate-800">{job.description}</p>
              </div>

              {job.notes && (
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase block mb-1">Technician Work Logs</span>
                  <pre className="p-3 rounded-md bg-slate-900 text-slate-100 text-xs font-mono whitespace-pre-wrap">
                    {job.notes}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Status Transition Controller */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-brand-500" />
                Assigned Technician
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.technician ? (
                <div className="space-y-2">
                  <div className="text-sm font-bold text-slate-900">{job.technician.name}</div>
                  <div className="text-xs text-slate-500">{job.technician.specialization}</div>
                  <div className="text-xs text-slate-600 flex items-center gap-1 pt-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {job.technician.phone}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">No technician assigned yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Update Job Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {updateMessage && (
                <div className="text-xs p-2.5 rounded bg-blue-50 text-blue-700 font-medium">{updateMessage}</div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Next Status Phase
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {statusSteps.concat(['ON_HOLD', 'CANCELLED']).map((s) => (
                    <option key={s} value={s}>
                      {s.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Update Log / Note
                </label>
                <textarea
                  rows={3}
                  placeholder="Add notes about parts replaced, inspection done..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <Button
                className="w-full"
                isLoading={isUpdating}
                onClick={() => handleStatusChange(status)}
              >
                Apply Status Change
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
