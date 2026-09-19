'use client';

import { ICONS } from '@/constants';

export default function BackToTopButton() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
    >
      Back to Top
      <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-black transition-all">
        <div className="-rotate-90 scale-75"><ICONS.ChevronRight /></div>
      </div>
    </button>
  );
}
