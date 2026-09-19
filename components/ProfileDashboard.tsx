'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Share2 } from 'lucide-react';
import type { CareerStats, MatchRecord, Player } from '@/types';
import ImageUpload from './ImageUpload';
import SportIcon from './SportIcon';
import { Button } from '@/components/ui/button';
import { Eyebrow, Text } from '@/components/ui/typography';
import { useAvatarUploader, usePlayerMatches } from '@/features/players/hooks';
import { useSports } from '@/features/sports/hooks';
import { formatGameDate, reliability, winRate } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * The player profile — the page people share, and the reason the stats have to be trustworthy.
 *
 * Everything under "Performance" is derived server-side from results each player approved;
 * nothing on this page can be typed in by its owner. Self-rated attributes are shown, but
 * kept visually apart from the record so the two are never read as the same kind of claim.
 */
interface DashboardProps {
  player: Player;
  isOwner?: boolean;
  /** Shown on the owner's own profile: below lg this is the only way out, since the header drawer is desktop-only. */
  onSignOut?: () => void;
  onShareProfile: () => void;
}

const ATTRIBUTE_LABELS: Record<string, string> = {
  pace: 'Pace',
  shooting: 'Shooting',
  passing: 'Passing',
  dribbling: 'Dribbling',
  defending: 'Defending',
  physical: 'Physical',
};

