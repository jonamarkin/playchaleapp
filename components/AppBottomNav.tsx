'use client';

import React from 'react';
import { Home, MessageCircle, Plus, Search, UserRound } from 'lucide-react';

interface AppBottomNavProps {
  activeView: string;
  unreadCount?: number;
  onNavigate: (view: string) => void;
  onOpenCreate: () => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'discover', label: 'Games', icon: Search },
  { id: 'messages', label: 'Inbox', icon: MessageCircle },
  { id: 'stats', label: 'Me', icon: UserRound },
];

export default function AppBottomNav({
  activeView,
  unreadCount = 0,
  onNavigate,
  onOpenCreate,
}: AppBottomNavProps) {
  const isActive = (id: string) => activeView === id;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[130] md:hidden pointer-events-none px-3 pb-[calc(0.7rem+env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto grid max-w-md grid-cols-5 items-end gap-1 rounded-[32px] border border-white/10 bg-black/90 px-2 py-2 text-white shadow-[0_-24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
        {navItems.slice(0, 2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`pc-btn-press relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[24px] px-2 text-[9px] font-black uppercase tracking-[0.16em] transition-all ${
                active ? 'bg-[#C6FF00] text-black shadow-lg shadow-lime-500/20' : 'text-white/45 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon size={20} strokeWidth={2.7} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={onOpenCreate}
          aria-label="Create game"
          className="pc-btn-press relative -mt-7 flex h-[66px] w-[66px] items-center justify-center rounded-full border-[6px] border-black bg-[#C6FF00] text-black shadow-[0_14px_34px_rgba(198,255,0,0.34)]"
        >
          <Plus size={28} strokeWidth={3.2} />
        </button>

        {navItems.slice(2).map((item) => {
          const Icon = item.icon;
          const active = isActive(item.id);
          const showBadge = item.id === 'messages' && unreadCount > 0;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={active ? 'page' : undefined}
              className={`pc-btn-press relative flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-[24px] px-2 text-[9px] font-black uppercase tracking-[0.16em] transition-all ${
                active ? 'bg-[#C6FF00] text-black shadow-lg shadow-lime-500/20' : 'text-white/45 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className="relative">
                <Icon size={20} strokeWidth={2.7} />
                {showBadge && (
                  <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-500 px-1 text-[8px] leading-4 text-white ring-2 ring-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
