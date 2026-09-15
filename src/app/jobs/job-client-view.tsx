'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Briefcase, Calendar, MapPin, User, Clock, ArrowRight } from 'lucide-react';

interface JobClientViewProps {
  initialJobs: any[];
  customers: any[];
  technicians: any[];
}

export default function JobClientView({ initialJobs, customers, technicians }: JobClientViewProps) {
  const [jobs, setJobs] = useState(initialJobs);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    description: '',
    address: '',
    priority: 'MEDIUM',
    technicianId: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00 AM - 12:00 PM',
    estimatedCost: '1500',
  });

  const filteredJobs = jobs.filter((job) => {
    if (activeTab === 'ALL') return true;
    return job.status === activeTab;
  });

  const handleCustomerChange = (customerId: string) => {
    const selected = customers.find((c) => c.id === customerId);
    setFormData({
      ...formData,
      customerId,
      address: selected ? selected.address : formData.address,
    });
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedCost: parseFloat(formData.estimatedCost) || 0,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create job');

      setJobs([data.job, ...jobs]);
      setIsModalOpen(false);
      setFormData({
        customerId: '',
        title: '',
        description: '',
        address: '',
        priority: 'MEDIUM',
        technicianId: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        scheduledTime: '10:00 AM - 12:00 PM',
        estimatedCost: '1500',
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Job Control Engine</h1>
          <p className="text-sm text-slate-500">Track and manage service operations lifecycle</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Dispatch New Job
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
        {['ALL', 'SCHEDULED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-md transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'bg-white border-x border-t border-slate-200 text-brand-600 border-b-2 border-b-brand-500'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg border border-slate-200 p-8">
            <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Jobs in this category</h3>
            <p className="text-xs text-slate-500 mt-1">Select another tab or create a new job dispatch.</p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <Card key={job.id} className="hover:border-brand-300 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-brand-50 text-brand-700 border border-brand-200">
                      {job.jobCode}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                    <Badge statusKey={job.status as any}>{job.status.replace('_', ' ')}</Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{job.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {job.customer?.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.address}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {job.scheduledDate || 'Flexible'} ({job.scheduledTime || 'N/A'})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 justify-between md:justify-end">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Cost</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(job.estimatedCost)}</span>
                  </div>

                  <Link href={`/jobs/${job.id}`}>
                    <Button variant="outline" size="sm">
                      Manage <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dispatch Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Dispatch New Service Job</h3>
            {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Customer
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Job Title / Primary Service"
                required
                placeholder="e.g. 1.5 Ton Split AC Installation"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />

              <Input
                label="Service Details & Instructions"
                required
                placeholder="Describe problem, requirements, or component symptoms..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Input
                label="Service Location Address"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Assign Technician
                  </label>
                  <select
                    value={formData.technicianId}
                    onChange={(e) => setFormData({ ...formData, technicianId: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="">Unassigned (Schedule later)</option>
                    {technicians.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.specialization || 'Tech'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Scheduled Date"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                />
                <Input
                  label="Estimated Cost (₹)"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Dispatch Job
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
