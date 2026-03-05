import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
    Plus,
    Search,
    FileDown,
    Eye,
    Download,
    FileText,
    Filter,
    Calendar,
    ArrowRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileMinus,
    Printer,
    FileSpreadsheet,
    ShieldCheck,
    X,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '../../components/ui/Dialog';
import { Tooltip } from '../../components/ui/Tooltip';
import { Select } from '../../components/ui/Select';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronDown } from 'lucide-react';

const InvoiceList = () => {
    const [invoices, setInvoices] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('all');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportDates, setExportDates] = useState({ start: '', end: '' });
    const [selectedIds, setSelectedIds] = useState([]);
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

    const { user } = useAuth();

    const fetchData = async () => {
        try {
            const [invoicesRes, clientsRes] = await Promise.all([
                api.get('/invoices'),
                api.get('/clients')
            ]);
            setInvoices(invoicesRes.data);
            setClients(clientsRes.data);
        } catch (err) {
            toast.error('Failed to sync ledger data');
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = async (id, number) => {
        try {
            toast.loading('Preparing PDF...', { id: 'pdf-list' });
            const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice_${number.replace(/\//g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Download started', { id: 'pdf-list' });
        } catch (err) {
            toast.error('PDF generation failed', { id: 'pdf-list' });
        }
    };

    const handleExportExcel = async () => {
        if (!exportDates.start || !exportDates.end) return toast.error('Select date range');
        try {
            toast.loading('Generating Excel...', { id: 'excel-export' });
            const response = await api.get(`/invoices/export/excel`, {
                params: { start_date: exportDates.start, end_date: exportDates.end },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoices_${exportDates.start}_to_${exportDates.end}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Excel downloaded', { id: 'excel-export' });
            setIsExportModalOpen(false);
        } catch (err) {
            toast.error('Export failed', { id: 'excel-export' });
        }
    };

    const handleMonthSelect = (type) => {
        const end = new Date();
        const start = new Date();
        if (type === 'last-month') {
            start.setMonth(start.getMonth() - 1); start.setDate(1); end.setDate(0);
        } else {
            start.setMonth(start.getMonth() - type); start.setDate(1);
        }
        setExportDates({ start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] });
    };

    useEffect(() => { fetchData(); }, []);

    const monthOptions = invoices.reduce((acc, inv) => {
        const date = new Date(inv.created_at);
        const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc.find(opt => opt.value === monthValue)) {
            acc.push({ label: monthLabel, value: monthValue });
        }
        return acc;
    }, []).sort((a, b) => b.value.localeCompare(a.value));

    const filteredInvoices = invoices.filter(inv => {
        const matchesSearch = inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
            inv.client_snapshot.name.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

        const clientId = inv.client_snapshot?.id || inv.client_snapshot?._id || inv.client_id;
        const matchesClient = clientFilter === 'all' || clientId === clientFilter;

        const invDate = new Date(inv.created_at);
        const invMonth = `${invDate.getFullYear()}-${String(invDate.getMonth() + 1).padStart(2, '0')}`;
        const matchesMonth = monthFilter === 'all' || invMonth === monthFilter;

        return matchesSearch && matchesStatus && matchesClient && matchesMonth;
    });

    const statuses = ['all', 'draft', 'sent', 'paid', 'overdue'];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'paid': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
            case 'overdue': return { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle };
            case 'sent': return { color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Clock };
            default: return { color: 'text-text/40', bg: 'bg-surface', icon: FileText };
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredInvoices.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredInvoices.map(inv => inv.id));
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };


    const handleBulkDelete = async () => {
        try {
            toast.loading('Purging records...', { id: 'bulk-delete' });
            await api.post('/invoices/bulk-delete', { ids: selectedIds });
            toast.success(`${selectedIds.length} Invoices removed`, { id: 'bulk-delete' });
            setSelectedIds([]);
            fetchData();
        } catch (err) {
            toast.error('Bulk deletion failed', { id: 'bulk-delete' });
        }
    };

    const handleBulkExportExcel = async () => {
        try {
            toast.loading('Generating consolidated report...', { id: 'bulk-excel' });
            const response = await api.get(`/invoices/export/excel`, {
                params: { invoice_ids: selectedIds.join(',') },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Consolidated_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Excel downloaded', { id: 'bulk-excel' });
            setSelectedIds([]);
        } catch (err) {
            toast.error('Export failed', { id: 'bulk-excel' });
        }
    };

    const handleBulkPrint = async () => {
        try {
            toast.loading('Generating documents...', { id: 'bulk-pdf' });
            const response = await api.get('/invoices/bulk-pdf', {
                params: { ids: selectedIds.join(',') },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Consolidated_Invoices_${new Date().toISOString().split('T')[0]}.zip`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success(`${selectedIds.length} Invoices zipped and downloaded`, { id: 'bulk-pdf' });
            setSelectedIds([]);
        } catch (err) {
            toast.error('Bulk PDF generation failed', { id: 'bulk-pdf' });
        }
    };

    return (
        <div className="space-y-4 w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-text leading-none">Invoice Ledger</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            {invoices.length} Documents
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Tooltip content="Export">
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="h-9 px-3 bg-background/50 border border-border/50 rounded-lg text-text/60 hover:text-text transition-all flex items-center justify-center group"
                        >
                            <Download size={16} />
                        </button>
                    </Tooltip>
                    <Link to="/invoices/create" className="btn-primary h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm font-bold">
                        <Plus size={16} />
                        <span>New Invoice</span>
                    </Link>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col xl:flex-row gap-4 items-center">
                <div className="flex flex-col lg:flex-row gap-3 items-center flex-1 w-full">
                    <div className="relative w-full lg:w-48 group">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors z-10" />
                        <input
                            placeholder="Universal Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field w-full pl-10 h-10 bg-background/50 backdrop-blur-sm border-border/50 focus:ring-2 ring-primary/20 transition-all text-[11px] font-bold"
                        />
                    </div>

                    <div className="flex gap-3 w-full lg:w-auto">
                        <Select
                            value={clientFilter}
                            onValueChange={setClientFilter}
                            placeholder="All Clients"
                            className="w-full lg:w-48"
                            options={[
                                { label: 'All Clients', value: 'all' },
                                ...clients.map(c => ({ label: c.name, value: c.id }))
                            ]}
                        />
                        <Select
                            value={monthFilter}
                            onValueChange={setMonthFilter}
                            placeholder="All Time"
                            className="w-full lg:w-40"
                            options={[
                                { label: 'All Time', value: 'all' },
                                ...monthOptions
                            ]}
                        />
                    </div>
                </div>

                <div className="flex p-1 bg-surface border border-border/40 rounded-xl w-full xl:w-auto overflow-x-auto no-scrollbar shadow-sm">
                    {statuses.map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${statusFilter === s
                                ? 'bg-background text-text shadow-sm ring-1 ring-black/5'
                                : 'text-text/30 hover:text-text/60'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Invoices Table */}
            <div className="card !p-0 overflow-hidden border-border/50 bg-background/40 backdrop-blur-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface border-b border-border text-[9px] uppercase tracking-[0.2em] text-text/40 font-black">
                            <tr>
                                <th className="px-5 py-3 w-10">
                                    <button
                                        onClick={toggleSelectAll}
                                        className="w-5 h-5 transition-all flex items-center justify-center text-primary"
                                    >
                                        {selectedIds.length === filteredInvoices.length && filteredInvoices.length > 0
                                            ? <Check size={16} strokeWidth={4} />
                                            : <div className="w-3.5 h-3.5 rounded border border-text/10 hover:border-text/30 transition-all" />
                                        }
                                    </button>
                                </th>
                                <th className="px-5 py-3">Serial</th>
                                <th className="px-5 py-3">Beneficiary</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Total</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredInvoices.map((inv) => {
                                const styles = getStatusStyles(inv.status);
                                const StatusIcon = styles.icon;
                                const isSelected = selectedIds.includes(inv.id);
                                return (
                                    <tr key={inv.id} className={`hover:bg-primary/[0.01] transition-colors group ${isSelected ? 'bg-primary/[0.02]' : ''}`}>
                                        <td className="px-5 py-3.5">
                                            <button
                                                onClick={() => toggleSelect(inv.id)}
                                                className="w-5 h-5 transition-all flex items-center justify-center text-primary"
                                            >
                                                {isSelected
                                                    ? <Check size={16} strokeWidth={4} />
                                                    : <div className="w-3.5 h-3.5 rounded border border-text/10 hover:border-text/30 transition-all" />
                                                }
                                            </button>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono text-xs font-black tracking-tighter text-text/70">{inv.invoice_number}</span>
                                        </td>
                                        <td className="px-5 py-3.5 border-l border-border/5">
                                            <div className="font-bold text-[13px] text-text tracking-tight leading-tight">{inv.client_snapshot.name}</div>
                                            <div className="text-[9px] text-text/30 font-medium">{inv.client_snapshot.company_name}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-[11px] font-medium text-text/50">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={11} className="text-primary/20" />
                                                {formatDate(inv.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="text-[13px] font-black text-text">{formatCurrency(inv.grand_total)}</div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${styles.bg} ${styles.color}`}>
                                                <StatusIcon size={9} />
                                                {inv.status}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                <Tooltip content="View">
                                                    <Link
                                                        to={`/invoices/${inv.id}`}
                                                        className="p-1.5 bg-surface text-text/40 hover:text-primary rounded-lg border border-border/50 transition-all"
                                                    >
                                                        <Eye size={14} />
                                                    </Link>
                                                </Tooltip>
                                                <Tooltip content="PDF">
                                                    <button
                                                        onClick={() => downloadPdf(inv.id, inv.invoice_number)}
                                                        className="p-1.5 bg-surface text-text/40 hover:text-text rounded-lg border border-border/50 transition-all"
                                                    >
                                                        <FileDown size={14} />
                                                    </button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredInvoices.length === 0 && (
                    <div className="py-24 text-center rounded-2xl border-2 border-dashed border-border/50 bg-surface/20 m-4">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-text/20">
                            <FileMinus size={32} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-text/30">No invoice records found</p>
                        <p className="text-[10px] text-text/20 mt-2 text-center">Your ledger is currently empty for this selection</p>
                    </div>
                )}
            </div>

            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent title="Export Documents" description="Export ledger data to high-fidelity Excel format">
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/30">Commencement Date</label>
                                <input
                                    type="date"
                                    value={exportDates.start}
                                    onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/30">Termination Date</label>
                                <input
                                    type="date"
                                    value={exportDates.end}
                                    onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-medium focus:ring-1 focus:ring-primary outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/30">Quick Range</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { label: 'Full Year', value: 12 },
                                    { label: 'Last 6 Months', value: 6 },
                                    { label: 'Last 3 Months', value: 3 },
                                    { label: 'Last Month', value: 'last-month' },
                                    { label: 'This Month', value: 0 }
                                ].map((q) => (
                                    <button
                                        key={q.label}
                                        onClick={() => handleMonthSelect(q.value)}
                                        className="px-4 py-2 bg-surface hover:bg-border/40 border border-border/40 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all text-text"
                                    >
                                        {q.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleExportExcel}
                            className="w-full h-11 bg-text text-background rounded-lg flex items-center justify-center gap-3 font-bold text-xs hover:opacity-90 transition-all shadow-sm group"
                        >
                            <Download size={16} className="group-hover:-translate-y-0.5 transition-transform" />
                            <span>Download Detailed Ledger</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Bulk Actions Floating Bar */}
            {selectedIds.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-8 duration-500">
                    <div className="bg-[#0f1115] text-white px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-8 border border-white/10 backdrop-blur-xl">
                        <div className="flex items-center gap-3 pr-8 border-r border-white/10">
                            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white font-black text-xs ring-1 ring-white/20">
                                {selectedIds.length}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-black tracking-[0.2em] text-white/40 leading-none">Selected</span>
                                <span className="text-xs font-bold leading-none mt-1.5 text-white">Records Active</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Tooltip content="Collective PDF Download">
                                <button onClick={handleBulkPrint} className="flex flex-col items-center gap-1.5 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/15 transition-all border border-white/10">
                                        <Printer size={18} className="text-white/80" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-white/40 group-hover:text-white/60">Print All</span>
                                </button>
                            </Tooltip>


                            <Tooltip content="Excel Consolidation">
                                <button onClick={handleBulkExportExcel} className="flex flex-col items-center gap-1.5 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/15 transition-all border border-white/10">
                                        <FileSpreadsheet size={18} className="text-white/80" />
                                    </div>
                                    <span className="text-[8px] font-black uppercase tracking-tighter text-white/40 group-hover:text-white/60">Export</span>
                                </button>
                            </Tooltip>

                            {user?.role === 'super_admin' && (
                                <Tooltip content="Delete Permanently">
                                    <button onClick={() => setIsBulkDeleteModalOpen(true)} className="flex flex-col items-center gap-1.5 group">
                                        <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center group-hover:bg-rose-500/30 transition-all border border-rose-500/30">
                                            <FileMinus size={18} />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-rose-500/60">Delete</span>
                                    </button>
                                </Tooltip>
                            )}
                        </div>

                        <div className="pl-6 ml-2 border-l border-white/10">
                            <button
                                onClick={() => setSelectedIds([])}
                                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all text-white/60 border border-white/10"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}


            <ConfirmModal
                isOpen={isBulkDeleteModalOpen}
                onClose={() => setIsBulkDeleteModalOpen(false)}
                onConfirm={handleBulkDelete}
                title="Delete Selected Records?"
                description={`You are about to permanently delete ${selectedIds.length} invoices. This action is irreversible.`}
                variant="danger"
                confirmText="Delete Now"
            />
        </div>
    );
};

export default InvoiceList;
