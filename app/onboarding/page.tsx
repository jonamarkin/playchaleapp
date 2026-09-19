'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Onboarding, { type OnboardingData } from '@/components/Onboarding';
import { useCompleteOnboarding } from '@/features/auth/hooks';

export default function OnboardingPage() {
  const router = useRouter();
  const { mutateAsync: completeOnboarding } = useCompleteOnboarding();

  const handleComplete = async ({ email, password, name, sports, level, location }: OnboardingData) => {
    await completeOnboarding({
      credentials: { email, password },
      profile: { name, sports, skillLevel: level, locationText: location },
    });
  };

  return (
    <div className="animate-in fade-in duration-300">
      <Onboarding onComplete={handleComplete} onSkip={() => router.push('/discover')} />
    </div>
  );
}
