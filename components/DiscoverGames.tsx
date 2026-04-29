'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ICONS } from '@/constants/icons';
import GameCard from '@/components/GameCard';
import { Game } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DiscoverProps {
  games: Game[];
  onOpenGame: (game: Game) => void;
  isFullPage?: boolean;
}

const CalendarView = ({ games, onSelectDate, selectedDate }: { games: Game[], onSelectDate: (d: string) => void, selectedDate: string | null }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const monthShort = monthName.substring(0, 3);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Helper to check if a game date matches a specific day in the current month
  const gameMatchesDay = (gameDate: string, day: number): boolean => {
    // Handle "Today" special case
    if (gameDate === 'Today') {
      const today = new Date();
      return day === today.getDate() &&
        currentMonth.getMonth() === today.getMonth() &&
        currentMonth.getFullYear() === today.getFullYear();
    }
    // Handle format like "Tue, Jan 14"
    const hasMonth = gameDate.includes(monthShort);
    // Match the day number at end of string (after space) to avoid matching "14" in "2014"
    const dayMatch = gameDate.match(/\s(\d{1,2})$/);
    const hasDay = dayMatch ? parseInt(dayMatch[1]) === day : false;
    return hasMonth && hasDay;
  };

  // Calculate games in current month
  const gamesThisMonth = games.filter(g => {
    if (g.date === 'Today') {
      const today = new Date();
      return currentMonth.getMonth() === today.getMonth() && currentMonth.getFullYear() === today.getFullYear();
    }
    return g.date.includes(monthShort);
  }).length;

  // Find next month with games (check up to 12 months ahead)
  const findNextMonthWithGames = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 1; i <= 12; i++) {
      const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + i, 1);
      const checkMonthShort = months[checkDate.getMonth()];
      const gamesInMonth = games.filter(g => g.date.includes(checkMonthShort)).length;
      if (gamesInMonth > 0) {
        return { date: checkDate, monthName: checkDate.toLocaleString('default', { month: 'long' }), count: gamesInMonth };
      }
    }
    return null;
  };

  const nextMonthWithGames = gamesThisMonth === 0 ? findNextMonthWithGames() : null;

  return (
    <div className="bg-black text-white p-6 md:p-10 rounded-[48px] shadow-2xl">
      <div className="flex justify-between items-center mb-10">
        <h3 className="text-3xl font-black italic tracking-tighter uppercase">{monthName} {currentMonth.getFullYear()}</h3>
        <div className="flex gap-3">
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/10"><ICONS.ChevronRight className="rotate-180" /></button>
          <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/10"><ICONS.ChevronRight /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-white/30 py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {blanks.map(b => <div key={`b-${b}`} className="aspect-square"></div>)}
        {days.map(d => {
          const gameCount = games.filter(g => gameMatchesDay(g.date, d)).length;
          const isSelected = selectedDate === d.toString();
          const isToday = d === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

          return (
            <button
              key={d}
              onClick={() => onSelectDate(isSelected ? "" : d.toString())}
              className={`aspect-square rounded-2xl md:rounded-[28px] flex flex-col items-center justify-center gap-1 transition-all relative border 
                ${isSelected ? 'bg-[#C6FF00] text-black border-[#C6FF00] scale-105 shadow-lg shadow-[#C6FF00]/30' :
                  isToday ? 'bg-white/10 border-[#C6FF00]/50' :
                    gameCount > 0 ? 'bg-white/5 border-white/10 hover:border-[#C6FF00]/50 hover:bg-white/10' :
                      'bg-white/5 border-white/5 hover:border-white/20'}`}
            >
              <span className={`text-sm md:text-lg font-black ${isToday && !isSelected ? 'text-[#C6FF00]' : ''}`}>{d}</span>
              {gameCount > 0 && !isSelected && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(gameCount, 3) }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full bg-[#C6FF00] ${isToday ? 'animate-pulse' : ''}`}></div>
                  ))}
                  {gameCount > 3 && (
                    <span className="text-[8px] font-black text-[#C6FF00] ml-0.5">+{gameCount - 3}</span>
                  )}
                </div>
              )}
              {isSelected && gameCount > 0 && (
                <span className="text-[9px] font-black uppercase">{gameCount} Game{gameCount > 1 ? 's' : ''}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* No games this month - show next available */}
      {gamesThisMonth === 0 && (
        <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-[32px] text-center">
          <p className="text-white/40 text-sm font-bold mb-4">No games scheduled in {monthName}</p>
          {nextMonthWithGames ? (
            <button
              onClick={() => setCurrentMonth(nextMonthWithGames.date)}
              className="inline-flex items-center gap-3 bg-[#C6FF00] text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
            >
              <span>⚡</span>
              Jump to {nextMonthWithGames.monthName} ({nextMonthWithGames.count} games)
              <ICONS.ChevronRight />
            </button>
          ) : (
            <p className="text-white/20 text-xs font-bold uppercase tracking-widest">No upcoming games found</p>
          )}
        </div>
      )}
    </div>
  );
};

