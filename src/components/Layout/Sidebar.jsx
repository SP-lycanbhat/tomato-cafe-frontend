import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCompany } from '../../contexts/CompanyContext';
import { useEffect, useState } from 'react';
import api from '../../lib/api';
import {
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    UserCog,
    LogOut,
    Menu,
    ChevronRight,
    Zap,
    Sparkles,
    Shield,
    Wallet,
    TrendingUp,
    ClipboardList,
    MapPin,
    PieChart
} from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const { company } = useCompany();
    const location = useLocation();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/invoices', icon: FileText, label: 'Invoices' },
        { to: '/quotations', icon: ClipboardList, label: 'Quotations' },
        { to: '/revenue', icon: TrendingUp, label: 'Revenue' },
        { to: '/profit-loss', icon: PieChart, label: 'Profit & Loss' },
        { to: '/expenses', icon: Wallet, label: 'Expenses' },
        { to: '/clients', icon: Users, label: 'Clients' },
        { to: '/company', icon: Settings, label: 'Organization' },
    ];

    if (user?.role === 'super_admin') {
        navItems.push({ to: '/admin/locations', icon: MapPin, label: 'Cafe Branches' });
        navItems.push({ to: '/admin/users', icon: UserCog, label: 'Admin Hub' });
    }

    return (
        <>
            {/* Desktop Modern Sidebar */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border/40 bg-background fixed h-screen top-0 z-40 transition-all">
                {/* Branding Section */}
                <div className="p-6 pb-2 flex justify-center">
                    <div className="group transition-transform hover:scale-105 duration-500">
                        {company?.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt="Logo"
                                className="max-h-12 w-auto object-contain"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-background shadow-lg shadow-primary/20 rotate-3">
                                <Zap size={20} fill="currentColor" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-3 space-y-1">
                    <div className="px-4 mb-2">
                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-text/20">Main</span>
                    </div>
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`group relative flex items-center justify-between px-4 py-2.5 rounded-xl text-[12px] font-bold tracking-tight transition-all ${isActive
                                    ? 'bg-primary text-background shadow-lg shadow-primary/10'
                                    : 'hover:bg-surface text-text/60 hover:text-text hover:translate-x-0.5'
                                    }`}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon
                                        size={18}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={`${isActive ? 'text-background' : 'text-text/30 group-hover:text-primary'} transition-colors duration-300`}
                                    />
                                    <span>{item.label}</span>
                                </div>
                                {isActive && (
                                    <div className="absolute -left-1 w-1 h-6 bg-background rounded-full" />
                                )}
                                {!isActive && (
                                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section / Footer */}
                <div className="p-6">
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="group flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-surface/50 border border-border/40 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:bg-rose-500 hover:text-background hover:border-rose-500 transition-all active:scale-95 shadow-sm"
                    >
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation - Full Width & Fixed */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-2xl border-t border-border/40 shadow-[0_-8px_30px_rgb(0,0,0,0.12)] flex items-center overflow-x-auto no-scrollbar px-4 z-50 transition-all duration-300">
                <div className="flex items-center gap-1 min-w-full justify-between">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.to;
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`relative flex flex-col items-center justify-center min-w-[50px] h-12 rounded-xl transition-all duration-300 active:scale-90 ${isActive
                                    ? 'bg-primary text-background shadow-lg shadow-primary/20 scale-105'
                                    : 'text-text/40 hover:text-text/60'
                                    }`}
                            >
                                <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <div className="absolute -bottom-1 w-1 h-1 bg-background rounded-full" />
                                )}
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex flex-col items-center justify-center min-w-[50px] h-12 rounded-xl text-rose-500/60 transition-all hover:bg-rose-500/10 active:scale-90"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </nav>

            <ConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={logout}
                title="Logout?"
                description="Are you sure you want to logout of your session?"
                confirmText="Logout Now"
                cancelText="Stay Active"
                variant="danger"
            />
        </>
    );
};

export default Sidebar;

