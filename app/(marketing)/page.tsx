import { gamesListQuery } from '@/features/games/queries';
import { playersListQuery } from '@/features/players/queries';
import { serverApi } from '@/lib/api/server';
import { Prefetch } from '@/lib/query/prefetch';
import HeroCinematic from '@/components/landing/HeroCinematic';
import HeroLight from '@/components/landing/HeroLight';
import { resolveHeroVariant } from '@/components/landing/hero-variant';
import LandingView from './landing-view';

type Props = {
  searchParams: Promise<{ hero?: string | string[] }>;
};

export default async function LandingPage({ searchParams }: Props) {
  // ?hero= previews a variant; otherwise LANDING_HERO picks the default
  const variant = resolveHeroVariant((await searchParams).hero, process.env.LANDING_HERO);

  return (
    <Prefetch
      queries={(qc) => [
        qc.prefetchInfiniteQuery(gamesListQuery(serverApi)),
        qc.prefetchInfiniteQuery(playersListQuery(serverApi)),
      ]}
    >
      {/* Rendered here so only the chosen hero's code ships to the browser */}
      <LandingView
        hero={variant === 'cinematic' ? <HeroCinematic /> : <HeroLight />}
        overlapHero={variant === 'cinematic'}
      />
    </Prefetch>
  );
}
