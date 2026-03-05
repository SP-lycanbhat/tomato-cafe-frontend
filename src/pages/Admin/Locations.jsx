import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
    MapPin,
    Plus,
    Edit2,
    Trash2,
    Phone,
    Building2,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '../../components/ui/Dialog';
import toast from 'react-hot-toast';
import ConfirmModal from '../../components/ui/ConfirmModal';

const Locations = () => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingLoc, setEditingLoc] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [locToDelete, setLocToDelete] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '', phone: '', is_active: true });

    const fetchLocations = async () => {
        try {
            const { data } = await api.get('/locations');
            setLocations(data);
        } catch (err) {
            toast.error('Failed to load locations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLocations(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLoc) {
                await api.put(`/locations/${editingLoc.id}`, formData);
                toast.success('Location updated');
            } else {
                await api.post('/locations', formData);
                toast.success('Location added');
            }
            setModalOpen(false);
            setEditingLoc(null);
            setFormData({ name: '', address: '', phone: '', is_active: true });
            fetchLocations();
        } catch (err) {
            toast.error('Operation failed');
        }
    };

    const confirmDelete = async () => {
        try {
            await api.delete(`/locations/${locToDelete.id}`);
            toast.success('Location removed');
            setShowDeleteModal(false);
            fetchLocations();
        } catch (err) {
            toast.error('Deletion failed');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex items-center justify-between pb-4 border-b border-border">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight leading-none">Cafe Locations</h1>
                        <p className="text-[10px] text-text/40 uppercase tracking-widest font-bold mt-1.5 flex items-center gap-2">
                            {locations.length} Active Branches
                        </p>
                    </div>
                </div>

                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogTrigger asChild>
                        <button
                            onClick={() => { setEditingLoc(null); setFormData({ name: '', address: '', phone: '', is_active: true }); }}
                            className="btn-primary h-9 px-4 rounded-lg flex items-center gap-2 font-bold"
                        >
                            <Plus size={16} />
                            <span>Add Branch</span>
                        </button>
                    </DialogTrigger>
                    <DialogContent title={editingLoc ? "Update Branch Details" : "Register New Branch"}>
                        <form onSubmit={handleSubmit} className="space-y-5 py-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Location Name</label>
                                <input required className="input-field w-full h-11 px-4" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Tomato Cafe Indiranagar" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Phone Number</label>
                                <input className="input-field w-full h-11 px-4" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 ..." />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-text/40 ml-1">Physical Address</label>
                                <textarea className="input-field w-full h-24 p-4 resize-none" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address..." />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`w-10 h-5 rounded-full relative transition-all ${formData.is_active ? 'bg-primary' : 'bg-surface border border-border'}`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${formData.is_active ? 'right-0.5 bg-background' : 'left-0.5 bg-text/20'}`} />
                                </button>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-text/40">Active Status</span>
                            </div>
                            <button type="submit" className="w-full btn-primary h-11 rounded-lg font-bold mt-2 shadow-sm">
                                {editingLoc ? 'Finalize Changes' : 'Initialize Location'}
                            </button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {locations.map(loc => (
                    <div key={loc.id} className="card bg-background/50 backdrop-blur-sm border-border/50 group hover:border-primary/30 transition-all p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-background transition-all">
                                <Building2 size={20} />
                            </div>
                            <div className="flex items-center gap-1.5">
                                {loc.is_active ? (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest">
                                        <CheckCircle2 size={10} /> Active
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase tracking-widest">
                                        <XCircle size={10} /> Inactive
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-1">
                            <h3 className="font-bold text-text text-lg tracking-tight">{loc.name}</h3>
                            <div className="flex items-center gap-2 text-text/40">
                                <MapPin size={12} />
                                <p className="text-[11px] font-medium leading-relaxed truncate">{loc.address}</p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-text/40">
                                <Phone size={12} />
                                <span className="text-[10px] font-bold tracking-tight">{loc.phone || 'N/A'}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => { setEditingLoc(loc); setFormData(loc); setModalOpen(true); }}
                                    className="p-2 bg-surface hover:bg-primary/10 text-text/40 hover:text-primary rounded-lg border border-border/50 transition-all"
                                >
                                    <Edit2 size={14} />
                                </button>
                                <button
                                    onClick={() => { setLocToDelete(loc); setShowDeleteModal(true); }}
                                    className="p-2 bg-surface hover:bg-rose-500/10 text-text/40 hover:text-rose-500 rounded-lg border border-border/50 transition-all"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {locations.length === 0 && !loading && (
                <div className="py-24 text-center rounded-2xl border-2 border-dashed border-border/50 bg-surface/20">
                    <p className="text-xs font-black uppercase tracking-widest text-text/30">No branches registered yet</p>
                    <p className="text-[10px] text-text/20 mt-2">Initialize your first location to start tracking performance</p>
                </div>
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Decommission Branch?"
                description={`This will remove ${locToDelete?.name} from active records. Historical transactional data associated with this location will be preserved.`}
            />
        </div>
    );
};

export default Locations;
