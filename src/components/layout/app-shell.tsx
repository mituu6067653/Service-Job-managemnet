import React from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { JWTPayload } from '@/lib/auth';

interface AppShellProps {
  user: JWTPayload;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar businessName={user.businessName} role={user.role} />
      <Header userName={user.name} userRole={user.role} businessName={user.businessName} />

      <main className="pl-64 pt-16 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
