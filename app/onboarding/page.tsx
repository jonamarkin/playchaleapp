'use client';

import React from 'react';
import Onboarding from '@/components/Onboarding';
import { usePlayChale } from '@/providers/PlayChaleProvider';
import { AppProviders } from '@/providers/AppProviders';

export default function OnboardingPage() {
  return (
    <AppProviders>
      <OnboardingContent />
    </AppProviders>
  );
}

function OnboardingContent() {
  const { completeOnboarding, handleNavigate } = usePlayChale();

  return (
    <div className="pc-view-enter">
      <Onboarding 
        onComplete={completeOnboarding} 
        onSkip={() => handleNavigate('/discover')} 
      />
    </div>
  );
}
