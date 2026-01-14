'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '@/constants';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

interface OnboardingData {
  name: string;
  sports: string[];
  level: string;
  location: string;
  email: string;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<{
    name: string;
    sports: string[];
    level: string;
    location: string;
    email: string;
    password: string;
  }>({
    name: '',
    sports: [],
    level: '',
    location: '',
    email: '',
    password: ''
  });

  const SPORTS = [
    { name: 'Football', icon: '⚽' },
    { name: 'Basketball', icon: '🏀' },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Volleyball', icon: '🏐' },
    { name: 'Swimming', icon: '🏊' },
    { name: 'Athletics', icon: '🏃' }
  ];

  const LEVELS = [
    { name: 'Beginner', label: 'Just starting out', intensity: 'Rookie' },
    { name: 'Intermediate', label: 'Weekend warrior', intensity: 'Semi-Pro' },
    { name: 'Competitive', label: 'Play to win', intensity: 'Pro' }
  ];

  const LEVEL_CONFIG: Record<string, { matches: string, rivals: string, grade: string, drive: string }> = {
    'Beginner': { matches: '0', rivals: '12', grade: 'Bronze', drive: 'Rookie' },
    'Intermediate': { matches: '24', rivals: '156', grade: 'Silver', drive: 'Semi-Pro' },
    'Competitive': { matches: '89', rivals: '482', grade: 'Gold', drive: 'Pro' }
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(Math.max(1, step - 1));

  const handleFinalSign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
          }
        }
      });

      if (error) throw error;

      // Ensure user is signed in before proceeding
      if (authData.user) {
        onComplete({
          name: data.name,
          sports: data.sports,
          level: data.level,
          location: data.location,
          email: data.email
        });
      } else {
        // Handle "Check your email" case if email confirmation is on
        // In a real app, you'd show a UI step for "Verify Email"
        alert('Please check your email to confirm your account!');
        setIsLoading(false);
      }

    } catch (error: any) {
      console.error('Signup error:', error);
      alert(error.message || 'Failed to sign up');
      setIsLoading(false);
    }
  };

  // ... existing code ...

  const handleSocialAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    // Save draft state before redirecting
    localStorage.setItem('playchale_onboarding_temp', JSON.stringify(data));
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Social auth error:', error);
      setIsLoading(false);
    }
  };

  // Resume onboarding after OAuth redirect
  React.useEffect(() => {
    const checkResume = async () => {
      const saved = localStorage.getItem('playchale_onboarding_temp');
      if (saved) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setIsLoading(true);
          try {
            const parsed = JSON.parse(saved);
            // Restore state slightly for UI context if needed, or just submit
            setData(parsed);
            // Trigger completion logic
            onComplete(parsed);
            localStorage.removeItem('playchale_onboarding_temp');
          } catch (e) {
            console.error('Failed to parse saved onboarding data', e);
            localStorage.removeItem('playchale_onboarding_temp');
            setIsLoading(false);
          }
        }
      }
    };
    checkResume();
  }, []);

  // Total steps is now 6 (Sport, Level, Location, Name, Report, Auth)
  const TOTAL_STEPS = 6;

  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#C6FF00]/10 blur-[150px] rounded-full -mr-40 -mt-40"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full -ml-40 -mb-40"></div>
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/5 flex z-50">
        <motion.div
          className="h-full bg-[#C6FF00] shadow-[0_0_20px_#C6FF00]"
          initial={{ width: '0%' }}
          animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>

      <header className="p-6 md:p-10 flex justify-between items-center relative z-20 bg-gradient-to-b from-black to-transparent">
        <div className="flex items-center gap-4">
          {step > 1 && step < TOTAL_STEPS && (
            <button
              onClick={prevStep}
              className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all mr-2"
            >
              <div className="rotate-180 scale-125"><ICONS.ChevronRight /></div>
            </button>
          )}
          <div className="flex items-center gap-3">
            <ICONS.Logo />
            <span className="font-black text-xl md:text-2xl tracking-tighter italic uppercase">PRO DRAFT.</span>
          </div>
        </div>
        {step < TOTAL_STEPS && (
          <button
            onClick={onSkip}
            className="text-white/40 text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] hover:text-white transition-colors"
          >
            Exit Draft
          </button>
        )}
      </header>

      {/* Central Content Area - Now Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-12 relative z-10 hide-scrollbar">
        <div className="max-w-6xl mx-auto flex flex-col items-center justify-center min-h-full">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full space-y-12 text-center"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C6FF00]">PHASE 01: ARENA</span>
                  <h2 className="text-4xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85]">Select your <br /> disciplines.</h2>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest">Select all that apply</p>
                </div>

                <div className="flex flex-col items-center gap-8">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl">
                    {SPORTS.map(s => {
                      const isSelected = data.sports.includes(s.name);
                      return (
                        <button
                          key={s.name}
                          onClick={() => {
                            const newSports = isSelected
                              ? data.sports.filter(sport => sport !== s.name)
                              : [...data.sports, s.name];
                            setData({ ...data, sports: newSports });
                          }}
                          className={`group border-2 p-6 md:p-10 rounded-[32px] md:rounded-[48px] hover:scale-105 transition-all duration-500 flex flex-col items-center gap-3 md:gap-6 ${isSelected ? 'bg-[#C6FF00] border-[#C6FF00] text-black scale-105' : 'bg-white/5 border-white/5 hover:bg-white/10 text-white'}`}
                        >
                          <span className={`text-3xl md:text-5xl transition-transform ${isSelected ? 'scale-125' : 'group-hover:scale-125'}`}>{s.icon}</span>
                          <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em]">{s.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  <Button
                    onClick={nextStep}
                    disabled={data.sports.length === 0}
                    className="px-12 py-6 rounded-full bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-[#C6FF00] disabled:opacity-30 disabled:hover:bg-white transition-all w-full md:w-auto"
                  >
                    Confirm Selection ({data.sports.length})
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full space-y-12 text-center"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C6FF00]">PHASE 02: LEVEL</span>
                  <h2 className="text-4xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85]">What's your <br /> level?</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
                  {LEVELS.map(l => (
                    <button
                      key={l.name}
                      onClick={() => { setData({ ...data, level: l.name }); nextStep(); }}
                      className="group bg-white/5 border-2 border-white/5 p-8 md:p-12 rounded-[40px] md:rounded-[56px] hover:bg-white hover:text-black transition-all duration-500 text-left relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:opacity-30 transition-all font-black italic text-2xl md:text-4xl">{l.intensity}</div>
                      <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter mb-2">{l.name}</h3>
                      <p className="text-[10px] md:text-xs font-bold opacity-40 group-hover:opacity-60">{l.label}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full space-y-12 text-center"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C6FF00]">PHASE 03: REGION</span>
                  <h2 className="text-4xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85]">Where do <br /> you play?</h2>
                </div>

                <div className="max-w-md mx-auto w-full px-4">
                  <div className="relative group w-full">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C6FF00] transition-colors z-10"><ICONS.MapPin /></div>
                    <Input
                      type="text"
                      placeholder="Enter your city..."
                      className="w-full h-auto bg-white/5 border-2 border-white/10 rounded-full pl-16 pr-8 py-6 text-base md:text-xl font-black outline-none focus:border-[#C6FF00] transition-all focus-visible:ring-0 placeholder:text-white/20"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.currentTarget.value) {
                          setData({ ...data, location: e.currentTarget.value });
                          nextStep();
                        }
                      }}
                    />
                  </div>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Press enter to lock region</p>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="w-full space-y-12 text-center"
              >
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C6FF00]">PHASE 04: IDENTITY</span>
                  <h2 className="text-4xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85]">The Athlete <br /> Signature.</h2>
                </div>

                <div className="max-w-md mx-auto w-full px-4">
                  <div className="relative group w-full">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C6FF00] transition-colors z-10">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    </div>
                    <Input
                      type="text"
                      placeholder="Name or Username..."
                      className="w-full h-auto bg-white/5 border-2 border-white/10 rounded-full pl-16 pr-8 py-6 text-base md:text-xl font-black outline-none focus:border-[#C6FF00] transition-all focus-visible:ring-0 placeholder:text-white/20"
                      autoFocus
                      value={data.name}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && data.name) {
                          nextStep();
                        }
                      }}
                    />
                  </div>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">This is how you'll be known in the Arena</p>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className="w-full bg-white/5 border border-white/10 p-6 md:p-20 rounded-[40px] md:rounded-[80px] text-center space-y-8 md:space-y-12 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12 hidden md:block"><ICONS.Logo /></div>

                <div className="space-y-4 md:space-y-6">
                  <span className="bg-[#C6FF00] text-black px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest">DRAFT REPORT: {data.name.toUpperCase()}</span>
                  <h2 className="text-3xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.85]">Welcome to <br className="hidden md:block" /> the Elite.</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-left w-full">
                  <div className="p-6 md:p-8 bg-black border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Projected Matches</p>
                    <p className="text-4xl md:text-5xl font-black italic text-[#C6FF00]">{LEVEL_CONFIG[data.level]?.matches || '0'}</p>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mt-2 truncate">In {data.location}</p>
                  </div>
                  <div className="p-6 md:p-8 bg-black border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Potential Rivals</p>
                    <p className="text-4xl md:text-5xl font-black italic text-[#C6FF00]">{LEVEL_CONFIG[data.level]?.rivals || '0'}</p>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">Active {data.sports.join(', ')}</p>
                  </div>
                  <div className="p-6 md:p-8 bg-black border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl">
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Starting Tier</p>
                    <p className="text-4xl md:text-5xl font-black italic text-[#C6FF00]">{LEVEL_CONFIG[data.level]?.grade || 'Bronze'}</p>
                    <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mt-2 truncate">Level: {LEVEL_CONFIG[data.level]?.drive || data.level}</p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 md:pt-10">
                  <Button onClick={nextStep} className="w-full md:w-auto h-auto bg-[#C6FF00] text-black px-12 py-5 md:py-6 rounded-full font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl shadow-lime-500/20 hover:scale-105 hover:bg-[#b0ff00] transition-all">Sign Athlete Contract</Button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-2xl w-full flex flex-col items-center space-y-8 md:space-y-12"
              >
                {/* ... existing header content ... */}
                <div className="text-center space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C6FF00]">PHASE 06: COMMISSIONING</span>
                  <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.85]">Finalize <br /> Credentials.</h2>
                  <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest">Commissioning profile for {data.name}</p>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center gap-6 py-20">
                    <div className="w-16 h-16 border-4 border-white/10 border-t-[#C6FF00] rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C6FF00] animate-pulse">Commissioning Athlete...</p>
                  </div>
                ) : (
                  <div className="w-full space-y-8 md:space-y-10">
                    {/* Social Auth */}
                    <div className="grid grid-cols-1 gap-4">
                      {/* ... Social Buttons kept as native for custom icons layout ... */}
                      <button
                        onClick={() => handleSocialAuth('google')}
                        className="bg-white text-black p-5 rounded-full flex items-center justify-center gap-4 hover:bg-gray-200 transition-all group"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.172-1.224 1.224-3.136 2.584-6.392 2.584-5.112 0-9.216-4.144-9.216-9.256s4.104-9.256 9.216-9.256c2.784 0 4.888 1.104 6.384 2.504l2.312-2.312c-2.128-2.024-4.88-3.192-8.696-3.192-7.392 0-13.432 6.04-13.432 13.432s6.04 13.432 13.432 13.432c4.016 0 7.04-1.32 9.424-3.792 2.448-2.448 3.216-5.888 3.216-8.544 0-.816-.064-1.584-.2-2.312h-12.42z" /></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                      <div className="h-px bg-white/10 flex-1"></div>
                      <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">OR DIRECT SIGNING</span>
                      <div className="h-px bg-white/10 flex-1"></div>
                    </div>

                    <form onSubmit={handleFinalSign} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Athlete Email</label>
                        <Input
                          type="email"
                          required
                          placeholder="scout@academy.pro"
                          className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-8 py-5 text-base font-bold outline-none transition-all placeholder:text-white/20 focus-visible:ring-0"
                          value={data.email}
                          onChange={(e) => setData({ ...data, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Secret Access Code</label>
                        <Input
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full h-auto bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-8 py-5 text-base font-bold outline-none transition-all placeholder:text-white/20 focus-visible:ring-0"
                          value={data.password}
                          onChange={(e) => setData({ ...data, password: e.target.value })}
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full h-auto bg-white text-black py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-[#C6FF00] transition-all mt-6"
                      >
                        Commission Account
                      </Button>
                    </form>

                    <p className="text-[8px] font-black text-center text-white/20 uppercase tracking-[0.2em] leading-relaxed">
                      By commissioning, you agree to our Pro-Athlete terms of conduct <br /> and amateur eligibility guidelines.
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <footer className="p-6 md:p-10 flex justify-center opacity-20 relative z-20 bg-gradient-to-t from-black to-transparent">
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-center">© 2025 PLAYCHALE ATHLETE MANAGEMENT SYSTEM</p>
      </footer>
    </div>
  );
};

export default Onboarding;
