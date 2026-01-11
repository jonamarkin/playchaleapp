'use client';

import React, { useRef } from 'react';
import { PROGRAMS, ICONS } from '@/constants';
import ProgramCard from '@/components/ProgramCard';
import { motion } from 'framer-motion';

interface ProgramsProps {
  onOpenDetails: () => void;
}

const Programs: React.FC<ProgramsProps> = ({ onOpenDetails }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 400;
      current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-20 md:py-40 px-6 md:px-12 bg-[#FDFDFB] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-24 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-black/30">
              <span className="w-2 h-2 rounded-full bg-[#C6FF00]"></span>
              TRAINING PROGRAMS
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-[#111111] leading-[0.9] tracking-tighter">
              Master the Court. <br className="hidden md:block" /> Every Step.
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex gap-4"
          >
            <button 
              onClick={() => scroll('left')}
              className="w-16 h-16 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-white hover:border-[#C6FF00] transition-all shadow-sm active:scale-90"
            >
              <div className="rotate-180">
                <ICONS.ChevronRight />
              </div>
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#C6FF00] hover:text-black transition-all shadow-xl active:scale-90"
            >
              <ICONS.ChevronRight />
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 hide-scrollbar pb-16 -mx-6 px-6 snap-x snap-mandatory"
        >
          {PROGRAMS.map((program, idx) => (
            <div key={program.id} className="snap-center shrink-0">
               <ProgramCard program={program} onClick={onOpenDetails} />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Programs;
