'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import MessageCenter from '@/components/MessageCenter';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function MessagesPage() {
  const router = useRouter();
  const { messages, archivedIds, setArchivedIds, games, hasProfile } = usePlayChale();

  // Protect this route
  useEffect(() => {
    if (!hasProfile) {
      router.push('/onboarding');
    }
  }, [hasProfile, router]);

  if (!hasProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }}
    >
      <MessageCenter 
        messages={messages.filter(m => !archivedIds.includes(m.id))}
        hostedGames={games.filter(g => g.organizer?.includes('Alex') || g.organizer === 'Me')}
        onReadMessage={(id) => {}}
        onArchiveMessage={(id) => setArchivedIds([...archivedIds, id])}
        onSendReply={() => {}}
      />
    </motion.div>
  );
}
