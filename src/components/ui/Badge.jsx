import { Lock } from 'lucide-react';

export const Badge = ({ children, status, className = "" }) => {
    const isLocked = children?.toString().toLowerCase() === 'locked' || status === 'locked';

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-border bg-surface text-text/70 ${className}`}>
            {isLocked && <Lock size={12} />}
            {children}
        </span>
    );
};
