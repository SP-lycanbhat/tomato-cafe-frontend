import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export const Select = ({ value, onValueChange, placeholder, options, label, className = "" }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        {label && <label className="text-sm font-medium text-text/70">{label}</label>}
        <SelectPrimitive.Root value={value} onValueChange={onValueChange}>
            <SelectPrimitive.Trigger className="flex items-center justify-between w-full bg-background border border-border h-10 px-3 rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-surface/50">
                <SelectPrimitive.Value placeholder={placeholder} />
                <SelectPrimitive.Icon>
                    <ChevronDown size={16} className="text-text/40" />
                </SelectPrimitive.Icon>
            </SelectPrimitive.Trigger>

            <SelectPrimitive.Portal>
                <SelectPrimitive.Content className="overflow-hidden bg-background border border-border rounded-md shadow-lg z-[100] animate-in fade-in zoom-in-95 duration-100 min-w-[var(--radix-select-trigger-width)]">
                    <SelectPrimitive.Viewport className="p-1">
                        {options.map((opt) => (
                            <SelectPrimitive.Item
                                key={opt.value}
                                value={opt.value}
                                className="relative flex items-center px-8 py-2 text-sm rounded-sm cursor-pointer hover:bg-surface outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 data-[state=checked]:font-semibold data-[state=checked]:text-primary"
                            >
                                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
                                <SelectPrimitive.ItemIndicator className="absolute left-2 inline-flex items-center">
                                    <Check size={14} className="text-primary" />
                                </SelectPrimitive.ItemIndicator>
                            </SelectPrimitive.Item>
                        ))}
                    </SelectPrimitive.Viewport>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    </div>
);
