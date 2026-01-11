'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GameModal from '@/components/GameModal';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { 
    activeModal, 
    selectedItem, 
    closeModal, 
    openModal,
    handleNavigate, 
    showToast,
    triggerToast,
    hasProfile,
    setPendingAction
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
      
      {/* Global Modal */}
      <AnimatePresence>
        {activeModal && (
          <GameModal 
            type={activeModal} 
            item={selectedItem} 
            onClose={closeModal} 
            onJoin={(id) => {
              if (!hasProfile) {
                setPendingAction({ type: 'modal', modalType: 'join', item: selectedItem });
                closeModal();
                handleNavigate('/onboarding');
                return;
              }
              triggerToast("JOIN REQUEST SENT!");
              closeModal();
            }}
            onSendMessage={(gameId, content) => {
              if (!hasProfile) {
                setPendingAction({ type: 'modal', modalType: 'join', item: selectedItem });
                closeModal();
                handleNavigate('/onboarding');
                return;
              }
              triggerToast("MESSAGE SENT TO HOST!");
            }}
          />
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: 50 }} 
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] bg-black text-[#C6FF00] px-8 py-4 rounded-full font-black uppercase tracking-widest text-[10px] shadow-2xl"
          >
            {showToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
