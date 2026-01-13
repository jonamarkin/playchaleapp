
import React from 'react';
import { Game, PlayerProfile, Program, Testimonial } from './types';

export const COLORS = {
  lime: '#C6FF00',
  beige: '#F5F5F0',
  dark: '#111111',
};

export const GAMES: Game[] = [
  {
    id: 'g1',
    sport: 'Football',
    title: 'NIGHT SCUFFLE 5v5',
    location: 'Central Park Arena • Pitch 4',
    time: '18:30',
    date: 'Wed, Oct 25',
    spotsTotal: 10,
    spotsTaken: 3,
    skillLevel: 'Intermediate',
    organizer: 'Alex K.',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200',
    price: '$5',
    status: 'upcoming',
    participants: [
      { id: 'p1', name: 'Marcus J.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200' },
      { id: 'p3', name: 'Alex K.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', role: 'Host' },
      { id: 'p4', name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' }
    ],
    requests: [
      { id: 'req1', userId: 'p2', name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', timestamp: '10m ago' }
    ]
  },
  {
    id: 'g2',
    sport: 'Basketball',
    title: 'ELITE 3v3 RUN',
    location: 'Underground Hoops Lab',
    time: '20:00',
    date: 'Thu, Oct 26',
    spotsTotal: 6,
    spotsTaken: 2,
    skillLevel: 'Competitive',
    organizer: 'Jordan B.',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=1200',
    price: 'Free',
    status: 'upcoming',
    participants: [
      { id: 'p2', name: 'Elena R.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200' },
      { id: 'p5', name: 'Jordan B.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', role: 'Host' }
    ]
  },
  {
    id: 'g3',
    sport: 'Tennis',
    title: 'DOUBLES SHOWDOWN',
    location: 'Riverbank Clay Courts',
    time: '08:00',
    date: 'Sat, Oct 28',
    spotsTotal: 4,
    spotsTaken: 3,
    skillLevel: 'Beginner',
    organizer: 'Sarah L.',
    imageUrl: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&q=80&w=1200',
    price: '$12',
    status: 'upcoming',
    participants: [
      { id: 'p4', name: 'Sarah L.', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', role: 'Host' },
      { id: 'p6', name: 'Mike D.', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&q=80&w=200' }
    ]
  },
  {
    id: 'g4',
    sport: 'Padel',
    title: 'POWER VOLLEY 4s',
    location: 'Skyline Padel Club',
    time: '19:00',
    date: 'Fri, Oct 27',
    spotsTotal: 4,
    spotsTaken: 1,
    skillLevel: 'Intermediate',
    organizer: 'Carlos M.',
    imageUrl: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&q=80&w=1200',
    price: '$15',
    status: 'upcoming',
    participants: [
      { id: 'p7', name: 'Carlos M.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', role: 'Host' }
    ]
  },
];

export const TOP_PLAYERS: PlayerProfile[] = [
  {
    id: 'p1',
    name: 'Marcus "The Wall" J.',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800',
    mainSport: 'Football',
    attributes: {
      pace: 82,
      shooting: 65,
      passing: 78,
      dribbling: 72,
      defending: 94,
      physical: 89
    },
    stats: {
      gamesPlayed: 142,
      winRate: '68%',
      mvps: 24,
      reliability: '98%',
      rating: 8.8,
      goals: 124,
      assists: 48,
      cleanSheets: 42
    },
    recentActivity: 'Clean sheet in 5v5 Scrimmage yesterday',
    matchHistory: [
      // Fix: Added missing required properties to match type MatchRecord
      { id: 'm1', opponent: 'Ravens FC', result: 'W', score: '2-0', rating: 9.1, date: 'Oct 22', sport: 'Football', title: 'Qualifier Round 1', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400', location: 'Arena A', organizer: 'League Staff', participants: [] },
      { id: 'm2', opponent: 'Shadows 5s', result: 'D', score: '1-1', rating: 8.5, date: 'Oct 19', sport: 'Football', title: 'Weekly Challenge', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400', location: 'Central Field', organizer: 'Alex K.', participants: [] },
      { id: 'm3', opponent: 'City Blues', result: 'W', score: '3-0', rating: 9.4, date: 'Oct 15', sport: 'Football', title: 'City Cup', imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=400', location: 'Metropolitan Pitch', organizer: 'Sarah L.', participants: [] }
    ]
  },
  {
    id: 'p2',
    name: 'Elena "Sky" R.',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800',
    mainSport: 'Basketball',
    attributes: {
      pace: 91,
      shooting: 88,
      passing: 84,
      dribbling: 93,
      defending: 76,
      physical: 72
    },
    stats: {
      gamesPlayed: 89,
      winRate: '54%',
      mvps: 12,
      reliability: '100%',
      rating: 9.2,
      points: 1420,
      rebounds: 342,
      steals: 84
    },
    recentActivity: '34 pts in City Tournament Last Weekend',
    matchHistory: [
      // Fix: Added missing required properties to match type MatchRecord
      { id: 'h1', opponent: 'Lakers Local', result: 'W', score: '102-98', rating: 9.6, date: 'Oct 21', sport: 'Basketball', title: 'Pro Run', imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=400', location: 'Underground Lab', organizer: 'Jordan B.', participants: [] },
      { id: 'h2', opponent: 'Hoop Dreams', result: 'L', score: '88-92', rating: 8.2, date: 'Oct 17', sport: 'Basketball', title: 'Night Session', imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=400', location: 'South Court', organizer: 'Jordan B.', participants: [] },
      { id: 'h3', opponent: 'Westside 3s', result: 'W', score: '21-15', rating: 9.8, date: 'Oct 12', sport: 'Basketball', title: '3v3 Elite', imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=400', location: 'Westside Park', organizer: 'Elena R.', participants: [] }
    ]
  },
];

export const PROGRAMS: Program[] = [
  {
    id: 'pr1',
    title: 'Elite Striker',
    description: 'Master the art of finishing with pro-level drills and positioning analysis.',
    imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=800',
    ageRange: '16-21',
    category: 'Football',
    accentColor: '#C6FF00'
  },
  {
    id: 'pr2',
    title: 'Hoop Mastery',
    description: 'Elevate your handles and shooting consistency in high-intensity sessions.',
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&q=80&w=800',
    ageRange: '14+',
    category: 'Basketball',
    accentColor: '#F5F5F0'
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    content: "PlayChale changed the game for me. I found a consistent team and my stats have never been better.",
    author: "David 'Speedy' K.",
    trainer: "Coach Sam",
    trainerRole: "Lead Technical Coach",
    statValue: "15%",
    statLabel: "Increase in shooting accuracy",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800"
  }
];

export const ICONS = {
  Clock: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
  ),
  ChevronRight: (props: any) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="9 18 15 12 9 6" /></svg>
  ),
  MapPin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
  ),
  UpArrow: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></svg>
  ),
  Logo: () => (
    <div className="w-10 h-10 bg-[#C6FF00] rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-lime-500/30">
      <svg viewBox="0 0 24 24" fill="black" className="w-6 h-6">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
    </div>
  ),
  TennisBall: (props: any) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12a10 10 0 0 1 10-10" />
      <path d="M12 22a10 10 0 0 1 10-10" />
    </svg>
  )
};
