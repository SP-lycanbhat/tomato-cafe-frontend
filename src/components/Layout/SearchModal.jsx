import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Search, FileText, Users, LayoutDashboard, Building2, UserCog, Command, ArrowRight, X, ClipboardList, TrendingUp, Wallet, PieChart } from 'lucide-react';
import api from '../../lib/api';

// Pages for quick navigation
const pages = [
    { name: 'System Overview', path: '/dashboard', icon: LayoutDashboard, category: 'Pages' },
    { name: 'Financial Ledger', path: '/invoices', icon: FileText, category: 'Pages' },
    { name: 'B2B Quotations', path: '/quotations', icon: ClipboardList, category: 'Pages' },
    { name: 'Revenue Tracking', path: '/revenue', icon: TrendingUp, category: 'Pages' },
    { name: 'Profit & Loss Statement', path: '/profit-loss', icon: PieChart, category: 'Pages' },
    { name: 'Expense Manager', path: '/expenses', icon: Wallet, category: 'Pages' },
    { name: 'Client Directory', path: '/clients', icon: Users, category: 'Pages' },
    { name: 'Organization Profile', path: '/company', icon: Building2, category: 'Pages' },
    { name: 'Identity Management', path: '/admin/users', icon: UserCog, category: 'Pages' },
];

