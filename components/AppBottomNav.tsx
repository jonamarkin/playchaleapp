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
  { id: 'create', label: 'Create', icon: Plus, action: 'create' },
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
    const handleClick = item.action === 'create' ? onOpenCreate : () => onNavigate(item.id);

    return (
      <button
        key={item.id}
        type="button"
        onClick={handleClick}
        aria-label={item.action === 'create' ? 'Create game' : undefined}
        aria-current={active ? 'page' : undefined}
        className="pc-btn-press group relative flex min-h-[66px] min-w-0 flex-col items-center justify-center overflow-hidden rounded-[22px] px-1 text-[8px] font-black uppercase tracking-[0.08em] text-white transition-all duration-300"
      >
        <span
          className={`absolute inset-x-1.5 inset-y-1.5 rounded-[18px] transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            active ? 'bg-[#C6FF00]/10 opacity-100 shadow-[inset_0_1px_0_rgba(198,255,0,0.16)]' : 'opacity-0 group-hover:bg-white/[0.045] group-hover:opacity-100'
          }`}
        />
        <span
          className={`relative mb-1 flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
            active ? 'text-[#C6FF00]' : 'text-white/42 group-hover:-translate-y-0.5 group-hover:text-white/80'
          }`}
        >
          <Icon size={20} strokeWidth={active ? 2.7 : 2.4} />
          {showBadge && (
            <span className="absolute -right-2 -top-1.5 min-w-4 rounded-full bg-red-500 px-1 text-[8px] leading-4 text-white ring-2 ring-black">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </span>
        <span
          className={`relative truncate transition-all duration-300 ${
            active ? 'text-[#C6FF00] opacity-100' : 'text-white/38 opacity-90 group-hover:text-white/70'
          }`}
        >
          {item.label}
        </span>
        <span
          className={`absolute bottom-1.5 h-0.5 rounded-full bg-[#C6FF00] shadow-[0_0_16px_rgba(198,255,0,0.7)] transition-all duration-300 ${
            active ? 'w-9 opacity-100' : 'w-0 opacity-0'
          }`}
        />
      </button>
    );
  };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[130] md:hidden pointer-events-none px-4 pb-[calc(0.85rem+env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto mx-auto max-w-md">
        <div className="grid grid-cols-5 items-center gap-1 overflow-hidden rounded-[28px] border border-[#C6FF00]/15 bg-[#111111] px-2 py-2 text-white shadow-[0_-18px_55px_rgba(0,0,0,0.42)]">
          {navItems.map(renderNavButton)}
        </div>
      </div>
    </nav>
  );
}
