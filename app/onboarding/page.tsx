'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Onboarding from '@/components/Onboarding';
import { useUIStore } from '@/hooks/useUIStore';
import { backend } from '@/services';
import { OnboardingProfileInput } from '@/types';

export default function OnboardingPage() {
  const router = useRouter();
  const {
    pendingAction,
    setPendingAction,
    openModal,
    triggerToast,
  } = useUIStore();

  const completeOnboarding = useCallback(async (userData: OnboardingProfileInput) => {
    triggerToast('Saving Profile...');
    await backend.auth.completeOnboarding(userData);
    triggerToast(`WELCOME TO THE ARENA, ${userData.name.toUpperCase()}.`);

    if (pendingAction?.type === 'view' && pendingAction.viewPath) {
      router.push(pendingAction.viewPath);
      setPendingAction(null);
      return;
    }

    if (pendingAction?.type === 'modal' && pendingAction.modalType) {
      router.push('/discover');
      openModal(pendingAction.modalType, pendingAction.item);
      setPendingAction(null);
      return;
    }

    router.push('/home');
  }, [openModal, pendingAction, router, setPendingAction, triggerToast]);

  const skipOnboarding = useCallback(() => {
    router.push('/discover');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [router]);

  return (
    <div>
      <Onboarding
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />
    </div>
  );
}
