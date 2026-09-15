'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Plus, Receipt, Printer, DollarSign, User, FileText, CheckCircle2, Eye, X, Wrench } from 'lucide-react';

interface InvoiceClientViewProps {
  initialInvoices: any[];
  customers: any[];
  jobs: any[];
}

export default function InvoiceClientView({ initialInvoices, customers, jobs }: InvoiceClientViewProps) {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Invoice creation form
  const [formData, setFormData] = useState({
    customerId: '',
    jobId: '',
    taxPercent: 18,
    discountAmount: 0,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ description: 'AC Repair & Gas Refill Service', quantity: 1, unitPrice: 2499 }],
  });

  // Payment form
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    method: 'UPI',
    transactionId: '',
    notes: '',
  });

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invoice');

      setInvoices([data.invoice, ...invoices]);
      setIsCreateModalOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: parseFloat(paymentData.amount as any),
          method: paymentData.method,
          transactionId: paymentData.transactionId,
          notes: paymentData.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');

      setInvoices(
        invoices.map((inv) =>
          inv.id === selectedInvoice.id
            ? { ...inv, paidAmount: data.newPaidAmount, status: data.newStatus }
            : inv
        )
      );

      setIsPaymentModalOpen(false);
      setSelectedInvoice(null);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Invoice & Receivables</h1>
          <p className="text-sm text-slate-500">Automated billing, taxes, itemized receipts, and payment tracking</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Generate New Invoice
        </Button>
      </div>

      {/* Invoices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 no-print">
        {invoices.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-lg border border-slate-200 p-8">
            <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No Invoices Issued</h3>
            <p className="text-xs text-slate-500 mt-1">Generate your first invoice for completed service jobs.</p>
          </div>
        ) : (
          invoices.map((inv) => {
            const dueBalance = inv.totalAmount - inv.paidAmount;
            return (
              <Card key={inv.id} className="hover:border-brand-300 transition-all flex flex-col justify-between">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {inv.invoiceNumber}
                    </span>
                    <Badge statusKey={inv.status as any}>{inv.status.replace('_', ' ')}</Badge>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{inv.customer.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-400" /> {inv.customer.phone}
                    </p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-md border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Total Amount:</span>
                      <strong className="text-slate-900">{formatCurrency(inv.totalAmount)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Paid Amount:</span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(inv.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                      <span>Balance Due:</span>
                      <strong className="text-rose-600 font-bold">{formatCurrency(dueBalance)}</strong>
                    </div>
                  </div>
                </CardContent>

                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setIsViewModalOpen(true);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" /> View / Print PDF
                  </Button>

                  {dueBalance > 0 && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setPaymentData({ amount: dueBalance, method: 'UPI', transactionId: '', notes: '' });
                        setIsPaymentModalOpen(true);
                      }}
                    >
                      <DollarSign className="w-3.5 h-3.5 mr-1" /> Collect
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Full Proper Tax Invoice Modal / Print Document */}
      {isViewModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 relative my-8">
            {/* Modal Controls (Hidden in Print) */}
            <div className="no-print flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-500" />
                <h3 className="text-base font-bold text-slate-900">Tax Invoice Layout Preview</h3>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={triggerPrint} className="bg-slate-900 hover:bg-black text-white">
                  <Printer className="w-4 h-4 mr-2" /> Save PDF / Print
                </Button>
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Container */}
            <div className="print-only-container space-y-6 text-slate-900 bg-white">
              {/* Invoice Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">Apex HVAC & Services</h2>
                    <p className="text-xs text-slate-500">102 Industrial Estate, Sector 5, Tech City</p>
                    <p className="text-xs text-slate-500">GSTIN: GSTIN29ABCDE1234F1Z5 • Phone: +91 98765 00000</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-extrabold tracking-widest text-brand-600 block">TAX INVOICE</span>
                  <span className="text-base font-mono font-extrabold text-slate-900 block mt-0.5">{selectedInvoice.invoiceNumber}</span>
                  <span className="text-xs text-slate-500 block">Date: {formatDate(selectedInvoice.createdAt)}</span>
                </div>
              </div>

              {/* Bill To & Status */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider mb-1">Billed To</span>
                  <h4 className="text-sm font-bold text-slate-900">{selectedInvoice.customer.name}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{selectedInvoice.customer.phone}</p>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">{selectedInvoice.customer.address}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Payment Status</span>
                  <Badge statusKey={selectedInvoice.status as any} className="text-xs font-bold px-3 py-1">
                    {selectedInvoice.status.replace('_', ' ')}
                  </Badge>
                  {selectedInvoice.dueDate && (
                    <p className="text-xs text-slate-500 pt-1">Due Date: {selectedInvoice.dueDate}</p>
                  )}
                </div>
              </div>

              {/* Itemized Services Table */}
              <div>
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold uppercase border-b border-slate-200">
                      <th className="p-3 border-r border-slate-200"># Description</th>
                      <th className="p-3 border-r border-slate-200 text-center w-16">Qty</th>
                      <th className="p-3 border-r border-slate-200 text-right w-28">Unit Price</th>
                      <th className="p-3 text-right w-28">Total Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((item: any, idx: number) => (
                        <tr key={item.id || idx}>
                          <td className="p-3 border-r border-slate-200 font-medium text-slate-800">{item.description}</td>
                          <td className="p-3 border-r border-slate-200 text-center">{item.quantity}</td>
                          <td className="p-3 border-r border-slate-200 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="p-3 text-right font-semibold text-slate-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 border-r border-slate-200 font-medium text-slate-800">Field Service & Maintenance</td>
                        <td className="p-3 border-r border-slate-200 text-center">1</td>
                        <td className="p-3 border-r border-slate-200 text-right">{formatCurrency(selectedInvoice.subtotal)}</td>
                        <td className="p-3 text-right font-semibold text-slate-900">{formatCurrency(selectedInvoice.subtotal)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Total Calculation Grid */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal Amount:</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  {selectedInvoice.discountAmount > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Discount Offered:</span>
                      <span className="text-rose-600">- {formatCurrency(selectedInvoice.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>GST Tax (18%):</span>
                    <span>+ {formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-300">
                    <span>Grand Total:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold pt-1">
                    <span>Paid Amount:</span>
                    <span>{formatCurrency(selectedInvoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between text-rose-700 font-extrabold border-t border-dashed border-slate-300 pt-1">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount - selectedInvoice.paidAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Signature Footer */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-6 items-end text-[11px] text-slate-500">
                <div>
                  <h5 className="font-bold text-slate-700 uppercase mb-1">Terms & Conditions</h5>
                  <p>1. Payment is due within the stipulated due date.</p>
                  <p>2. Thank you for doing business with ServiceFlow Apex!</p>
                </div>
                <div className="text-right pt-6">
                  <div className="border-b border-slate-400 w-36 ml-auto mb-1"></div>
                  <span className="font-bold text-slate-800 uppercase block">Authorized Signatory</span>
                  <span className="text-[10px] text-slate-400 block">Apex Service Management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Invoice Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 no-print">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">Generate New Service Invoice</h3>
            {error && <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded">{error}</div>}

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Customer
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              {/* Itemized charges table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-brand-600 font-semibold hover:underline"
                  >
                    + Add Line Item
                  </button>
                </div>

                {formData.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Service / Part description"
                      required
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="col-span-6 px-3 py-1.5 text-xs border border-slate-300 rounded"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      required
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', parseInt(e.target.value) || 1)}
                      className="col-span-2 px-3 py-1.5 text-xs border border-slate-300 rounded text-center"
                    />
                    <input
                      type="number"
                      placeholder="Price ₹"
                      required
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="col-span-4 px-3 py-1.5 text-xs border border-slate-300 rounded"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="GST Tax Rate (%)"
                  type="number"
                  value={formData.taxPercent}
                  onChange={(e) => setFormData({ ...formData, taxPercent: parseFloat(e.target.value) || 0 })}
                />
                <Input
                  label="Discount Amount (₹)"
                  type="number"
                  value={formData.discountAmount}
                  onChange={(e) => setFormData({ ...formData, discountAmount: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Issue Invoice
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Collect Payment Modal */}
      {isPaymentModalOpen && selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 no-print">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in">
            <h3 className="text-lg font-bold text-slate-900">
              Collect Payment - {selectedInvoice.invoiceNumber}
            </h3>

            <form onSubmit={handleRecordPayment} className="space-y-3">
              <Input
                label="Amount to Collect (₹)"
                type="number"
                required
                value={paymentData.amount}
                onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Payment Method
                </label>
                <select
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-md"
                >
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Debit / Credit Card</option>
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <Input
                label="Transaction ID / UTR (Optional)"
                placeholder="UPI Ref / Cheque No."
                value={paymentData.transactionId}
                onChange={(e) => setPaymentData({ ...paymentData, transactionId: e.target.value })}
              />

              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
