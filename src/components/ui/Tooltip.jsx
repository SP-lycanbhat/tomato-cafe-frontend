import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export const TooltipProvider = TooltipPrimitive.Provider;

export const Tooltip = ({ children, content, side = 'top', align = 'center', delayDuration = 300, ...props }) => {
    return (
        <TooltipPrimitive.Root delayDuration={delayDuration} {...props}>
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
                <TooltipPrimitive.Content
                    side={side}
                    align={align}
                    sideOffset={5}
                    className="z-[100] overflow-hidden rounded-md bg-text px-3 py-1.5 text-xs font-medium text-background animate-in fade-in zoom-in-95 duration-200 shadow-md"
                >
                    {content}
                    <TooltipPrimitive.Arrow className="fill-text" />
                </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
    );
};
