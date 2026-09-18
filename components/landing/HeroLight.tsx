'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ICONS } from '@/constants';
import { useSession } from '@/features/auth/session';

/** Light, card-styled hero in the look of the core-advantage section */
const HeroLight: React.FC = () => {
  const { user } = useSession();

  return (
    <section className="relative bg-[#FDFDFB] overflow-x-clip px-4 md:px-12 pb-8 md:pb-12">
      {/* Ambient lime glow, no blur filter */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-[radial-gradient(closest-side,rgba(198,255,0,0.18),transparent)] rounded-full pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-20 max-w-7xl mx-auto py-6 md:py-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <ICONS.Logo priority />
          <span className="font-black text-xl tracking-tighter text-black hidden sm:block">PlayChale</span>
        </div>
        {!user ? (
          <Link
            href="/login"
            className="text-[10px] font-black uppercase tracking-[0.2em] text-black/50 hover:text-black transition-colors"
          >
            Member Sign In
          </Link>
        ) : (
          <Link
            href="/home"
            className="bg-black text-[#C6FF00] px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-transform"
          >
            Go to Dashboard
          </Link>
        )}
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto pt-6 md:pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Headline */}
          <div className="lg:col-span-7 space-y-8 md:space-y-10">
            <div className="animate-in fade-in slide-in-from-left-5 [animation-duration:500ms] inline-flex items-center gap-3 bg-black text-[#C6FF00] px-5 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.4em]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00] animate-pulse"></span>
              Active in your city
            </div>

            <h1 className="animate-in fade-in slide-in-from-bottom-10 [animation-duration:600ms] [animation-delay:100ms] fill-mode-both text-5xl sm:text-6xl md:text-7xl lg:text-[5.25rem] xl:text-[6rem] font-black tracking-tighter italic leading-[0.9] uppercase text-black">
              Step Out, <br />
              <span className="text-[#C6FF00] bg-black px-3 md:px-4 mt-2 inline-block transform -rotate-1 shadow-2xl">PlayChale.</span>
            </h1>

            <p className="animate-in fade-in slide-in-from-bottom-5 [animation-duration:600ms] [animation-delay:250ms] fill-mode-both text-lg md:text-2xl text-black/40 font-bold max-w-xl tracking-tight leading-tight">
              Don&apos;t just watch. Compete. Find games, build your legacy, and own the city.
            </p>

            <div className="animate-in fade-in slide-in-from-bottom-5 [animation-duration:600ms] [animation-delay:400ms] fill-mode-both flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
              <Link
                href="/discover"
                className="touch-target bg-black text-white px-8 py-5 md:px-10 md:py-6 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 hover:bg-[#C6FF00] hover:text-black transition-all group shadow-xl"
              >
                Discover Games
                <div className="bg-[#C6FF00] text-black group-hover:bg-black group-hover:text-[#C6FF00] rounded-full p-1 transition-all group-hover:rotate-45">
                  <ICONS.ChevronRight />
                </div>
              </Link>

              <div className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="flex -space-x-3">
                  {[11, 12, 13].map((i) => (
                    <Image
                      key={i}
                      className="w-10 h-10 rounded-full border-4 border-[#FDFDFB] object-cover"
                      src={`https://i.pravatar.cc/100?u=${i}`}
                      alt=""
                      width={40}
                      height={40}
                    />
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-widest text-black">482 Players Active</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-black/30">Live in your vicinity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feature image */}
          <div className="lg:col-span-5 animate-in fade-in zoom-in-95 [animation-duration:700ms] [animation-delay:200ms] fill-mode-both">
            <div className="relative aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/5] rounded-[40px] md:rounded-[56px] overflow-hidden shadow-2xl border-4 border-white group">
              <Image
                src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=1600"
                alt="Players in a floodlit night match"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover transition-transform duration-[2s] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center gap-2 bg-[#C6FF00] text-black px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.3em]">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse"></span>
                  Live tonight
                </span>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-[#C6FF00] mb-1">This week</p>
                <p className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">
                  342 matches <br /> played
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroLight;
