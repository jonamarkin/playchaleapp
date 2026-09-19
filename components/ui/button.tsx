import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Brand buttons: pill, heavy, uppercase, wide tracking.
 *
 * This replaces the stock shadcn styling (rounded-md / text-sm / font-medium), which was
 * the opposite of the brand and therefore overridden at every single call site — the
 * reason the app had 92 raw <button> elements against 10 <Button>. Variants carry the
 * look so call sites don't have to.
 *
 * Works on both polarities: `primary` and `inverse` are explicit, `ghost`/`outline`
 * inherit --fg and --line from the surrounding <Surface>.
 */
const buttonVariants = cva(
    "inline-flex items-center justify-center gap-3 whitespace-nowrap rounded-pill font-black uppercase tracking-widest transition-all duration-base ease-brand touch-target disabled:pointer-events-none disabled:opacity-40 aria-busy:opacity-70",
    {
        variants: {
            variant: {
                primary: "bg-lime-500 text-ink-900 shadow-e1 hover:bg-lime-400 active:scale-[0.98]",
                inverse: "bg-ink-900 text-lime-500 shadow-e1 hover:bg-ink-800 active:scale-[0.98]",
                outline: "border-2 border-line text-fg hover:border-fg/40",
                ghost: "text-fg-muted hover:text-fg hover:bg-fg/5",
                danger: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.98]",
            },
            size: {
                sm: "h-10 px-5 text-eyebrow",
                md: "h-12 px-7 text-eyebrow",
                lg: "h-14 px-9 text-label",
                icon: "h-11 w-11 p-0",
            },
            full: { true: "w-full", false: "" },
        },
        defaultVariants: { variant: "primary", size: "md", full: false },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    /** Shows a busy state and blocks interaction; keeps the label for screen readers. */
    loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, full, asChild = false, loading = false, disabled, children, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, full, className }))}
                ref={ref}
                disabled={disabled || loading}
                aria-busy={loading || undefined}
                {...props}
            >
                {loading ? (
                    <>
                        <span
                            aria-hidden="true"
                            className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
                        />
                        {children}
                    </>
                ) : (
                    children
                )}
            </Comp>
        )
    }
)
Button.displayName = "Button"

export interface IconButtonProps extends Omit<ButtonProps, 'size' | 'full' | 'children'> {
    /** Required: an icon alone has no accessible name. This is why the app had 24 unnamed buttons. */
    label: string
    children: React.ReactNode
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ label, children, className, variant = 'ghost', ...props }, ref) => (
        <Button ref={ref} size="icon" variant={variant} aria-label={label} title={label} className={className} {...props}>
            <span aria-hidden="true" className="inline-flex items-center justify-center">{children}</span>
        </Button>
    )
)
IconButton.displayName = "IconButton"

export { Button, IconButton, buttonVariants }
