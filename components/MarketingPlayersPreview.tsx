import Image from 'next/image';
import Link from 'next/link';
import type { PlayerProfile } from '@/types';

interface MarketingPlayersPreviewProps {
  players: PlayerProfile[];
}

const ChevronIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export default function MarketingPlayersPreview({ players }: MarketingPlayersPreviewProps) {
  return (
    <section className="pc-render-contain relative overflow-hidden py-20 sm:py-24 md:py-32 bg-black text-white rounded-[40px] sm:rounded-[60px] md:rounded-[120px] mx-2 md:mx-10 mb-20 shadow-2xl">
      <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-[#C6FF00]/10 blur-[80px] sm:blur-[120px] rounded-full -mr-20 sm:-mr-40 -mt-20 sm:-mt-40 pointer-events-none opacity-50" />
      <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-blue-500/5 blur-[60px] sm:blur-[100px] rounded-full -ml-10 sm:-ml-20 -mb-10 sm:-mb-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 px-4 md:px-12">
        <div className="text-center space-y-6 md:space-y-10 mb-12 sm:mb-16 md:mb-24 text-white">
          <div className="inline-flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] text-[#C6FF00]">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-pulse" />
            CITY HALL OF FAME
          </div>

          <h2 className="font-black leading-[0.85] tracking-tighter italic uppercase text-5xl sm:text-7xl md:text-9xl text-white">
            Built for <br className="hidden md:block" /> Glory.
          </h2>

          <p className="font-bold max-w-2xl mx-auto text-sm sm:text-lg md:text-xl leading-tight tracking-tight px-4 text-white/50">
            Find active players nearby, compare form, and build your local sports circle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          {players.map((player, idx) => {
            const previewStat = player.mainSport === 'Football'
              ? { label: 'Goals', value: player.stats.goals || 0 }
              : player.mainSport === 'Basketball'
                ? { label: 'Points', value: player.stats.points || 0 }
                : { label: 'Rating', value: player.stats.rating };

            return (
              <Link
                key={player.id}
                href={`/profile/${player.slug || player.id}`}
                className="touch-scale touch-target group relative overflow-hidden rounded-[32px] sm:rounded-[40px] border transition-all duration-500 cursor-pointer flex flex-col shadow-sm bg-white/5 hover:bg-white/10 text-white border-white/10 hover:shadow-2xl"
              >
                <div className="p-6 sm:p-8 flex flex-col gap-6">
                  <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                      <Image
                        src={player.avatar}
                        alt={player.name}
                        width={128}
                        height={128}
                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-[6px] border-black/5 group-hover:border-[#C6FF00] transition-all duration-500 shadow-2xl"
                      />
                      <div className="absolute -bottom-2 -right-2 bg-[#C6FF00] text-black w-10 h-10 rounded-full flex items-center justify-center font-black text-base shadow-2xl border-4 border-black group-hover:scale-110 transition-transform">
                        #{idx + 1}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap gap-2 items-center mb-4">
                        <span className="bg-[#C6FF00] text-black text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-3 sm:px-4 py-1.5 rounded-full shadow-lg">
                          {player.mainSport}
                        </span>
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-white/40">
                          Verified Legend
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-4xl font-black tracking-tighter leading-[0.9] italic uppercase group-hover:text-[#C6FF00] transition-colors break-words line-clamp-2">
                        {player.name}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-0 border-y border-white/10 py-5 transition-colors">
                    <div className="text-center px-1">
                      <p className="text-lg sm:text-2xl md:text-3xl font-black italic tracking-tighter mb-1 text-white">
                        {player.stats.winRate}
                      </p>
                      <p className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/40 truncate">Win Rate</p>
                    </div>
                    <div className="text-center border-x border-white/10 px-1 sm:px-4">
                      <p className="text-lg sm:text-2xl md:text-3xl font-black italic text-[#C6FF00] group-hover:scale-110 transition-transform">
                        {previewStat.value}
                      </p>
                      <p className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/40 truncate">{previewStat.label}</p>
                    </div>
                    <div className="text-center px-1">
                      <p className="text-lg sm:text-2xl md:text-3xl font-black italic tracking-tighter mb-1 text-white">
                        {player.stats.mvps}
                      </p>
                      <p className="text-[7px] sm:text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-white/40 truncate">MVPs</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-auto">
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] mb-1 sm:mb-2 text-white/40">PLAYER BIO</p>
                      <p className="text-[10px] sm:text-xs md:text-sm font-bold italic leading-tight line-clamp-2 opacity-80 text-white">
                        {player.bio}
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 rounded-2xl transition-all group-hover:translate-x-1 shrink-0 bg-[#C6FF00] text-black">
                      <ChevronIcon />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 sm:mt-24 md:mt-32 text-center">
          <Link href="/community" className="touch-scale-sm touch-target bg-white text-black px-8 sm:px-12 md:px-20 py-6 md:py-8 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] hover:bg-[#C6FF00] hover:text-black transition-all shadow-2xl inline-flex items-center gap-3 sm:gap-5 mx-auto">
            View Full City Rankings
            <span className="bg-black text-[#C6FF00] p-2 rounded-full"><ChevronIcon /></span>
          </Link>
        </div>
      </div>
    </section>
  );
}
