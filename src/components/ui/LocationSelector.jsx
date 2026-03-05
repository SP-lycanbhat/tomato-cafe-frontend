import { useLocation } from '../../contexts/LocationContext';
import { MapPin, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './DropdownMenu';

const LocationSelector = () => {
    const { locations, selectedLocationId, setSelectedLocationId, selectedLocation } = useLocation();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 px-3 h-10 bg-surface/50 border border-border/40 rounded-lg hover:border-primary/30 transition-all group outline-none">
                    <div className={`p-1.5 rounded-md transition-colors ${selectedLocation ? 'bg-primary/20 text-primary' : 'bg-text/5 text-text/30'}`}>
                        <MapPin size={14} />
                    </div>
                    <div className="text-left hidden sm:block">
                        <p className="text-[9px] font-black uppercase tracking-widest leading-none text-text/30 group-hover:text-primary/50 transition-all">Context</p>
                        <p className="text-[11px] font-bold text-text mt-0.5">{selectedLocation?.name || 'Consolidated HQ'}</p>
                    </div>
                    <ChevronDown size={14} className="text-text/20 group-hover:text-primary transition-all ml-1" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[220px]">
                <DropdownMenuItem onClick={() => setSelectedLocationId('all')} className="flex flex-col items-start gap-1 py-2.5 px-3 cursor-pointer">
                    <span className="text-[11px] font-black uppercase tracking-widest text-primary">Consolidated HQ</span>
                    <span className="text-[9px] text-text/40 font-bold">Global B2B + All Branches</span>
                </DropdownMenuItem>
                <div className="h-[1px] bg-border/20 my-1" />
                {locations.map(loc => (
                    <DropdownMenuItem
                        key={loc.id}
                        onClick={() => setSelectedLocationId(loc.id)}
                        className="flex flex-col items-start gap-1 py-2.5 px-3 cursor-pointer"
                    >
                        <span className="text-[11px] font-bold text-text uppercase tracking-tight">{loc.name}</span>
                        <span className="text-[9px] text-text/30 font-medium uppercase tracking-widest flex items-center gap-1.5">
                            <MapPin size={10} /> {loc.phone || 'Branch Terminal'}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default LocationSelector;