const MobileGameRow = ({ game, onClick }: { game: Game; onClick: () => void }) => {
  const openSpots = Math.max(0, game.spotsTotal - game.spotsTaken);
  const isFull = openSpots === 0;

  return (
    <button
      type="button"
      onClick={onClick}
      className="pc-card-lift touch-target group w-full rounded-[30px] border border-black/5 bg-white p-3 text-left shadow-sm"
    >
      <div className="flex gap-4">
        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[24px] bg-black">
          <Image
            src={game.imageUrl}
            alt={game.title}
            fill
            sizes="112px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className={`absolute bottom-2 left-2 rounded-full px-2.5 py-1 text-[8px] font-black uppercase tracking-widest ${isFull ? 'bg-red-500 text-white' : 'bg-[#C6FF00] text-black'}`}>
            {isFull ? 'Full' : `${openSpots} open`}
          </span>
        </div>

        <div className="flex min-w-0 flex-1 flex-col py-1">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="rounded-full bg-black/5 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-black/45">
              {game.sport}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-black">
              {game.price}
            </span>
          </div>

          <h3 className="line-clamp-2 text-lg font-black italic uppercase leading-[0.95] tracking-tighter text-black">
            {game.title}
          </h3>

          <div className="mt-auto space-y-1.5 pt-3 text-[9px] font-black uppercase tracking-widest text-black/40">
            <div className="flex items-center gap-2">
              <ICONS.Clock />
              <span className="truncate">{game.date} · {game.time}</span>
            </div>
            <div className="flex items-center gap-2">
              <ICONS.MapPin />
              <span className="truncate">{game.location}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

import { useRouter } from 'next/navigation';
import { usePlayChale } from '@/providers/PlayChaleProvider';

// ... existing code ...

const DiscoverGames: React.FC<DiscoverProps> = ({ games, onOpenGame, isFullPage = false }) => {
  const router = useRouter();
  const { user } = usePlayChale();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [skillFilter, setSkillFilter] = useState('All Levels');
  const [displayMode, setDisplayMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Padel'];
  const priceOptions = ['All', 'Free', 'Paid'] as const;
  const activeFilterCount = [filter !== 'All', priceFilter !== 'All', skillFilter !== 'All Levels', !!search, !!selectedDay].filter(Boolean).length;

  const filteredGames = useMemo(() => {
    return games.filter(g => {
      const matchesSport = filter === 'All' || g.sport === filter;
      const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) ||
        g.location.toLowerCase().includes(search.toLowerCase());
      const matchesPrice = priceFilter === 'All' ||
        (priceFilter === 'Free' && g.price.toLowerCase() === 'free') ||
        (priceFilter === 'Paid' && g.price.toLowerCase() !== 'free');
      const matchesSkill = skillFilter === 'All Levels' || g.skillLevel === skillFilter;
      const matchesDay = !selectedDay || g.date.includes(selectedDay);

      return matchesSport && matchesSearch && matchesPrice && matchesSkill && matchesDay;
    });
  }, [games, filter, search, priceFilter, skillFilter, selectedDay]);

  return (
    <section className={`px-4 md:px-12 ${isFullPage ? 'pt-6 md:pt-36 pb-32 min-h-screen bg-white relative' : 'py-20 md:py-32 bg-transparent'}`}>
      {isFullPage && (
        <div className="absolute top-8 right-8 z-50 hidden md:block">
          {user ? (
            <button
              onClick={() => router.push('/home')}
              className="touch-scale-sm touch-target bg-black text-[#C6FF00] px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
            >
              Go to Dashboard
            </button>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-black text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-gray-900 transition-all shadow-lg"
            >
              Member Sign In
            </button>
          )}
        </div>
      )}
      <div className="max-w-7xl mx-auto">
        {isFullPage ? (
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-10 md:mb-16 gap-8">
            <div className="space-y-6 md:space-y-8 max-w-full lg:max-w-4xl w-full">
              <div className="pc-fade-left inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-black/50">
                <span className="w-2 h-2 rounded-full bg-[#C6FF00] shadow-[0_0_10px_#C6FF00]"></span>
                GAME ARENA
              </div>
              <h2 className="font-black text-black leading-[0.85] md:leading-[0.8] tracking-tighter italic text-4xl sm:text-7xl md:text-[9rem]">
                Find Your <br className="hidden md:block" /> Perfect Match.
              </h2>

              <div className="sticky top-3 z-40 md:hidden rounded-[32px] border border-black/5 bg-black p-3 text-white shadow-xl">
                <div className="relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/35">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search games nearby"
                    className="w-full rounded-full border border-white/10 bg-white/10 py-4 pl-12 pr-5 text-sm font-black text-white outline-none transition-all placeholder:text-white/25 focus:border-[#C6FF00]"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
                  {sports.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => setFilter(sport)}
                      className={`pc-btn-press shrink-0 rounded-full px-4 py-2.5 text-[9px] font-black uppercase tracking-widest ${filter === sport ? 'bg-[#C6FF00] text-black' : 'bg-white/10 text-white/55'}`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
                  <div className="flex rounded-full bg-white/10 p-1">
                    {priceOptions.map((price) => (
                      <button
                        key={price}
                        onClick={() => setPriceFilter(price)}
                        className={`flex-1 rounded-full py-2 text-[9px] font-black uppercase tracking-widest ${priceFilter === price ? 'bg-white text-black' : 'text-white/45'}`}
                      >
                        {price}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setDisplayMode(displayMode === 'grid' ? 'calendar' : 'grid');
                      if (displayMode === 'calendar') setSelectedDay(null);
                    }}
                    className="pc-btn-press rounded-full bg-[#C6FF00] px-4 py-2 text-[9px] font-black uppercase tracking-widest text-black"
                  >
                    {displayMode === 'grid' ? 'Calendar' : 'List'}
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between px-2 text-[9px] font-black uppercase tracking-widest text-white/35">
                  <span>{filteredGames.length} games found</span>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={() => {
                        setFilter('All');
                        setSearch('');
                        setPriceFilter('All');
                        setSkillFilter('All Levels');
                        setSelectedDay(null);
                      }}
                      className="text-[#C6FF00]"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden md:flex flex-col gap-5 pt-2 md:pt-6">
                <div className="flex flex-col md:flex-row gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-black/30">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search by city, pitch or title..."
                      className="w-full bg-gray-50 rounded-full pl-14 pr-6 py-4 md:py-5 border-2 border-black/5 focus:border-black outline-none font-bold text-black text-sm md:text-base transition-all"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="flex bg-gray-100 p-1.5 rounded-full">
                    <button
                      onClick={() => {
                        setDisplayMode('grid');
                        setSelectedDay(null);
                      }}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${displayMode === 'grid' ? 'bg-black text-white shadow-md' : 'text-black/40 hover:text-black/60'}`}
                    >
                      Grid
                    </button>
                    <button
                      onClick={() => setDisplayMode('calendar')}
                      className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${displayMode === 'calendar' ? 'bg-black text-white shadow-md' : 'text-black/40 hover:text-black/60'}`}
                    >
                      Calendar
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 border-t border-black/5 pt-5 md:pt-6">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/30">Sport:</span>
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-[140px] bg-white border-2 border-black/10 rounded-full px-4 py-2 h-auto text-[10px] font-black uppercase tracking-widest focus:ring-0 focus:border-black">
                        <SelectValue placeholder="All Sports" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-2 border-black/10 rounded-2xl shadow-xl z-[300]">
                        {sports.map(s => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-100 focus:bg-[#C6FF00] focus:text-black"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-px h-6 bg-black/10 hidden sm:block"></div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-black/30 mr-1">Price:</span>
                    {priceOptions.map(p => (
                      <button
                        key={p}
                        onClick={() => setPriceFilter(p)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${priceFilter === p ? 'bg-[#C6FF00] text-black' : 'bg-gray-100 text-black/70 hover:bg-gray-200'}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 px-4 gap-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-black/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF00]"></span>
                LIVE GAMES
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Games Near You</h2>
            </div>
            <button onClick={() => router.push('/discover')} className="touch-scale-sm touch-target bg-black text-[#C6FF00] px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all w-full md:w-auto">Explore Full Feed</button>
          </div>
        )}

        {displayMode === 'calendar' && isFullPage ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            <div className="lg:col-span-7">
              <CalendarView games={games} onSelectDate={setSelectedDay} selectedDate={selectedDay} />
            </div>
            <div className="lg:col-span-5 space-y-5">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-lg font-black italic uppercase tracking-tighter">
                  {selectedDay ? `Games on Oct ${selectedDay}` : 'Available Games'}
                </h4>
                <span className="bg-black text-[#C6FF00] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{filteredGames.length} Found</span>
              </div>
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 hide-scrollbar">
                {filteredGames.map((game) => (
                    <div
                      key={game.id}
                      className="pc-view-enter touch-target bg-gray-50 rounded-[28px] p-5 flex gap-5 items-center border border-black/5 hover:border-black transition-all cursor-pointer group"
                      onClick={() => onOpenGame(game)}
                    >
                      <Image src={game.imageUrl} alt={game.title} width={80} height={80} className="w-20 h-20 rounded-[20px] object-cover" />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <span className="text-[9px] font-black uppercase text-black/40 tracking-wider">{game.sport}</span>
                          <span className="text-[9px] font-black uppercase text-black tracking-wider">{game.price}</span>
                        </div>
                        <h5 className="text-base font-black tracking-tight">{game.title}</h5>
                        <div className="flex items-center gap-3 mt-1 text-[11px] font-bold text-black/40">
                          <div className="flex items-center gap-1"><ICONS.Clock /> {game.time}</div>
                          <div className="flex items-center gap-1"><ICONS.MapPin /> {game.location.split(' ').slice(0, 2).join(' ')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                {filteredGames.length === 0 && (
                  <div className="py-16 text-center opacity-20 font-black italic uppercase text-xl">No matches found</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {filteredGames.map((game) => (
                <MobileGameRow key={game.id} game={game} onClick={() => onOpenGame(game)} />
              ))}
            </div>
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} onClick={() => onOpenGame(game)} />
              ))}
            </div>
          </>
        )}

        {filteredGames.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
            <p className="opacity-20 font-black italic uppercase text-xl">No games found</p>
            {isFullPage && <p className="text-black/30 text-sm font-medium">Try adjusting your search or filters to see more results.</p>}
          </div>
        )}
      </div>
    </section >
  );
};

export default DiscoverGames;
