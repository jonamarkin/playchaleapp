import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * The brand voice, as components instead of 17 hand-retyped copies of
 * `font-black italic tracking-tighter uppercase`.
 *
 * Display — headlines. Heading — section titles. Eyebrow — the small uppercase
 * labels that used to be text-[8px]/[9px]/[10px] (now 12px, the readable floor).
 * Text — everything else.
 */

const display = cva('font-black italic uppercase text-fg', {
    variants: {
        size: {
            xl: 'text-display-xl',
            lg: 'text-display-lg',
            md: 'text-display-md',
            sm: 'text-display-sm',
        },
    },
    defaultVariants: { size: 'lg' },
});

export interface DisplayProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof display> {
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
}

export function Display({ size, as = 'h2', className, ...props }: DisplayProps) {
    const Tag = as;
    return <Tag className={cn(display({ size }), className)} {...props} />;
}

export function Heading({ as = 'h3', className, ...props }: DisplayProps) {
    const Tag = as;
    return <Tag className={cn('font-black italic uppercase tracking-tight text-fg text-display-sm', className)} {...props} />;
}

export interface EyebrowProps extends React.HTMLAttributes<HTMLElement> {
    as?: 'span' | 'p' | 'div' | 'h2' | 'h3';
    tone?: 'default' | 'muted' | 'accent';
}

export function Eyebrow({ as = 'span', tone = 'muted', className, ...props }: EyebrowProps) {
    const Tag = as;
    return (
        <Tag
            className={cn(
                'text-eyebrow font-black uppercase',
                tone === 'muted' && 'text-fg-muted',
                tone === 'accent' && 'text-brand',
                className
            )}
            {...props}
        />
    );
}

const text = cva('text-fg', {
    variants: {
        size: { lg: 'text-body-lg', md: 'text-body', sm: 'text-body-sm', label: 'text-label' },
        tone: { default: 'text-fg', muted: 'text-fg-muted', subtle: 'text-fg-subtle' },
        weight: { regular: 'font-medium', bold: 'font-bold', black: 'font-black' },
    },
    defaultVariants: { size: 'md', tone: 'default', weight: 'regular' },
});

export interface TextProps
    extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof text> {
    as?: 'p' | 'span' | 'div' | 'li';
}

export function Text({ size, tone, weight, as: Tag = 'p', className, ...props }: TextProps) {
    return <Tag className={cn(text({ size, tone, weight }), className)} {...props} />;
}
