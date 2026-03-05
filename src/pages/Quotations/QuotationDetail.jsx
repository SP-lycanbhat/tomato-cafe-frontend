import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { formatCurrency, formatDate, formatTime } from '../../lib/utils';
import {
    ArrowLeft,
    Download,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    Calendar,
    User,
    Building2,
    Hash,
    MoreHorizontal,
    Trash2,
    History,
    Edit2,
    Printer,
    ShieldCheck,
    AlertCircle,
    RefreshCw,
    CreditCard
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Button } from '../../components/ui/Button';
import { Tooltip } from '../../components/ui/Tooltip';

const QuotationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [quotation, setQuotation] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const fetchQuotation = async () => {
        try {
            const [{ data: qData }, { data: hData }] = await Promise.all([
                api.get(`/quotations/${id}`),
                api.get(`/quotations/${id}/history`)
            ]);
            setQuotation(qData);
            setHistory(hData);
        } catch (err) {
            toast.error('Failed to load quotation details');
            navigate('/quotations');
        }
    };

    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await fetchQuotation();
            setLoading(false);
        };
        loadAll();
    }, [id]);

    const handleUpdateStatus = async (status) => {
        try {
            toast.loading(`Updating status to ${status}...`, { id: 'status-update' });
            await api.put(`/quotations/${id}`, { status });
            toast.success(`Quotation ${status}`, { id: 'status-update' });
            fetchQuotation();
        } catch (err) {
            toast.error('Failed to update status', { id: 'status-update' });
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/quotations/${id}`);
            toast.success('Quotation removed');
            navigate('/quotations');
        } catch (err) {
            toast.error('Failed to delete quotation');
        }
    };

    const downloadPdf = async () => {
        try {
            toast.loading('Generating PDF document...', { id: 'pdf-dl' });
            const response = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quotation_${quotation.quotation_number.replace(/\//g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Downloaded successfully', { id: 'pdf-dl' });
        } catch (err) {
            toast.error('Failed to generate PDF', { id: 'pdf-dl' });
        }
    };

    if (loading) return (
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary animate-pulse">
                <FileText size={24} className="animate-bounce" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text/30">Loading Quotation...</p>
        </div>
    );

    if (!quotation) return null;

    const statusConfig = {
        open: { color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Clock, label: 'Pending Review' },
        approved: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2, label: 'Approved' },
        rejected: { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: XCircle, label: 'Rejected' },
    };

    const currentStatus = statusConfig[quotation.status] || statusConfig.open;

    return (
        <div className="w-full space-y-5 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-border">
                <div className="flex items-center gap-4">
                    <Tooltip content="Return to Quotations">
                        <button
                            onClick={() => navigate('/quotations')}
                            className="w-10 h-10 rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 flex items-center justify-center text-text/40 hover:text-primary hover:border-primary/20 transition-all active:scale-95"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    </Tooltip>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black tracking-tight text-text leading-none">{quotation.quotation_number}</h1>
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${quotation.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'
                                }`}>
                                <currentStatus.icon size={10} />
                                {currentStatus.label}
                            </div>
                        </div>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center flex-wrap gap-x-4 gap-y-2">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={11} className="text-primary/30" />
                                Date: {formatDate(quotation.created_at)}
                            </span>
                            <span className="flex items-center gap-1.5 border-l border-border/50 pl-4">
                                <User size={11} className="text-primary/30" />
                                Prepared by <span className="text-text/60">{quotation.created_by_name || 'System Admin'}</span>
                            </span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Tooltip content="Download PDF">
                        <button
                            onClick={downloadPdf}
                            className="h-9 px-4 bg-background border border-border rounded-lg text-text font-bold text-[11px] flex items-center gap-2 transition-all hover:bg-surface shadow-sm"
                        >
                            <Printer size={14} />
                            <span>PDF</span>
                        </button>
                    </Tooltip>

                    <Tooltip content="Edit Quotation">
                        <button
                            onClick={() => navigate(`/quotations/${id}/edit`)}
                            className="h-9 px-4 bg-background border border-border rounded-lg text-text font-bold text-[11px] flex items-center gap-2 transition-all hover:bg-surface shadow-sm"
                        >
                            <Edit2 size={14} />
                            <span>Edit</span>
                        </button>
                    </Tooltip>

                    {quotation.status === 'open' && (
                        <div className="flex items-center gap-2">
                            <Tooltip content="Approve Quotation">
                                <button
                                    onClick={() => handleUpdateStatus('approved')}
                                    className="h-9 px-4 bg-emerald-500 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center gap-2"
                                >
                                    <CheckCircle2 size={14} />
                                    <span>Approve</span>
                                </button>
                            </Tooltip>
                            <Tooltip content="Reject Quotation">
                                <button
                                    onClick={() => handleUpdateStatus('rejected')}
                                    className="h-9 px-4 bg-rose-500 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider active:scale-95 transition-all shadow-sm flex items-center gap-2"
                                >
                                    <XCircle size={14} />
                                    <span>Reject</span>
                                </button>
                            </Tooltip>
                        </div>
                    )}

                    {user?.role === 'super_admin' && (
                        <div className="flex gap-1.5 pl-3 border-l border-border/50 ml-0.5">
                            <Tooltip content="Delete">
                                <button onClick={() => setIsDeleteModalOpen(true)} className="w-9 h-9 bg-surface border border-border/50 flex items-center justify-center text-text/40 hover:text-rose-500 rounded-lg transition-all">
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
                                    <th className="px-4 py-3 text-right font-black">Total Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {quotation.line_items.map((item, idx) => (
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
                                            <div className="text-xs font-black text-text tracking-tighter">{formatCurrency(item.amount)}</div>
                                        </td>
                                    </tr>
                                ))}
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
                                <h4 className="text-[9px] font-black uppercase text-text/40 tracking-[0.2em]">Customer Details</h4>
                            </div>
                            <div className="relative z-10">
                                <p className="font-black text-base text-text tracking-tight">{quotation.client_snapshot.name}</p>
                                <div className="flex items-start gap-2 mt-3 text-[11px] text-text/50">
                                    <Building2 size={14} className="shrink-0 text-text/20 mt-0.5" />
                                    <p className="leading-relaxed font-bold">{quotation.client_snapshot.address}</p>
                                </div>
                                {quotation.client_snapshot.gstin && (
                                    <div className="flex items-center gap-2 mt-2 text-[11px] text-text/50">
                                        <ShieldCheck size={14} className="shrink-0 text-text/20" />
                                        <p className="font-mono font-black uppercase tracking-widest">{quotation.client_snapshot.gstin}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {quotation.notes && (
                            <div className="card !p-4 space-y-4 border-border/50 bg-background/50 backdrop-blur-xl group">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                        <AlertCircle size={16} />
                                    </div>
                                    <h4 className="text-[9px] font-black uppercase text-text/40 tracking-[0.2em]">Notes</h4>
                                </div>
                                <div className="bg-surface/30 p-3 rounded-lg border border-border/50 italic text-[11px] leading-relaxed text-text/60">
                                    {quotation.notes}
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
                            <h4 className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Quotation Summary</h4>
                        </div>

                        <div className="space-y-2.5 relative z-10">
                            <div className="flex justify-between text-[11px] font-bold text-text/40">
                                <span className="uppercase tracking-widest">Subtotal</span>
                                <span>{formatCurrency(quotation.subtotal)}</span>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-border/50">
                                {quotation.igst > 0 ? (
                                    <div className="flex justify-between text-[11px] font-black text-text/60">
                                        <span className="uppercase tracking-widest flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-primary/30" /> IGST
                                        </span>
                                        <span>{formatCurrency(quotation.igst)}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-[11px] font-black text-text/60">
                                            <span className="uppercase tracking-widest flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary/30" /> CGST
                                            </span>
                                            <span>{formatCurrency(quotation.cgst)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black text-text/60">
                                            <span className="uppercase tracking-widest flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary/30" /> SGST
                                            </span>
                                            <span>{formatCurrency(quotation.sgst)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-5 border-t-2 border-primary/10 flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20">Grand Total</span>
                                <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(quotation.grand_total)}</span>
                            </div>
                        </div>
                    </div>

                    <div className={`card !p-4 border-dashed flex items-center gap-3 transition-all ${quotation.status === 'approved'
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : quotation.status === 'rejected'
                            ? 'bg-rose-500/5 border-rose-500/20'
                            : 'bg-primary/5 border-primary/20'
                        }`}>
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${quotation.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                            quotation.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'
                            }`}>
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text/40">Status</div>
                            <div className={`text-[11px] font-black uppercase tracking-widest ${quotation.status === 'approved' ? 'text-emerald-500' :
                                quotation.status === 'rejected' ? 'text-rose-500' : 'text-primary'
                                }`}>
                                {quotation.status}
                            </div>
                        </div>
                    </div>

                    <div className="card !p-4 space-y-4 border-border/50 bg-background/50 backdrop-blur-xl">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-surface border border-border/40 rounded-lg text-text/30">
                                <Hash size={15} />
                            </div>
                            <h4 className="text-[9px] font-black uppercase text-text/40 tracking-[0.2em]">Information</h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-text/30 uppercase tracking-widest">Valid Until</span>
                                <span className="text-primary font-black">{formatDate(quotation.valid_until)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className="text-text/30 uppercase tracking-widest">Prepared by</span>
                                <span className="text-text/80">{quotation.created_by_name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Audit History Section */}
            <div className="space-y-4 pt-8 border-t border-border/40">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-surface border border-border/40 rounded-lg text-text/30">
                            <History size={16} />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-[0.15em] text-text">Activity History</h2>
                    </div>
                    <button
                        onClick={fetchQuotation}
                        className="p-1.5 hover:bg-surface rounded-md text-text/30 hover:text-primary transition-all"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>

                <div className="card !p-0 overflow-hidden border-border/40 bg-background/50 backdrop-blur-sm shadow-sm">
                    {history.length > 0 ? (
                        <div className="divide-y divide-border/20">
                            {history.map((log, idx) => (
                                <div key={idx} className="p-4 flex items-start justify-between hover:bg-primary/[0.01] transition-colors group">
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
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-surface text-text/30 flex items-center justify-center">
                                                    <History size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[11px] font-bold text-text">
                                                <span className="text-primary">{log.performed_by_name}</span>
                                                <span className="text-text/40 font-medium px-2 uppercase tracking-widest text-[9px]">{log.action.replace('_', ' ')}</span>
                                            </p>
                                            <p className="text-[10px] text-text/30 mt-1 flex items-center gap-2">
                                                <Clock size={10} /> {formatDate(log.performed_at)}
                                            </p>
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
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">No history found</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Quotation?"
                description="This action will permanently delete this quotation. This cannot be undone."
                variant="danger"
                confirmText="Yes, Delete"
            />
        </div>
    );
};

export default QuotationDetail;
