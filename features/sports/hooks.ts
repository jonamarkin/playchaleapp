'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/browser';
import type { Sport } from '@/lib/api/types';
import { sportsQuery } from './queries';

export function useSports() {
    return useQuery(sportsQuery(api));
}

/** One sport by code, plus the list — the common case for result and stat entry. */
export function useSport(code: string | undefined) {
    const { data, ...rest } = useSports();
    return { ...rest, data, sport: data?.find((s: Sport) => s.code === code) };
}

/**
 * Display name for a sport code. Falls back to the code itself so an unknown sport from a
 * newer server still renders something sensible.
 */
export function useSportName() {
    const { data } = useSports();
    return (code: string) => data?.find((s) => s.code === code)?.name ?? code;
}
