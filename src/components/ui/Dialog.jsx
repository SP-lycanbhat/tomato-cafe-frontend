import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export const DialogContent = ({ children, title, description, ...props }) => (
    <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-background/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <DialogPrimitive.Content
            className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[90%] md:w-full max-w-lg bg-background border border-border p-6 rounded-xl shadow-2xl z-50 animate-in zoom-in-95 duration-200 outline-none"
            {...props}
        >
            <div className="flex flex-col mb-6">
                <div className="flex justify-between items-start">
                    <div className="space-y-1.5">
                        <DialogPrimitive.Title className="text-xl font-bold text-text">
                            {title}
                        </DialogPrimitive.Title>
                        {description && (
                            <DialogPrimitive.Description className="text-sm text-text/60 leading-relaxed">
                                {description}
                            </DialogPrimitive.Description>
                        )}
                    </div>
                    <DialogPrimitive.Close className="p-1.5 hover:bg-surface rounded-full transition-all text-text/30 hover:text-text focus:ring-2 ring-primary/20">
                        <X size={20} />
                    </DialogPrimitive.Close>
                </div>
            </div>
            <div className="relative">
                {children}
            </div>
        </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
);
