'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Wrench, ShieldCheck, UserCheck, KeyRound, Briefcase, Search } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fillAdminCredentials = () => {
    setFormData({ email: 'admin@apexhvac.com', password: 'admin123' });
    setError('');
  };

  const fillManagerCredentials = () => {
    setFormData({ email: 'manager@apexhvac.com', password: 'manager123' });
    setError('');
  };

  const fillTechCredentials = () => {
    setFormData({ email: 'vikram@apexhvac.com', password: 'tech123' });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500 text-white mb-3 shadow-md">
          <Wrench className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to ServiceFlow</h2>
        <p className="mt-1 text-sm text-slate-600">Centralized Service & Job Management Platform</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Quick Demo Autofill Bar */}
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3.5 space-y-2 text-center">
          <span className="text-xs font-bold text-blue-900 flex items-center justify-center gap-1">
            <KeyRound className="w-3.5 h-3.5 text-brand-600" /> Demo Quick Login (Click to Autofill):
          </span>
          <div className="grid grid-cols-3 gap-1.5 pt-1">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="px-2 py-1.5 text-[11px] font-semibold rounded bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 shadow-sm transition-all flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3 h-3 text-brand-500" /> Admin
            </button>
            <button
              type="button"
              onClick={fillManagerCredentials}
              className="px-2 py-1.5 text-[11px] font-semibold rounded bg-white text-purple-800 border border-purple-200 hover:bg-purple-50 shadow-sm transition-all flex items-center justify-center gap-1"
            >
              <Briefcase className="w-3 h-3 text-purple-600" /> Manager
            </button>
            <button
              type="button"
              onClick={fillTechCredentials}
              className="px-2 py-1.5 text-[11px] font-semibold rounded bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 shadow-sm transition-all flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-emerald-600" /> Tech
            </button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            {error && (
              <div className="mb-4 p-3 rounded-md bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                required
                placeholder="admin@serviceflow.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />

              <Input
                label="Password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />

              <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <Link href="/register" className="font-semibold text-brand-500 hover:text-brand-600">
                Register Business
              </Link>
              <Link href="/track" className="font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                <Search className="w-3.5 h-3.5" /> Customer Track Portal
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
