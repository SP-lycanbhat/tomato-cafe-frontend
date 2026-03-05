import { useState, useEffect } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../lib/utils';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Zap,
    Briefcase,
    Globe,
    PieChart as PieIcon,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Filter,
    Users,
    AlertTriangle,
    Download,
    Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from '../contexts/LocationContext';
import LocationSelector from '../components/ui/LocationSelector';
import MonthSelector from '../components/ui/MonthSelector';

import { Button } from '../components/ui/Button';

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

const ProfitLoss = () => {
    const [pnlData, setPnlData] = useState(null);
    const [revData, setRevData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(''); // will be set after data load
    const { selectedLocationId } = useLocation();

    // Compute month options from available_months returned by backend
    const monthOptions = (pnlData?.available_months || []).map(monthValue => {
        const [year, month] = monthValue.split('-');
        const date = new Date(parseInt(year), parseInt(month) - 1);
        const label = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        return { label, value: monthValue };
    });

    // Set default month to most recent available month after data loads
    useEffect(() => {
        if (monthOptions.length > 0 && !selectedMonth) {
            setSelectedMonth(monthOptions[0].value);
        }
    }, [monthOptions, selectedMonth]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedMonth) params.month = selectedMonth;
            if (selectedLocationId !== 'all') {
                params.location_id = selectedLocationId;
            }

            const [pnlRes, revRes] = await Promise.all([
                api.get('/analytics/pnl', { params }),
                api.get('/analytics/revenue', { params })
            ]);

            setPnlData(pnlRes.data);
            setRevData(revRes.data);
        } catch (err) {
            console.error('Failed to fetch analytics data', err);
            toast.error('Could not load financial data');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        try {
            setExporting(true);
            const params = { month: selectedMonth };
            if (selectedLocationId !== 'all') {
                params.location_id = selectedLocationId;
            }

            const response = await api.get('/analytics/export/pnl', {
                params,
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Profit_Loss_Statement_${new Date().toISOString().split('T')[0]}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('P&L Statement exported');
        } catch (err) {
            console.error('Export failed', err);
            toast.error('Failed to export statement');
        } finally {
            setExporting(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedLocationId, selectedMonth]);

    if (loading) return (
        <div className="flex items-center justify-center h-[80vh]">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary animate-pulse">
                <Zap size={24} />
            </div>
        </div>
    );

    const { summary, expense_breakdown, monthly_performance } = pnlData || {};
    const { top_clients, leaks } = revData || {};

    const stats = [
        {
            label: 'Total Revenue',
            value: formatCurrency(summary?.total_revenue),
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            label: 'Net Profit',
            value: formatCurrency(summary?.net_profit),
            icon: DollarSign,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10'
        },
        {
            label: 'Total Expenses',
            value: formatCurrency(summary?.total_expense),
            icon: TrendingDown,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10'
        },
        {
            label: 'Profit Margin',
            value: `${summary?.profit_margin?.toFixed(1) || 0}%`,
            icon: Target,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        }
    ];

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <PieIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-text leading-none uppercase">Profit & Loss Statement</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-[0.2em] font-bold mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Financial Analytics Active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        onClick={handleExport}
                        disabled={exporting}
                        className="h-10 px-6"
                    >
                        {exporting ? (
                            <Loader2 className="animate-spin text-primary" size={14} />
                        ) : (
                            <Download size={14} />
                        )}
                        Export P&L
                    </Button>

                    <div className="h-6 w-px bg-border/50 mx-2 hidden sm:block" />
                    <MonthSelector selectedMonth={selectedMonth} onChange={setSelectedMonth} options={monthOptions} />
                    <LocationSelector />
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="card group overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mr-12 -mt-12 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity`} />
                        <div className="relative flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} border border-white/5`}>
                                <stat.icon size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-text/30">{stat.label}</p>
                                <h3 className="text-xl font-bold text-text mt-1">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profit Trend Chart */}
                <div className="lg:col-span-2 card !p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-text">Performance Trend</h3>
                            <p className="text-[11px] text-text/40 font-medium mt-1">Revenue vs Expenses</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border/50">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black uppercase tracking-tight text-text/60">Revenue</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface rounded-lg border border-border/50">
                                <div className="w-2 h-2 rounded-full bg-rose-500" />
                                <span className="text-[10px] font-black uppercase tracking-tight text-text/60">Expense</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthly_performance}>
                                <defs>
                                    <linearGradient id="colorPnLRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorPnLExp" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgb(var(--border))" opacity={0.3} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'rgb(var(--text))', opacity: 0.3 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: 'rgb(var(--text))', opacity: 0.3 }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <ChartTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const rev = payload.find(p => p.dataKey === 'revenue')?.value || 0;
                                            const exp = payload.find(p => p.dataKey === 'expense')?.value || 0;
                                            const profit = rev - exp;
                                            return (
                                                <div className="bg-zinc-900 text-zinc-100 p-4 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-xl space-y-3">
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{payload[0].payload.month} Summary</p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-[10px] font-bold opacity-60 uppercase">Revenue</span>
                                                            <span className="text-xs font-black text-emerald-400">{formatCurrency(rev)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-[10px] font-bold opacity-60 uppercase">Expense</span>
                                                            <span className="text-xs font-black text-rose-400">-{formatCurrency(exp)}</span>
                                                        </div>
                                                        <div className="h-px bg-white/10 my-1" />
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">Net Profit</span>
                                                            <span className="text-xs font-black text-white">{formatCurrency(profit)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorPnLRev)" />
                                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorPnLExp)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Breakdown */}
                <div className="card !p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <PieIcon size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-text">Expense Breakdown</h3>
                            <p className="text-[11px] text-text/40 font-medium mt-1">Distribution by Category</p>
                        </div>
                    </div>

                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expense_breakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="amount"
                                    nameKey="category"
                                >
                                    {expense_breakdown?.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <ChartTooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-zinc-900 text-zinc-100 p-3 rounded-xl border border-white/10 shadow-xl">
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{payload[0].name}</p>
                                                    <p className="text-xs font-black mt-1">{formatCurrency(payload[0].value)}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black text-text/30 uppercase">Total</span>
                            <span className="text-sm font-bold text-text">{formatCurrency(summary?.total_expense)}</span>
                        </div>
                    </div>

                    <div className="space-y-4 mt-8">
                        {expense_breakdown?.slice(0, 4).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                    <span className="text-[11px] font-bold text-text/60 uppercase">{item.category}</span>
                                </div>
                                <span className="text-[11px] font-black text-text">{formatCurrency(item.amount)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Performing Clients (NEW) */}
                <div className="card !p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Users size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-text">Top Revenue Sources</h3>
                            <p className="text-[11px] text-text/40 font-medium mt-1">Highest Contributing Partnerships</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        {top_clients && top_clients.length > 0 ? (
                            top_clients.map((client, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-xl border border-border/50 hover:border-emerald-500/30 transition-all group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-full bg-background border border-border flex items-center justify-center text-[10px] font-black text-text/40 uppercase group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all">
                                            {client.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-text uppercase tracking-tight">{client.name}</p>
                                            <p className="text-[10px] text-text/40 font-bold uppercase transition-all group-hover:text-emerald-500/40">
                                                {client.invoices} Invoices Issued
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-500 tracking-tighter">{formatCurrency(client.total)}</p>
                                        <p className="text-[9px] font-black text-text/20 uppercase tracking-widest">Revenue Generated</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-[10px] font-black uppercase tracking-widest text-text/20">No partner data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Overdue Payments Analysis (NEW) */}
                <div className="card !p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500">
                            <AlertTriangle size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-text">Capital Risks</h3>
                            <p className="text-[11px] text-text/40 font-medium mt-1">Pending & Overdue Receivables</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-5 bg-rose-500/5 rounded-2xl border border-rose-500/10 space-y-1">
                            <p className="text-[9px] font-black uppercase text-rose-500/40 tracking-[0.2em]">Overdue Total</p>
                            <h4 className="text-xl font-black text-rose-500 tracking-tighter">{formatCurrency(leaks?.overdue_total)}</h4>
                            <p className="text-[10px] font-bold text-text/40 tracking-tight">{leaks?.overdue_count} Records Delayed</p>
                        </div>
                        <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10 space-y-1">
                            <p className="text-[9px] font-black uppercase text-amber-500/40 tracking-[0.2em]">Pending Payments</p>
                            <h4 className="text-xl font-black text-amber-500 tracking-tighter">{formatCurrency(leaks?.pending_total)}</h4>
                            <p className="text-[10px] font-bold text-text/40 tracking-tight">{leaks?.pending_count} Bills Outstanding</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text/30 border-b border-border/50 pb-2">Expense Analysis</h4>
                        {expense_breakdown?.slice(0, 5).map((item, i) => (
                            <div key={i} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-xs font-bold text-text uppercase tracking-tight">{item.category}</span>
                                    </div>
                                    <span className="text-xs font-black text-text">{formatCurrency(item.amount)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-border/50">
                                    <div
                                        className="h-full rounded-full transition-all duration-1000"
                                        style={{
                                            backgroundColor: COLORS[i % COLORS.length],
                                            width: `${(item.amount / summary?.total_expense * 100).toFixed(1)}%`
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfitLoss;
