/**
 * Which landing-page hero to show.
 * - `light`: cream, card-styled hero in the look of the core-advantage section
 * - `cinematic`: the original full-bleed night-match photo
 *
 * Set the default with LANDING_HERO in .env.local (read at request time, so a restart is enough).
 * Preview either one with ?hero=light or ?hero=cinematic.
 */

export const HERO_VARIANTS = ['light', 'cinematic'] as const;

export type HeroVariant = (typeof HERO_VARIANTS)[number];

export const DEFAULT_HERO_VARIANT: HeroVariant = 'light';

const isHeroVariant = (value: unknown): value is HeroVariant =>
    typeof value === 'string' && (HERO_VARIANTS as readonly string[]).includes(value);

/** First valid candidate wins (e.g. URL override, then env setting); falls back to the default */
export function resolveHeroVariant(...candidates: unknown[]): HeroVariant {
    return candidates.find(isHeroVariant) ?? DEFAULT_HERO_VARIANT;
}
