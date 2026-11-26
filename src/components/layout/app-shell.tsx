'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { JWTPayload } from '@/lib/auth';

interface AppShellProps {
  user: JWTPayload;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar
        businessName={user.businessName}
        role={user.role}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      <Header
        userName={user.name}
        userRole={user.role}
        businessName={user.businessName}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      <main className="lg:pl-64 pt-16 min-h-screen w-full flex-1">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
