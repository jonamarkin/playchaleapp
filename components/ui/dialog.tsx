'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IconButton } from '@/components/ui/button';

/**
 * One overlay primitive for the whole app.
 *
 * Replaces four hand-rolled full-screen shells that each picked their own backdrop,
 * their own z-index (z-[110] … z-[300]) and had no focus trap, no Escape handling and
 * no scroll lock. Radix provides all of that plus role="dialog" and aria-labelledby.
 *
 * Presents as a bottom sheet on phones and a centred dialog from md up, which is the
 * pattern the app already used by hand.
 */
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            'fixed inset-0 z-overlay bg-ink-950/70 backdrop-blur-sm',
            'data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out',
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = 'DialogOverlay';

interface DialogContentProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
    /** Required: dialogs must be announced. Pass `srOnlyTitle` to hide it visually. */
    title: string;
    description?: string;
    srOnlyTitle?: boolean;
}

const DialogContent = React.forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, DialogContentProps>(
    ({ className, children, title, description, srOnlyTitle = false, ...props }, ref) => (
        <DialogPrimitive.Portal>
            <DialogOverlay />
            <DialogPrimitive.Content
                ref={ref}
                data-polarity="dark"
                className={cn(
                    'fixed z-modal flex flex-col bg-surface-inverse text-fg shadow-e3',
                    // bottom sheet on phones
                    'inset-x-0 bottom-0 max-h-[92vh] rounded-t-card-xl border-t border-line',
                    'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-10 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-10',
                    // centred dialog from md
                    'md:inset-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-card-lg md:border',
                    'md:data-[state=open]:zoom-in-95 md:data-[state=closed]:zoom-out-95',
                    className
                )}
                {...props}
            >
                <div className="flex items-start justify-between gap-4 p-6 pb-2 md:p-8 md:pb-2">
                    <div className="min-w-0 space-y-1">
                        <DialogPrimitive.Title
                            className={cn(
                                'text-display-sm font-black italic uppercase tracking-tight',
                                srOnlyTitle && 'sr-only'
                            )}
                        >
                            {title}
                        </DialogPrimitive.Title>
                        {description ? (
                            <DialogPrimitive.Description className="text-body-sm text-fg-muted">
                                {description}
                            </DialogPrimitive.Description>
                        ) : (
                            <DialogPrimitive.Description className="sr-only">{title}</DialogPrimitive.Description>
                        )}
                    </div>
                    <DialogPrimitive.Close asChild>
                        <IconButton label="Close"><X className="h-5 w-5" /></IconButton>
                    </DialogPrimitive.Close>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-8 md:px-8">{children}</div>
            </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
    )
);
DialogContent.displayName = 'DialogContent';

export { Dialog, DialogTrigger, DialogClose, DialogContent, DialogOverlay };
