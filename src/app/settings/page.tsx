import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { isRoleAllowed } from '@/lib/permissions';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Building, ShieldCheck } from 'lucide-react';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Strict Role Gate: Settings is restricted ONLY to ADMIN
  if (!isRoleAllowed(session.role, ['ADMIN'])) {
    redirect('/dashboard');
  }

  const business = await db.business.findUnique({
    where: { id: session.businessId },
  });

  return (
    <AppShell user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Business Profile & Settings</h1>
          <p className="text-sm text-slate-500">Configure business identity, tax credentials, and multi-tenant security</p>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="w-4 h-4 text-brand-500" />
                Workspace Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input label="Business Name" defaultValue={business?.name || ''} readOnly />
              <Input label="Business Unique Slug" defaultValue={business?.slug || ''} readOnly />
              <Input label="Registered Work Email" defaultValue={business?.email || ''} readOnly />
              <Input label="Official Contact Phone" defaultValue={business?.phone || ''} readOnly />
              <Input label="GST / Tax Identification Number" defaultValue={business?.taxNumber || 'GSTIN29ABCDE1234F1Z5'} readOnly />
              <Input label="Operating Headquarter Address" defaultValue={business?.address || ''} readOnly />

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Multi-tenant workspace active
                </span>
                <Button variant="outline" size="sm" disabled>
                  Saved
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
