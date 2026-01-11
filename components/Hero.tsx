'use client';

import React from 'react';
import { ICONS } from '@/constants';
import { motion } from 'framer-motion';

interface HeroProps {
  onOpenDiscover: () => void;
}

const Hero: React.FC<HeroProps> = ({ onOpenDiscover }) => {
  return (
    <section className="relative min-h-[100svh] w-full flex items-end overflow-hidden bg-black">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.5 }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=2560"
          alt="Sports Action"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      </div>

      {/* Live Activity Ticker (Top Floating) */}
      <div className="absolute top-28 left-0 right-0 z-20 pointer-events-none hidden md:block overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
          {[1,2,3].map(i => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00]"></span> Marcus J. scored 3 goals in 5v5</span>
              <span className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Elena R. climbed to Rank #12 in Basketball</span>
              <span className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00]"></span> 15 games scheduled for this evening</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 pb-24 md:pb-36 pt-40">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
          <div className="lg:col-span-8 text-white space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-3 bg-[#C6FF00] text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(198,255,0,0.3)]">
                <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
                ACTIVE IN YOUR CITY
              </div>
              <h1 className="text-7xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black leading-[0.8] tracking-tighter italic">
                Step Out, <br /> <span className="text-[#C6FF00]">PlayChale.</span>
              </h1>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-3xl text-white/80 max-w-2xl leading-tight font-bold tracking-tight"
            >
              Don't just watch. Compete. Build your profile, find local legends, and take the amateur stage.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center gap-8"
            >
              <button 
                onClick={onOpenDiscover}
                className="w-full sm:w-auto bg-[#C6FF00] text-black px-12 py-6 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 hover:scale-[1.05] hover:shadow-[0_0_40px_rgba(198,255,0,0.4)] transition-all group"
              >
                Discover Games
                <div className="bg-black text-white rounded-full p-1 group-hover:rotate-45 transition-transform">
                  <ICONS.ChevronRight />
                </div>
              </button>
              
              <div className="flex items-center gap-5">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <img key={i} className="w-10 h-10 rounded-full border-4 border-black" src={`https://i.pravatar.cc/100?u=${i+10}`} alt="user" />
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-widest text-white">482 Players Active</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#C6FF00]">Live in your vicinity</p>
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 }}
            className="lg:col-span-4 hidden lg:flex flex-col gap-6"
          >
            <div className="glass rounded-[56px] p-10 border border-white/10 space-y-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-[2s]"><ICONS.Logo /></div>
              
              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C6FF00]">Recruiting Nearby</h4>
                <ICONS.MapPin />
              </div>
              
              <div className="space-y-5">
                {[
                  { sport: 'Football', label: 'Dusk Kickoff', time: '19:00', spots: '3 Open', price: '$5' },
                  { sport: 'Basketball', label: 'Full Court 5s', time: '20:30', spots: '6 Open', price: 'Free' }
                ].map((item, i) => (
                  <div key={i} className="bg-white/5 p-6 rounded-[32px] border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/item">
                    <div className="flex justify-between items-center mb-3">
                       <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{item.sport}</span>
                       <span className="text-[9px] font-black text-[#C6FF00] uppercase tracking-widest bg-[#C6FF00]/10 px-2 py-0.5 rounded">{item.spots}</span>
                    </div>
                    <h5 className="text-xl font-black italic uppercase group-hover/item:text-[#C6FF00] transition-colors">{item.label}</h5>
                    <div className="mt-4 flex items-center justify-between">
                       <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/30 tracking-widest">
                          <ICONS.Clock /> {item.time} Tonight
                       </div>
                       <span className="text-sm font-black italic">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button onClick={onOpenDiscover} className="w-full py-4 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:bg-white/5 transition-all">View Full Marketplace</button>
            </div>
          </motion.div>
        </div>
      </div>
      
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;
