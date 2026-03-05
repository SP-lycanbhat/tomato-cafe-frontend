import { formatCurrency } from '../../lib/utils';
import { useInvoiceCalc } from '../../hooks/useInvoiceCalc';

const TaxSummary = ({ lineItems, isInterstate, compact, dark }) => {
    const { subtotal, cgst, sgst, igst, grand_total } = useInvoiceCalc(lineItems, isInterstate);

    const labelClass = dark ? 'text-white/70' : 'opacity-50';

    return (
        <div className={`space-y-1.5 ${compact ? '' : 'card'}`}>
            <div className="flex justify-between text-[11px]">
                <span className={`${labelClass} uppercase tracking-tighter`}>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>

            {isInterstate ? (
                <div className="flex justify-between text-[11px]">
                    <span className={`${labelClass} uppercase tracking-tighter`}>IGST</span>
                    <span className="font-medium">{formatCurrency(igst)}</span>
                </div>
            ) : (
                <>
                    <div className="flex justify-between text-[11px]">
                        <span className={`${labelClass} uppercase tracking-tighter`}>CGST</span>
                        <span className="font-medium">{formatCurrency(cgst)}</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                        <span className={`${labelClass} uppercase tracking-tighter`}>SGST</span>
                        <span className="font-medium">{formatCurrency(sgst)}</span>
                    </div>
                </>
            )}

            <div className={`pt-2 flex justify-between items-baseline border-t ${compact ? (dark ? 'border-white/10' : 'border-current/10') : 'border-border'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${dark ? 'text-white/50' : ''}`}>Total</span>
                <span className={`font-bold ${compact ? 'text-lg' : 'text-base'}`}>{formatCurrency(grand_total)}</span>
            </div>
        </div>
    );
};

export default TaxSummary;
