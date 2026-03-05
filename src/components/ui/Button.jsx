import React from 'react';

const Button = React.forwardRef(({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const Comp = 'button';

    const variants = {
        primary: 'bg-primary text-background shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0',
        secondary: 'bg-background border border-border text-text shadow-sm hover:bg-primary hover:text-background',
        outline: 'border border-border bg-background hover:bg-primary hover:text-background text-text',
        ghost: 'hover:bg-primary/5 text-text/60 hover:text-text',
        danger: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white',
        success: 'bg-emerald-500 text-white shadow-md hover:opacity-90',
    };

    const sizes = {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-[10px]',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9 overflow-hidden flex items-center justify-center shrink-0',
    };

    const baseStyles = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50 active:scale-95';

    const combinedClassName = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`;

    return (
        <Comp
            className={combinedClassName}
            ref={ref}
            {...props}
        />
    );
});

Button.displayName = 'Button';

export { Button };
