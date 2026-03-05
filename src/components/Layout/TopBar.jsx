import { useTheme } from 'next-themes';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation as usePath } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import { Sun, Moon, Bell, Search, Command, ShieldCheck, User as UserIcon, MapPin, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/DropdownMenu';

const TopBar = () => {
    const { theme, setTheme } = useTheme();
    const { user } = useAuth();
    const path = usePath();
    const { locations, selectedLocationId, setSelectedLocationId, selectedLocation } = useLocation();

    const getPageTitle = () => {
        const p = path.pathname;
        if (p === '/dashboard') return 'System Overview';
        if (p.startsWith('/invoices')) return 'Financial Ledger';
        if (p === '/clients') return 'Client Directory';
        if (p === '/company') return 'Organization Profile';
        if (p === '/admin/users') return 'Identity Management';
        if (p === '/admin/locations') return 'Nexus Control';
        return 'System Core';
    };

    return (
        <header className="h-14 border-b border-border/40 flex items-center px-4 md:px-6 lg:px-8 bg-background/50 backdrop-blur-2xl sticky top-0 z-30 transition-all">
            <div className="flex-1 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h2 className="text-[11px] font-black tracking-[0.3em] text-text/30 uppercase leading-none hidden lg:block">
                        {getPageTitle()}
                    </h2>

                    {/* Quick Search Trigger */}
                    <div
                        onClick={() => window.dispatchEvent(new CustomEvent('open-search'))}
                        className="hidden md:flex items-center gap-3 px-3 py-1.5 border border-border/40 rounded-lg text-text/30 hover:border-primary/20 hover:text-text/60 transition-all cursor-pointer group"
                    >
                        <Search size={14} className="group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Universal Query</span>
                        <div className="flex items-center gap-1 ml-2 border border-border/40 px-1.5 py-0.5 rounded bg-background/50">
                            <Command size={10} />
                            <span className="text-[9px] font-bold uppercase tracking-tighter">K</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">


                    {/* Mode Toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface text-text/40 hover:text-primary transition-all"
                    >
                        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    <div className="h-4 w-[1px] bg-border/40 mx-2" />

                    {/* Active User Slot */}
                    <div className="flex items-center gap-3 pl-1 group cursor-pointer">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black leading-none text-text group-hover:text-primary transition-colors uppercase tracking-tight">{user?.name}</p>
                            <p className="text-[8px] font-bold text-text/30 uppercase tracking-[0.1em] mt-1 text-right">{user?.role?.replace('_', ' ')}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-[10px] font-black transition-all group-hover:bg-primary group-hover:text-background shadow-sm">
                            {user?.name?.[0].toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopBar;
