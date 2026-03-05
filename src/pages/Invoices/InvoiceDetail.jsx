import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { formatCurrency, formatDate, formatTime } from '../../lib/utils';
import {
    ArrowLeft,
    FileDown,
    Lock,
    Trash2,
    Printer,
    MoreVertical,
    CheckCircle2,
    Clock,
    Calendar,
    Hash,
    Building2,
    CreditCard,
    ShieldCheck,
    AlertCircle,
    FileText,
    Receipt,
    Edit2,
    History,
    ArrowRight,
    RefreshCw,
    User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { Tooltip } from '../../components/ui/Tooltip';
import { Dialog, DialogContent } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import ConfirmModal from '../../components/ui/ConfirmModal';

const ChangeDetails = ({ log }) => {
    if (!log.diff || (!log.diff.before && !log.diff.after)) return null;

    const changes = [];
    const before = log.diff.before || {};
    const after = log.diff.after || {};

    // Standard fields to track
    const fields = [
        { key: 'status', label: 'Status' },
        { key: 'grand_total', label: 'Total Amount', isCurrency: true },
        { key: 'notes', label: 'Remarks' },
        { key: 'due_date', label: 'Due Date', isDate: true },
        { key: 'is_locked', label: 'Lock Status' }
    ];

    fields.forEach(f => {
        const b = before[f.key];
        const a = after[f.key];

        if (a !== undefined && a !== b) {
            changes.push({
                label: f.label,
                before: f.isCurrency ? formatCurrency(b) : f.isDate ? formatDate(b) : String(b || 'None'),
                after: f.isCurrency ? formatCurrency(a) : f.isDate ? formatDate(a) : String(a),
            });
        }
    });

    if (changes.length === 0 && log.action === 'edited') {
        return <p className="text-[9px] text-text/30 mt-1 italic">Line items or metadata adjusted</p>;
    }

    return (
        <div className="mt-2 space-y-1">
            {changes.map((c, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px] font-bold">
                    <span className="text-text/40 uppercase tracking-tighter w-20">{c.label}:</span>
                    <div className="flex items-center gap-2 bg-surface/50 px-2 py-0.5 rounded border border-border/30">
                        <span className="text-text/30 line-through decoration-text/10">{c.before}</span>
                        <ArrowRight size={10} className="text-primary/30" />
                        <span className="text-primary">{c.after}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

const PaymentModal = ({ isOpen, onClose, onConfirm, totalAmount }) => {
    const [mode, setMode] = useState('UPI');
    const [amount, setAmount] = useState(totalAmount);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [transactionId, setTransactionId] = useState('');
    const [notes, setNotes] = useState('');

    const modes = [
        { label: 'UPI / QR', value: 'UPI' },
        { label: 'Bank Transfer', value: 'Bank' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Card Payment', value: 'Card' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        onConfirm({
            payment_mode: mode,
            amount_paid: parseFloat(amount),
            paid_at: new Date(date).toISOString(),
            transaction_id: transactionId,
            notes: notes
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent title="Record Payment" description="Enter the details of the received payment to settle this invoice.">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Method"
                            value={mode}
                            onValueChange={setMode}
                            options={modes}
                        />
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text/40">Amount</label>
                            <input
                                type="number"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-xs font-bold text-text focus:border-primary outline-none"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text/40">Payment Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-xs font-bold text-text focus:border-primary outline-none"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text/40">Transaction Ref / ID</label>
                        <input
                            type="text"
                            placeholder="UTR, Ref number, etc."
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-xs font-bold text-text focus:border-primary outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text/40">Notes</label>
                        <textarea
                            placeholder="Optional payment notes..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-surface border border-border/50 rounded-xl px-4 py-2.5 text-xs font-bold text-text focus:border-primary outline-none h-20 resize-none"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-text/40 hover:bg-surface transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary py-3"
                        >
                            Finalize Payment
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

const InvoiceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [invoice, setInvoice] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const fetchInvoice = async () => {
        try {
            const { data } = await api.get(`/invoices/${id}`);
            setInvoice(data);
        } catch (err) {
            toast.error('Invoice not found');
            navigate('/invoices');
        }
    };

    const fetchHistory = async () => {
        setLoadingHistory(true);
        try {
            const { data } = await api.get(`/invoices/${id}/history`);
            setHistory(data);
        } catch (err) {
            console.error('Failed to load history', err);
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchInvoice(), fetchHistory()]);
            setLoading(false);
        };
        loadAll();
    }, [id]);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);

    const updateStatus = async (status, paymentData = null) => {
        try {
            await api.patch(`/invoices/${id}/status?status=${status}`, paymentData);
            setInvoice({
                ...invoice,
                status,
                payment_details: paymentData,
                is_locked: status === 'paid' ? true : invoice.is_locked
            });
            toast.success(`Marked as ${status}`);
            fetchHistory(); // Refresh history
            setShowPaymentModal(false);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const lockInvoice = async () => {
        try {
            await api.post(`/invoices/${id}/lock`);
            setInvoice({ ...invoice, is_locked: true });
            toast.success('Invoice locked');
            fetchHistory(); // Refresh history
            setShowLockModal(false);
        } catch (err) {
            toast.error('Unauthorized');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/invoices/${id}`);
            toast.success('Invoice deleted');
            navigate('/invoices');
            setShowDeleteModal(false);
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    const downloadPdf = async () => {
        try {
            toast.loading('Preparing PDF...', { id: 'pdf-gen' });
            const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${invoice.invoice_number.replace(/\//g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Download started', { id: 'pdf-gen' });
        } catch (err) {
            toast.error('PDF generation failed', { id: 'pdf-gen' });
        }
    };

    if (loading) return (
        <div className="h-64 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Receipt size={24} className="animate-bounce" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text/30">Syncing Ledger Data...</p>
        </div>
    );

    const isPaid = invoice.status === 'paid';
    const isOverdue = invoice.status === 'overdue';

    return (
        <div className="w-full space-y-5 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-border">
                <div className="flex items-center gap-4">
                    <Tooltip content="Return to Ledger">
                        <button
                            onClick={() => navigate('/invoices')}
                            className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 flex items-center justify-center text-text/40 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    </Tooltip>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight text-text leading-none">{invoice.invoice_number}</h1>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                                }`}>
                                {isPaid ? <ShieldCheck size={10} /> : <Clock size={10} />}
                                {invoice.status}
                            </div>
                            {invoice.is_locked && (
                                <div className="p-0.5 px-2 bg-rose-500/10 text-rose-500 rounded-full border border-rose-500/10 flex items-center gap-1 text-[9px] font-black uppercase">
                                    <Lock size={10} /> Locked
                                </div>
                            )}
                        </div>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center flex-wrap gap-x-4 gap-y-2">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={11} className="text-primary/30" />
                                Issued {formatDate(invoice.created_at)}
                            </span>
                            {invoice.due_date && (
                                <span className="flex items-center gap-1.5">
                                    <Clock size={11} className="text-primary/30" />
                                    Due {formatDate(invoice.due_date)}
                                </span>
                            )}
                            <span className="flex items-center gap-1.5 border-l border-border/50 pl-4">
                                <User size={11} className="text-primary/30" />
                                Prepared by <span className="text-text/60">{invoice.created_by_name || 'System Admin'}</span>
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Tooltip content="Print PDF">
                        <button
                            onClick={downloadPdf}
                            className="h-9 px-4 bg-background border border-border rounded-lg text-text font-bold text-[11px] flex items-center gap-2 transition-all hover:bg-surface shadow-sm"
                        >
                            <Printer size={14} />
                            <span>PDF</span>
                        </button>
                    </Tooltip>

                    {!invoice.is_locked && (
                        <div className="flex items-center gap-2">
                            <Tooltip content="Modify Invoice">
                                <button
                                    onClick={() => navigate(`/invoices/${id}/edit`)}
                                    className="h-9 px-4 bg-background border border-border rounded-lg text-text font-bold text-[11px] flex items-center gap-2 transition-all hover:bg-surface shadow-sm"
                                >
                                    <Edit2 size={14} />
                                    <span>Edit</span>
                                </button>
                            </Tooltip>

                            {invoice.status !== 'sent' && (
                                <Tooltip content="Mark as Sent">
                                    <button
                                        onClick={() => updateStatus('sent')}
                                        className="h-9 px-4 border border-border rounded-lg text-[11px] font-bold text-text/60 hover:bg-surface transition-all"
                                    >
                                        Mark Issued
                                    </button>
                                </Tooltip>
                            )}
                            {invoice.status !== 'paid' && (
                                <Tooltip content="Mark as Paid">
                                    <button
                                        onClick={() => setShowPaymentModal(true)}
                                        className="h-9 px-4 bg-primary text-background rounded-lg text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-sm"
                                    >
                                        Record Payment
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    )}

                    {user?.role === 'super_admin' && (
                        <div className="flex gap-1.5 pl-3 border-l border-border/50 ml-0.5">
                            {!invoice.is_locked && (
                                <Tooltip content="Lock Invoice">
                                    <button onClick={() => setShowLockModal(true)} className="w-9 h-9 bg-surface border border-border/50 flex items-center justify-center text-text/40 hover:text-rose-500 rounded-lg transition-all">
                                        <Lock size={15} />
                                    </button>
                                </Tooltip>
                            )}
                            <Tooltip content="Delete Permanently">
                                <button onClick={() => setShowDeleteModal(true)} className="w-9 h-9 bg-surface border border-border/50 flex items-center justify-center text-text/40 hover:text-rose-500 rounded-lg transition-all">
                                    <Trash2 size={15} />
                                </button>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    {/* Line Items Table */}
                    <div className="card !p-0 overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-surface/50 border-b border-border text-[9px] uppercase tracking-[0.2em] text-text/40 font-black">
                                <tr>
                                    <th className="px-4 py-3 w-10 text-center opacity-50">#</th>
                                    <th className="px-4 py-3 min-w-[200px]">Description</th>
                                    <th className="px-4 py-3">HSN/SAC</th>
                                    <th className="px-4 py-3 text-right">Rate</th>
                                    <th className="px-4 py-3 text-center">Qty</th>
                                    <th className="px-4 py-3 text-center">Tax %</th>
                                    <th className="px-4 py-3 text-right font-black">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {invoice.line_items.map((item, idx) => {
                                    const taxAmount = (item.amount * item.tax_percent) / 100;
                                    const rowTotal = item.amount + taxAmount;
                                    return (
                                        <tr key={idx} className="group hover:bg-primary/[0.01] transition-colors">
                                            <td className="px-4 py-3 text-center text-[10px] font-black text-text/20">{idx + 1}</td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-xs text-text">{item.description}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="font-mono text-[9px] font-bold text-text/30 bg-surface/50 px-1.5 py-0.5 rounded border border-border/50">{item.hsn_code}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-[11px] font-bold text-text/60">{formatCurrency(item.rate)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-surface border border-border/50 text-[10px] font-black text-text/80">{item.quantity}</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <div className="text-[9px] font-black text-text/40 border border-border/50 inline-block px-1.5 py-0.5 rounded uppercase tracking-widest">{item.tax_percent}%</div>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="text-xs font-black text-text tracking-tighter">{formatCurrency(rowTotal)}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Meta Information Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card !p-4 space-y-4 border-border/50 bg-background/50 backdrop-blur-xl relative overflow-hidden group">
                            <div className="flex items-center gap-2 relative z-10">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                    <Building2 size={16} />
                                </div>
                                <h4 className="text-[9px] font-black uppercase text-text/40 tracking-[0.2em]">Entity Details</h4>
                            </div>
                            <div className="relative z-10">
                                <p className="font-black text-base text-text tracking-tight">{invoice.client_snapshot.name}</p>
                                <div className="flex items-start gap-2 mt-3 text-[11px] text-text/50">
                                    <Building2 size={14} className="shrink-0 text-text/20 mt-0.5" />
                                    <p className="leading-relaxed font-bold">{invoice.client_snapshot.address}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2 text-[11px] text-text/50">
                                    <ShieldCheck size={14} className="shrink-0 text-text/20" />
                                    <p className="font-mono font-black uppercase tracking-widest">{invoice.client_snapshot.gstin}</p>
                                </div>
                            </div>
                        </div>

                        {invoice.notes && (
                            <div className="card !p-4 space-y-4 border-border/50 bg-background/50 backdrop-blur-xl group">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                        <AlertCircle size={16} />
                                    </div>
                                    <h4 className="text-[9px] font-black uppercase text-text/40 tracking-[0.2em]">Remarks</h4>
                                </div>
                                <div className="bg-surface/30 p-3 rounded-lg border border-border/50 italic text-[11px] leading-relaxed text-text/60">
                                    {invoice.notes}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Vertical Sidebar: Financial Summary */}
                <div className="space-y-4">
                    <div className="card !p-5 bg-surface/50 border-primary/20 space-y-5 relative overflow-hidden">
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="p-2 bg-primary text-background rounded-lg shadow-sm">
                                <CreditCard size={15} />
                            </div>
                            <h4 className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Payment Summary</h4>
                        </div>

                        <div className="space-y-2.5 relative z-10">
                            <div className="flex justify-between text-[11px] font-bold text-text/40">
                                <span className="uppercase tracking-widest">Subtotal</span>
                                <span>{formatCurrency(invoice.subtotal)}</span>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-border/50">
                                {invoice.igst > 0 ? (
                                    <div className="flex justify-between text-[11px] font-black text-text/60">
                                        <span className="uppercase tracking-widest flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-primary/30" /> IGST
                                        </span>
                                        <span>{formatCurrency(invoice.igst)}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-[11px] font-black text-text/60">
                                            <span className="uppercase tracking-widest flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary/30" /> CGST
                                            </span>
                                            <span>{formatCurrency(invoice.cgst)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black text-text/60">
                                            <span className="uppercase tracking-widest flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary/30" /> SGST
                                            </span>
                                            <span>{formatCurrency(invoice.sgst)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-5 border-t-2 border-primary/10 flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20">Grand Total</span>
                                <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(invoice.grand_total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`card !p-4 border-dashed flex items-center gap-3 transition-all ${isPaid
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                        }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPaid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text/40">Status</div>
                            <div className={`text-[11px] font-black uppercase tracking-widest ${isPaid ? 'text-emerald-500' : 'text-amber-500'
                                }`}>
                                {isPaid ? 'Paid' : 'Unpaid'}
                            </div>
                        </div>
                    </div>

                    {isPaid && invoice.payment_details && (
                        <div className="card !p-4 space-y-4 bg-emerald-500/5 border-emerald-500/20 border-solid">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                                    <CreditCard size={15} />
                                </div>
                                <h4 className="text-[9px] font-black uppercase text-emerald-500 tracking-[0.2em]">Payment Details</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[9px] font-black uppercase text-text/30 tracking-widest">Method</span>
                                    <span className="text-[11px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">{invoice.payment_details.payment_mode}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[9px] font-black uppercase text-text/30 tracking-widest">Paid Amount</span>
                                    <span className="text-[11px] font-black text-text">{formatCurrency(invoice.payment_details.amount_paid)}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[9px] font-black uppercase text-text/30 tracking-widest">Transaction ID</span>
                                    <span className="text-[10px] font-mono font-bold text-text/60 truncate max-w-[120px]">{invoice.payment_details.transaction_id || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                    <span className="text-[9px] font-black uppercase text-text/30 tracking-widest">Payment Date</span>
                                    <span className="text-[10px] font-bold text-text/60">{formatDate(invoice.payment_details.paid_at)}</span>
                                </div>
                                {invoice.payment_details.notes && (
                                    <div className="pt-2 border-t border-emerald-500/10">
                                        <p className="text-[9px] text-emerald-600/60 leading-relaxed font-bold italic">"{invoice.payment_details.notes}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Audit History Section */}
            <div className="space-y-4 pt-8 border-t border-border/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface border border-border/40 rounded-lg text-text/30">
                            <History size={16} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-text">Audit History</h2>
                    </div>
                    <button
                        onClick={fetchHistory}
                        disabled={loadingHistory}
                        className="p-1.5 hover:bg-surface rounded-md text-text/30 hover:text-primary transition-all disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loadingHistory ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="card !p-0 overflow-hidden border-border/40 bg-background/50 backdrop-blur-sm shadow-sm">
                    {history.length > 0 ? (
                        <div className="divide-y divide-border/20">
                            {history.map((log) => (
                                <div key={log.id} className="p-4 flex items-start justify-between hover:bg-primary/[0.01] transition-colors group">
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {log.action === 'created' ? (
                                                <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                    <CheckCircle2 size={14} />
                                                </div>
                                            ) : log.action === 'status_changed' ? (
                                                <div className="w-8 h-8 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center">
                                                    <RefreshCw size={14} />
                                                </div>
                                            ) : log.action === 'edited' ? (
                                                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                                                    <Edit2 size={14} />
                                                </div>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-surface text-text/30 flex items-center justify-center">
                                                    <History size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-text">
                                                <span className="text-primary">{log.user_name}</span>
                                                <span className="text-text/40 font-medium px-2 uppercase tracking-widest text-[9px]">{log.action.replace('_', ' ')}</span>
                                            </p>
                                            <p className="text-[10px] text-text/30 mt-1 flex items-center gap-2">
                                                <Clock size={10} /> {formatDate(log.performed_at)}
                                            </p>
                                            <ChangeDetails log={log} />
                                        </div>
                                    </div>
                                    <div className="text-[9px] font-black uppercase tracking-widest text-text/20 group-hover:text-text/40 transition-colors">
                                        {formatTime(log.performed_at)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center text-text/20">
                            <History size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Record sequence empty</p>
                        </div>
                    )}
                </div>
            </div>
            <PaymentModal
                isOpen={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={(data) => updateStatus('paid', data)}
                totalAmount={invoice.grand_total}
            />

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Invoice?"
                description="This action will permanently delete this invoice. This cannot be undone."
                variant="danger"
            />

            <ConfirmModal
                isOpen={showLockModal}
                onClose={() => setShowLockModal(false)}
                onConfirm={lockInvoice}
                title="Lock Invoice?"
                description="Locking this invoice will prevent any further modifications. This action cannot be undone."
                variant="warning"
                confirmText="Lock Permanently"
            />
        </div>
    );
};

export default InvoiceDetail;
