'use client';

import React from 'react';
import Image from 'next/image';
import { Program } from '@/types';
import { ICONS } from '@/constants';
import { motion } from 'framer-motion';

interface ProgramCardProps {
  program: Program;
  onClick?: () => void;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onClick }) => {
  const isPrimary = program.accentColor === '#C6FF00';

  return (
    <motion.div
      whileHover={{ y: -10 }}
      onClick={onClick}
      className={`w-[300px] md:w-[400px] h-[580px] md:h-[680px] rounded-[56px] flex flex-col p-8 md:p-12 transition-all duration-500 cursor-pointer shadow-lg hover:shadow-[0_40px_80px_rgba(0,0,0,0.05)] relative overflow-hidden group`}
      style={{ backgroundColor: isPrimary ? '#C6FF00' : '#F5F5F0' }}
    >
      <div className="absolute top-[-40px] right-[-40px] opacity-[0.03] group-hover:rotate-45 transition-transform duration-[2s] pointer-events-none">
        <ICONS.TennisBall className="w-80 h-80" />
      </div>

      <div className="relative z-10 flex flex-col gap-2 mb-12">
        <div className="flex flex-wrap gap-2">
          <span className="bg-white/95 backdrop-blur-sm px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
            {program.ageRange}
          </span>
          <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${isPrimary ? 'bg-black text-white' : 'bg-white/95'}`}>
            {program.category}
          </span>
        </div>
      </div>

      <div className="relative z-10 mb-8">
        <h3 className="text-5xl md:text-6xl font-black text-black mb-6 leading-[0.85] tracking-tighter">
          {program.title}
        </h3>
        <p className="text-base md:text-lg text-black/50 font-bold leading-tight max-w-[280px]">
          {program.description}
        </p>
      </div>

      <div className="mt-auto relative rounded-[48px] overflow-hidden h-72 md:h-80 shadow-2xl group-hover:scale-[1.02] transition-transform duration-700">
        <Image
          src={program.imageUrl}
          alt={program.title}
          fill
          sizes="(max-width: 768px) 300px, 400px"
          className="object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        <div className="absolute bottom-6 left-6 right-6">
          <button className="w-full bg-white/20 backdrop-blur-2xl border border-white/20 text-white rounded-full py-5 px-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/40 transition-all active:scale-95">
            Full Details
            <div className="bg-[#C6FF00] text-black w-7 h-7 rounded-full flex items-center justify-center">
              <ICONS.ChevronRight />
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProgramCard;
