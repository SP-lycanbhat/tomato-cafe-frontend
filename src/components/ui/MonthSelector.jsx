import { Calendar } from 'lucide-react';

/**
 * MonthSelector component renders a dropdown of month options.
 * It accepts an optional `options` prop to provide a custom list of months.
 * If `options` is not supplied, it falls back to generating the last 24 months.
 */
const MonthSelector = ({ selectedMonth, onChange, options }) => {
    // Determine the month options to display.
    // `options` should be an array of objects: { label: string, value: string }.
    // If `options` is undefined, it falls back to generating the last 24 months.
    const monthOptions = options !== undefined ? options : Array.from({ length: 24 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const val = d.toISOString().slice(0, 7);
        const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        return { label, value: val };
    });

    return (
        <div className="flex items-center bg-surface/50 border border-border/40 rounded-lg hover:border-primary/30 transition-all relative group">
            <div className="px-3 border-r border-border/40 flex items-center justify-center text-text/30 group-hover:text-primary transition-colors">
                <Calendar size={14} />
            </div>
            <select
                value={selectedMonth}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 px-3 pr-8 bg-transparent text-[11px] font-black uppercase tracking-widest text-text hover:text-primary transition-colors outline-none cursor-pointer appearance-none"
            >
                <option value="all">All Time</option>
                {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text/30 group-hover:text-primary transition-colors">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};

export default MonthSelector;
