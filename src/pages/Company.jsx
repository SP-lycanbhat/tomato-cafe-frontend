import { useEffect, useState } from 'react';
import api from '../lib/api';
import {
    Save,
    Loader2,
    BadgeCheck,
    Building2,
    Banknote,
    MapPin,
    Globe,
    Hash,
    Image as ImageIcon,
    Mail,
    Phone,
    Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCompany } from '../contexts/CompanyContext';
import toast from 'react-hot-toast';

const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Icon size={16} />
        </div>
        <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.15em] text-text">{title}</h2>
            {description && <p className="text-[9px] uppercase tracking-widest text-text/30 mt-0.5 font-bold">{description}</p>}
        </div>
    </div>
);

const InputWrapper = ({ label, icon: Icon, children }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-black uppercase tracking-[0.1em] text-text/30 flex items-center gap-1.5 ml-1">
            {Icon && <Icon size={9} />}
            {label}
        </label>
        {children}
    </div>
);

const Company = () => {
    const [formData, setFormData] = useState({
        name: '', address: '', email: '', phone: '', gstin: '', logo_url: '', invoice_prefix: 'TC',
        bank_name: '', account_number: '', ifsc_code: '', branch: '', udyam_number: '', account_name: ''
    });
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { company, refreshCompany, loading: fetching } = useCompany();
    const isAdmin = user?.role === 'super_admin';

    useEffect(() => {
        if (company) {
            setFormData(company);
        }
    }, [company]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/company', formData);
            await refreshCompany();
            toast.success('Organization updated successfully');
        } catch (err) {
            toast.error('Failed to update organization');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="h-40 flex items-center justify-center text-xs uppercase tracking-widest text-text/30">Syncing...</div>;

    return (
        <div className="w-full space-y-4 pb-20 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-2 border-b border-border">
                <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-xl bg-background border border-primary/20 flex items-center justify-center overflow-hidden shadow-sm group relative">
                        {formData.logo_url ? (
                            <img src={formData.logo_url} alt="Logo" className="w-full h-full object-contain p-2" />
                        ) : (
                            <Building2 size={24} className="text-primary/40" />
                        )}
                        {isAdmin && (
                            <label className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                                <ImageIcon size={16} className="text-text" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => setFormData({ ...formData, logo_url: reader.result });
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                />
                            </label>
                        )}
                    </div>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-text leading-tight">{formData.name || 'Tomato Organization'}</h1>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-black rounded uppercase tracking-widest border border-primary/10">
                                {formData.invoice_prefix}-SERIES
                            </span>
                            {isAdmin ? (
                                <span className="text-[9px] font-black text-text/30 uppercase tracking-widest flex items-center gap-1">
                                    <BadgeCheck size={11} className="text-emerald-500" /> Administrative
                                </span>
                            ) : (
                                <span className="text-[9px] font-black text-text/30 uppercase tracking-widest flex items-center gap-1">
                                    Read Only
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="btn-primary min-w-[140px] h-9 flex items-center justify-center gap-2 rounded-lg shadow-sm"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        <span className="font-bold">Update Entity</span>
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Identity & Legal */}
                <div className="lg:col-span-8 space-y-5">
                    <div className="card !p-5 border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                        <SectionHeader icon={Building2} title="Legal Identity" description="Official names and tax registration" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <InputWrapper label="Legal Name" icon={Building2}>
                                    <input
                                        disabled={!isAdmin}
                                        required
                                        className="input-field w-full font-bold text-[13px] bg-surface/50 h-9 px-3"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </InputWrapper>
                            </div>
                            <InputWrapper label="GSTIN / VAT ID" icon={Hash}>
                                <input
                                    disabled={!isAdmin}
                                    required
                                    className="input-field w-full uppercase font-mono text-[11px] bg-surface/50 h-9 px-3"
                                    value={formData.gstin}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                                />
                            </InputWrapper>
                            <InputWrapper label="Registration No" icon={Briefcase}>
                                <input
                                    disabled={!isAdmin}
                                    className="input-field w-full uppercase font-mono text-[11px] bg-surface/50 h-9 px-3"
                                    value={formData.udyam_number || ''}
                                    onChange={(e) => setFormData({ ...formData, udyam_number: e.target.value.toUpperCase() })}
                                    placeholder="REG-000-000"
                                />
                            </InputWrapper>
                        </div>
                    </div>

                    <div className="card !p-5 border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                        <SectionHeader icon={MapPin} title="Contact & Location" description="Primary communication handles" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <InputWrapper label="Business Address" icon={MapPin}>
                                    <textarea
                                        disabled={!isAdmin}
                                        required
                                        className="input-field w-full h-20 resize-none bg-surface/50 p-3 text-[13px] leading-relaxed"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </InputWrapper>
                            </div>
                            <InputWrapper label="Support Email" icon={Mail}>
                                <input
                                    disabled={!isAdmin}
                                    required
                                    type="email"
                                    className="input-field w-full bg-surface/50 h-9 px-3 text-[13px]"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </InputWrapper>
                            <InputWrapper label="Business Phone" icon={Phone}>
                                <input
                                    disabled={!isAdmin}
                                    required
                                    className="input-field w-full bg-surface/50 h-9 px-3 text-[13px]"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </InputWrapper>
                        </div>
                    </div>
                </div>

                {/* Right Column: Invoicing & Banking */}
                <div className="lg:col-span-4 space-y-5">
                    <div className="card !p-5 border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                        <SectionHeader icon={Globe} title="Billing Config" description="Invoice series prefix" />
                        <InputWrapper label="Invoice Prefix" icon={Hash}>
                            <input
                                disabled={!isAdmin}
                                required
                                className="input-field w-full uppercase font-black text-center tracking-widest bg-surface/50 h-9 px-3"
                                value={formData.invoice_prefix}
                                onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value.toUpperCase() })}
                            />
                        </InputWrapper>
                    </div>

                    <div className="card !p-5 border-border/50 shadow-sm bg-background/50 backdrop-blur-sm">
                        <SectionHeader icon={Banknote} title="Banking Info" description="Account for settlements" />
                        <div className="space-y-4">
                            <InputWrapper label="Account Name">
                                <input
                                    disabled={!isAdmin}
                                    className="input-field w-full text-xs bg-surface/50 h-9 px-3"
                                    value={formData.account_name || ''}
                                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                                />
                            </InputWrapper>
                            <InputWrapper label="Bank Name">
                                <input
                                    disabled={!isAdmin}
                                    className="input-field w-full text-xs bg-surface/50 h-9 px-3"
                                    value={formData.bank_name || ''}
                                    onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                                />
                            </InputWrapper>
                            <InputWrapper label="Account Number">
                                <input
                                    disabled={!isAdmin}
                                    className="input-field w-full font-mono text-xs bg-surface/50 h-9 px-3"
                                    value={formData.account_number || ''}
                                    onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                                />
                            </InputWrapper>
                            <InputWrapper label="IFSC Code">
                                <input
                                    disabled={!isAdmin}
                                    className="input-field w-full uppercase font-mono text-xs bg-surface/50 h-9 px-3"
                                    value={formData.ifsc_code || ''}
                                    onChange={(e) => setFormData({ ...formData, ifsc_code: e.target.value.toUpperCase() })}
                                />
                            </InputWrapper>
                            <InputWrapper label="Branch">
                                <input
                                    disabled={!isAdmin}
                                    className="input-field w-full text-xs bg-surface/50 h-9 px-3"
                                    value={formData.branch || ''}
                                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                                />
                            </InputWrapper>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default Company;
