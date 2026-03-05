import * as ToastPrimitive from '@radix-ui/react-toast';
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((title, description, type = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts((prev) => [...prev, { id, title, description, type }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            <ToastPrimitive.Provider swipeDirection="right">
                {children}
                {toasts.map(({ id, title, description, type }) => (
                    <ToastPrimitive.Root
                        key={id}
                        className="card !py-3 !px-4 flex items-center gap-3 w-80 shadow-2xl animate-in slide-in-from-right-full"
                        onOpenChange={(open) => !open && removeToast(id)}
                    >
                        <div className={type === 'error' ? 'text-red-500' : 'text-emerald-500'}>
                            {type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                            <ToastPrimitive.Title className="font-bold text-sm">{title}</ToastPrimitive.Title>
                            {description && <ToastPrimitive.Description className="text-xs opacity-70">{description}</ToastPrimitive.Description>}
                        </div>
                        <ToastPrimitive.Close className="p-1 hover:bg-primary/10 rounded">
                            <X className="w-4 h-4" />
                        </ToastPrimitive.Close>
                    </ToastPrimitive.Root>
                ))}
                <ToastPrimitive.Viewport className="fixed bottom-0 right-0 flex flex-col p-6 gap-2 w-full max-w-sm m-0 list-none z-[2147483647] outline-none" />
            </ToastPrimitive.Provider>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
