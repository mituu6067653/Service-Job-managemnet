'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, UserCheck, Phone, Mail, Wrench, Briefcase } from 'lucide-react';

interface TechClientViewProps {
  initialTechnicians: any[];
}

export default function TechClientView({ initialTechnicians }: TechClientViewProps) {
  const [technicians, setTechnicians] = useState(initialTechnicians);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialization: '',
  });

  const handleAddTech = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/technicians', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add technician');

      setTechnicians([{ ...data.technician, jobs: [] }, ...technicians]);
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', specialization: '' });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Technician Force</h1>
          <p className="text-sm text-slate-500">Field staff directory, skills catalog, and assigned workloads</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Technician
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {technicians.map((t) => (
          <Card key={t.id} className="hover:border-brand-300 transition-all">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                  {t.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs text-brand-600 font-semibold">{t.specialization || 'Field Specialist'}</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.phone}</span>
                </div>
                {t.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.email}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-brand-500" /> Total Jobs Handled:
                </span>
                <span className="text-xs font-bold text-slate-900">{t.jobs?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Tech Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900">Add New Technician</h3>
            {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleAddTech} className="space-y-3">
              <Input
                label="Full Name"
                required
                placeholder="Ramesh Kumar"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Phone Number"
                required
                placeholder="+91 98765 12345"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Email Address (Optional)"
                type="email"
                placeholder="tech@apexhvac.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Specialization / Trade"
                placeholder="e.g. AC Installation, Washing Machine, Electrical"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Save Technician
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
