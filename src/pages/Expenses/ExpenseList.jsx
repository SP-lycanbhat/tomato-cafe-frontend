import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatCurrency, formatDate } from '../../lib/utils';
import {
    Plus,
    Search,
    Trash2,
    Calendar,
    Wallet,
    Tag,
    ArrowUpRight,
    TrendingDown,
    Filter,
    X,
    FileMinus,
    Zap,
    Download,
    Pencil,
    Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '../../components/ui/Dialog';
import { Tooltip } from '../../components/ui/Tooltip';
import ConfirmModal from '../../components/ui/ConfirmModal';
import LocationSelector from '../../components/ui/LocationSelector';
import MonthSelector from '../../components/ui/MonthSelector';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { MapPin } from 'lucide-react';

const ExpenseList = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [expenseToDelete, setExpenseToDelete] = useState(null);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [monthFilter, setMonthFilter] = useState(''); // will be set after data load
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    // Compute month options from expenses data
    const monthOptions = expenses?.reduce((acc, exp) => {
        const date = new Date(exp.date);
        const monthValue = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!acc.find(opt => opt.value === monthValue)) {
            acc.push({ label: date.toLocaleString('default', { month: 'short', year: 'numeric' }), value: monthValue });
        }
        return acc;
    }, []).sort((a, b) => b.value.localeCompare(a.value)) || [];

    // Set default month after data loads
    useEffect(() => {
        if (monthOptions.length > 0 && !monthFilter) {
            setMonthFilter(monthOptions[0].value);
        }
    }, [monthOptions, monthFilter]);
    const [exportDates, setExportDates] = useState({ start: '', end: '' });

    const [expenseToEdit, setExpenseToEdit] = useState(null);
    const [expenseForm, setExpenseForm] = useState({
        category: 'Inventory',
        amount: '',
        description: '',
        location_id: '',
        date: new Date().toISOString().split('T')[0]
    });

    const { user } = useAuth();
    const { selectedLocationId, locations } = useLocation();

    const categories = ['Inventory', 'Rent', 'Salaries', 'Utilities', 'Marketing', 'Other'];

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedLocationId !== 'all') {
                params.location_id = selectedLocationId;
            }
            const response = await api.get('/expenses', { params });
            setExpenses(response.data);
        } catch (err) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const isEditing = !!expenseToEdit;
        const loadingMsg = isEditing ? 'Updating expense...' : 'Recording expense...';
        const successMsg = isEditing ? 'Expense updated' : 'Expense recorded';
        const errorMsg = isEditing ? 'Update failed' : 'Recording failed';
        const toastId = 'expense-action';

        try {
            toast.loading(loadingMsg, { id: toastId });

            if (!expenseForm.location_id) {
                toast.error('Please select a branch', { id: toastId });
                return;
            }

            if (isEditing) {
                await api.put(`/expenses/${expenseToEdit.id}`, expenseForm);
            } else {
                await api.post('/expenses', expenseForm);
            }
            toast.success(successMsg, { id: toastId });
            setIsAddModalOpen(false);
            setExpenseToEdit(null);
            setExpenseForm({
                category: 'Inventory',
                amount: '',
                description: '',
                location_id: (selectedLocationId !== 'all' ? selectedLocationId : ''),
                date: new Date().toISOString().split('T')[0]
            });
            fetchData();
        } catch (err) {
            toast.error(errorMsg, { id: toastId });
        }
    };

    const handleDeleteExpense = async () => {
        try {
            toast.loading('Deleting entry...', { id: 'del-expense' });
            await api.delete(`/expenses/${expenseToDelete}`);
            toast.success('Entry removed', { id: 'del-expense' });
            setExpenseToDelete(null);
            fetchData();
        } catch (err) {
            toast.error('Deletion failed', { id: 'del-expense' });
        }
    };

    const handleExportExcel = async () => {
        if (!exportDates.start || !exportDates.end) return toast.error('Select date range');
        try {
            toast.loading('Generating Excel...', { id: 'excel-export' });
            const params = { start_date: exportDates.start, end_date: exportDates.end };
            if (selectedLocationId !== 'all') {
                params.location_id = selectedLocationId;
            }

            const response = await api.get(`/expenses/export/excel`, {
                params,
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Expenses_${exportDates.start}_to_${exportDates.end}.xlsx`);
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

    useEffect(() => {
        fetchData();
    }, [selectedLocationId]);

    const filteredExpenses = expenses.filter(exp => {
        const matchesSearch = exp.description?.toLowerCase().includes(search.toLowerCase()) ||
            exp.category.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;

        const expDate = new Date(exp.date);
        const expMonth = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
        const matchesMonth = monthFilter === 'all' || expMonth === monthFilter;

        return matchesSearch && matchesCategory && matchesMonth;
    });

    const totalExpense = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    return (
        <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-inner">
                        <TrendingDown size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-text leading-none uppercase">Expense Ledger</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            Financial Tracking Active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-surface border border-border/50 px-4 py-2 rounded-xl flex flex-col items-end">
                        <span className="text-[8px] font-black uppercase tracking-tighter text-text/20 leading-none">Total Expenditure</span>
                        <span className="text-sm font-black text-rose-500 mt-1">{formatCurrency(totalExpense)}</span>
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
                        <button
                            onClick={() => {
                                setExpenseToEdit(null);
                                setExpenseForm({
                                    category: 'Inventory',
                                    amount: '',
                                    description: '',
                                    location_id: (selectedLocationId !== 'all' ? selectedLocationId : ''),
                                    date: new Date().toISOString().split('T')[0]
                                });
                                setIsAddModalOpen(true);
                            }}
                            className="btn-primary h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm font-bold"
                        >
                            <Plus size={16} />
                            <span>Add Expense</span>
                        </button>
                    </div>

                    <div className="h-6 w-px bg-border/50 mx-2 hidden sm:block" />
                    <MonthSelector selectedMonth={monthFilter} onChange={setMonthFilter} options={monthOptions} />
                    <LocationSelector />
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center">
                <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center flex-1 min-w-0">
                    <div className="relative w-full lg:w-64 group">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors z-10" />
                        <input
                            placeholder="Search expenses..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field w-full pl-10 h-9 bg-background/50 border-border/50 transition-all font-bold text-[11px] rounded-lg"
                        />
                    </div>
                </div>

                <div className="flex bg-surface border border-border/40 p-1 rounded-xl overflow-x-auto no-scrollbar max-w-full xl:w-auto shadow-sm">
                    {['all', ...categories].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${categoryFilter === cat
                                ? 'bg-background text-text shadow-sm ring-1 ring-black/5'
                                : 'text-text/30 hover:text-text/60'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Expenses Table */}
            <div className="card !p-0 overflow-hidden border-border/50 bg-background/40 backdrop-blur-xl shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-surface border-b border-border text-[9px] uppercase tracking-[0.2em] text-text/40 font-black">
                            <tr>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {filteredExpenses.map((exp) => (
                                <tr key={exp.id} className="hover:bg-rose-500/[0.01] transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[11px] font-medium text-text/50">
                                            <Calendar size={12} className="text-rose-500/30" />
                                            {formatDate(exp.date)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-text/40 uppercase tracking-tight">
                                            <MapPin size={10} className="text-primary/40" />
                                            {locations.find(l => l.id === exp.location_id)?.name || 'Central'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/5 border border-rose-500/10 text-[9px] font-black uppercase tracking-widest text-rose-500">
                                            <Tag size={10} />
                                            {exp.category}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-xs font-medium text-text/70 line-clamp-1 max-w-md">
                                            {exp.description || 'No description provided'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-[13px] font-black text-rose-500">{formatCurrency(exp.amount)}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => {
                                                    setExpenseToEdit(exp);
                                                    setExpenseForm({
                                                        category: exp.category,
                                                        amount: exp.amount,
                                                        description: exp.description || '',
                                                        location_id: exp.location_id,
                                                        date: exp.date.split('T')[0]
                                                    });
                                                    setIsAddModalOpen(true);
                                                }}
                                                className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all border border-primary/10"
                                            >
                                                <Pencil size={14} />
                                            </button>
                                            <button
                                                onClick={() => setExpenseToDelete(exp.id)}
                                                className="p-2 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/10"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && filteredExpenses.length === 0 && (
                    <div className="py-24 text-center">
                        <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-text/20">
                            <FileMinus size={32} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text/30 italic">No expenses found</p>
                    </div>
                )}
            </div>

            {/* Add Expense Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={(val) => {
                if (!val) setExpenseToEdit(null);
                setIsAddModalOpen(val);
            }}>
                <DialogContent
                    title={expenseToEdit ? "Edit Expense" : "New Expense Entry"}
                    description={expenseToEdit ? "Update existing expense details" : "Record a new operational expense"}
                >
                    <form onSubmit={handleFormSubmit} className="space-y-5 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Category</label>
                                <select
                                    className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-rose-500/50 outline-none appearance-none"
                                    value={expenseForm.category}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                >
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Branch</label>
                                <select
                                    required
                                    className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-primary/50 outline-none appearance-none"
                                    value={expenseForm.location_id}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, location_id: e.target.value })}
                                >
                                    <option value="" disabled>Select Branch</option>
                                    {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Amount (INR)</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-rose-500/50 outline-none"
                                    placeholder="0.00"
                                    value={expenseForm.amount}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full h-10 px-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-rose-500/50 outline-none"
                                    value={expenseForm.date}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.1em] text-text/30">Description</label>
                            <textarea
                                className="w-full h-24 p-3 bg-background border border-border/50 rounded-lg text-xs font-bold focus:ring-1 ring-rose-500/50 outline-none resize-none"
                                placeholder="Enter details..."
                                value={expenseForm.description}
                                onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full h-11 bg-rose-500 text-white rounded-lg font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all flex items-center justify-center gap-3"
                        >
                            <Save size={16} />
                            {expenseToEdit ? "Update Expense" : "Save Expense"}
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={!!expenseToDelete}
                onClose={() => setExpenseToDelete(null)}
                onConfirm={handleDeleteExpense}
                title="Delete Expense?"
                description="This action will permanently delete this expense from the ledger."
                variant="danger"
                confirmText="Delete Now"
            />

            <Dialog open={isExportModalOpen} onOpenChange={setIsExportModalOpen}>
                <DialogContent title="Export Expenses" description="Download expense data in Excel format">
                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/30">From Date</label>
                                <input
                                    type="date"
                                    value={exportDates.start}
                                    onChange={(e) => setExportDates({ ...exportDates, start: e.target.value })}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-medium focus:ring-1 focus:ring-rose-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/30">To Date</label>
                                <input
                                    type="date"
                                    value={exportDates.end}
                                    onChange={(e) => setExportDates({ ...exportDates, end: e.target.value })}
                                    className="w-full h-10 px-3 bg-background border border-border rounded-lg text-xs font-medium focus:ring-1 focus:ring-rose-500 outline-none transition-all"
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
                            <span>Download Excel Report</span>
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default ExpenseList;
