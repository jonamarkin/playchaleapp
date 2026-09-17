import { myProfileQuery } from '@/features/players/queries';
import { requireProfile } from '@/lib/auth/guards';
import { serverApi } from '@/lib/api/server';
import { Prefetch } from '@/lib/query/prefetch';
import StatsView from './stats-view';

export default async function StatsPage() {
  await requireProfile('/stats');

  return (
    <Prefetch queries={(qc) => [qc.prefetchQuery(myProfileQuery(serverApi))]}>
      <StatsView />
    </Prefetch>
  );
}
