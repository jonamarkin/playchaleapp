import { gamesListQuery } from '@/features/games/queries';
import { playersListQuery } from '@/features/players/queries';
import { serverApi } from '@/lib/api/server';
import { Prefetch } from '@/lib/query/prefetch';
import LandingView from './landing-view';

export default function LandingPage() {
  return (
    <Prefetch
      queries={(qc) => [
        qc.prefetchInfiniteQuery(gamesListQuery(serverApi)),
        qc.prefetchInfiniteQuery(playersListQuery(serverApi)),
      ]}
    >
      <LandingView />
    </Prefetch>
  );
}
