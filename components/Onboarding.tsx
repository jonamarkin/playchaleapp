'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ICONS } from '@/constants';

interface OnboardingData {
  name: string;
  sport: string;
  level: string;
  location: string;
  email: string;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
  onSkip: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    name: '',
    sport: '',
    level: '',
    location: '',
    email: '',
    password: ''
  });

  const SPORTS = [
    { name: 'Football', icon: '⚽' },
    { name: 'Basketball', icon: '🏀' },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Padel', icon: '🎾' }
  ];

  const LEVELS = [
    { name: 'Casual', label: 'Play for fun', intensity: 'Low' },
    { name: 'Competitive', label: 'Play to win', intensity: 'High' },
    { name: 'Elite', label: 'Pro-level', intensity: 'Extreme' }
  ];

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(Math.max(1, step - 1));

  const handleFinalSign = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API registration call
    setTimeout(() => {
      setIsLoading(false);
      onComplete({
        name: data.name,
        sport: data.sport,
        level: data.level,
        location: data.location,
        email: data.email
      });
    }, 2000);
  };

  const handleSocialAuth = (provider: string) => {
    setIsLoading(true);
    // Simulate Social OAuth
    setTimeout(() => {
      setIsLoading(false);
      onComplete({
        name: data.name || 'Anonymous Pro',
        sport: data.sport || 'Multi',
        level: data.level || 'Competitive',
        location: data.location || 'Local',
        email: data.email || 'guest@playchale.com'
      });
    }, 1500);
  };

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
                  <h2 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85]">Select your <br /> discipline.</h2>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {SPORTS.map(s => (
                    <button 
                      key={s.name}
                      onClick={() => { setData({ ...data, sport: s.name }); nextStep(); }}
                      className="group bg-white/5 border-2 border-white/5 p-8 md:p-10 rounded-[40px] md:rounded-[48px] hover:bg-[#C6FF00] hover:text-black hover:scale-105 transition-all duration-500 flex flex-col items-center gap-4 md:gap-6"
                    >
                      <span className="text-4xl md:text-5xl group-hover:scale-125 transition-transform">{s.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-[0.3em]">{s.name}</span>
                    </button>
                  ))}
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
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#C6FF00]">PHASE 02: INTENSITY</span>
                  <h2 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85]">What's your <br /> drive?</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
                  {LEVELS.map(l => (
                    <button 
                      key={l.name}
                      onClick={() => { setData({ ...data, level: l.name }); nextStep(); }}
                      className="group bg-white/5 border-2 border-white/5 p-6 md:p-12 rounded-[40px] md:rounded-[56px] hover:bg-white hover:text-black transition-all duration-500 text-left relative overflow-hidden"
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
                  <h2 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85]">Where do <br /> you play?</h2>
                </div>
                
                <div className="max-w-md mx-auto relative group w-full px-4">
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C6FF00] transition-colors"><ICONS.MapPin /></div>
                  <input 
                    type="text" 
                    placeholder="Enter your city..." 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-full px-16 py-6 text-xl font-black outline-none focus:border-[#C6FF00] transition-all"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) { 
                        setData({...data, location: e.currentTarget.value}); 
                        nextStep(); 
                      }
                    }}
                  />
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
                  <h2 className="text-5xl md:text-9xl font-black italic tracking-tighter uppercase leading-[0.85]">The Athlete <br /> Signature.</h2>
                </div>
                
                <div className="max-w-md mx-auto relative group w-full px-4">
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#C6FF00] transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Your Full Name..." 
                    className="w-full bg-white/5 border-2 border-white/10 rounded-full px-16 py-6 text-xl font-black outline-none focus:border-[#C6FF00] transition-all"
                    autoFocus
                    value={data.name}
                    onChange={(e) => setData({...data, name: e.target.value})}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && data.name) { 
                        nextStep(); 
                      }
                    }}
                  />
                  <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-white/20">This is how you'll be addressed in the Arena</p>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -100 }}
                className="w-full bg-white/5 border border-white/10 p-8 md:p-20 rounded-[48px] md:rounded-[80px] text-center space-y-8 md:space-y-12 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12 hidden md:block"><ICONS.Logo /></div>
                
                <div className="space-y-4 md:space-y-6">
                  <span className="bg-[#C6FF00] text-black px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest">DRAFT REPORT: {data.name.toUpperCase()}</span>
                  <h2 className="text-4xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.85]">Welcome to <br className="hidden md:block" /> the Elite.</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 text-left w-full">
                   <div className="p-6 md:p-8 bg-black border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl">
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Live Matches</p>
                      <p className="text-4xl md:text-5xl font-black italic text-[#C6FF00]">12</p>
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mt-2 truncate">In {data.location}</p>
                   </div>
                   <div className="p-6 md:p-8 bg-black border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl">
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Elite Rivals</p>
                      <p className="text-4xl md:text-5xl font-black italic text-[#C6FF00]">482</p>
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mt-2">Active {data.sport}</p>
                   </div>
                   <div className="p-6 md:p-8 bg-black border border-white/10 rounded-[32px] md:rounded-[40px] shadow-2xl">
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">Scouting Grade</p>
                      <p className="text-4xl md:text-5xl font-black italic text-[#C6FF00]">A+</p>
                      <p className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-white/30 mt-2 truncate">Drive: {data.level}</p>
                   </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-6 md:pt-10">
                   <button onClick={nextStep} className="w-full md:w-auto bg-[#C6FF00] text-black px-12 py-5 md:py-6 rounded-full font-black uppercase tracking-widest text-[10px] md:text-[11px] shadow-2xl shadow-lime-500/20 hover:scale-105 transition-all">Sign Athlete Contract</button>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button 
                        onClick={() => handleSocialAuth('Google')}
                        className="bg-white text-black p-5 rounded-full flex items-center justify-center gap-4 hover:bg-gray-200 transition-all group"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.172-1.224 1.224-3.136 2.584-6.392 2.584-5.112 0-9.216-4.144-9.216-9.256s4.104-9.256 9.216-9.256c2.784 0 4.888 1.104 6.384 2.504l2.312-2.312c-2.128-2.024-4.88-3.192-8.696-3.192-7.392 0-13.432 6.04-13.432 13.432s6.04 13.432 13.432 13.432c4.016 0 7.04-1.32 9.424-3.792 2.448-2.448 3.216-5.888 3.216-8.544 0-.816-.064-1.584-.2-2.312h-12.42z"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
                      </button>
                      <button 
                        onClick={() => handleSocialAuth('Apple')}
                        className="bg-zinc-900 border border-white/10 text-white p-5 rounded-full flex items-center justify-center gap-4 hover:bg-zinc-800 transition-all"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.96.95-2.208 1.72-3.712 1.72-1.472 0-2.432-.88-3.92-.88-1.504 0-2.528.864-3.92.864-1.392 0-2.672-.736-3.712-1.744-2.112-2.08-3.44-6.192-3.44-8.848 0-4.048 2.528-6.192 4.96-6.192 1.28 0 2.256.784 3.424.784 1.152 0 2.016-.8 3.552-.8 2.096 0 4.352 1.152 5.424 2.848-4.32 1.808-3.632 7.648.744 9.248zm-4.304-15.68c-.016-3.088 2.56-5.6 5.616-5.6.08 3.44-3.168 5.792-5.616 5.6z"/></svg>
                        <span className="text-[10px] font-black uppercase tracking-widest">Apple</span>
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
                         <input 
                          type="email"
                          required
                          placeholder="scout@academy.pro"
                          className="w-full bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-8 py-5 text-sm font-bold outline-none transition-all"
                          value={data.email}
                          onChange={(e) => setData({...data, email: e.target.value})}
                         />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[9px] font-black uppercase tracking-widest text-white/30 ml-4">Secret Access Code</label>
                         <input 
                          type="password"
                          required
                          placeholder="••••••••"
                          className="w-full bg-white/5 border-2 border-white/5 focus:border-[#C6FF00] rounded-full px-8 py-5 text-sm font-bold outline-none transition-all"
                          value={data.password}
                          onChange={(e) => setData({...data, password: e.target.value})}
                         />
                      </div>
                      
                      <button 
                        type="submit"
                        className="w-full bg-white text-black py-6 rounded-full font-black uppercase tracking-widest text-[11px] shadow-2xl hover:bg-[#C6FF00] transition-all mt-6"
                      >
                        Commission Account
                      </button>
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
