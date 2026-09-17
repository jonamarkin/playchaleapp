import { gamesListQuery, myGamesQuery } from '@/features/games/queries';
import { myProfileQuery, playersListQuery } from '@/features/players/queries';
import { requireProfile } from '@/lib/auth/guards';
import { serverApi } from '@/lib/api/server';
import { Prefetch } from '@/lib/query/prefetch';
import HomeView from './home-view';

export default async function HomePage() {
  await requireProfile('/home');

  return (
    <Prefetch
      queries={(qc) => [
        qc.prefetchQuery(myProfileQuery(serverApi)),
        qc.prefetchQuery(myGamesQuery(serverApi)),
        qc.prefetchInfiniteQuery(gamesListQuery(serverApi)),
        qc.prefetchInfiniteQuery(playersListQuery(serverApi)),
      ]}
    >
      <HomeView />
    </Prefetch>
  );
}
