import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
    Shield, ShieldAlert, Loader2, Users, UserCheck, UserX, Search, ShieldCheck,
    Mail, Fingerprint, Edit, Trash2, Key, Save
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Dialog, DialogContent } from '../../components/ui/Dialog';
import ConfirmModal from '../../components/ui/ConfirmModal';
import { Tooltip, TooltipProvider } from '../../components/ui/Tooltip';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionId, setActionId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal states
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Form states
    const [formData, setFormData] = useState({ name: '', email: '', role: '' });
    const [newPassword, setNewPassword] = useState('');

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/users');
            setUsers(data);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const toggleActivate = async (id) => {
        setActionId(id);
        try {
            await api.patch(`/users/${id}/activate`);
            toast.success('Status updated');
            fetchUsers();
        } catch (err) {
            toast.error('Operation failed');
        } finally {
            setActionId(null);
        }
    };

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!formData.name || !formData.email) {
            toast.error('All fields are required');
            return;
        }
        setActionId(selectedUser.id);
        try {
            await api.patch(`/users/${selectedUser.id}`, formData);
            toast.success('User updated');
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Update failed');
        } finally {
            setActionId(null);
        }
    };

    const handleResetClick = (user) => {
        setSelectedUser(user);
        setNewPassword('');
        setIsResetModalOpen(true);
    };

    const handleSaveReset = async () => {
        if (!newPassword || newPassword.length < 4) {
            toast.error('Password must be at least 4 chars');
            return;
        }
        setActionId(selectedUser.id);
        try {
            await api.post(`/users/${selectedUser.id}/reset-password`, { password: newPassword });
            toast.success('Password updated successfully');
            setIsResetModalOpen(false);
        } catch (err) {
            toast.error('Reset failed');
        } finally {
            setActionId(null);
        }
    };

    const handleDeleteClick = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        setActionId(selectedUser.id);
        try {
            await api.delete(`/users/${selectedUser.id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.detail || 'Deletion failed');
        } finally {
            setActionId(null);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="h-64 flex flex-col items-center justify-center gap-4 animate-pulse">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <ShieldCheck size={24} className="animate-spin" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-text/30">Loading System Directory...</p>
        </div>
    );

    return (
        <TooltipProvider>
            <div className="space-y-4 w-full pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-border">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-inner">
                            <Users size={20} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-text leading-none uppercase">User Hub</h1>
                            <div className="flex items-center gap-2 mt-1.5">
                                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest">
                                    <Shield size={9} /> Admin Center
                                </span>
                                <span className="text-[10px] text-text/30 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <Users size={11} /> {users.length} Total Users
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text/20 z-10" size={14} />
                        <input
                            type="text"
                            placeholder="Search Users..."
                            className="input-field w-full !pl-10 !h-9 bg-background/50 backdrop-blur-sm border-border/50 font-bold text-[11px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Ledger */}
                <div className="card !p-0 overflow-hidden border-border/50 bg-background/50 backdrop-blur-xl shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-surface border-b border-border text-[9px] uppercase tracking-[0.2em] text-text/40 font-black">
                                <tr>
                                    <th className="px-5 py-3">User Details</th>
                                    <th className="px-5 py-3 text-center">Role</th>
                                    <th className="px-5 py-3">Status</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className="group hover:bg-primary/[0.01] transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-surface border border-border/20 flex items-center justify-center text-[10px] text-primary/60 font-black shadow-inner">
                                                    {u.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-[13px] font-black text-text tracking-tight group-hover:text-primary transition-colors">{u.name}</div>
                                                    <div className="text-[9px] text-text/30 font-bold flex items-center gap-1.5 mt-0.5">
                                                        <Mail size={9} className="text-primary/20" /> {u.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-center">
                                            <span className="inline-flex px-2 py-0.5 rounded border border-border/30 bg-surface/50 text-[9px] font-black uppercase tracking-widest text-text/40">
                                                {u.role.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-rose-500'}`} />
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${u.is_active ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                    {u.is_active ? 'Active' : 'Deactivated'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2 text-[10px] font-black uppercase tracking-widest">
                                                {u.role !== 'super_admin' && (
                                                    <Tooltip content={u.is_active ? "Lock Account" : "Unlock Account"}>
                                                        <button
                                                            onClick={() => toggleActivate(u.id)}
                                                            disabled={actionId === u.id}
                                                            className={`p-2 rounded-lg transition-all border shadow-sm ${u.is_active
                                                                ? 'bg-background text-rose-500 border-rose-500/10 hover:bg-rose-500/5'
                                                                : 'bg-primary text-background border-primary hover:opacity-90'
                                                                }`}
                                                        >
                                                            {actionId === u.id && !isEditModalOpen && !isResetModalOpen && !isDeleteModalOpen ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : u.is_active ? <UserX size={12} /> : <UserCheck size={12} />}
                                                        </button>
                                                    </Tooltip>
                                                )}

                                                <Tooltip content="Reset Password">
                                                    <button
                                                        onClick={() => handleResetClick(u)}
                                                        className="p-2 rounded-lg bg-background text-primary border border-primary/10 hover:bg-primary/5 transition-all shadow-sm"
                                                    >
                                                        <Key size={12} />
                                                    </button>
                                                </Tooltip>

                                                <Tooltip content="Edit Details">
                                                    <button
                                                        onClick={() => handleEditClick(u)}
                                                        className="p-2 rounded-lg bg-background text-text/60 border border-border hover:bg-surface transition-all shadow-sm"
                                                    >
                                                        <Edit size={12} />
                                                    </button>
                                                </Tooltip>

                                                {u.role !== 'super_admin' && (
                                                    <Tooltip content="Delete User">
                                                        <button
                                                            onClick={() => handleDeleteClick(u)}
                                                            className="p-2 rounded-lg bg-background text-rose-500 border-rose-500/10 hover:bg-rose-500/5 transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={12} />
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
                    {filteredUsers.length === 0 && (
                        <div className="py-20 flex flex-col items-center justify-center text-center opacity-20">
                            <Users size={48} className="mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No users found</p>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
                <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                    <DialogContent title="Edit User Details" description="Update user information and access levels.">
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-black text-text/40">Full Name</label>
                                <input
                                    className="input-field w-full"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter full name..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-black text-text/40">Email Address</label>
                                <input
                                    className="input-field w-full"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="Enter email..."
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-black text-text/40">Access Role</label>
                                <select
                                    className="input-field w-full"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="staff">Staff</option>
                                    <option value="super_admin">System Admin</option>
                                </select>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-text/40 hover:bg-surface transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    disabled={actionId === selectedUser?.id}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {actionId === selectedUser?.id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Reset Modal */}
                <Dialog open={isResetModalOpen} onOpenChange={setIsResetModalOpen}>
                    <DialogContent title="Update Password" description="Assign a new login password for this user.">
                        <div className="space-y-4 py-2">
                            <div className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-widest font-black text-text/40">New Password</label>
                                <input
                                    type="password"
                                    className="input-field w-full"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    placeholder="Min 4 characters..."
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={() => setIsResetModalOpen(false)}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-[10px] font-black uppercase tracking-widest text-text/40 hover:bg-surface transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveReset}
                                    disabled={actionId === selectedUser?.id}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-background text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    {actionId === selectedUser?.id ? <Loader2 size={12} className="animate-spin" /> : <Key size={12} />}
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <ConfirmModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Delete User"
                    description={`This action will permanently delete ${selectedUser?.name} and all associated access records.`}
                    confirmText="Delete Now"
                    variant="danger"
                />

                {/* Bottom Insight Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="card !p-4 flex items-start gap-3 border-dashed border-border/50 bg-surface/30 group">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg group-hover:scale-110 transition-transform">
                            <ShieldCheck size={16} />
                        </div>
                        <div>
                            <h4 className="font-black text-[10px] uppercase tracking-[0.15em] text-text/40 mb-1 group-hover:text-text transition-colors">Access Control</h4>
                            <p className="text-[10px] text-text/30 leading-relaxed font-bold">Account locking prevents logins immediately. All authorization changes are logged in the system.</p>
                        </div>
                    </div>
                    <div className="card !p-4 flex items-start gap-3 border-dashed border-border/50 bg-surface/30 group">
                        <div className="p-2 bg-rose-500/10 text-rose-500 rounded-lg group-hover:scale-110 transition-transform">
                            <ShieldAlert size={16} />
                        </div>
                        <div>
                            <h4 className="font-black text-[10px] uppercase tracking-[0.15em] text-text/40 mb-1 group-hover:text-text transition-colors">Security Compliance</h4>
                            <p className="text-[10px] text-text/30 leading-relaxed font-bold">Deletion is permanent. Ensure all necessary record handovers are completed before removal.</p>
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

export default UserManagement;
