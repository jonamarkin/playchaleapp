'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Onboarding from '@/components/Onboarding';
import { usePlayChale } from '@/providers/PlayChaleProvider';

export default function OnboardingPage() {
  const { completeOnboarding, handleNavigate } = usePlayChale();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
    >
      <Onboarding 
        onComplete={completeOnboarding} 
        onSkip={() => handleNavigate('/discover')} 
      />
    </motion.div>
  );
}
