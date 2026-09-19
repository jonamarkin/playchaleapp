'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { ICONS } from '@/constants';
import GameCard from '@/components/GameCard';
import { m, AnimatePresence } from 'framer-motion';
import { Game } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DiscoverProps {
  games: Game[];
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
                ${isSelected ? 'bg-lime-500 text-black border-lime-500 scale-105 shadow-lg shadow-lime-500/30' :
                  isToday ? 'bg-white/10 border-lime-500/50' :
                    gameCount > 0 ? 'bg-white/5 border-white/10 hover:border-lime-500/50 hover:bg-white/10' :
                      'bg-white/5 border-white/5 hover:border-white/20'}`}
            >
              <span className={`text-sm md:text-lg font-black ${isToday && !isSelected ? 'text-lime-500' : ''}`}>{d}</span>
              {gameCount > 0 && !isSelected && (
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(gameCount, 3) }).map((_, i) => (
                    <div key={i} className={`w-1.5 h-1.5 rounded-full bg-lime-500 ${isToday ? 'animate-pulse' : ''}`}></div>
                  ))}
                  {gameCount > 3 && (
                    <span className="text-[8px] font-black text-lime-500 ml-0.5">+{gameCount - 3}</span>
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
              className="inline-flex items-center gap-3 bg-lime-500 text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
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

import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/session';

// ... existing code ...

const DiscoverGames: React.FC<DiscoverProps> = ({ games, isFullPage = false }) => {
  const router = useRouter();
  const { user } = useSession();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [skillFilter, setSkillFilter] = useState('All Levels');
  const [displayMode, setDisplayMode] = useState<'grid' | 'calendar'>('grid');
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const sports = ['All', 'Football', 'Basketball', 'Tennis', 'Padel'];

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
    <section className={`px-4 md:px-12 ${isFullPage ? 'pt-28 md:pt-36 pb-32 min-h-screen bg-white relative' : 'pt-12 md:pt-16 pb-24 md:pb-32 bg-transparent'}`}>
      {isFullPage && (
        <div className="absolute top-8 right-8 z-50">
          {user ? (
            <button
              onClick={() => router.push('/home')}
              className="touch-scale-sm touch-target bg-black text-lime-500 px-6 py-3 rounded-full font-black uppercase tracking-widest text-[10px] transition-all shadow-lg"
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
              <div className="animate-in fade-in slide-in-from-left-5 [animation-duration:400ms] inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.5em] text-black/50">
                <span className="w-2 h-2 rounded-full bg-lime-500 shadow-[0_0_10px_hsl(var(--lime-500))]"></span>
                GAME ARENA
              </div>
              <h2 className="font-black text-black leading-[0.85] md:leading-[0.8] tracking-tighter italic text-5xl sm:text-7xl md:text-[9rem]">
                Find Your <br className="hidden md:block" /> Perfect Match.
              </h2>

              <div className="flex flex-col gap-5 pt-2 md:pt-6">
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
                            className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-gray-100 focus:bg-lime-500 focus:text-black"
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
                    {(['All', 'Free', 'Paid'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setPriceFilter(p)}
                        className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${priceFilter === p ? 'bg-lime-500 text-black' : 'bg-gray-100 text-black/70 hover:bg-gray-200'}`}
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
                <span className="w-1.5 h-1.5 rounded-full bg-lime-500"></span>
                LIVE GAMES
              </div>
              <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Games Near You</h2>
            </div>
            <button onClick={() => router.push('/discover')} className="touch-scale-sm touch-target bg-black text-lime-500 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all w-full md:w-auto">Explore Full Feed</button>
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
                <span className="bg-black text-lime-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{filteredGames.length} Found</span>
              </div>
              <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 hide-scrollbar">
                <AnimatePresence mode="popLayout">
                  {filteredGames.map((game) => (
                    <GameCard key={game.id} game={game} variant="row" />
                  ))}
                </AnimatePresence>
                {filteredGames.length === 0 && (
                  <div className="py-16 text-center opacity-20 font-black italic uppercase text-xl">No matches found</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <m.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            <AnimatePresence mode="popLayout">
              {filteredGames.map((game, index) => (
                <GameCard key={game.id} game={game} priority={isFullPage && index < 2} />
              ))}
            </AnimatePresence>
          </m.div>
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
