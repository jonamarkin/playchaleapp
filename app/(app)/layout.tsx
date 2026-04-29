'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    openModal,
    handleNavigate,
    showToast,
  } = usePlayChale();

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
    <div className="min-h-screen relative bg-[#FDFDFB]">
      <Header
        activeView={getActiveView()}
        onNavigate={(view) => handleNavigate(`/${view}`)}
        onOpenCreate={() => openModal('create')}
      />
      <main>
        {children}
      </main>
      <Footer onNavigate={handleNavigate} />
      <AppModalHost />

      {/* Toast Notification */}
      {showToast && (
        <div className="pc-toast-enter fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-black text-[#C6FF00] px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl">
          {showToast}
        </div>
      )}
    </div>
  );
}
