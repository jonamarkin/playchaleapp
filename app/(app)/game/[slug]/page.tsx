import { Metadata } from 'next';
import GameClientPage from '@/components/GameClientPage';
import { backend } from '@/services';

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug;
  const game = await backend.games.get(slug);

  if (!game) {
    return {
      title: 'Game Not Found - PlayChale',
      description: 'This game does not exist or has been removed.'
    };
  }

  return {
    title: `${game.title} | PlayChale`,
    description: `Join ${game.organizer}'s ${game.sport} game at ${game.location} on ${game.date}.`,
    openGraph: {
      title: `Join ${game.title}`,
      description: `Play ${game.sport} at ${game.location}. ${game.spotsTotal - game.spotsTaken} spots left!`,
      images: [
        {
          url: game.imageUrl || 'https://playchale.app/og-default.jpg',
          width: 1200,
          height: 630,
          alt: game.title,
        }
      ],
      type: 'website',
    },
  };
}

export default async function GamePage({ params }: Props) {
  const slug = (await params).slug;
  const game = await backend.games.get(slug);

  return <GameClientPage id={game?.id || slug} initialGame={game} />;
}
