import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ICONS } from '@/constants/icons';

interface HeroProps {
  discoverHref?: string;
}

const Hero: React.FC<HeroProps> = ({ discoverHref = '/discover' }) => {
  return (
    <section id="top" className="relative min-h-[90vh] md:min-h-screen bg-black text-white overflow-hidden rounded-b-[60px] md:rounded-b-[100px] z-10 flex flex-col justify-center">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 p-6 md:p-10 flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <ICONS.Logo />
        </div>
        <Link
          href="/login"
          className="pc-btn-press touch-target block text-[10px] font-black uppercase tracking-[0.2em] hover:text-[#C6FF00] transition-colors"
        >
          Member Sign In
        </Link>
      </nav>

      {/* Background Layer */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full opacity-50 hero-media">
          <Image
            src="https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=2560"
            alt="Sports Action"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
      </div>

      {/* Live Activity Ticker (Top Floating) */}
      <div className="absolute top-24 left-0 right-0 z-20 pointer-events-none hidden md:block overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-12 text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
          {[1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00]"></span> Marcus J. scored 3 goals in 5v5</span>
              <span className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Elena R. climbed to Rank #12 in Basketball</span>
              <span className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00]"></span> 15 games scheduled for this evening</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full px-6 md:px-12 pb-24 md:pb-36 pt-24 md:pt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-8 text-white space-y-12">
            <div className="space-y-6 hero-reveal hero-delay-1">
              <div className="inline-flex items-center gap-3 bg-[#C6FF00] text-black px-4 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(198,255,0,0.3)]">
                <span className="w-2 h-2 rounded-full bg-black animate-ping"></span>
                ACTIVE IN YOUR CITY
              </div>
              <h1 className="text-6xl sm:text-6xl md:text-8xl lg:text-[10rem] font-black leading-[0.85] tracking-tighter italic">
                <span className="whitespace-nowrap">Step Out,</span> <br /> <span className="text-[#C6FF00] whitespace-nowrap">PlayChale.</span>
              </h1>
            </div>

            <p className="text-xl md:text-3xl text-white/80 max-w-2xl leading-tight font-bold tracking-tight hero-reveal hero-delay-2">
              Don&apos;t just watch. Compete. Find games, build your legacy, and own the city.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-8 hero-reveal hero-delay-3">
              <Link
                href={discoverHref}
                className="pc-btn-press touch-target w-full sm:w-auto bg-[#C6FF00] text-black px-8 py-4 md:px-12 md:py-6 rounded-full font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-4 hover:shadow-[0_0_40px_rgba(198,255,0,0.4)] transition-all group"
              >
                Discover Games
                <div className="pc-icon-kick bg-black text-white rounded-full p-1 group-hover:rotate-45 transition-transform">
                  <ICONS.ChevronRight />
                </div>
              </Link>

              <div className="flex items-center gap-5">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map(i => (
                    <Image
                      key={i}
                      className="w-10 h-10 rounded-full border-4 border-black"
                      src={`https://i.pravatar.cc/100?u=${i + 10}`}
                      alt="user"
                      width={40}
                      height={40}
                    />
                  ))}
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-widest text-white">482 Players Active</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#C6FF00]">Live in your vicinity</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 hidden lg:flex flex-col gap-6 hero-side">
            <div className="pc-card-lift glass rounded-[48px] p-8 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-[2s]"><ICONS.Logo /></div>

              <div className="flex justify-between items-center">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[#C6FF00]">Happening Nearby</h4>
                <ICONS.MapPin />
              </div>

              <div className="space-y-4">
                {[
                  { sport: 'Football', label: 'Dusk Kickoff', time: '19:00', spots: '3 Open', price: '$5' },
                  { sport: 'Basketball', label: 'Full Court 5s', time: '20:30', spots: '6 Open', price: 'Free' }
                ].map((item, i) => (
                  <div key={i} className="pc-choice-card bg-white/5 p-5 rounded-[24px] border border-white/5 hover:bg-white/10 transition-all cursor-pointer group/item">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">{item.sport}</span>
                      <span className="text-[9px] font-black text-[#C6FF00] uppercase tracking-widest bg-[#C6FF00]/10 px-2 py-0.5 rounded">{item.spots}</span>
                    </div>
                    <h5 className="text-lg font-black italic uppercase text-white group-hover/item:text-[#C6FF00] transition-colors">{item.label}</h5>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-white/50 tracking-widest">
                        <ICONS.Clock /> {item.time} Tonight
                      </div>
                      <span className="text-sm font-black italic text-white">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>

              <Link href={discoverHref} className="pc-btn-press touch-target block text-center w-full py-3 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white hover:bg-white/5 transition-all">Browse All Games</Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes heroImageIn {
          from { transform: scale(1.08); opacity: 0; }
          to { transform: scale(1); opacity: 0.5; }
        }
        @keyframes heroFadeUp {
          from { transform: translateY(24px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes heroSlideIn {
          from { transform: translateX(20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .hero-media {
          animation: heroImageIn 2s ease-out both;
        }
        .hero-reveal {
          opacity: 0;
          animation: heroFadeUp 700ms ease-out both;
        }
        .hero-side {
          opacity: 0;
          animation: heroSlideIn 700ms ease-out 900ms both;
        }
        .hero-delay-1 { animation-delay: 250ms; }
        .hero-delay-2 { animation-delay: 400ms; }
        .hero-delay-3 { animation-delay: 550ms; }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-media,
          .hero-reveal,
          .hero-side,
          .animate-marquee {
            animation: none;
            opacity: 1;
          }
          .hero-media {
            opacity: 0.5;
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;
