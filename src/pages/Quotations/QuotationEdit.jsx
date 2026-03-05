import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import LineItemRow from '../../components/Invoice/LineItemRow';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Plus, Save, ArrowLeft, Loader2, Calendar, User, Clock, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useInvoiceCalc } from '../../hooks/useInvoiceCalc';

const QuotationEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [clients, setClients] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [validityDays, setValidityDays] = useState('30');
    const [validUntil, setValidUntil] = useState(null);
    const [notes, setNotes] = useState('');
    const [lineItems, setLineItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [isInterstate, setIsInterstate] = useState(false);
    const [quotationNumber, setQuotationNumber] = useState('');
    const { subtotal, cgst, sgst, igst, grand_total } = useInvoiceCalc(lineItems, isInterstate);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientsRes, quotationRes] = await Promise.all([
                    api.get('/clients'),
                    api.get(`/quotations/${id}`)
                ]);

                setClients(clientsRes.data);

                const q = quotationRes.data;
                setQuotationNumber(q.quotation_number);
                setSelectedClientId(q.client_id || q.client_snapshot.id);
                setLineItems(q.line_items);
                setIsInterstate(q.is_interstate);
                setNotes(q.notes || '');

                if (q.valid_until) {
                    const expiry = new Date(q.valid_until);
                    setValidUntil(expiry);
                }
            } catch (err) {
                toast.error('Failed to load quotation data');
                navigate('/quotations');
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    useEffect(() => {
        if (selectedClientId && clients.length > 0) {
            const client = clients.find(c => c.id === selectedClientId || c._id === selectedClientId);
            setSelectedClient(client);
        }
    }, [selectedClientId, clients]);

    const addLineItem = () => {
        setLineItems([...lineItems, { description: '', hsn_code: '', quantity: 1, rate: 0, tax_percent: 18, amount: 0 }]);
    };

    const removeLineItem = (index) => {
        if (lineItems.length === 1) return;
        setLineItems(lineItems.filter((_, i) => i !== index));
    };

    const updateLineItem = (index, updatedItem) => {
        const newItems = [...lineItems];
        newItems[index] = updatedItem;
        setLineItems(newItems);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                client_id: selectedClientId,
                line_items: lineItems,
                is_interstate: isInterstate,
                valid_until: validUntil ? validUntil.toISOString() : null,
                notes: notes
            };
            await api.put(`/quotations/${id}`, payload);
            toast.success('Quotation updated successfully');
            navigate(`/quotations/${id}`);
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Failed to update quotation');
        } finally {
            setLoading(false);
        }
    };

    const validityOptions = [
        { label: '7 Days', value: '7' },
        { label: '15 Days', value: '15' },
        { label: '30 Days', value: '30' },
        { label: '60 Days', value: '60' },
        { label: '90 Days', value: '90' }
    ];

    const handleValidityChange = (days) => {
        setValidityDays(days);
        const today = new Date();
        const validDate = new Date();
        validDate.setDate(today.getDate() + parseInt(days));
        setValidUntil(validDate);
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary animate-pulse">
                    <Loader2 size={24} className="animate-spin" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-text/30">Syncing Quotation...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-4 border-b border-border pb-6">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-lg border border-border/40 flex items-center justify-center text-text/40 hover:text-primary transition-all">
                    <ArrowLeft size={18} />
                </button>
                <div>
                    <h1 className="text-xl font-black tracking-tight text-text leading-none uppercase">Edit {quotationNumber}</h1>
                    <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Draft Revision
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="card space-y-4 bg-background/50 border-border/50">
                            <Select
                                label="Customer / Client"
                                placeholder="Select recipient..."
                                value={selectedClientId}
                                onValueChange={setSelectedClientId}
                                options={clients.map(c => ({ label: c.name, value: c.id }))}
                            />

                            {selectedClient && (
                                <div className="p-4 bg-surface/50 rounded-xl border border-border/50">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <User size={14} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-black text-text uppercase tracking-tight">{selectedClient.name}</p>
                                            <p className="text-[10px] text-text/50 leading-relaxed font-bold">{selectedClient.address}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="card space-y-4 bg-background/50 border-border/50">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text/30">Tax Configuration</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-text/40 lowercase">interstate</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsInterstate(!isInterstate)}
                                        className={`w-9 h-5 rounded-full transition-all relative ${isInterstate ? 'bg-primary' : 'bg-surface border border-border/50'}`}
                                    >
                                        <div className={`absolute top-1 w-3 h-3 rounded-full transition-all ${isInterstate ? 'right-1 bg-background' : 'left-1 bg-text/20'}`} />
                                    </button>
                                </div>
                            </div>

                            <Select
                                label="Extend Validity"
                                placeholder="Select duration..."
                                value={validityDays}
                                onValueChange={handleValidityChange}
                                options={validityOptions}
                            />

                            <div className="p-4 bg-surface/50 rounded-xl border border-border/50 flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <Clock size={14} />
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase font-black tracking-widest text-text/30">Updated Expiry</p>
                                    <p className="text-[13px] font-black text-primary">
                                        {validUntil ? formatDate(validUntil.toISOString()) : '-'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card !p-0 overflow-hidden border-border/50 bg-background/50">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-surface/30">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text/40">Itemized List</h3>
                            <button
                                type="button"
                                onClick={addLineItem}
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-background text-[10px] font-black uppercase tracking-tight shadow-sm hover:opacity-90 transition-all active:scale-95"
                            >
                                <Plus size={12} /> Add Row
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {lineItems.map((item, idx) => (
                                <LineItemRow
                                    key={idx}
                                    index={idx}
                                    item={item}
                                    onChange={updateLineItem}
                                    onRemove={removeLineItem}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="card space-y-3 border-border/50 bg-background/50">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-text/40">Notes & Terms</h3>
                        <textarea
                            placeholder="Specify payment terms, delivery timelines, or other conditions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-transparent border border-border/50 rounded-xl p-4 text-xs font-bold text-text/70 focus:border-primary/30 outline-none transition-all h-28 resize-none"
                        />
                    </div>
                </div>

                <div className="space-y-6 lg:sticky lg:top-24 h-fit">
                    <div className="card !p-5 bg-surface/50 border-primary/20 space-y-6 relative overflow-hidden">
                        {/* Summary Header */}
                        <div className="flex items-center gap-2 relative z-10">
                            <div className="p-2 bg-primary text-background rounded-lg shadow-sm">
                                <CreditCard size={15} />
                            </div>
                            <h4 className="text-[9px] font-black uppercase text-primary tracking-[0.2em]">Estimate Summary</h4>
                        </div>

                        {/* Breakdown */}
                        <div className="space-y-2.5 relative z-10">
                            <div className="flex justify-between text-[11px] font-bold text-text/40">
                                <span className="uppercase tracking-widest">Subtotal</span>
                                <span>{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-border/50">
                                {isInterstate ? (
                                    <div className="flex justify-between text-[11px] font-black text-text/60">
                                        <span className="uppercase tracking-widest flex items-center gap-1.5">
                                            <div className="w-1 h-1 rounded-full bg-primary/30" /> IGST
                                        </span>
                                        <span>{formatCurrency(igst)}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex justify-between text-[11px] font-black text-text/60">
                                            <span className="uppercase tracking-widest flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary/30" /> CGST
                                            </span>
                                            <span>{formatCurrency(cgst)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-black text-text/60">
                                            <span className="uppercase tracking-widest flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-primary/30" /> SGST
                                            </span>
                                            <span>{formatCurrency(sgst)}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="pt-5 border-t-2 border-primary/10 flex flex-col gap-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20">Final Amount</span>
                                <span className="text-3xl font-black text-primary tracking-tighter leading-none">{formatCurrency(grand_total)}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-14 bg-text text-background font-black rounded-xl hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs uppercase tracking-widest shadow-lg shadow-black/10 disabled:opacity-50 mt-2"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={18} />}
                                <span>Save Changes</span>
                            </button>

                            <button
                                className="w-full h-10 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-all"
                                onClick={() => navigate(-1)}
                                type="button"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl border border-dashed border-border/50 text-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text/20 leading-relaxed text-balance">
                            Changes will be saved to the quotation record
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default QuotationEdit;
