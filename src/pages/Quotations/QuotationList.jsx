import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
    Plus,
    Search,
    FileDown,
    Eye,
    ClipboardList,
    Filter,
    Calendar,
    CheckCircle2,
    Clock,
    AlertCircle,
    FileMinus,
    X,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Tooltip } from '../../components/ui/Tooltip';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { Edit2 } from 'lucide-react';

const QuotationList = () => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [clientFilter, setClientFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState('all');

    const { user } = useAuth();

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== 'all') params.status = statusFilter;
            if (clientFilter !== 'all') params.client_id = clientFilter;
            if (monthFilter !== 'all') params.month = monthFilter;

            const [quotationsRes, clientsRes] = await Promise.all([
                api.get('/quotations', { params }),
                api.get('/clients')
            ]);
            setQuotations(quotationsRes.data);
            setClients(clientsRes.data);
        } catch (err) {
            toast.error('Failed to sync quotation data');
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = async (id, number) => {
        try {
            toast.loading('Preparing PDF...', { id: 'pdf-list' });
            const response = await api.get(`/quotations/${id}/pdf`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Quotation_${number.replace(/\//g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Download started', { id: 'pdf-list' });
        } catch (err) {
            toast.error('PDF generation failed', { id: 'pdf-list' });
        }
    };

    useEffect(() => {
        fetchData();
    }, [statusFilter, clientFilter, monthFilter]);

    // Calculate month options from data or just fixed recent months
    // For now, let's use the same logic as InvoiceList to show months available in data
    const monthOptions = quotations.reduce((acc, q) => {
        const date = new Date(q.created_at);
        const monthLabel = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc.find(opt => opt.value === monthValue)) {
            acc.push({ label: monthLabel, value: monthValue });
        }
        return acc;
    }, []).sort((a, b) => b.value.localeCompare(a.value));

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch = q.quotation_number.toLowerCase().includes(search.toLowerCase()) ||
            q.client_snapshot.name.toLowerCase().includes(search.toLowerCase());
        return matchesSearch;
    });

    const statuses = ['all', 'open', 'approved', 'rejected'];

    const getStatusStyles = (status) => {
        switch (status) {
            case 'approved': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
            case 'rejected': return { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle };
            case 'open': return { color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Clock };
            default: return { color: 'text-text/40', bg: 'bg-surface', icon: ClipboardList };
        }
    };

    return (
        <div className="space-y-4 w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Premium Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <ClipboardList size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-text leading-none">Quotation Ledger</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            {quotations.length} Quotations
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button onClick={() => navigate('/quotations/create')} className="normal-case">
                        <Plus size={16} />
                        New Quotation
                    </Button>
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
                            className={`px-6 py-2 rounded-lg text-[10px] font-black tracking-[0.15em] transition-all whitespace-nowrap ${statusFilter === s
                                ? 'bg-background text-text shadow-sm ring-1 ring-black/5'
                                : 'text-text/30 hover:text-text/60'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quotations Table */}
            <div className="card !p-0 overflow-hidden border-border/50 bg-background/40 backdrop-blur-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface border-b border-border text-[9px] uppercase tracking-[0.2em] text-text/40 font-black">
                            <tr>
                                <th className="px-5 py-3">Serial</th>
                                <th className="px-5 py-3">Beneficiary</th>
                                <th className="px-5 py-3">Date</th>
                                <th className="px-5 py-3">Total</th>
                                <th className="px-5 py-3">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredQuotations.map((q) => {
                                const styles = getStatusStyles(q.status);
                                const StatusIcon = styles.icon;
                                return (
                                    <tr key={q.id} className="hover:bg-primary/[0.01] transition-colors group">
                                        <td className="px-5 py-3.5">
                                            <span className="font-mono text-xs font-black tracking-tighter text-text/70">{q.quotation_number}</span>
                                        </td>
                                        <td className="px-5 py-3.5 border-l border-border/5">
                                            <div className="font-bold text-[13px] text-text tracking-tight leading-tight">{q.client_snapshot.name}</div>
                                            <div className="text-[9px] text-text/30 font-medium">{q.client_snapshot.company_name}</div>
                                        </td>
                                        <td className="px-5 py-3.5 text-[11px] font-medium text-text/50">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={11} className="text-primary/20" />
                                                {formatDate(q.created_at)}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="text-[13px] font-black text-text">{formatCurrency(q.grand_total)}</div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${styles.bg} ${styles.color}`}>
                                                <StatusIcon size={9} />
                                                {q.status}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                <Tooltip content="View">
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        onClick={() => navigate(`/quotations/${q.id}`)}
                                                    >
                                                        <Eye size={14} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="Edit">
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        onClick={() => navigate(`/quotations/${q.id}/edit`)}
                                                    >
                                                        <Edit2 size={14} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip content="PDF">
                                                    <Button
                                                        variant="secondary"
                                                        size="icon"
                                                        onClick={() => downloadPdf(q.id, q.quotation_number)}
                                                    >
                                                        <FileDown size={14} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredQuotations.length === 0 && (
                    <div className="py-24 text-center rounded-2xl border-2 border-dashed border-border/50 bg-surface/20 m-4">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-text/20">
                            <FileMinus size={32} />
                        </div>
                        <p className="text-xs font-black uppercase tracking-widest text-text/30">No quotations found</p>
                        <p className="text-[10px] text-text/20 mt-2 text-center">Your ledger is currently empty for this selection</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuotationList;
