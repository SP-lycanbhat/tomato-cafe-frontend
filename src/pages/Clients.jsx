import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Mail,
    Phone,
    MapPin,
    Users as UsersIcon,
    Hash,
    Building2,
    Calendar
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../components/ui/Dialog';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Tooltip } from '../components/ui/Tooltip';
import ConfirmModal from '../components/ui/ConfirmModal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', gstin: '' });

    const { user } = useAuth();

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (err) {
            toast.error('Failed to fetch clients');
        }
    };

    useEffect(() => { fetchClients(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const submissionData = {
            ...formData,
            email: formData.email?.trim() || null,
            phone: formData.phone?.trim() || null,
            gstin: formData.gstin?.trim() || null
        };
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient.id}`, submissionData);
                toast.success('Client updated successfully');
            } else {
                await api.post('/clients', submissionData);
                toast.success('Client added successfully');
            }
            setModalOpen(false);
            setEditingClient(null);
            setFormData({ name: '', email: '', phone: '', address: '', gstin: '' });
            fetchClients();
        } catch (err) {
            toast.error('Failed to save client');
        }
    };

    const initiateDelete = (client) => {
        setClientToDelete(client);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!clientToDelete) return;
        try {
            await api.delete(`/clients/${clientToDelete.id}`);
            toast.success('Client removed');
            fetchClients();
            setShowDeleteModal(false);
            setClientToDelete(null);
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.gstin || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4 w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <UsersIcon size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-text leading-none">Customer Directory</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                            {clients.length} Registered Entities
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-text/30 group-focus-within:text-primary transition-colors z-10" />
                        <input
                            placeholder="Search Profiles..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input-field w-56 pl-10 h-9 bg-background/50 backdrop-blur-sm border-border/50 text-[11px] font-bold"
                        />
                    </div>

                    <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                        <DialogTrigger asChild>
                            <button
                                onClick={() => { setEditingClient(null); setFormData({ name: '', email: '', phone: '', address: '', gstin: '' }); }}
                                className="btn-primary h-9 px-4 rounded-lg flex items-center gap-2 shadow-sm font-bold"
                            >
                                <Plus size={16} />
                                <span>Add Client</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent title={editingClient ? "Edit Client Details" : "Register New Client"}>
                            <form onSubmit={handleSubmit} className="space-y-5 py-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Legal Name</label>
                                    <input required className="input-field w-full h-11 px-4" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enterprise Name" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Email</label>
                                        <input type="email" className="input-field w-full h-11 px-4" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="office@domain.com" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Phone</label>
                                        <input className="input-field w-full h-11 px-4" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 ..." />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">GSTIN / TAX ID</label>
                                    <input className="input-field w-full h-11 px-4 uppercase font-mono" value={formData.gstin} onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })} placeholder="29XXXXX..." />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Physical Address</label>
                                    <textarea required className="input-field w-full h-24 p-4 resize-none leading-relaxed" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full billing address..." />
                                </div>
                                <Tooltip content="Register New Client">
                                    <button type="submit" className="w-full btn-primary h-11 rounded-lg font-bold mt-2 shadow-sm">
                                        {editingClient ? 'Finalize Changes' : 'Register Core Entity'}
                                    </button>
                                </Tooltip>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredClients.map(client => (
                    <div key={client.id} className="card !p-5 space-y-4 relative group border-border/50 bg-background/50 backdrop-blur-sm shadow-sm transition-all active:scale-[0.98]">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <Link to={`/clients/${client.id}`} className="font-bold text-text text-base leading-tight hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/30">
                                    {client.name}
                                </Link>
                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-surface border border-border text-[9px] font-mono font-bold text-text/40 uppercase tracking-tighter block w-fit">
                                    <Hash size={10} /> {client.gstin || 'NO GSTIN'}
                                </div>
                            </div>
                            <div className="flex gap-1.5 bg-surface/50 p-1 rounded-lg border border-border/50">
                                <Tooltip content="Edit Client">
                                    <button
                                        onClick={() => { setEditingClient(client); setFormData(client); setModalOpen(true); }}
                                        className="p-2 hover:bg-background rounded-md text-text/40 hover:text-primary transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                </Tooltip>
                                {user?.role === 'super_admin' && (
                                    <Tooltip content="Delete Client">
                                        <button
                                            onClick={() => initiateDelete(client)}
                                            className="p-2 hover:bg-background rounded-md text-text/40 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </Tooltip>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5 border-t border-border/40 pt-4">
                            <div className="flex items-start gap-3 text-xs text-text/60">
                                <MapPin size={14} className="shrink-0 text-primary/40 mt-0.5" />
                                <span className="leading-relaxed">{client.address}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-text/60">
                                <Mail size={14} className="shrink-0 text-primary/40" />
                                <span>{client.email || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-text/60">
                                <Phone size={14} className="shrink-0 text-primary/40" />
                                <span>{client.phone || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block card !p-0 overflow-hidden border-border/50 bg-background/40 backdrop-blur-xl shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-surface border-b border-border text-[9px] uppercase tracking-[0.2em] text-text/40 font-black">
                        <tr>
                            <th className="px-5 py-3">Legal name & Address</th>
                            <th className="px-5 py-3">Communication Channels</th>
                            <th className="px-5 py-3">GSTIN/Tax ID</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                        {filteredClients.map(client => (
                            <tr key={client.id} className="hover:bg-primary/[0.01] transition-colors group">
                                <td className="px-5 py-3.5">
                                    <Link to={`/clients/${client.id}`} className="text-text font-bold text-[13px] tracking-tight hover:text-primary transition-colors hover:underline underline-offset-4 decoration-primary/30">
                                        {client.name}
                                    </Link>
                                    <div className="text-[9px] text-text/30 flex items-center gap-1 mt-1 font-medium">
                                        <MapPin size={9} className="text-primary/20" /> {client.address}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5 text-[10px] text-text/60 leading-none">
                                        <Mail size={11} className="text-primary/20" /> {client.email || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] text-text/60 mt-1.5 leading-none">
                                        <Phone size={11} className="text-primary/20" /> {client.phone || 'N/A'}
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="font-mono text-[10px] font-bold text-text/40 border border-border/50 px-1.5 py-0.5 rounded bg-surface uppercase">
                                        {client.gstin || 'N/A'}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-right">
                                    <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                        <Tooltip content="Edit Details">
                                            <button
                                                onClick={() => { setEditingClient(client); setFormData(client); setModalOpen(true); }}
                                                className="p-1.5 bg-surface text-text/40 hover:text-primary rounded-lg border border-border/50 transition-all"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </Tooltip>
                                        {user?.role === 'super_admin' && (
                                            <Tooltip content="Remove Client">
                                                <button
                                                    onClick={() => initiateDelete(client)}
                                                    className="p-1.5 bg-surface text-text/40 hover:text-rose-500 rounded-lg border border-border/50 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </Tooltip>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {filteredClients.length === 0 && (
                <div className="py-24 text-center rounded-2xl border-2 border-dashed border-border/50 bg-surface/20">
                    <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4 text-text/20">
                        <UsersIcon size={32} />
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest text-text/30">No matching clients discovered</p>
                    <p className="text-[10px] text-text/20 mt-2">Try adjusting your search parameters</p>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Delete Client?"
                description={`This will permanently delete ${clientToDelete?.name} and all associated records from the directory.`}
            />
        </div>
    );
};

export default Clients;