const ProfileDashboard: React.FC<DashboardProps> = ({ player, isOwner = false, onShareProfile, onSignOut }) => {
  const uploadAvatar = useAvatarUploader();
  const { data: sports = [] } = useSports();
  const { data: matches = [] } = usePlayerMatches(player.handle);

  // Sports the player has a record in, main sport first
  const recorded = React.useMemo(() => {
    const ordered = [...player.careerStats];
    ordered.sort((a, b) => (a.sport === player.mainSport ? -1 : b.sport === player.mainSport ? 1 : b.gamesPlayed - a.gamesPlayed));
    return ordered;
  }, [player.careerStats, player.mainSport]);

  const [activeSport, setActiveSport] = React.useState(recorded[0]?.sport ?? player.mainSport);
  const stats = recorded.find((s) => s.sport === activeSport) ?? null;
  const sport = sports.find((s) => s.code === activeSport);
  const sportLabel = sport?.name ?? activeSport;

  const attributes = Object.entries(player.attributes ?? {}).filter(([, value]) => typeof value === 'number');
  const sportMatches = matches.filter((m) => m.game.sport === activeSport);

  return (
    <section className="relative min-h-screen overflow-hidden bg-ink-950 px-4 pb-20 pt-24 text-white md:px-12 md:pb-32 md:pt-32">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-1/2 w-full -translate-x-1/2 bg-gradient-to-t from-lime-500/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="flex flex-col items-start gap-8 lg:flex-row md:gap-16">

          <div className="animate-in fade-in slide-in-from-bottom-5 w-full shrink-0 [animation-duration:400ms] lg:w-[380px]">
            <div className="relative space-y-10 overflow-hidden rounded-card-xl border border-white/10 bg-white/5 p-8 shadow-e3 backdrop-blur-3xl md:p-10">
              <div className="flex flex-col items-center space-y-6 text-center">
                {isOwner ? (
                  <ImageUpload currentImage={player.avatarUrl} onImageSelected={async (file) => { await uploadAvatar(file); }} />
                ) : (
                  <Image
                    src={player.avatarUrl}
                    alt=""
                    width={160}
                    height={160}
                    priority
                    className="h-40 w-40 rounded-pill border-[6px] border-white/5 object-cover shadow-e3"
                  />
                )}
                <div className="space-y-2">
                  <h1 className="text-4xl font-black italic uppercase leading-none tracking-tighter">{player.name}</h1>
                  <p className="text-body-sm font-bold text-white/40">@{player.handle}</p>
                  <div className="flex items-center justify-center gap-2 text-brand">
                    <SportIcon sport={player.mainSport} size={14} />
                    <Eyebrow className="text-lime-500">
                      {sports.find((s) => s.code === player.mainSport)?.name ?? player.mainSport}
                      {player.locationText ? ` · ${player.locationText}` : ''}
                    </Eyebrow>
                  </div>
                </div>
                {player.bio && <Text size="sm" className="text-white/60">{player.bio}</Text>}
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                <Button size="lg" full onClick={onShareProfile}>
                  <Share2 className="h-4 w-4" aria-hidden="true" />
                  Share profile
                </Button>
                {isOwner && onSignOut && (
                  <Button variant="ghost" full onClick={onSignOut} className="text-red-400 hover:bg-white/5 hover:text-red-300">
                    Log out
                  </Button>
                )}
              </div>

              {attributes.length > 0 && (
                <div className="space-y-4 border-t border-white/10 pt-8">
                  <div>
                    <Eyebrow>Playing style</Eyebrow>
                    <Text size="sm" tone="subtle" className="text-white/30">Self-rated — not part of the record below.</Text>
                  </div>
                  <ul className="space-y-3">
                    {attributes.map(([key, value]) => (
                      <li key={key} className="space-y-1.5">
                        <div className="flex justify-between">
                          <Eyebrow>{ATTRIBUTE_LABELS[key] ?? key}</Eyebrow>
                          <span className="text-eyebrow font-black text-white/60">{value}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-pill bg-white/10">
                          <div className="h-full rounded-pill bg-white/40" style={{ width: `${Math.min(100, Number(value))}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="w-full flex-1">
            <div className="animate-in fade-in slide-in-from-right-5 space-y-16 [animation-duration:400ms]">
              <div className="space-y-10">
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <h2 className="text-4xl font-black italic uppercase leading-none tracking-tighter sm:text-6xl md:text-8xl">Record.</h2>

                  {recorded.length > 1 && (
                    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sport">
                      {recorded.map((entry) => (
                        <button
                          key={entry.sport}
                          role="tab"
                          aria-selected={entry.sport === activeSport}
                          onClick={() => setActiveSport(entry.sport)}
                          className={cn(
                            'rounded-pill px-5 py-2.5 text-eyebrow font-black uppercase tracking-widest transition-colors',
                            entry.sport === activeSport ? 'bg-lime-500 text-ink-900' : 'bg-white/5 text-white/50 hover:bg-white/10'
                          )}
                        >
                          {sports.find((s) => s.code === entry.sport)?.name ?? entry.sport}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {stats ? (
                  <>
                    <Provenance stats={stats} />
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6">
                      <Metric label="Matches" value={stats.gamesPlayed} />
                      <Metric label="Win rate" value={winRate(stats) ?? '—'} accent />
                      <Metric label="Reliability" value={reliability(stats) ?? '—'} />
                      <Metric label="MVPs" value={stats.mvps} />
                    </div>
                  </>
                ) : (
                  <div className="rounded-card-xl border border-white/10 bg-white/5 p-10 text-center">
                    <Text weight="bold">No verified stats yet.</Text>
                    <Text size="sm" tone="subtle" className="mt-2 text-white/40">
                      {isOwner
                        ? 'Play a game, then approve the report your host sends. Approved lines are the only ones that count.'
                        : `${player.name} hasn't had a game report approved yet.`}
                    </Text>
                  </div>
                )}
              </div>

              {stats && sport && sport.statFields.length > 0 && (
                <div className="space-y-8">
                  <h3 className="border-l-4 border-lime-500 pl-4 text-2xl font-black uppercase italic tracking-tight">{sportLabel} totals</h3>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                    {sport.statFields.map((field) => (
                      <div key={field.key} className="rounded-card border border-white/5 bg-white/5 p-8 transition-colors hover:border-lime-500/30">
                        <span className="mb-1 block text-4xl font-black italic text-lime-500">{stats.counters[field.key] ?? 0}</span>
                        <Eyebrow>{field.label}</Eyebrow>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-8">
                <h3 className="text-2xl font-black uppercase italic tracking-tight">Recent matches</h3>
                <div className="space-y-4">
                  {sportMatches.map((match) => (
                    <MatchRow key={match.game.id} match={match} />
                  ))}
                  {sportMatches.length === 0 && (
                    <Text tone="subtle" className="py-12 text-center italic text-white/30">
                      No {sportLabel} matches recorded yet.
                    </Text>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** Says where the numbers came from — the difference between a stat and a claim. */
function Provenance({ stats }: { stats: CareerStats }) {
  return (
    <Text size="sm" tone="subtle" className="text-white/40">
      From {stats.gamesPlayed} approved {stats.gamesPlayed === 1 ? 'game' : 'games'}
      {stats.lastGameAt ? ` · last played ${formatGameDate(stats.lastGameAt)}` : ''}
      {stats.noShows > 0 ? ` · ${stats.noShows} no-${stats.noShows === 1 ? 'show' : 'shows'}` : ''}
    </Text>
  );
}

function Metric({ label, value, accent = false }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <div className="group rounded-card-xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10 md:p-10">
      <span className={cn('mb-4 block text-5xl font-black italic leading-none tracking-tighter sm:text-6xl md:text-8xl', accent ? 'text-lime-500' : 'text-white')}>
        {value}
      </span>
      <Eyebrow>{label}</Eyebrow>
    </div>
  );
}

function MatchRow({ match }: { match: MatchRecord }) {
  const { game, outcome, approval, wasMvp } = match;
  const won = outcome === 'win';

  return (
    <Link
      href={`/game/${game.slug || game.id}`}
      className="group flex flex-col items-center justify-between gap-6 rounded-card border border-white/5 bg-white/5 p-8 transition-all hover:bg-white/10 md:flex-row"
    >
      <div className="flex min-w-0 items-center gap-6">
        <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-pill border border-white/10 bg-ink-950 text-center text-eyebrow font-black italic uppercase text-lime-500">
          {formatGameDate(game.startsAt, game.timezone).replace(/^\w+, /, '')}
        </div>
        <div className="min-w-0">
          <h4 className="mb-1 truncate text-xl font-black tracking-tight">{game.title}</h4>
          <div className="flex flex-wrap items-center gap-3">
            {outcome && (
              <span className={cn('flex items-center gap-2 text-eyebrow font-black uppercase tracking-widest', won ? 'text-lime-500' : outcome === 'draw' ? 'text-white/50' : 'text-red-500')}>
                <span className={cn('h-2 w-2 rounded-pill', won ? 'bg-lime-500' : outcome === 'draw' ? 'bg-white/40' : 'bg-red-500')} />
                {outcome}
              </span>
            )}
            {wasMvp && <Eyebrow className="text-lime-500">MVP</Eyebrow>}
            {approval !== 'approved' && (
              <span className="rounded-pill bg-white/10 px-2 py-0.5 text-eyebrow font-black uppercase text-white/50">
                {approval === 'pending' ? 'Awaiting your approval' : 'Disputed'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProfileDashboard;
