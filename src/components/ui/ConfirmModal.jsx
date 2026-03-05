import { Dialog, DialogContent } from './Dialog';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    description = "Are you sure you want to proceed? This action may be irreversible.",
    confirmText = "Delete Permanently",
    cancelText = "Cancel",
    variant = "danger" // danger, warning, info
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent title={title} description={description}>
                <div className="flex flex-col items-center gap-4 py-4 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${variant === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                        <AlertTriangle size={32} />
                    </div>

                    <div className="flex w-full gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-text/40 hover:bg-surface transition-all"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-background shadow-lg transition-all active:scale-95 ${variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 'bg-primary hover:bg-primary-focus shadow-primary/20'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConfirmModal;
