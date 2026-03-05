import { useMemo } from 'react';

export const useInvoiceCalc = (lineItems, isInterstate) => {
    const totals = useMemo(() => {
        const subtotal = lineItems.reduce((acc, item) => acc + (parseFloat(item.amount) || 0), 0);
        let cgst = 0;
        let sgst = 0;
        let igst = 0;

        lineItems.forEach((item) => {
            const amount = parseFloat(item.amount) || 0;
            const taxPercent = parseFloat(item.tax_percent) || 0;
            const taxAmount = (amount * taxPercent) / 100;

            if (isInterstate) {
                igst += taxAmount;
            } else {
                cgst += taxAmount / 2;
                sgst += taxAmount / 2;
            }
        });

        return {
            subtotal,
            cgst,
            sgst,
            igst,
            grand_total: subtotal + cgst + sgst + igst,
        };
    }, [lineItems, isInterstate]);

    return totals;
};
