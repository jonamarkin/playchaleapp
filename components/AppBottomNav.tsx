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
  const renderNavButton = (item: (typeof navItems)[number]) => {
    const Icon = item.icon;
    const active = isActive(item.id);
    const showBadge = item.id === 'messages' && unreadCount > 0;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => onNavigate(item.id)}
        aria-current={active ? 'page' : undefined}
        className="pc-btn-press group relative flex min-h-[64px] min-w-0 flex-col items-center justify-center rounded-[28px] px-1 text-[8px] font-black uppercase tracking-[0.12em] text-white transition-all"
      >
        <span
          className={`absolute inset-x-1.5 bottom-1 top-2 rounded-[24px] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            active ? 'bg-white/[0.07] opacity-100' : 'opacity-0 group-hover:bg-white/[0.05] group-hover:opacity-100'
          }`}
        />
        <span
          className={`relative flex h-11 w-11 items-center justify-center rounded-[19px] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            active
              ? '-translate-y-3 bg-[#C6FF00] text-black shadow-[0_12px_28px_rgba(198,255,0,0.35)] ring-4 ring-black'
              : 'translate-y-0 text-white/45 group-hover:-translate-y-1 group-hover:bg-white/10 group-hover:text-white'
          }`}
        >
          <Icon size={20} strokeWidth={2.7} />
          {showBadge && (
            <span className="absolute -right-1.5 -top-1.5 min-w-4 rounded-full bg-red-500 px-1 text-[8px] leading-4 text-white ring-2 ring-black">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        <span
          className={`relative -mt-1 truncate transition-all duration-300 ${
            active ? '-translate-y-1 text-[#C6FF00] opacity-100' : 'translate-y-0 text-white/35 opacity-75 group-hover:text-white/70'
          }`}
        >
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[130] md:hidden pointer-events-none px-3 pb-[calc(0.7rem+env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto max-w-md">
        <div className="grid grid-cols-5 items-end gap-1 overflow-visible rounded-[34px] border border-white/10 bg-black/90 px-2 py-2 text-white shadow-[0_-24px_70px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
          {navItems.slice(0, 2).map(renderNavButton)}

          <button
            type="button"
            onClick={onOpenCreate}
            aria-label="Create game"
            className="pc-btn-press relative -mt-8 mx-auto flex h-[68px] w-[68px] items-center justify-center rounded-[26px] border-[6px] border-black bg-[#C6FF00] text-black shadow-[0_16px_38px_rgba(198,255,0,0.34)] transition-transform duration-300"
          >
            <Plus size={28} strokeWidth={3.2} />
          </button>

          {navItems.slice(2).map(renderNavButton)}
        </div>
      </div>
    </nav>
  );
}
