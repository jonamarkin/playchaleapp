'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ICONS } from '@/constants';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Game, Challenge } from '@/types';

interface MessageCenterProps {
  messages: Message[];
  hostedGames: Game[];
  onReadMessage: (id: string) => void;
  onArchiveMessage: (id: string) => void;
  onSendReply: (gameId: string, content: string, recipientId: string) => void;
  onUpdateChallenge?: (challengeId: string, status: 'accepted' | 'declined') => void;
}

type MobileView = 'games' | 'threads' | 'chat';

const MessageCenter: React.FC<MessageCenterProps> = ({
  messages, hostedGames, onReadMessage, onArchiveMessage, onSendReply, onUpdateChallenge
}) => {
  const [selectedGameId, setSelectedGameId] = useState<string | 'all'>('all');
  const [activeThreadUserId, setActiveThreadUserId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>('games');
  const [replyText, setReplyText] = useState('');
  const [inquiryType, setInquiryType] = useState<'all' | 'inquiry' | 'challenge'>('all');

  // Group messages by user for the thread view. 
  const threads = useMemo(() => {
    const threadMap: Record<string, { user: any, messages: Message[], gameId: string, type?: string }> = {};

    messages.forEach(m => {
      // Filtering logic
      if (selectedGameId !== 'all' && m.gameId !== selectedGameId) return;
      if (inquiryType !== 'all' && m.type !== inquiryType) return;

      const isHost = m.senderId === 'host-user';
      const playerUserId = isHost ? m.recipientId : m.senderId;

      if (!playerUserId) return;

      const key = `${m.gameId}-${playerUserId}`;

      if (!threadMap[key]) {
        threadMap[key] = {
          user: isHost
            ? { name: 'Player', id: playerUserId, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200' }
            : { name: m.senderName, id: m.senderId, avatar: m.senderAvatar },
          messages: [],
          gameId: m.gameId,
          type: m.type
        };
      }
      threadMap[key].messages.push(m);
    });

    Object.values(threadMap).forEach(t => {
      t.messages.sort((a, b) => b.id.localeCompare(a.id));
    });

    return Object.values(threadMap).sort((a, b) => b.messages[0].id.localeCompare(a.messages[0].id));
  }, [messages, selectedGameId, inquiryType]);

  const activeThread = useMemo(() => {
    if (!activeThreadUserId) return null;
    return threads.find(t => t.user.id === activeThreadUserId);
  }, [threads, activeThreadUserId]);

  const handleSendReply = () => {
    if (!replyText.trim() || !activeThread) return;
    onSendReply(activeThread.gameId, replyText, activeThread.user.id);
    setReplyText('');
  };

  const handleGameSelect = (id: string | 'all') => {
    setSelectedGameId(id);
    setMobileView('threads');
  };

  const handleThreadSelect = (userId: string) => {
    setActiveThreadUserId(userId);
    setMobileView('chat');
    const thread = threads.find(t => t.user.id === userId);
    thread?.messages.forEach(m => !m.isRead && onReadMessage(m.id));
  };

  return (
    <section className="min-h-screen bg-black pt-28 pb-6 md:pb-20 px-4 md:px-12 text-white flex flex-col">
      <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col md:flex-row gap-4 md:gap-10">

        {/* Pane 1: Game & Action Sidebar */}
        <div className={`${mobileView !== 'games' ? 'hidden md:flex' : 'flex'} w-full md:w-20 shrink-0 md:flex-col gap-4 items-center overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar`}>
          <button
            onClick={() => handleGameSelect('all')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 ${selectedGameId === 'all' ? 'bg-[#C6FF00] text-black shadow-lg shadow-lime-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
          >
            <span className="font-black text-xs italic uppercase">All</span>
          </button>
          <div className="h-px w-8 bg-white/10 hidden md:block" />
          {hostedGames.map(game => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id)}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all relative shrink-0 ${selectedGameId === game.id ? 'bg-[#C6FF00] text-black shadow-lg shadow-lime-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
            >
              <ICONS.TennisBall className="scale-75" />
              {messages.some(m => m.gameId === game.id && !m.isRead) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-black animate-pulse" />
              )}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => setInquiryType(inquiryType === 'challenge' ? 'all' : 'challenge')}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shrink-0 border-2 ${inquiryType === 'challenge' ? 'bg-red-500 border-red-500 text-white animate-pulse' : 'bg-white/5 border-white/10 text-white/40'}`}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
          </button>
        </div>

        {/* Pane 2: Thread List */}
        <div className={`${mobileView !== 'threads' ? 'hidden md:flex' : 'flex'} w-full md:w-80 shrink-0 bg-white/5 border border-white/10 rounded-[40px] flex flex-col overflow-hidden`}>
          <div className="p-8 border-b border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Incoming</h4>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">Inbox</h3>
              </div>
              <button onClick={() => setMobileView('games')} className="md:hidden p-3 bg-white/5 rounded-full"><ICONS.X /></button>
            </div>

            <div className="bg-black/40 p-1 rounded-full flex gap-1 border border-white/5">
              {(['all', 'inquiry', 'challenge'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setInquiryType(t)}
                  className={`flex-1 py-2 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${inquiryType === t ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-2">
            {threads.map(thread => (
              <button
                key={`${thread.gameId}-${thread.user.id}`}
                onClick={() => handleThreadSelect(thread.user.id)}
                className={`w-full text-left p-5 rounded-[32px] transition-all flex items-center gap-4 relative group ${activeThreadUserId === thread.user.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div className="relative shrink-0">
                  <Image src={thread.user.avatar} alt={thread.user.name} width={48} height={48} className="w-12 h-12 rounded-full border-2 border-white/10" />
                  {thread.type === 'challenge' && (
                    <div className="absolute -bottom-1 -right-1 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black">VS</div>
                  )}
                  {thread.messages.some(m => !m.isRead) && <div className="absolute top-0 right-0 w-3 h-3 bg-[#C6FF00] rounded-full border-2 border-black" />}
                </div>
                <div className="overflow-hidden">
                  <h5 className="font-black italic uppercase tracking-tight truncate">{thread.user.name}</h5>
                  <p className={`text-[10px] font-black uppercase tracking-widest truncate ${thread.type === 'challenge' ? 'text-red-500' : 'text-[#C6FF00]'}`}>
                    {thread.type === 'challenge' ? 'CHALLENGE' : hostedGames.find(g => g.id === thread.gameId)?.title.split(' ')[0]}
                  </p>
                  <p className="text-[10px] text-white/30 truncate mt-1">{thread.messages[0].content}</p>
                </div>
              </button>
            ))}
            {threads.length === 0 && (
              <div className="py-20 text-center opacity-10 flex flex-col items-center gap-4">
                <ICONS.Logo />
                <p className="text-sm font-black italic uppercase">No {inquiryType}s found</p>
              </div>
            )}
          </div>
        </div>

        {/* Pane 3: Chat/Challenge View */}
        <div className={`${mobileView !== 'chat' ? 'hidden md:flex' : 'flex'} flex-1 bg-white/5 border border-white/10 rounded-[40px] md:rounded-[56px] flex flex-col overflow-hidden relative`}>
          <AnimatePresence mode="wait">
            {activeThread ? (
              <motion.div key={activeThread.user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col h-full">
                <div className="p-6 md:p-10 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md relative z-10 shrink-0">
                  <div className="flex items-center gap-3 md:gap-5">
                    <button onClick={() => setMobileView('threads')} className="md:hidden p-2 bg-white/5 rounded-full"><ICONS.ChevronRight className="rotate-180" /></button>
                    <Image src={activeThread.user.avatar} alt={activeThread.user.name} width={56} height={56} className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-[#C6FF00]" />
                    <div className="overflow-hidden">
                      <h3 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter truncate">{activeThread.user.name}</h3>
                      <div className="hidden sm:flex items-center gap-3">
                        <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full shrink-0 ${activeThread.type === 'challenge' ? 'bg-red-500 text-white' : 'bg-[#C6FF00] text-black'}`}>
                          {activeThread.type === 'challenge' ? 'Opponent' : 'Inquiry'}
                        </span>
                        <span className="text-[9px] font-black uppercase text-white/30 tracking-widest truncate">
                          {activeThread.type === 'challenge' ? 'Awaiting Acceptance' : 'Match Inquiry'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        activeThread.messages.forEach(m => onArchiveMessage(m.id));
                        setActiveThreadUserId(null);
                        setMobileView('threads');
                      }}
                      className="bg-white/5 hover:bg-red-500/20 hover:text-red-500 p-3 md:p-4 rounded-full transition-all text-white/30"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-6 md:space-y-8 flex flex-col-reverse hide-scrollbar">
                  <div className="flex flex-col gap-6 md:gap-8">
                    {[...activeThread.messages].reverse().map(msg => (
                      <React.Fragment key={msg.id}>
                        {msg.type === 'challenge' && msg.challengeDetails && (
                          <div className="w-full bg-red-500/10 border-2 border-red-500/20 rounded-[40px] p-8 space-y-6 my-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="text-red-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Direct Challenge</h4>
                                <p className="text-white text-2xl font-black italic uppercase">{msg.challengeDetails.type} {msg.challengeDetails.sport}</p>
                              </div>
                              <div className="bg-red-500 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase italic animate-pulse">Pending</div>
                            </div>
                            <p className="text-white/60 font-medium italic italic">"{msg.challengeDetails.message}"</p>

                            {msg.challengeDetails.status === 'pending' && msg.senderId !== 'host-user' && (
                              <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                  onClick={() => onUpdateChallenge?.(msg.challengeDetails!.id, 'accepted')}
                                  className="bg-white text-black py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-xl"
                                >
                                  Accept Challenge
                                </button>
                                <button
                                  onClick={() => onUpdateChallenge?.(msg.challengeDetails!.id, 'declined')}
                                  className="bg-white/5 text-white/40 border border-white/10 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                >
                                  Decline
                                </button>
                              </div>
                            )}

                            {msg.challengeDetails.status !== 'pending' && (
                              <div className={`py-4 text-center rounded-full font-black uppercase text-xs tracking-widest ${msg.challengeDetails.status === 'accepted' ? 'bg-[#C6FF00] text-black' : 'bg-white/5 text-white/40'}`}>
                                Challenge {msg.challengeDetails.status.toUpperCase()}
                              </div>
                            )}
                          </div>
                        )}

                        <div className={`flex ${msg.senderId === 'host-user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[70%] rounded-[28px] md:rounded-[32px] p-5 md:p-6 ${msg.senderId === 'host-user' ? (msg.type === 'challenge' ? 'bg-red-500 text-white' : 'bg-[#C6FF00] text-black') : 'bg-white/10 text-white border border-white/5'}`}>
                            <p className="text-sm md:text-base font-bold leading-relaxed">{msg.content}</p>
                            <p className={`text-[8px] font-black uppercase tracking-widest mt-2 ${msg.senderId === 'host-user' ? 'text-white/40' : 'text-white/20'}`}>{msg.timestamp}</p>
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="p-6 md:p-8 border-t border-white/5 bg-black/40 backdrop-blur-xl shrink-0">
                  <div className="flex gap-3 md:gap-4">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={activeThread.type === 'challenge' ? "Drop some trash talk..." : "Type pro-response..."}
                      className="flex-1 bg-white/5 border border-white/10 rounded-[28px] md:rounded-[32px] p-4 md:p-6 text-sm font-bold text-white outline-none focus:border-[#C6FF00] transition-all resize-none h-16 md:h-20"
                    />
                    <button
                      onClick={handleSendReply}
                      className={`${activeThread.type === 'challenge' ? 'bg-red-500' : 'bg-[#C6FF00]'} text-black w-16 h-16 md:w-20 md:h-20 rounded-[28px] md:rounded-[32px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl shrink-0`}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polyline points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center p-8 space-y-6 md:space-y-8">
                <ICONS.Logo />
                <div className="space-y-2">
                  <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">Combat Dashboard</h3>
                  <p className="text-[10px] md:text-sm font-black uppercase tracking-widest">Select an inquiry or challenge to manage</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

export default MessageCenter;
