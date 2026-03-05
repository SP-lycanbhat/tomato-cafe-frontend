import { useEffect, useState } from 'react';
import api from '../../lib/api';
import { formatCurrency } from '../../lib/utils';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import {
    TrendingUp,
    Users,
    FileText,
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Target,
    Zap,
    Crown,
    CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation } from '../../contexts/LocationContext';
import LocationSelector from '../../components/ui/LocationSelector';
import MonthSelector from '../../components/ui/MonthSelector';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(''); // will be set after data load
    const { selectedLocationId } = useLocation();

    // Compute month options from available_months returned by backend
    const monthOptions = (data?.available_months || []).map(monthValue => {
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

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const params = {};
            if (selectedMonth) params.month = selectedMonth;
            if (selectedLocationId !== 'all') {
                params.location_id = selectedLocationId;
            }
            const response = await api.get('/analytics/revenue', { params });
            setData(response.data);
        } catch (err) {
            toast.error('Failed to sync intelligence data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, [selectedLocationId, selectedMonth]);

    if (loading) return null;

    const stats = [
        {
            label: 'Total Revenue',
            value: formatCurrency(data?.summary?.total_revenue),
            icon: TrendingUp,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            label: 'Net Profit',
            value: formatCurrency(data?.summary?.net_profit),
            icon: CheckCircle2,
            color: 'text-sky-500',
            bg: 'bg-sky-500/10'
        },
        {
            label: 'Total Expenses',
            value: formatCurrency(data?.summary?.total_expense),
            icon: ArrowDownRight,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10',
            info: 'Total Expenses Logged'
        },
        {
            label: 'Overdue Payments',
            value: formatCurrency(data?.leaks?.overdue_total),
            icon: AlertTriangle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            info: `${data?.leaks?.overdue_count} Overdue Records`
        }
    ];

    return (
        <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-8">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <Zap size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-text leading-none uppercase">Financial Dashboard</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-[0.2em] font-bold mt-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Real-time Analytics Active
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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
                                {stat.info && <p className="text-[10px] text-text/40 font-bold mt-1 uppercase tracking-tighter">{stat.info}</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Growth Chart */}
                <div className="lg:col-span-2 card !p-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-text">Financial Trend</h3>
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
                            <AreaChart data={data?.growth}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
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
                                                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">{payload[0].payload.month} Statistics</p>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-[10px] font-bold opacity-60">Revenue</span>
                                                            <span className="text-xs font-black text-emerald-400">{formatCurrency(rev)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-[10px] font-bold opacity-60">Expense</span>
                                                            <span className="text-xs font-black text-rose-400">-{formatCurrency(exp)}</span>
                                                        </div>
                                                        <div className="h-px bg-white/10 my-2" />
                                                        <div className="flex items-center justify-between gap-8">
                                                            <span className="text-[10px] font-bold opacity-60">Net Profit</span>
                                                            <span className="text-sm font-black text-white">{formatCurrency(profit)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRev)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    stroke="#f43f5e"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExp)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Beneficiaries */}
                <div className="card !p-8">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Crown size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-widest text-text">Top Beneficiaries</h3>
                            <p className="text-[11px] text-text/40 font-medium">Lifetime Revenue Leaders</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {data?.top_clients?.map((client, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-xl bg-surface border border-border/50 flex items-center justify-center text-[10px] font-black group-hover:border-primary/30 transition-all">
                                            {client.name.charAt(0)}
                                        </div>
                                        {i === 0 && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-[8px] border-2 border-background">
                                                ★
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-text group-hover:text-primary transition-colors">{client.name}</p>
                                        <p className="text-[9px] text-text/30 font-black uppercase tracking-tighter mt-0.5">{client.invoices} Documents</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-black text-text">{formatCurrency(client.total)}</p>
                                    <div className="mt-1.5 w-20 h-1 bg-surface rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${(client.total / data.top_clients[0].total) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-8 py-3 bg-surface hover:bg-border/30 rounded-xl text-[10px] font-black uppercase tracking-widest text-text/40 transition-all border border-border/50">
                        View Complete Analytics
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
