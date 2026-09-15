'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Plus, Phone, Mail, MapPin, Briefcase, FileText, User } from 'lucide-react';

interface CustomerClientViewProps {
  initialCustomers: any[];
}

export default function CustomerClientView({ initialCustomers }: CustomerClientViewProps) {
  const [customers, setCustomers] = useState(initialCustomers);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    notes: '',
  });

  const handleSearch = async (query: string) => {
    setSearch(query);
    const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      setCustomers(data.customers);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create customer');

      setCustomers([data.customer, ...customers]);
      setIsModalOpen(false);
      setFormData({ name: '', phone: '', email: '', address: '', notes: '' });
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Directory</h1>
          <p className="text-sm text-slate-500">Centralized profile and service history management</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add New Customer
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone number, or address..."
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {customers.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-lg border border-slate-200 p-8">
            <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Customers Found</h3>
            <p className="text-xs text-slate-500 mt-1">Get started by creating your first customer profile.</p>
          </div>
        ) : (
          customers.map((c) => (
            <Card key={c.id} className="hover:border-brand-300 transition-all flex flex-col justify-between">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 font-bold flex items-center justify-center text-sm border border-brand-100">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{c.address}</span>
                  </div>
                </div>

                {c.notes && (
                  <p className="text-[11px] bg-slate-50 p-2 rounded text-slate-500 italic">
                    "{c.notes}"
                  </p>
                )}
              </CardContent>

              <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-brand-500" />
                  <strong>{c._count?.jobs || 0}</strong> Jobs
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{c._count?.invoices || 0}</strong> Invoices
                </span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900">Add New Customer</h3>
            {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <Input
                label="Customer Full Name"
                required
                placeholder="Apex Mall Admin"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Phone Number"
                required
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Email Address"
                type="email"
                placeholder="customer@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Service Address"
                required
                placeholder="Building name, Floor, Street, Landmark"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Input
                label="Notes / Instructions"
                placeholder="e.g. Call before coming, Gate entry required"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Save Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
