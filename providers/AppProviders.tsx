'use client';

import React from 'react';
import { PlayChaleProvider } from '@/providers/PlayChaleProvider';
import { QueryProvider } from '@/providers/QueryProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <PlayChaleProvider>{children}</PlayChaleProvider>
    </QueryProvider>
  );
}
