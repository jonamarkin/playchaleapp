'use client';

import React, { useState } from 'react';
import MessageCenter from '@/components/MessageCenter';
import { useSession } from '@/features/auth/session';
import { useMyGames } from '@/features/games/hooks';
import type { Message } from '@/types';

// TODO(backend): replace with the messaging API once it exists
const SAMPLE_MESSAGES: Message[] = [
  {
    id: 'm1',
    gameId: 'g1',
    senderId: 'p2',
    senderName: 'Elena R.',
    senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    content: "Hey, is there parking near Pitch 4? I'm coming with a big car.",
    timestamp: '2h ago',
    isRead: false,
    type: 'inquiry',
  },
];

export default function MessagesView() {
  const { user } = useSession();
  const { data: myGames } = useMyGames(!!user);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-300">
      <MessageCenter
        messages={SAMPLE_MESSAGES.filter((m) => !archivedIds.includes(m.id))}
        hostedGames={myGames?.hostedGames || []}
        onReadMessage={() => {}}
        onArchiveMessage={(id) => setArchivedIds((ids) => [...ids, id])}
        onSendReply={() => {}}
      />
    </div>
  );
}
