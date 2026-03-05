import React, { useState, useRef, useEffect } from 'react';

const DropdownMenuContext = React.createContext(null);

export const DropdownMenu = ({ children, open, onOpenChange }) => {
    const [isOpen, setIsOpen] = useState(open || false);

    useEffect(() => {
        if (open !== undefined) setIsOpen(open);
    }, [open]);

    const handleOpenChange = (val) => {
        setIsOpen(val);
        if (onOpenChange) onOpenChange(val);
    };

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen: handleOpenChange }}>
            <div className="relative inline-block text-left">
                {React.Children.map(children, child => {
                    if (child.type === DropdownMenuTrigger) {
                        return React.cloneElement(child, {
                            isOpen,
                            setIsOpen: handleOpenChange
                        });
                    }
                    if (child.type === DropdownMenuContent) {
                        return isOpen ? child : null;
                    }
                    return child;
                })}
            </div>
        </DropdownMenuContext.Provider>
    );
};

export const DropdownMenuTrigger = ({ children, asChild, isOpen: triggerIsOpen, setIsOpen: triggerSetIsOpen }) => {
    const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);

    // Support either injected props or context
    const open = triggerIsOpen !== undefined ? triggerIsOpen : isOpen;
    const setOpen = triggerSetIsOpen || setIsOpen;

    return React.cloneElement(children, {
        onClick: (e) => {
            e.preventDefault();
            setOpen(!open);
        },
        'data-state': open ? 'open' : 'closed'
    });
};

export const DropdownMenuContent = ({ children, align = 'right' }) => {
    const { setIsOpen } = React.useContext(DropdownMenuContext);
    const contentRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (contentRef.current && !contentRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    const alignmentClasses = {
        left: 'left-0',
        start: 'left-0',
        right: 'right-0',
        end: 'right-0',
        center: 'left-1/2 -translate-x-1/2'
    };

    return (
        <div
            ref={contentRef}
            className={`absolute z-50 mt-2 min-w-[12rem] overflow-hidden rounded-xl border border-border/50 bg-background p-1.5 shadow-2xl animate-in fade-in zoom-in-95 duration-200 ${alignmentClasses[align] || alignmentClasses.right}`}
        >
            {children}
        </div>
    );
};

export const DropdownMenuItem = ({ children, onClick, className = "" }) => {
    const { setIsOpen } = React.useContext(DropdownMenuContext);

    return (
        <button
            onClick={(e) => {
                if (onClick) onClick(e);
                setIsOpen(false);
            }}
            className={`flex w-full items-start justify-start rounded-lg px-3 py-2 text-[11px] font-bold text-text/60 hover:bg-primary/5 hover:text-primary transition-all text-left uppercase tracking-tight ${className}`}
        >
            {children}
        </button>
    );
};
