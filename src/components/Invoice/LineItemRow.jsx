import { Trash2 } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

const LineItemRow = ({ item, index, onChange, onRemove, disabled }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...item, [name]: value };

        if (name === 'quantity' || name === 'rate') {
            const q = name === 'quantity' ? parseFloat(value) || 0 : item.quantity;
            const r = name === 'rate' ? parseFloat(value) || 0 : item.rate;
            updated.amount = q * r;
        }

        onChange(index, updated);
    };

    return (
        <div className="flex flex-col md:flex-row gap-2 items-start md:items-end group bg-surface/30 p-2 rounded border border-border/50 transition-colors">
            <div className="flex-1 min-w-[150px] space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">Description</label>
                <input
                    name="description"
                    value={item.description}
                    onChange={handleChange}
                    disabled={disabled}
                    placeholder="Product details..."
                    className="w-full bg-transparent border-b border-border/50 focus:border-primary outline-none py-0.5 text-xs font-medium"
                />
            </div>

            <div className="w-20 space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">HSN</label>
                <input
                    name="hsn_code"
                    value={item.hsn_code}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full bg-transparent border-b border-border/50 focus:border-primary outline-none py-0.5 text-xs text-center font-mono"
                />
            </div>

            <div className="w-12 space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">Qty</label>
                <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full bg-transparent border-b border-border/50 focus:border-primary outline-none py-0.5 text-xs text-center"
                />
            </div>

            <div className="w-20 space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">Rate</label>
                <input
                    type="number"
                    name="rate"
                    value={item.rate}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full bg-transparent border-b border-border/50 focus:border-primary outline-none py-0.5 text-xs text-right"
                />
            </div>

            <div className="w-12 space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">Tax%</label>
                <input
                    type="number"
                    name="tax_percent"
                    value={item.tax_percent}
                    onChange={handleChange}
                    disabled={disabled}
                    className="w-full bg-transparent border-b border-border/50 focus:border-primary outline-none py-0.5 text-xs text-center"
                />
            </div>

            <div className="w-24 space-y-1 text-right">
                <label className="text-[9px] font-bold uppercase tracking-widest opacity-30">Total</label>
                <div className="py-0.5 text-xs font-bold text-text truncate">
                    {formatCurrency(item.amount)}
                </div>
            </div>

            <button
                type="button"
                onClick={() => onRemove(index)}
                disabled={disabled}
                className="p-1 opacity-0 group-hover:opacity-100 text-text/30 hover:text-red-500 transition-all disabled:opacity-0"
            >
                <Trash2 size={14} />
            </button>
        </div>
    );
};

export default LineItemRow;
