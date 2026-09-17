import type { Metadata } from 'next';
import { playersListQuery } from '@/features/players/queries';
import { serverApi } from '@/lib/api/server';
import { Prefetch } from '@/lib/query/prefetch';
import CommunityView from './community-view';

export const metadata: Metadata = {
  title: 'Community | PlayChale',
  description: 'Top amateur athletes and rising stars on PlayChale.',
};

export default function CommunityPage() {
  return (
    <Prefetch queries={(qc) => [qc.prefetchInfiniteQuery(playersListQuery(serverApi))]}>
      <CommunityView />
    </Prefetch>
  );
}
