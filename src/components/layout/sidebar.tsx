'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Briefcase,
  Calendar,
  Users,
  UserCheck,
  Receipt,
  CreditCard,
  BarChart3,
  Settings,
  Wrench,
  X,
} from 'lucide-react';

interface SidebarProps {
  businessName?: string;
  role?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({
  businessName = 'ServiceFlow',
  role = 'ADMIN',
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  // Role-Based Navigation Scoping (Architecture Section 7 & Rules Section 6)
  const isTech = role === 'TECHNICIAN';
  const isManager = role === 'MANAGER';
  const isAdmin = role === 'ADMIN';

  const rawNavGroups = [
    {
      group: 'Main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
      ],
    },
    {
      group: 'Operations',
      items: [
        { name: 'Service Requests', href: '/requests', icon: FileSpreadsheet, roles: ['ADMIN', 'MANAGER'] },
        { name: 'Jobs', href: '/jobs', icon: Briefcase, roles: ['ADMIN', 'MANAGER'] },
        { name: 'Schedule', href: '/schedule', icon: Calendar, roles: ['ADMIN', 'MANAGER', 'TECHNICIAN'] },
        { name: 'Technicians', href: '/technicians', icon: UserCheck, roles: ['ADMIN', 'MANAGER'] },
      ],
    },
    {
      group: 'Directory',
      items: [
        { name: 'Customers', href: '/customers', icon: Users, roles: ['ADMIN', 'MANAGER'] },
      ],
    },
    {
      group: 'Finance',
      items: [
        { name: 'Invoices', href: '/invoices', icon: Receipt, roles: ['ADMIN', 'MANAGER'] },
        { name: 'Payments', href: '/payments', icon: CreditCard, roles: ['ADMIN', 'MANAGER'] },
      ],
    },
    {
      group: 'Analytics & Settings',
      items: [
        { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['ADMIN', 'MANAGER'] },
        { name: 'Settings', href: '/settings', icon: Settings, roles: ['ADMIN'] },
      ],
    },
  ];

  // Filter items and groups based on active user role
  const navGroups = rawNavGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role)),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Responsive Drawer / Desktop Fixed Sidebar */}
      <aside
        className={cn(
          'w-64 bg-slate-900 text-slate-300 flex flex-col h-screen fixed left-0 top-0 z-50 border-r border-slate-800 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-white truncate max-w-[130px] leading-tight">
                {businessName}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">
                {role} Panel
              </span>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 -mr-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => {
                        if (onClose) onClose();
                      }}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-brand-500 text-white font-semibold shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                      )}
                    >
                      <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          ServiceFlow v1.0 • {role} Mode
        </div>
      </aside>
    </>
  );
}
