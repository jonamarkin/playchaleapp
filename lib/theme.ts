/**
 * Theme configuration - design tokens for the application
 */

export const colors = {
    lime: '#C6FF00',
    beige: '#F5F5F0',
    dark: '#111111',
    cream: '#FDFDFB',
} as const;

export const spacing = {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
} as const;

export const borderRadius = {
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '2.5rem', // 40px
    '3xl': '3rem',   // 48px
    full: '9999px',
} as const;

export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    lime: '0 0 30px rgba(198, 255, 0, 0.3)',
} as const;

export const typography = {
    fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
    },
    fontSize: {
        xs: ['0.625rem', { lineHeight: '1.4' }],    // 10px
        sm: ['0.75rem', { lineHeight: '1.4' }],     // 12px
        base: ['0.875rem', { lineHeight: '1.5' }],  // 14px
        lg: ['1rem', { lineHeight: '1.5' }],        // 16px
        xl: ['1.25rem', { lineHeight: '1.4' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '1.3' }],   // 24px
        '3xl': ['2rem', { lineHeight: '1.2' }],     // 32px
        '4xl': ['2.5rem', { lineHeight: '1.1' }],   // 40px
        '5xl': ['3rem', { lineHeight: '1' }],       // 48px
    },
} as const;

export const animations = {
    durations: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
    },
    easings: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
} as const;
