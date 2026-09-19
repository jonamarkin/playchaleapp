import type { CareerStats, Money } from '@/lib/api/types';

/**
 * Display formatting for the API's machine-readable values.
 *
 * The API returns instants and minor units; turning those into "Wed, 18:30" or "₵25" is a
 * rendering decision and lives here, not in the data.
 */

const LOCALE = 'en-GH';

/** "₵25" / "₵25.50" / "Free" */
export function formatMoney(money: Money | undefined | null, { free = 'Free' } = {}): string {
    if (!money || money.amountMinor === 0) return free;
    const amount = money.amountMinor / 100;
    return new Intl.NumberFormat(LOCALE, {
        style: 'currency',
        currency: money.currency,
        // Whole amounts read better without ".00" on a card
        minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(amount);
}

const dateFormat = (timeZone: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(LOCALE, { timeZone, ...options });

/** "Wed, 25 Oct" in the game's own timezone */
export function formatGameDate(startsAt: string, timeZone = 'Africa/Accra'): string {
    return dateFormat(timeZone, { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(startsAt));
}

/** "18:30" in the game's own timezone */
export function formatGameTime(startsAt: string, timeZone = 'Africa/Accra'): string {
    return dateFormat(timeZone, { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(startsAt));
}

/** "Tonight · 18:30", "Tomorrow · 18:30", "Wed, 25 Oct · 18:30" */
export function formatGameWhen(startsAt: string, timeZone = 'Africa/Accra'): string {
    const time = formatGameTime(startsAt, timeZone);
    const day = relativeDay(startsAt, timeZone);
    return day ? `${day} · ${time}` : `${formatGameDate(startsAt, timeZone)} · ${time}`;
}

/** "Today"/"Tomorrow" when it applies, otherwise null. */
export function relativeDay(startsAt: string, timeZone = 'Africa/Accra'): string | null {
    const key = (d: Date) => dateFormat(timeZone, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
    const target = key(new Date(startsAt));
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    if (target === key(today)) return 'Today';
    if (target === key(tomorrow)) return 'Tomorrow';
    return null;
}

export const isPast = (startsAt: string) => new Date(startsAt).getTime() < Date.now();

/** "68%" — derived for display from counts, never stored. */
export function winRate(stats: Pick<CareerStats, 'wins' | 'losses' | 'draws'>): string | null {
    const played = stats.wins + stats.losses + stats.draws;
    if (played === 0) return null;
    return `${Math.round((stats.wins / played) * 100)}%`;
}

/** "98%" of games where the player turned up. */
export function reliability(stats: Pick<CareerStats, 'gamesPlayed' | 'noShows'>): string | null {
    if (stats.gamesPlayed === 0) return null;
    return `${Math.round(((stats.gamesPlayed - stats.noShows) / stats.gamesPlayed) * 100)}%`;
}

/** The sport a player leads with, or their first recorded sport. */
export function primaryStats(careerStats: CareerStats[], mainSport?: string): CareerStats | null {
    if (careerStats.length === 0) return null;
    return careerStats.find((s) => s.sport === mainSport) ?? careerStats[0];
}
