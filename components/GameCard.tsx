'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { m } from 'framer-motion';
import { Game } from '@/types';
import { ICONS } from '@/constants';
import { Eyebrow } from '@/components/ui/typography';
import { cn } from '@/lib/utils';

/**
 * The one game card. Replaces five separate implementations (the discover grid card,
 * a local component in mygames that shadowed this file, the calendar list row, the
 * dashboard row) that all showed the same thing in slightly different ways.
 *
 * `feature` is the full card for browsing; `row` is the compact line used in lists.
 * Both are links rather than clickable divs, so they are reachable by keyboard.
 */
interface GameCardProps {
  game: Game;
  variant?: 'feature' | 'row';
  /** Load the cover eagerly; set for cards visible on first paint (LCP candidates) */
  priority?: boolean;
  /** Marks the viewer as the host of this game */
  isHost?: boolean;
  className?: string;
}

const gameHref = (game: Game) => `/game/${game.slug || game.id}`;

const GameCard: React.FC<GameCardProps> = ({ game, variant = 'feature', priority = false, isHost = false, className }) => {
  const isFull = game.spotsTaken >= game.spotsTotal;

  if (variant === 'row') {
    return (
      <Link
        href={gameHref(game)}
        className={cn(
          'touch-card touch-target group flex items-center gap-4 rounded-card border-2 border-line bg-surface-panel p-5 shadow-e1 transition-all duration-base hover:border-lime-500 sm:gap-5 sm:p-6',
          className
        )}
      >
        <Image
          src={game.imageUrl}
          alt=""
          width={80}
          height={80}
          className="h-16 w-16 shrink-0 rounded-field object-cover shadow-e1 sm:h-20 sm:w-20"
        />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Eyebrow>{game.sport}</Eyebrow>
            {game.visibility === 'private' && (
              <span className="rounded-pill bg-ink-900 px-2 py-0.5 text-eyebrow font-black uppercase text-lime-500">Private</span>
            )}
            {isHost && (
              <span className="rounded-pill bg-lime-500 px-2 py-0.5 text-eyebrow font-black uppercase text-ink-900">Host</span>
            )}
          </div>
          <h4 className="truncate text-body-lg font-black italic uppercase tracking-tighter text-fg">{game.title}</h4>
          <div className="mt-1 flex items-center gap-4 text-eyebrow font-bold text-fg-muted">
            <span className="flex items-center gap-1"><ICONS.Clock /> {game.date} • {game.time}</span>
            <span>{game.spotsTaken}/{game.spotsTotal}</span>
          </div>
        </div>
        <span className="shrink-0 rounded-pill bg-fg/5 p-3 transition-all group-hover:bg-lime-500 group-hover:text-ink-900">
          <ICONS.ChevronRight />
        </span>
      </Link>
    );
  }

  const fillPercentage = (game.spotsTaken / game.spotsTotal) * 100;

  return (
    <Link
      href={gameHref(game)}
      className={cn(
        'touch-card touch-target group relative flex h-full min-h-[620px] flex-col overflow-hidden rounded-card-xl border border-line bg-surface-panel p-6 transition-all duration-slow hover:border-white/10 hover:bg-ink-900 hover:shadow-e3',
        className
      )}
    >
      {/* Visual Identity Section */}
      <div className="relative mb-8 h-64 overflow-hidden rounded-card-lg md:h-80">
        <Image
          src={game.imageUrl}
          alt=""
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform [transition-duration:1500ms] ease-out group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

        <div className="absolute inset-x-6 top-6 flex items-start justify-between">
          <div className="flex flex-col gap-2">
            <span className="glass rounded-pill px-4 py-2 text-eyebrow font-black uppercase text-white backdrop-blur-md">
              {game.sport}
            </span>
            <span className={cn(
              'rounded-pill px-4 py-2 text-eyebrow font-black uppercase shadow-e1',
              isFull ? 'bg-red-500 text-white' : 'bg-lime-500 text-ink-900'
            )}>
              {isFull ? 'Squad full' : `${game.spotsTotal - game.spotsTaken} open`}
            </span>
          </div>
          <div className="flex min-w-[70px] flex-col items-center rounded-field border border-white/20 bg-white/95 px-5 py-2.5 shadow-e2">
            <span className="mb-1 text-eyebrow font-black uppercase leading-none text-ink-900/40">Price</span>
            <span className="text-body-sm font-black leading-none text-ink-900">{game.price}</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-1 flex-col px-4 pb-4">
        <div className="mb-10">
          <h3 className="mb-5 text-3xl font-black italic uppercase leading-[0.9] tracking-tighter text-fg transition-colors duration-base group-hover:text-lime-500 md:text-5xl">
            {game.title}
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-4 text-eyebrow font-black uppercase text-fg-muted transition-colors group-hover:text-white/40">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center"><ICONS.MapPin /></span>
              <span className="truncate">{game.location}</span>
            </div>
            <div className="flex items-center gap-4 text-eyebrow font-black uppercase text-fg-muted transition-colors group-hover:text-white/40">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center"><ICONS.Clock /></span>
              <span>{game.date} • {game.time}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-10">
          {/* Squad Progress Bar */}
          <div className="space-y-4">
            <div className="flex items-end justify-between px-1">
              <Eyebrow className="transition-colors group-hover:text-white/20">Squad recruitment</Eyebrow>
              <span className="text-body-sm font-black italic text-fg transition-colors group-hover:text-white">
                {game.spotsTaken} <span className="mx-1 text-eyebrow font-black opacity-30">/</span> {game.spotsTotal}
              </span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-pill bg-ink-100 transition-colors group-hover:bg-white/5">
              <m.div
                initial={{ width: 0 }}
                whileInView={{ width: `${fillPercentage}%` }}
                className={cn('h-full transition-all duration-slow', fillPercentage > 85 ? 'bg-red-500' : 'bg-ink-900 group-hover:bg-lime-500')}
              />
            </div>
          </div>

          {/* Action Row - Integrated Button Design */}
          <div className="-mr-6 flex items-center justify-between border-t border-line pt-8 transition-colors group-hover:border-white/10">
            <div className="flex shrink-0 -space-x-4">
              {game.participants?.slice(0, 3).map((p) => (
                <Image key={p.id} src={p.avatar} alt="" width={48} height={48} className="h-12 w-12 rounded-pill border-[4px] border-white object-cover shadow-e1 transition-colors group-hover:border-ink-900" />
              ))}
              {game.participants && game.participants.length > 3 && (
                <span className="flex h-12 w-12 items-center justify-center rounded-pill border-[4px] border-white bg-ink-100 text-eyebrow font-black text-ink-900 transition-all group-hover:border-ink-900 group-hover:bg-white/10 group-hover:text-white">
                  +{game.participants.length - 3}
                </span>
              )}
            </div>

            <span
              className={cn(
                'flex h-16 shrink-0 items-center justify-center gap-4 rounded-l-full pl-10 pr-8 text-eyebrow font-black uppercase transition-all',
                isFull
                  ? 'bg-ink-100 text-ink-900/20'
                  : 'bg-ink-900 text-white shadow-[-20px_0_40px_hsl(var(--ink-900)/0.1)] group-hover:bg-lime-500 group-hover:text-ink-900'
              )}
            >
              {isFull ? 'Squad full' : 'View match'}
              {!isFull && <span className="transition-transform duration-base group-hover:translate-x-1"><ICONS.ChevronRight /></span>}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GameCard;
