import { useEffect, useState } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import {
    Plus,
    RefreshCw,
    TrendingUp,
    Calendar,
    FileText,
    Zap,
    Download,
    Pencil,
    ChevronRight,
    Search,
    Upload,
    File,
    Trash2,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '../components/ui/Dialog';
import { Tooltip } from '../components/ui/Tooltip';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from '../contexts/LocationContext';
import LocationSelector from '../components/ui/LocationSelector';
import MonthSelector from '../components/ui/MonthSelector';
import { MapPin } from 'lucide-react';
import ConfirmModal from '../components/ui/ConfirmModal';

const Revenue = () => {
    const [revenues, setRevenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isB2CModalOpen, setIsB2CModalOpen] = useState(false);
    const [isB2BModalOpen, setIsB2BModalOpen] = useState(false);
    const [revToEdit, setRevToEdit] = useState(null);
    const [revenueForm, setRevenueForm] = useState({
        month_year: new Date().toISOString().slice(0, 7), // YYYY-MM
        b2c_amount: '',
        notes: ''
    });
    const [reportFile, setReportFile] = useState(null);
    const [b2bMonth, setB2bMonth] = useState(new Date().toISOString().slice(0, 7));
    const [revToDelete, setRevToDelete] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('');

    const { user } = useAuth();
    const { selectedLocationId, locations } = useLocation();

    // Compute month options from revenues data
    const monthOptions = revenues?.reduce((acc, rev) => {
        const date = new Date(rev.month_year + '-01');
        const monthValue = rev.month_year;
        if (!acc.find(opt => opt.value === monthValue)) {
            acc.push({ label: date.toLocaleString('default', { month: 'short', year: 'numeric' }), value: monthValue });
        }
        return acc;
    }, []).sort((a, b) => b.value.localeCompare(a.value)) || [];

    // Set default month
    useEffect(() => {
        if (monthOptions.length > 0 && !selectedMonth) {
            setSelectedMonth(monthOptions[0].value);
        }
    }, [monthOptions, selectedMonth]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedLocationId !== 'all') {
                params.location_id = selectedLocationId;
            }
            const response = await api.get('/revenue', { params });
            setRevenues(response.data);
        } catch (err) {
            toast.error('Failed to sync revenue data');
        } finally {
            setLoading(false);
        }
    };

    const handleB2CSubmit = async (e) => {
        e.preventDefault();
        const toastId = 'b2c-action';
        try {
            toast.loading('Saving B2C revenue...', { id: toastId });
            const formData = new FormData();
            formData.append('month_year', revenueForm.month_year);
            formData.append('b2c_amount', revenueForm.b2c_amount);
            formData.append('notes', revenueForm.notes);
            if (reportFile) {
                formData.append('report_file', reportFile);
            }

            // Ensure location_id is provided
            const locId = selectedLocationId !== 'all' ? selectedLocationId : revenueForm.location_id;
            if (!locId) {
                toast.error('Please select a branch', { id: toastId });
                return;
            }
            formData.append('location_id', locId);

            await api.post('/revenue', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('B2C revenue updated', { id: toastId });
            setIsB2CModalOpen(false);
            setRevToEdit(null);
            setReportFile(null);
            fetchData();
        } catch (err) {
            toast.error('Failed to save B2C revenue', { id: toastId });
        }
    };

    const handleSyncB2B = async () => {
        const toastId = 'b2b-sync';
        try {
            toast.loading(`Syncing B2B sales for ${b2bMonth}...`, { id: toastId });
            await api.post(`/revenue/sync-b2b/${b2bMonth}`);
            toast.success('B2B sales synced successfully', { id: toastId });
            setIsB2BModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to sync B2B sales', { id: toastId });
        }
    };

    const handleDeleteRevenue = async () => {
        if (!revToDelete) return;
        const toastId = 'rev-delete';
        try {
            toast.loading('Deleting revenue record...', { id: toastId });
            await api.delete(`/revenue/${revToDelete.id}`);
            toast.success('Record deleted', { id: toastId });
            setShowDeleteModal(false);
            setRevToDelete(null);
            fetchData();
        } catch (err) {
            toast.error('Deletion failed', { id: toastId });
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedLocationId]);

    const displayRevenues = [...revenues]
        .filter(r => selectedMonth === 'all' || r.month_year === selectedMonth)
        .sort((a, b) => b.month_year.localeCompare(a.month_year));

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-text leading-none uppercase">Revenue Streams</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Financial Inflow Tracking
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {selectedLocationId === 'all' && (
                        <Tooltip content="Sync B2B Sales from Invoices">
                            <button
                                onClick={() => setIsB2BModalOpen(true)}
                                className="h-9 px-4 bg-background/50 border border-border/50 rounded-lg text-text/60 hover:text-text transition-all flex items-center justify-center gap-2 group font-bold text-[11px]"
                            >
                                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                                <span>Sync B2B Sales</span>
                            </button>
                        </Tooltip>
                    )}
                    <button
                        onClick={() => {
                            setRevToEdit(null);
                            setRevenueForm({
                                month_year: new Date().toISOString().slice(0, 7),
                                b2c_amount: '',
                                location_id: selectedLocationId !== 'all' ? selectedLocationId : '',
                                notes: ''
                            });
                            setReportFile(null);
                            setIsB2CModalOpen(true);
                        }}
                        className="btn-primary h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm font-bold text-[11px]"
                    >
                        <Plus size={16} />
                        <span>Add B2C Revenue</span>
                    </button>
                    <div className="h-6 w-px bg-border/50 mx-2 hidden sm:block" />
                    <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} options={monthOptions} />
                    <LocationSelector />
                </div>
            </div>

            {/* Revenue Table */}
            <div className="card !p-0 overflow-hidden border-border/50 bg-background/40 backdrop-blur-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface border-b border-border text-[9px] uppercase tracking-[0.2em] text-text/40 font-black">
                            <tr>
                                <th className="px-6 py-4">Month</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">B2B (Invoices)</th>
                                <th className="px-6 py-4">B2C (Custom)</th>
                                <th className="px-6 py-4">Total Revenue</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {displayRevenues.map((rev) => (
                                <tr key={rev.id} className="hover:bg-emerald-500/[0.01] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] font-black text-text/80">
                                            <Calendar size={12} className="text-emerald-500/30" />
                                            {new Date(rev.month_year + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-text/40 uppercase tracking-tight">
                                            <MapPin size={10} className="text-emerald-500/40" />
                                            {locations.find(l => l.id === rev.location_id)?.name || 'Central'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[12px] font-bold text-text/60 tracking-tight">{formatCurrency(rev.b2b_amount)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3 text-[12px] font-bold text-text/60 tracking-tight">
                                            {formatCurrency(rev.b2c_amount)}
                                            {rev.report_url && (
                                                <Tooltip content="Download Report">
                                                    <a
                                                        href={`${api.defaults.baseURL}${rev.report_url}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <FileText size={10} />
                                                    </a>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[14px] font-black text-emerald-500">{formatCurrency(rev.total_amount)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-emerald-500/5 text-emerald-500 border border-emerald-500/10">
                                            Verified
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            {selectedLocationId !== 'all' && (
                                                <button
                                                    onClick={() => {
                                                        setRevToEdit(rev);
                                                        setRevenueForm({
                                                            month_year: rev.month_year,
                                                            b2c_amount: rev.b2c_amount,
                                                            location_id: rev.location_id || '',
                                                            notes: rev.notes || ''
                                                        });
                                                        setReportFile(null);
                                                        setIsB2CModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-lg bg-surface text-text/60 hover:text-primary transition-all border border-border/40"
                                                >
                                                    <Pencil size={14} />
                                                </button>
                                            )}
                                            {selectedLocationId === 'all' && (
                                                <Tooltip content="Resync Invoices">
                                                    <button
                                                        onClick={async () => {
                                                            const toastId = 'b2b-sync-row';
                                                            try {
                                                                toast.loading('Resyncing B2B...', { id: toastId });
                                                                await api.post(`/revenue/sync-b2b/${rev.month_year}`);
                                                                toast.success('B2B Resynced', { id: toastId });
                                                                fetchData();
                                                            } catch (err) {
                                                                toast.error('Sync failed', { id: toastId });
                                                            }
                                                        }}
                                                        className="p-2 rounded-lg bg-surface text-text/60 hover:text-emerald-500 transition-all border border-border/40"
                                                    >
                                                        <RefreshCw size={14} />
                                                    </button>
                                                </Tooltip>
                                            )}
                                            {user?.role === 'super_admin' && (
                                                <Tooltip content="Delete Record">
                                                    <button
                                                        onClick={() => {
                                                            setRevToDelete(rev);
                                                            setShowDeleteModal(true);
                                                        }}
                                                        className="p-2 rounded-lg bg-surface text-text/60 hover:text-rose-500 transition-all border border-border/40"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && revenues.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-text/20">
                            <TrendingUp size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text/30 italic">No revenue records found</p>
                    </div>
                )}
            </div>

            {/* B2C Revenue Modal */}
            <Dialog open={isB2CModalOpen} onOpenChange={setIsB2CModalOpen}>
                <DialogContent
                    title={revToEdit ? "Edit Custom Revenue" : "New Revenue Entry (B2C)"}
                    description="Enter manual revenue figures not captured from invoices"
                >
                    <form onSubmit={handleB2CSubmit} className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Target Period</label>
                            <input
                                type="month"
                                required
                                disabled={!!revToEdit}
                                className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-emerald-500/50 outline-none disabled:opacity-50"
                                value={revenueForm.month_year}
                                onChange={(e) => setRevenueForm({ ...revenueForm, month_year: e.target.value })}
                            />
                        </div>

                        {selectedLocationId === 'all' && (
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Branch</label>
                                <select
                                    required
                                    className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-emerald-500/50 outline-none appearance-none"
                                    value={revenueForm.location_id}
                                    onChange={(e) => setRevenueForm({ ...revenueForm, location_id: e.target.value })}
                                >
                                    <option value="" disabled>Select Branch</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Amount (INR)</label>
                            <input
                                type="number"
                                required
                                className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-emerald-500/50 outline-none"
                                placeholder="0.00"
                                value={revenueForm.b2c_amount}
                                onChange={(e) => setRevenueForm({ ...revenueForm, b2c_amount: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Notes</label>
                            <textarea
                                className="w-full h-20 p-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-emerald-500/50 outline-none resize-none"
                                placeholder="Details..."
                                value={revenueForm.notes}
                                onChange={(e) => setRevenueForm({ ...revenueForm, notes: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Report File (PDF/Excel/CSV)</label>
                            <div className="relative group/upload">
                                <input
                                    type="file"
                                    onChange={(e) => setReportFile(e.target.files[0])}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    accept=".pdf,.csv,.xlsx,.xls"
                                />
                                <div className="w-full h-12 px-4 bg-background border-2 border-dashed border-border/50 group-hover/upload:border-emerald-500/50 rounded-xl flex items-center justify-between transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                            <Upload size={14} />
                                        </div>
                                        <span className="text-xs font-bold text-text/40 group-hover/upload:text-text/60">
                                            {reportFile ? reportFile.name : "Upload Report"}
                                        </span>
                                    </div>
                                    {reportFile && (
                                        <File size={14} className="text-emerald-500 animate-bounce" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full h-11 bg-emerald-500 text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                        >
                            <Save size={16} />
                            {revToEdit ? "Update Revenue" : "Save Revenue"}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* B2B Sync Modal */}
            <Dialog open={isB2BModalOpen} onOpenChange={setIsB2BModalOpen}>
                <DialogContent
                    title="Sync Invoice Data"
                    description="Automatically calculate B2B revenue from invoices for the selected period"
                >
                    <div className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Month</label>
                            <input
                                type="month"
                                required
                                className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-primary/50 outline-none"
                                value={b2bMonth}
                                onChange={(e) => setB2bMonth(e.target.value)}
                            />
                        </div>

                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                                <FileText size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Automation Insight</span>
                            </div>
                            <p className="text-[11px] font-medium text-text/60 leading-relaxed">
                                This will scan all active invoices for <span className="text-primary font-bold">{b2bMonth}</span> and add the total to your revenue records.
                            </p>
                        </div>

                        <button
                            onClick={handleSyncB2B}
                            className="w-full h-11 bg-primary text-background rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-3"
                        >
                            <RefreshCw size={16} />
                            Start Sync
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteRevenue}
                title="Delete Revenue Entry?"
                description={`This will permanently remove the revenue record for ${revToDelete ? new Date(revToDelete.month_year + '-01').toLocaleString('default', { month: 'short', year: 'numeric' }) : ''}.`}
            />
        </div>
    );
};

export default Revenue;
