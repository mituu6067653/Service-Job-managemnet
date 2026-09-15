export const DESIGN_TOKENS = {
  colors: {
    primary: '#2563EB',
    primaryDark: '#1D4ED8',
    background: '#F8FAFC',
    surface: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0284C7',
  },
  statusStyles: {
    // Job Statuses
    SCHEDULED: 'bg-blue-50 text-blue-700 border-blue-200',
    ASSIGNED: 'bg-purple-50 text-purple-700 border-purple-200',
    EN_ROUTE: 'bg-amber-50 text-amber-700 border-amber-200',
    IN_PROGRESS: 'bg-sky-50 text-sky-700 border-sky-200',
    ON_HOLD: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    COMPLETED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200',

    // Request Statuses
    NEW: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CONTACTED: 'bg-blue-50 text-blue-700 border-blue-200',
    CONVERTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',

    // Invoice Statuses
    DRAFT: 'bg-slate-100 text-slate-700 border-slate-200',
    ISSUED: 'bg-blue-50 text-blue-700 border-blue-200',
    PARTIALLY_PAID: 'bg-amber-50 text-amber-700 border-amber-200',
    PAID: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    OVERDUE: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  priorities: {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-amber-100 text-amber-700',
    URGENT: 'bg-rose-100 text-rose-700 font-semibold',
  }
};
