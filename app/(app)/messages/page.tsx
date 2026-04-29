'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLoader from '@/components/AppLoader';
import MessageCenter from '@/components/MessageCenter';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { useGames } from '@/hooks/useData';

export default function MessagesPage() {
  const router = useRouter();
  const { messages, archivedIds, setArchivedIds, hasProfile } = usePlayChale();
  const { data: games = [] } = useGames();

  // Protect this route
  useEffect(() => {
    if (!hasProfile) {
      router.push('/onboarding');
    }
  }, [hasProfile, router]);

  if (!hasProfile) {
    return <AppLoader label="Loading messages" tone="dark" />;
  }

  return (
    <div className="pc-view-enter">
      <MessageCenter 
        messages={messages.filter(m => !archivedIds.includes(m.id))}
        hostedGames={games.filter(g => g.organizer?.includes('Alex') || g.organizer === 'Me')}
        onReadMessage={(id) => {}}
        onArchiveMessage={(id) => setArchivedIds([...archivedIds, id])}
        onSendReply={() => {}}
      />
    </div>
  );
}
