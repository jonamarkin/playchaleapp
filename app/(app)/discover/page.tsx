import type { Metadata } from 'next';
import { gamesListQuery } from '@/features/games/queries';
import { serverApi } from '@/lib/api/server';
import { Prefetch } from '@/lib/query/prefetch';
import DiscoverView from './discover-view';

export const metadata: Metadata = {
  title: 'Discover Games | PlayChale',
  description: 'Find pickup games, matches and tournaments near you.',
};

export default function DiscoverPage() {
  return (
    <Prefetch queries={(qc) => [qc.prefetchInfiniteQuery(gamesListQuery(serverApi))]}>
      <DiscoverView />
    </Prefetch>
  );
}
