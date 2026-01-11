'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const IconUsers = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
const IconCalendar = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const IconTrendingUp = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
const IconStar = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2"/></svg>
);
const IconClock = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconUserPlus = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="16" y1="11" x2="22" y2="11"/></svg>
);

export function Features() {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const features = [
    {
      icon: <IconUsers />,
      title: "Connect with players",
      subtitle: "Find athletes in your local area",
      stat: "12.5K",
      label: "Active Players"
    },
    {
      icon: <IconCalendar />,
      title: "Create & join games",
      subtitle: "Instant match organization",
      stat: "342",
      label: "Live Games"
    },
    {
      icon: <IconTrendingUp />,
      title: "Track performance",
      subtitle: "Data-driven growth analytics",
      stat: "2.8K",
      label: "Matches Today"
    },
    {
      icon: <IconStar />,
      title: "Build your legacy",
      subtitle: "Showcase skills & badges",
      stat: "45",
      label: "Avg Games/Mo"
    },
    {
      icon: <IconClock />,
      title: "Real-time updates",
      subtitle: "Never miss a local kickoff",
      stat: "24/7",
      label: "Live Support"
    },
    {
      icon: <IconUserPlus />,
      title: "Join communities",
      subtitle: "Niche sport circles & squads",
      stat: "156",
      label: "Tribes"
    }
  ];

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let scrollInterval: any;
    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (scrollContainer) {
          const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
          const currentScroll = scrollContainer.scrollLeft;
          if (currentScroll >= maxScroll - 10) {
            scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            scrollContainer.scrollBy({ left: 320, behavior: 'smooth' });
          }
        }
      }, 4000);
    };

    if (window.innerWidth < 1024) {
      startAutoScroll();
    }
    return () => { if (scrollInterval) clearInterval(scrollInterval); };
  }, []);

  return (
    <section className="relative py-24 md:py-40 bg-[#FDFDFB] overflow-hidden">
      {/* Background Watermark Text */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full select-none pointer-events-none overflow-hidden opacity-[0.03]">
        <h2 className="text-[20rem] md:text-[35rem] font-black italic tracking-tighter leading-none text-black whitespace-nowrap">
          DOMINATE DOMINATE DOMINATE
        </h2>
      </div>

      <div className="relative z-10 px-4 md:px-12 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-16 md:mb-28 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6 max-w-3xl"
          >
            <div className="inline-flex items-center gap-3 bg-black text-[#C6FF00] px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00] animate-pulse"></span>
              CORE ADVANTAGE
            </div>
            <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic leading-[0.85] uppercase text-black">
              Everything <br/> you need to <span className="text-[#C6FF00] bg-black px-4 inline-block transform -rotate-1">Win.</span>
            </h2>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-black/40 font-bold max-w-md tracking-tight leading-tight lg:text-right"
          >
            Stop settling for casual. PlayChale gives you the pro tools to organize, compete, and climb the local ranks.
          </motion.p>
        </div>

        {/* Features Scroll Area */}
        <div 
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-3 gap-6 md:gap-10 overflow-x-auto lg:overflow-visible pb-12 lg:pb-0 hide-scrollbar snap-x snap-mandatory lg:snap-none"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ y: 40, opacity: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -15 }}
              onHoverStart={() => setHoveredFeature(index)}
              onHoverEnd={() => setHoveredFeature(null)}
              className="min-w-[300px] lg:min-w-0 bg-white hover:bg-black border border-black/5 hover:border-white/10 rounded-[48px] p-10 flex flex-col transition-all duration-500 snap-center relative group"
            >
              {/* Highlight bar on hover */}
              <motion.div 
                className="absolute top-0 left-10 right-10 h-1 bg-[#C6FF00] rounded-b-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
              />

              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-10 group-hover:bg-[#C6FF00] transition-colors duration-500">
                <div className="text-black transition-transform duration-500 group-hover:scale-110">
                  {feature.icon}
                </div>
              </div>

              <div className="space-y-3 mb-12">
                <h3 className="font-black text-2xl md:text-3xl leading-none tracking-tighter italic uppercase text-black group-hover:text-[#C6FF00] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm font-bold tracking-tight text-black/30 group-hover:text-white/40 transition-colors">
                  {feature.subtitle}
                </p>
              </div>

              <div className="mt-auto pt-8 border-t border-black/5 group-hover:border-white/10 flex items-end justify-between transition-colors">
                <div>
                  <div className="text-4xl md:text-5xl font-black italic tracking-tighter text-black group-hover:text-white leading-none mb-1 transition-colors">
                    {feature.stat}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-black/20 group-hover:text-white/20 transition-colors">
                    {feature.label}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-full border border-black/5 flex items-center justify-center text-black/10 group-hover:text-[#C6FF00] group-hover:border-[#C6FF00] transition-all group-hover:rotate-45">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Call to Action */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 md:mt-32 text-center"
        >
          <div className="inline-block p-1 bg-gray-100 rounded-full">
            <div className="flex items-center gap-2 px-6 py-3">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <img key={i} className="w-8 h-8 rounded-full border-2 border-white" src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                ))}
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-black/60">
                Join <span className="text-black">5,000+</span> athletes in your area
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
