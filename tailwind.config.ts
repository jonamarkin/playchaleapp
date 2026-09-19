import type { Config } from 'tailwindcss';

/** Builds a 50–950 colour scale from CSS custom properties, keeping opacity modifiers working. */
const ramp = (name: string) =>
  Object.fromEntries([
    ['DEFAULT', `hsl(var(${name}-500) / <alpha-value>)`],
    ...[50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((step) => [
      step,
      `hsl(var(${name}-${step}) / <alpha-value>)`,
    ]),
  ]);

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './providers/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './constants.tsx',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand ramp. Previously `lime: '#C6FF00'` — a bare string, which replaced
        // Tailwind's whole lime scale and made every lime-400/500 utility compile to
        // nothing (hover:bg-lime-400 on the join button, shadow-lime-500/20, ...).
        lime: ramp('--lime'),
        ink: ramp('--ink'),

        // Semantic, polarity-aware (see the [data-polarity] blocks in globals.css)
        fg: {
          DEFAULT: 'hsl(var(--fg) / <alpha-value>)',
          muted: 'hsl(var(--fg-muted) / <alpha-value>)',
          subtle: 'hsl(var(--fg-subtle) / <alpha-value>)',
        },
        line: 'hsl(var(--line) / <alpha-value>)',
        /** Lime accent text, automatically readable on the current surface */
        brand: 'hsl(var(--brand-fg) / <alpha-value>)',
        surface: {
          DEFAULT: 'hsl(var(--surface) / <alpha-value>)',
          app: 'hsl(var(--surface-app) / <alpha-value>)',
          panel: 'hsl(var(--surface-panel) / <alpha-value>)',
          sunken: 'hsl(var(--surface-sunken) / <alpha-value>)',
          inverse: 'hsl(var(--surface-inverse) / <alpha-value>)',
        },

        // Legacy aliases, kept until the last raw-hex call sites are migrated
        beige: '#F5F5F0',
        dark: '#111111',
        cream: '#FDFDFB',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Named by role. Replaces the 25 one-off rounded-[Npx] values.
        chip: 'var(--r-chip)',
        field: 'var(--r-field)',
        card: 'var(--r-card)',
        'card-lg': 'var(--r-card-lg)',
        'card-xl': 'var(--r-card-xl)',
        pill: '9999px',
      },
      boxShadow: {
        e1: 'var(--e-1)',
        e2: 'var(--e-2)',
        e3: 'var(--e-3)',
        lime: 'var(--e-lime)',
      },
      zIndex: {
        sticky: 'var(--z-sticky)',
        header: 'var(--z-header)',
        overlay: 'var(--z-overlay)',
        modal: 'var(--z-modal)',
        toast: 'var(--z-toast)',
        tooltip: 'var(--z-tooltip)',
      },
      transitionDuration: {
        fast: 'var(--dur-fast)',
        base: 'var(--dur)',
        slow: 'var(--dur-slow)',
      },
      transitionTimingFunction: {
        brand: 'var(--ease-out)',
      },
      fontSize: {
        // Display = the brand voice (italic, uppercase, tight). Text = everything else.
        // Nothing below 12px: the old text-[8px]/[9px]/[10px] labels all map to `eyebrow`.
        'display-xl': ['clamp(3.25rem, 7vw, 6rem)', { lineHeight: '0.88', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '0.9', letterSpacing: '-0.03em' }],
        'display-md': ['clamp(2rem, 3.5vw, 3rem)', { lineHeight: '0.95', letterSpacing: '-0.025em' }],
        'display-sm': ['clamp(1.5rem, 2.5vw, 2rem)', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        body: ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.55' }],
        label: ['0.8125rem', { lineHeight: '1.3', letterSpacing: '0.02em' }],
        eyebrow: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.2em' }],
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      // `fade-in` starts at 1% instead of 0%: Chrome ignores elements first painted at opacity 0
      // as LCP candidates, so fully transparent entrances make LCP go unreported or late. Visually identical.
      animationOpacity: {
        DEFAULT: '0.01',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      keyframes: {
        float: {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
