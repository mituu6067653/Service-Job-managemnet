import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { isRoleAllowed } from '@/lib/permissions';
import { AppShell } from '@/components/layout/app-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

export default async function PaymentsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  // Role Gate: Technicians cannot access Payments Ledger
  if (!isRoleAllowed(session.role, ['ADMIN', 'MANAGER'])) {
    redirect('/dashboard');
  }

  const payments = await db.payment.findMany({
    where: { businessId: session.businessId },
    orderBy: { createdAt: 'desc' },
    include: {
      invoice: {
        include: { customer: true },
      },
    },
  });

  return (
    <AppShell user={session}>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Payments Log</h1>
          <p className="text-xs sm:text-sm text-slate-500">Real-time ledger of recorded payments, UPI UTR numbers, and receipts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CreditCard className="w-4 h-4 text-brand-500 shrink-0" />
              Recorded Transactions Ledger
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {payments.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-sm">No payment records logged yet.</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {payments.map((p: any) => (
                  <div key={p.id} className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {p.method}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          Invoice: {p.invoice.invoiceNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 flex items-center gap-2 flex-wrap">
                        <span>Customer: <strong>{p.invoice.customer.name}</strong></span>
                        {p.transactionId && (
                          <span>• Ref/UTR: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">{p.transactionId}</code></span>
                        )}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <span className="text-sm sm:text-base font-bold text-emerald-600 block">
                        + {formatCurrency(p.amount)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">{formatDate(p.paymentDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
