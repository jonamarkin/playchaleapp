import * as React from 'react';
import { cn } from '@/lib/utils';

type Tone = 'app' | 'panel' | 'sunken' | 'inverse' | 'none';

const TONE_CLASS: Record<Tone, string> = {
    app: 'bg-surface-app',
    panel: 'bg-surface-panel',
    sunken: 'bg-surface-sunken',
    inverse: 'bg-surface-inverse',
    none: '',
};

export interface SurfaceProps extends React.HTMLAttributes<HTMLElement> {
    /** Which foreground scale descendants inherit. Dark sections must say so. */
    polarity?: 'light' | 'dark';
    tone?: Tone;
    as?: 'div' | 'section' | 'article' | 'aside' | 'header' | 'footer' | 'main' | 'nav';
}

/**
 * Declares the light/dark context for everything inside it.
 *
 * PlayChale mixes polarity freely (a cream dashboard with a black panel in it), so
 * components can't assume a background. Surface sets --fg / --fg-muted / --line for its
 * subtree; primitives read those, which is why they need no `dark:` variants and why
 * `text-white/30` should never appear again.
 */
export function Surface({ polarity = 'light', tone = 'none', as = 'div', className, ...props }: SurfaceProps) {
    const Tag = as;
    return <Tag data-polarity={polarity} className={cn(TONE_CLASS[tone], 'text-fg', className)} {...props} />;
}
