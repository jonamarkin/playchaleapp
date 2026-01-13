'use client';

import { useState, useEffect } from 'react';
import { BREAKPOINTS } from '@/lib/config';

type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Custom hook for responsive breakpoint detection
 * Returns current breakpoint and boolean checks
 */
export function useMediaQuery() {
    const [windowWidth, setWindowWidth] = useState<number>(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        // Set initial value
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isAbove = (breakpoint: Breakpoint): boolean => {
        return windowWidth >= BREAKPOINTS[breakpoint];
    };

    const isBelow = (breakpoint: Breakpoint): boolean => {
        return windowWidth < BREAKPOINTS[breakpoint];
    };

    const getCurrentBreakpoint = (): Breakpoint | 'xs' => {
        if (windowWidth >= BREAKPOINTS['2xl']) return '2xl';
        if (windowWidth >= BREAKPOINTS.xl) return 'xl';
        if (windowWidth >= BREAKPOINTS.lg) return 'lg';
        if (windowWidth >= BREAKPOINTS.md) return 'md';
        if (windowWidth >= BREAKPOINTS.sm) return 'sm';
        return 'xs';
    };

    return {
        width: windowWidth,
        breakpoint: getCurrentBreakpoint(),
        isMobile: windowWidth < BREAKPOINTS.md,
        isTablet: windowWidth >= BREAKPOINTS.md && windowWidth < BREAKPOINTS.lg,
        isDesktop: windowWidth >= BREAKPOINTS.lg,
        isAbove,
        isBelow,
    };
}
