import React from 'react';
import { ICONS } from '@/constants/icons';
import ProgramCard from '@/components/ProgramCard';
import type { Program } from '@/types';

interface ProgramsProps {
  programs: Program[];
  detailsHref?: string;
}

const Programs: React.FC<ProgramsProps> = ({ programs, detailsHref = '/discover' }) => {
  const firstProgramId = programs[0]?.id ?? 'programs';
  const lastProgramId = programs[programs.length - 1]?.id ?? 'programs';

  return (
    <section id="programs" className="pc-content-visibility py-20 md:py-40 px-6 md:px-12 bg-[#FDFDFB] overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-24 gap-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.4em] text-black/30">
              <span className="w-2 h-2 rounded-full bg-[#C6FF00]"></span>
              TRAINING PROGRAMS
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-[#111111] leading-[0.9] tracking-tighter">
              Master the Court. <br className="hidden md:block" /> Every Step.
            </h2>
          </div>
          
          <div className="flex gap-4">
            <a
              href={`#program-${firstProgramId}`}
              className="w-16 h-16 rounded-full border-2 border-gray-100 flex items-center justify-center hover:bg-white hover:border-[#C6FF00] transition-all shadow-sm active:scale-90"
            >
              <div className="rotate-180">
                <ICONS.ChevronRight />
              </div>
            </a>
            <a
              href={`#program-${lastProgramId}`}
              className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center hover:bg-[#C6FF00] hover:text-black transition-all shadow-xl active:scale-90"
            >
              <ICONS.ChevronRight />
            </a>
          </div>
        </div>

        <div
          className="flex overflow-x-auto gap-8 hide-scrollbar pb-16 -mx-6 px-6 snap-x snap-mandatory"
        >
          {programs.map((program) => (
            <div key={program.id} id={`program-${program.id}`} className="snap-center shrink-0 scroll-mt-32">
               <ProgramCard program={program} href={detailsHref} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;
