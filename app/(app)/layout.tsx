'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppBottomNav from '@/components/AppBottomNav';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { AppProviders } from '@/providers/AppProviders';

const AppModalHost = dynamic(() => import('@/components/AppModalHost'), {
  ssr: false,
});

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppProviders>
      <AppShell>{children}</AppShell>
    </AppProviders>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const {
    messages,
    openModal,
    handleNavigate,
    showToast,
  } = usePlayChale();
  const unreadCount = messages.filter((message) => !message.isRead).length;
  const isDarkSurface = pathname.startsWith('/messages') || pathname.startsWith('/profile') || pathname.startsWith('/stats') || pathname.startsWith('/game');

  // Determine active view for Header styling
  const getActiveView = () => {
    if (pathname === '/home') return 'home';
    if (pathname === '/discover') return 'discover';
    if (pathname === '/community') return 'community';
    if (pathname === '/stats') return 'stats';
    if (pathname === '/messages') return 'messages';
    return 'home';
  };

  return (
    <div className={`min-h-screen relative ${isDarkSurface ? 'bg-black' : 'bg-[#FDFDFB]'}`}>
      <div className="hidden md:block">
        <Header
          activeView={getActiveView()}
          onNavigate={(view) => handleNavigate(`/${view}`)}
          onOpenCreate={() => openModal('create')}
        />
      </div>
      <main className={`pb-[calc(7.75rem+env(safe-area-inset-bottom))] md:pb-0 ${isDarkSurface ? 'bg-black' : 'bg-[#FDFDFB]'}`}>
        {children}
      </main>
      <div className="hidden md:block">
        <Footer onNavigate={handleNavigate} />
      </div>
      <AppBottomNav
        activeView={getActiveView()}
        unreadCount={unreadCount}
        onNavigate={(view) => handleNavigate(`/${view}`)}
        onOpenCreate={() => openModal('create')}
      />
      <AppModalHost />

      {/* Toast Notification */}
      {showToast && (
        <div className="pc-toast-enter fixed bottom-[calc(6.8rem+env(safe-area-inset-bottom))] md:bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-black text-[#C6FF00] px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl">
          {showToast}
        </div>
      )}
    </div>
  );
}
