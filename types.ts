
export interface AuthUser {
  id: string;
  email: string;
}

export interface Game {
  id: string;
  slug?: string;
  sport: string;
  title: string;
  location: string;
  time: string;
  date: string;
  spotsTotal: number;
  spotsTaken: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Competitive' | 'All Levels';
  organizer: string;
  organizerId?: string;
  imageUrl: string;
  price: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  visibility: 'public' | 'private';
  completedAt?: string;
  participants?: Participant[];
}


export interface Participant {
  id: string;
  slug?: string;
  name: string;
  avatar: string;
  role?: string;
  rating?: number;
  contribution?: string;
}



export interface PlayerProfile {
  id: string;
  slug?: string;
  name: string;
  avatar: string;
  mainSport: string;
  attributes: {
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  sportStats: Record<string, SportStats>;
  // keeping 'stats' for backward compat, ideally it mirrors sportStats[mainSport]
  stats: SportStats;
  bio: string;
  location?: string;
  matchHistory?: MatchRecord[];
}

export interface SportStats {
  gamesPlayed: number;
  winRate: string;
  mvps: number;
  reliability: string;
  rating: number;
  // Football specific
  goals?: number;
  assists?: number;
  cleanSheets?: number;
  // Basketball specific
  points?: number;
  rebounds?: number;
  steals?: number;
  // Tennis/Volleyball specific
  setsWon?: number;
  aces?: number;
  winStreak?: number;
  blocks?: number; // Volleyball
  digs?: number; // Volleyball
  // Swimming
  lapsSwum?: number;
  // Athletics (Track & Field)
  meetWins?: number;
  podiums?: number;
  personalBests?: number;
}

export interface MatchRecord {
  id: string;
  opponent: string;
  result: 'W' | 'L' | 'D' | 'Win' | 'Loss' | 'Draw';
  score: string;
  rating: number;
  date: string;
  sport: string;
  title: string;
  imageUrl: string;
  location: string;
  organizer: string;
  participants: Participant[];
  mvp?: Participant;
  matchStats?: {
    // Football
    possession?: string;
    shots?: number;
    accuracy?: string;
    intensity?: string;
    // Basketball
    points?: number;
    rebounds?: number;
    assists?: number;
    steals?: number;
    // Padel/Tennis
    sets?: string;
    aces?: number;
    // Generic
    [key: string]: string | number | undefined;
  };
}


