import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { formatCurrency, formatDate } from '../lib/utils';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    MapPin,
    ShieldCheck,
    FileText,
    Users,
    CreditCard,
    ArrowRight,
    Eye,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    Edit2,
    Trash2,
    Plus
} from 'lucide-react';
import { Tooltip } from '../components/ui/Tooltip';
import { Dialog, DialogContent } from '../components/ui/Dialog';
import ConfirmModal from '../components/ui/ConfirmModal';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ClientDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', gstin: '', company_name: '' });

    const { user } = useAuth();

    const fetchData = async () => {
        try {
            const [clientRes, invoicesRes] = await Promise.all([
                api.get(`/clients/${id}`),
                api.get('/invoices')
            ]);
            setClient(clientRes.data);
            // Filter invoices for this client
            setInvoices(invoicesRes.data.filter(inv =>
                (inv.client_snapshot?.id || inv.client_snapshot?._id || inv.client_id) === id
            ));
        } catch (err) {
            toast.error('Failed to load client profile');
            navigate('/clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            email: formData.email?.trim() || null,
            phone: formData.phone?.trim() || null,
            gstin: formData.gstin?.trim() || null
        };
        try {
            await api.put(`/clients/${id}`, submissionData);
            toast.success('Client updated successfully');
            setModalOpen(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to update client');
        }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/clients/${id}`);
            toast.success('Client removed');
            navigate('/clients');
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    const handleEditClick = () => {
        setFormData({
            name: client.name,
            email: client.email || '',
            phone: client.phone || '',
            address: client.address || '',
            gstin: client.gstin || '',
            company_name: client.company_name || ''
        });
        setModalOpen(true);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'paid': return { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 };
            case 'overdue': return { color: 'text-rose-500', bg: 'bg-rose-500/10', icon: AlertCircle };
            case 'sent': return { color: 'text-sky-500', bg: 'bg-sky-500/10', icon: Clock };
            default: return { color: 'text-text/40', bg: 'bg-surface', icon: FileText };
        }
    };

    if (loading) return (
        <div className="h-64 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Users size={24} className="animate-bounce" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text/30">Decrypting Entity Profile...</p>
        </div>
    );

    const totalBilled = invoices.reduce((sum, inv) => sum + inv.grand_total, 0);
    const outstanding = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + inv.grand_total, 0);

    return (
        <div className="w-full space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                <div className="flex items-center gap-4">
                    <Tooltip content="Return to Directory">
                        <button
                            onClick={() => navigate('/clients')}
                            className="w-10 h-10 rounded-lg border border-border/40 flex items-center justify-center text-text/40 hover:text-primary transition-all active:scale-95"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    </Tooltip>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-text leading-none">{client.name}</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                            Core Representative
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Tooltip content="Edit Details">
                        <button
                            onClick={handleEditClick}
                            className="h-10 px-4 bg-background border border-border rounded-lg text-text font-bold text-[11px] flex items-center gap-2 transition-all hover:bg-surface shadow-sm"
                        >
                            <Edit2 size={14} />
                            <span>Edit Profile</span>
                        </button>
                    </Tooltip>

                    {user?.role === 'super_admin' && (
                        <Tooltip content="Delete Permanently">
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="w-10 h-10 bg-surface border border-border/50 flex items-center justify-center text-text/40 hover:text-rose-500 rounded-lg transition-all"
                            >
                                <Trash2 size={16} />
                            </button>
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Client Profile */}
                <div className="space-y-6">
                    <div className="card bg-background border-border/40 p-6 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
                                <Building2 size={18} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-text/30">Organization</h3>
                                <p className="text-sm font-bold text-text">{client.company_name}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-border/40">
                            <div className="flex items-start gap-3">
                                <Mail size={14} className="text-text/20 mt-1" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text/30">Email Vector</p>
                                    <p className="text-[11px] font-bold text-text/60">{client.email || 'No record'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Phone size={14} className="text-text/20 mt-1" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text/30">Contact Line</p>
                                    <p className="text-[11px] font-bold text-text/60">{client.phone || 'No record'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <ShieldCheck size={14} className="text-text/20 mt-1" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text/30">Tax Identity (GSTIN)</p>
                                    <p className="text-[11px] font-mono font-black text-primary/60">{client.gstin || 'No record'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin size={14} className="text-text/20 mt-1" />
                                <div className="space-y-0.5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text/30">Physical Vertex</p>
                                    <p className="text-[11px] font-bold text-text/60 leading-relaxed max-w-[200px]">{client.address}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial stats card */}
                    <div className="card bg-zinc-900 text-zinc-100 p-6 space-y-6 border-none shadow-xl shadow-black/10">
                        <div className="flex items-center gap-3">
                            <CreditCard size={18} className="opacity-40" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest opacity-40">Financial Standing</h3>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Total Ledger Volume</p>
                                <p className="text-2xl font-black tracking-tighter">{formatCurrency(totalBilled)}</p>
                            </div>
                            <div className="pt-4 border-t border-white/10">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-30 mb-1">Outstanding Balance</p>
                                <p className="text-2xl font-black tracking-tighter text-rose-400">{formatCurrency(outstanding)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Invoices List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center text-text/30 border border-border/40">
                                <FileText size={16} />
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-[0.15em] text-text">Related Records</h2>
                        </div>
                        <p className="text-[10px] font-bold text-text/20 uppercase tracking-widest">{invoices.length} Documents</p>
                    </div>

                    <div className="card !p-0 overflow-hidden border-border/40 bg-background/40 backdrop-blur-xl">
                        <table className="w-full text-left">
                            <thead className="bg-surface/50 border-b border-border text-[9px] uppercase tracking-[0.2em] text-text/40 font-black">
                                <tr>
                                    <th className="px-5 py-3">Serial</th>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Amount</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/20">
                                {invoices.length > 0 ? invoices.map((inv) => {
                                    const styles = getStatusStyles(inv.status);
                                    const StatusIcon = styles.icon;
                                    return (
                                        <tr key={inv.id} className="hover:bg-primary/[0.01] transition-colors group">
                                            <td className="px-5 py-4 font-mono text-xs font-black text-text/70">{inv.invoice_number}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-[11px] font-bold text-text/50">
                                                    <Calendar size={12} className="opacity-20" />
                                                    {formatDate(inv.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-[12px] font-black text-text">{formatCurrency(inv.grand_total)}</td>
                                            <td className="px-5 py-4">
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${styles.bg} ${styles.color}`}>
                                                    <StatusIcon size={9} />
                                                    {inv.status}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <Tooltip content="Navigate to Source">
                                                    <Link
                                                        to={`/invoices/${inv.id}`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-surface border border-border/40 text-text/30 hover:text-primary transition-all"
                                                    >
                                                        <ArrowRight size={14} />
                                                    </Link>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-5 py-20 text-center">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-text/20">No financial records found for this entity</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent title="Edit Client Information">
                    <form onSubmit={handleSubmit} className="space-y-5 py-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Legal Name</label>
                            <input required className="input-field w-full h-11 px-4 text-xs font-bold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Full Name" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Organization / Company</label>
                            <input className="input-field w-full h-11 px-4 text-xs font-bold" value={formData.company_name} onChange={(e) => setFormData({ ...formData, company_name: e.target.value })} placeholder="Enterprise Name" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Email</label>
                                <input type="email" className="input-field w-full h-11 px-4 text-xs font-bold" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="office@domain.com" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Phone</label>
                                <input className="input-field w-full h-11 px-4 text-xs font-bold" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 ..." />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">GSTIN / TAX ID</label>
                            <input className="input-field w-full h-11 px-4 uppercase font-mono text-xs font-bold" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })} placeholder="29XXXXX..." />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Physical Address</label>
                            <textarea required className="input-field w-full h-24 p-4 resize-none leading-relaxed text-xs font-bold" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full billing address..." />
                        </div>
                        <button type="submit" className="w-full btn-primary h-11 rounded-lg font-black uppercase tracking-widest text-[10px] mt-2 shadow-sm">
                            Finalize Profile Changes
                        </button>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Client?"
                description="This will permanently delete this client and all associated relationship metadata from the system. This cannot be reversed."
            />
        </div>
    );
};

export default ClientDetail;