const SearchModal = () => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ invoices: [], clients: [], pages: [], quotations: [], revenue: [], expenses: [] });
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const navigate = useNavigate();
    const debounceTimer = useRef(null);

    const toggleOpen = useCallback(() => setOpen(prev => !prev), []);

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                toggleOpen();
            }
        };

        const handleOpenSearch = () => setOpen(true);
        window.addEventListener('keydown', down);
        window.addEventListener('open-search', handleOpenSearch);

        return () => {
            window.removeEventListener('keydown', down);
            window.removeEventListener('open-search', handleOpenSearch);
        };
    }, [toggleOpen]);

    const performSearch = useCallback(async (val) => {
        if (!val.trim()) {
            setResults({ invoices: [], clients: [], pages: [], quotations: [], revenue: [], expenses: [] });
            return;
        }

        setLoading(true);
        try {
            const [invoicesRes, clientsRes, quotationsRes, revenueRes, expensesRes] = await Promise.all([
                api.get('/invoices').catch(() => ({ data: [] })),
                api.get('/clients').catch(() => ({ data: [] })),
                api.get('/quotations').catch(() => ({ data: [] })),
                api.get('/revenue').catch(() => ({ data: [] })),
                api.get('/expenses').catch(() => ({ data: [] }))
            ]);

            const term = val.toLowerCase();

            const filteredInvoices = (invoicesRes.data || []).filter(inv =>
                (inv.invoice_number || '').toLowerCase().includes(term) ||
                (inv.client_snapshot?.name || '').toLowerCase().includes(term)
            ).slice(0, 5);

            const filteredClients = (clientsRes.data || []).filter(c =>
                (c.name || '').toLowerCase().includes(term) ||
                (c.company_name || '').toLowerCase().includes(term)
            ).slice(0, 5);

            const filteredQuotations = (quotationsRes.data || []).filter(q =>
                (q.quotation_number || '').toLowerCase().includes(term) ||
                (q.client_snapshot?.name || '').toLowerCase().includes(term)
            ).slice(0, 5);

            const filteredRevenue = (revenueRes.data || []).filter(rev =>
                (rev.month_year || '').toLowerCase().includes(term) ||
                (rev.notes || '').toLowerCase().includes(term)
            ).slice(0, 5);

            const filteredExpenses = (expensesRes.data || []).filter(exp =>
                (exp.vendor || '').toLowerCase().includes(term) ||
                (exp.description || '').toLowerCase().includes(term)
            ).slice(0, 5);

            const filteredPages = pages.filter(p =>
                (p.name || '').toLowerCase().includes(term)
            );

            setResults({
                invoices: filteredInvoices,
                clients: filteredClients,
                pages: filteredPages,
                quotations: filteredQuotations,
                revenue: filteredRevenue,
                expenses: filteredExpenses
            });
            setSelectedIndex(0);
        } catch (err) {
            console.error('Search failed', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSearch = (val) => {
        setQuery(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            performSearch(val);
        }, 300);
    };

    const flatResults = [
        ...results.pages.map(p => ({ ...p, type: 'page' })),
        ...results.clients.map(c => ({ ...c, type: 'client' })),
        ...results.invoices.map(i => ({ ...i, type: 'invoice' })),
        ...results.quotations.map(q => ({ ...q, type: 'quotation' })),
        ...results.revenue.map(r => ({ ...r, type: 'revenue' })),
        ...results.expenses.map(e => ({ ...e, type: 'expense' }))
    ];

    const handleSelect = (item) => {
        setOpen(false);
        setQuery('');
        setResults({ invoices: [], clients: [], pages: [], quotations: [], revenue: [], expenses: [] });
        if (item.type === 'page') navigate(item.path);
        if (item.type === 'client') navigate(`/clients/${item.id}`);
        if (item.type === 'invoice') navigate(`/invoices/${item.id}`);
        if (item.type === 'quotation') navigate(`/quotations/${item.id}`);
        if (item.type === 'revenue') navigate(`/revenue`);
        if (item.type === 'expense') navigate(`/expenses`);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % flatResults.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + flatResults.length) % flatResults.length);
        } else if (e.key === 'Enter') {
            if (flatResults[selectedIndex]) {
                handleSelect(flatResults[selectedIndex]);
            }
        }
    };

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 bg-background/60 backdrop-blur-md z-[100] animate-in fade-in duration-300" />
                <DialogPrimitive.Content
                    className="fixed left-[50%] top-[20%] translate-x-[-50%] w-[90%] max-w-2xl bg-background border border-border rounded-2xl shadow-2xl z-[101] animate-in slide-in-from-top-4 duration-300 outline-none overflow-hidden"
                    onKeyDown={handleKeyDown}
                >
                    <div className="flex items-center px-4 border-b border-border h-14">
                        <Search size={18} className="text-text/30 mr-3" />
                        <input
                            autoFocus
                            placeholder="Search anything: invoices, quotes, clients, ledger..."
                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-text placeholder:text-text/20"
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-surface border border-border rounded-lg text-[9px] font-black text-text/30">
                            <span className="opacity-50">ESC</span>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto p-2 no-scrollbar">
                        {flatResults.length > 0 ? (
                            <div className="space-y-4 py-2">
                                {results.pages.length > 0 && (
                                    <div className="px-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20 mb-2 px-2">Navigation</p>
                                        {results.pages.map((p, i) => {
                                            const isSelected = selectedIndex === i;
                                            return (
                                                <button
                                                    key={p.path}
                                                    onClick={() => handleSelect({ ...p, type: 'page' })}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'hover:bg-surface text-text/60'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <p.icon size={16} className={isSelected ? 'text-background' : 'text-primary'} />
                                                        <span className="text-[11px] font-bold uppercase tracking-tight">{p.name}</span>
                                                    </div>
                                                    <ArrowRight size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {results.clients.length > 0 && (
                                    <div className="px-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20 mb-2 px-2">Clients</p>
                                        {results.clients.map((c, i) => {
                                            const globalIdx = results.pages.length + i;
                                            const isSelected = selectedIndex === globalIdx;
                                            return (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleSelect({ ...c, type: 'client' })}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'hover:bg-surface text-text/60'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Users size={16} className={isSelected ? 'text-background' : 'text-primary/40'} />
                                                        <div className="text-left">
                                                            <span className="text-[11px] font-bold block uppercase tracking-tight">{c.name}</span>
                                                            <span className={`text-[9px] block ${isSelected ? 'text-background/60' : 'text-text/30'}`}>{c.company_name}</span>
                                                        </div>
                                                    </div>
                                                    <ArrowRight size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {results.invoices.length > 0 && (
                                    <div className="px-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20 mb-2 px-2">Invoices</p>
                                        {results.invoices.map((inv, i) => {
                                            const globalIdx = results.pages.length + results.clients.length + i;
                                            const isSelected = selectedIndex === globalIdx;
                                            return (
                                                <button
                                                    key={inv.id}
                                                    onClick={() => handleSelect({ ...inv, type: 'invoice' })}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'hover:bg-surface text-text/60'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FileText size={16} className={isSelected ? 'text-background' : 'text-primary/40'} />
                                                        <div className="text-left">
                                                            <span className="text-[11px] font-bold block uppercase tracking-tight">{inv.invoice_number}</span>
                                                            <span className={`text-[9px] block ${isSelected ? 'text-background/60' : 'text-text/30'}`}>{inv.client_snapshot.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-3">
                                                        <span className={`text-[10px] font-black ${isSelected ? 'text-background' : 'text-text'}`}>
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(inv.grand_total)}
                                                        </span>
                                                        <ArrowRight size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {results.quotations.length > 0 && (
                                    <div className="px-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20 mb-2 px-2">Quotations</p>
                                        {results.quotations.map((q, i) => {
                                            const globalIdx = results.pages.length + results.clients.length + results.invoices.length + i;
                                            const isSelected = selectedIndex === globalIdx;
                                            return (
                                                <button
                                                    key={q.id}
                                                    onClick={() => handleSelect({ ...q, type: 'quotation' })}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'hover:bg-surface text-text/60'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <ClipboardList size={16} className={isSelected ? 'text-background' : 'text-primary/40'} />
                                                        <div className="text-left">
                                                            <span className="text-[11px] font-bold block uppercase tracking-tight">{q.quotation_number}</span>
                                                            <span className={`text-[9px] block ${isSelected ? 'text-background/60' : 'text-text/30'}`}>{q.client_snapshot.name}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-3">
                                                        <span className={`text-[10px] font-black ${isSelected ? 'text-background' : 'text-text'}`}>
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(q.grand_total)}
                                                        </span>
                                                        <ArrowRight size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {results.revenue.length > 0 && (
                                    <div className="px-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20 mb-2 px-2">Revenue Records</p>
                                        {results.revenue.map((r, i) => {
                                            const globalIdx = results.pages.length + results.clients.length + results.invoices.length + results.quotations.length + i;
                                            const isSelected = selectedIndex === globalIdx;
                                            return (
                                                <button
                                                    key={r.id}
                                                    onClick={() => handleSelect({ ...r, type: 'revenue' })}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'hover:bg-surface text-text/60'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <TrendingUp size={16} className={isSelected ? 'text-background' : 'text-primary/40'} />
                                                        <div className="text-left">
                                                            <span className="text-[11px] font-bold block uppercase tracking-tight">{r.month_year}</span>
                                                            <span className={`text-[9px] block ${isSelected ? 'text-background/60' : 'text-text/30'}`}>{r.notes || 'Monthly Revenue Log'}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-3">
                                                        <span className={`text-[10px] font-black ${isSelected ? 'text-background' : 'text-text'}`}>
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(r.total_amount)}
                                                        </span>
                                                        <ArrowRight size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}

                                {results.expenses.length > 0 && (
                                    <div className="px-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20 mb-2 px-2">Expenses</p>
                                        {results.expenses.map((e, i) => {
                                            const globalIdx = results.pages.length + results.clients.length + results.invoices.length + results.quotations.length + results.revenue.length + i;
                                            const isSelected = selectedIndex === globalIdx;
                                            return (
                                                <button
                                                    key={e.id}
                                                    onClick={() => handleSelect({ ...e, type: 'expense' })}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${isSelected ? 'bg-primary text-background shadow-lg shadow-primary/20' : 'hover:bg-surface text-text/60'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Wallet size={16} className={isSelected ? 'text-background' : 'text-primary/40'} />
                                                        <div className="text-left">
                                                            <span className="text-[11px] font-bold block uppercase tracking-tight">{e.vendor}</span>
                                                            <span className={`text-[9px] block ${isSelected ? 'text-background/60' : 'text-text/30'}`}>{e.description}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex items-center gap-3">
                                                        <span className={`text-[10px] font-black ${isSelected ? 'text-background' : 'text-text'}`}>
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(e.amount)}
                                                        </span>
                                                        <ArrowRight size={14} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : query ? (
                            <div className="py-12 text-center">
                                <Search size={32} className="mx-auto text-text/10 mb-3" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-text/30">No matches found for "{query}"</p>
                            </div>
                        ) : (
                            <div className="py-8 px-4">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20 mb-4 px-2">Recent Pages</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {pages.slice(0, 4).map(p => (
                                        <button
                                            key={p.path}
                                            onClick={() => navigate(p.path)}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-surface hover:border-primary/20 transition-all text-left"
                                        >
                                            <div className="p-2 bg-primary/5 rounded-lg text-primary">
                                                <p.icon size={16} />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-tight text-text/60">{p.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="px-4 py-3 bg-surface border-t border-border flex items-center justify-between">
                        <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-text/30">
                            <div className="flex items-center gap-1.5">
                                <span className="p-1 px-1.5 bg-background border border-border rounded shadow-sm flex items-center justify-center">
                                    <Command size={8} />
                                </span>
                                <span>K to Toggle</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="p-1 px-1.5 bg-background border border-border rounded shadow-sm flex items-center justify-center text-[7px]">ENTER</span>
                                <span>to Select</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[9px] font-black text-primary uppercase tracking-[0.2em]">
                            Tomato Systems v2.0
                        </div>
                    </div>
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

export default SearchModal;
