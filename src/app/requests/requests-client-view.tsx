'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, FileSpreadsheet, User, MapPin, Calendar, ArrowRight } from 'lucide-react';

interface RequestsClientViewProps {
  initialRequests: any[];
  customers: any[];
}

export default function RequestsClientView({ initialRequests, customers }: RequestsClientViewProps) {
  const router = useRouter();
  const [requests, setRequests] = useState(initialRequests);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    serviceType: '',
    description: '',
    preferredDate: new Date().toISOString().split('T')[0],
    preferredTime: 'Morning',
    location: '',
    priority: 'MEDIUM',
  });

  const handleCustomerSelect = (customerId: string) => {
    const selected = customers.find((c) => c.id === customerId);
    setFormData({
      ...formData,
      customerId,
      location: selected ? selected.address : formData.location,
    });
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create request');

      setRequests([data.request, ...requests]);
      setIsModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvert = async (requestId: string) => {
    setConvertingId(requestId);
    try {
      const res = await fetch(`/api/service-requests/${requestId}/convert`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Conversion failed');

      router.push(`/jobs/${data.job.id}`);
    } catch (err: any) {
      alert(`Error converting request: ${err.message}`);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Service Requests Inbox</h1>
          <p className="text-sm text-slate-500">Capture incoming customer leads and convert them into dispatches</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Log Service Request
        </Button>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-lg border border-slate-200 p-8">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Service Requests</h3>
            <p className="text-xs text-slate-500 mt-1">Log incoming calls or customer requests to start dispatch.</p>
          </div>
        ) : (
          requests.map((req) => (
            <Card key={req.id} className="hover:border-brand-300 transition-all">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900">{req.serviceType}</h3>
                    <Badge statusKey={req.status as any}>{req.status}</Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1">{req.description}</p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-1">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" /> {req.customer.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {req.location}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {req.preferredDate || 'Flexible'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {req.status !== 'CONVERTED' ? (
                    <Button
                      size="sm"
                      isLoading={convertingId === req.id}
                      onClick={() => handleConvert(req.id)}
                    >
                      Convert to Job <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
                      Converted
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Log Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900">Log Service Request</h3>
            {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleCreateRequest} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Customer
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => handleCustomerSelect(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md"
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
                label="Service Type / Requirement"
                required
                placeholder="e.g. Water Heater Leakage Repair"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
              />

              <Input
                label="Description"
                required
                placeholder="Details of complaint or service requested..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />

              <Input
                label="Location"
                required
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Preferred Date"
                  type="date"
                  value={formData.preferredDate}
                  onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                />
                <Input
                  label="Preferred Time"
                  placeholder="Morning / Afternoon"
                  value={formData.preferredTime}
                  onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Save Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
