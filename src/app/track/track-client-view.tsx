'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { Search, Wrench, CheckCircle2, User, Phone, MapPin, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function CustomerTrackClientView() {
  const [code, setCode] = useState('JOB-1001');
  const [job, setJob] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/track/${encodeURIComponent(code)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Job tracking failed');

      setJob(data.job);
    } catch (err: any) {
      setError(err.message);
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  };

  const statusSteps = ['SCHEDULED', 'ASSIGNED', 'EN_ROUTE', 'IN_PROGRESS', 'COMPLETED'];
  const currentStepIndex = job ? statusSteps.indexOf(job.status) : -1;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto w-full space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center font-bold">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">ServiceFlow Customer Portal</h1>
              <p className="text-xs text-slate-500">Live Service Status & Receipt Tracking</p>
            </div>
          </div>
          <Link href="/login" className="text-xs font-semibold text-brand-600 hover:underline">
            Staff Sign In
          </Link>
        </div>

        {/* Track Form Card */}
        <Card className="shadow-sm">
          <CardContent className="pt-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Track Your Service Status
            </h2>
            <p className="text-xs text-slate-600">
              Enter your <strong>Job Reference Code</strong> (e.g. <code>JOB-1001</code>) or registered phone number:
            </p>

            <form onSubmit={handleTrack} className="flex gap-2">
              <div className="flex-1">
                <Input
                  placeholder="JOB-1001 or 9811122334"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" isLoading={isLoading}>
                <Search className="w-4 h-4 mr-1" /> Track
              </Button>
            </form>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs font-medium text-rose-700">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracked Job Results Display */}
        {job && (
          <div className="space-y-5 animate-in fade-in">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                      {job.jobCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  </div>
                  <Badge statusKey={job.status as any}>{job.status.replace('_', ' ')}</Badge>
                </div>

                {/* Status Timeline */}
                <div className="grid grid-cols-5 gap-1.5 text-center pt-2">
                  {statusSteps.map((step, idx) => {
                    const isDone = currentStepIndex >= idx;
                    const isCurrent = currentStepIndex === idx;
                    return (
                      <div
                        key={step}
                        className={`p-2 rounded text-[10px] font-bold ${
                          isCurrent
                            ? 'bg-brand-500 text-white shadow-sm'
                            : isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {step.replace('_', ' ')}
                      </div>
                    );
                  })}
                </div>

                {/* Job & Tech Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase block text-[10px]">Assigned Technician</span>
                    {job.technician ? (
                      <p className="font-semibold text-slate-800 mt-0.5">
                        {job.technician.name} ({job.technician.phone})
                      </p>
                    ) : (
                      <p className="text-slate-500 italic mt-0.5">Technician being assigned...</p>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase block text-[10px]">Service Scheduled</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {job.scheduledDate || 'Flexible'} ({job.scheduledTime || 'Slot TBD'})
                    </p>
                  </div>
                </div>

                {/* Invoice Status if generated */}
                {job.invoices && job.invoices.length > 0 && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Invoice #{job.invoices[0].invoiceNumber}</span>
                      <span>{formatCurrency(job.invoices[0].totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Payment Status:</span>
                      <strong className="text-emerald-600">{job.invoices[0].status}</strong>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-400 py-4 flex items-center justify-center gap-1">
        <ShieldCheck className="w-4 h-4 text-emerald-600" />
        <span>ServiceFlow Real-Time Customer Verification Protocol</span>
      </div>
    </div>
  );
}
