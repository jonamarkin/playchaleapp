import { myGamesQuery } from '@/features/games/queries';
import { requireSession } from '@/lib/auth/guards';
import { serverApi } from '@/lib/api/server';
import { Prefetch } from '@/lib/query/prefetch';
import MyGamesView from './mygames-view';

export default async function MyGamesPage() {
    await requireSession('/mygames');

    return (
        <Prefetch queries={(qc) => [qc.prefetchQuery(myGamesQuery(serverApi))]}>
            <MyGamesView />
        </Prefetch>
    );
}
