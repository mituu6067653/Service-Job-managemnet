'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Bell, CheckCircle2, Clock, X, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  userName?: string;
  userRole?: string;
  businessName?: string;
  onToggleMobileMenu?: () => void;
}

export function Header({
  userName = 'Admin User',
  userRole = 'ADMIN',
  businessName = 'Business',
  onToggleMobileMenu,
}: HeaderProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 fixed top-0 right-0 left-0 lg:left-64 z-30 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
        {/* Mobile Hamburger Menu Toggle */}
        <button
          type="button"
          onClick={onToggleMobileMenu}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 lg:hidden shrink-0 transition-colors"
          title="Open Menu"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h2 className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
            Operational Control Center
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
            Managing <span className="font-medium text-slate-700">{businessName}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-lg shadow-xl border border-slate-200 z-50 p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">In-App Notifications</h4>
                <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500">No new notifications.</div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-2.5 rounded bg-slate-50 border border-slate-100 space-y-0.5">
                      <div className="text-xs font-bold text-slate-800">{n.title}</div>
                      <div className="text-[11px] text-slate-600">{n.message}</div>
                      <div className="text-[9px] text-slate-400 pt-1">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <div className="flex items-center gap-2 sm:gap-3 border-l border-slate-200 pl-2 sm:pl-4">
          <div className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 font-semibold text-xs shrink-0">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-800 leading-tight max-w-[120px] truncate">{userName}</div>
            <div className="text-[10px] text-slate-500">{userRole}</div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-500 hover:text-rose-600 px-2 sm:px-3"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
