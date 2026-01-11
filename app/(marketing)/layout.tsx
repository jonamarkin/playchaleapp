'use client';

import React from 'react';
import Footer from '@/components/Footer';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { handleNavigate } = usePlayChale();

  return (
    <div className="min-h-screen relative bg-[#FDFDFB]">
      {children}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
