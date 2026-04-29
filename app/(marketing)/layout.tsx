import React from 'react';
import MarketingFooter from '@/components/MarketingFooter';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative bg-[#FDFDFB]">
      {children}
      <MarketingFooter />
    </div>
  );
}
