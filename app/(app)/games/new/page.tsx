import type { Metadata } from 'next';
import { requireProfile } from '@/lib/auth/guards';
import { Surface } from '@/components/ui/surface';
import CreateGameForm from './create-game-form';

export const metadata: Metadata = {
    title: 'Host a match | PlayChale',
    robots: { index: false, follow: false },
};

export default async function NewGamePage() {
    await requireProfile('/games/new');

    return (
        <Surface tone="app" polarity="light" className="min-h-screen px-4 pb-16 pt-28 md:px-12 md:pt-32">
            <div className="mx-auto max-w-3xl">
                <CreateGameForm />
            </div>
        </Surface>
    );
}
