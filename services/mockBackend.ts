import { GAMES, TOP_PLAYERS } from '@/constants';
import type {
  AppUser,
  AuthSession,
  Game,
  GameResultInput,
  MvpVoteInput,
  OnboardingProfileInput,
  PlayerProfile,
  PlayerStatsInput,
  SignInInput,
  StatsApprovalInput,
} from '@/types';

const MOCK_SESSION_KEY = 'playchale.mock.session.v1';
const MOCK_SIGNED_OUT_KEY = 'playchale.mock.signed-out.v1';
const DEMO_USER_ID = 'p1';

const wait = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const playersById = new Map(TOP_PLAYERS.map((player) => [player.id, player]));
const firstPlayer = TOP_PLAYERS[0];

const demoUser: AppUser = {
  id: DEMO_USER_ID,
  email: 'demo@playchale.app',
  name: firstPlayer.name,
  avatar: firstPlayer.avatar,
};

let mockPlayers: PlayerProfile[] = clone(TOP_PLAYERS);
let mockGames: Game[] = clone(GAMES).map((game, index) => {
  const host = index === 0 ? firstPlayer : mockPlayers.find((player) => game.organizer.includes(player.name.split(' ')[0]));
  const organizerId = host?.id || game.organizer_id || `host-${index + 1}`;
  const organizer = host?.name || game.organizer;
  const participants = game.participants || [];
  const hasHostParticipant = participants.some((participant) => participant.id === organizerId);

  return {
    ...game,
    slug: game.slug || slugify(game.title),
    organizer,
    organizer_id: organizerId,
    status: game.status || 'upcoming',
    visibility: game.visibility || 'public',
    participants: hasHostParticipant
      ? participants
      : [
          {
            id: organizerId,
            slug: host?.slug,
            name: organizer,
            avatar: host?.avatar || 'https://i.pravatar.cc/150?u=host',
            role: 'Host',
            rating: host?.stats.rating,
          },
          ...participants,
        ],
  };
});

const isBrowser = () => typeof window !== 'undefined';

const readStoredSession = (): AuthSession | null => {
  if (!isBrowser()) return { user: demoUser, hasProfile: true };
  if (window.localStorage.getItem(MOCK_SIGNED_OUT_KEY) === 'true') {
    return { user: null, hasProfile: false };
  }

  const saved = window.localStorage.getItem(MOCK_SESSION_KEY);
  if (!saved) return { user: demoUser, hasProfile: true };

  try {
    return JSON.parse(saved) as AuthSession;
  } catch {
    window.localStorage.removeItem(MOCK_SESSION_KEY);
    return { user: demoUser, hasProfile: true };
  }
};

const writeSession = (session: AuthSession) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  window.localStorage.removeItem(MOCK_SIGNED_OUT_KEY);
};

const findProfile = (idOrSlug: string) => {
  if (idOrSlug === 'me') {
    const session = readStoredSession();
    return session?.user ? mockPlayers.find((player) => player.id === session.user?.id) || mockPlayers[0] : null;
  }

  return mockPlayers.find((player) => player.id === idOrSlug || player.slug === idOrSlug) || null;
};

export const mockBackend = {
  auth: {
    async getSession(): Promise<AuthSession> {
      await wait(80);
      return readStoredSession() || { user: null, hasProfile: false };
    },

    async signIn(input: SignInInput): Promise<AuthSession> {
      await wait();
      const profile = mockPlayers[0];
      const session = {
        user: {
          id: profile.id,
          email: input.email || demoUser.email,
          name: profile.name,
          avatar: profile.avatar,
        },
        hasProfile: true,
      };
      writeSession(session);
      return session;
    },

    async signInWithProvider(provider: 'google' | 'github'): Promise<AuthSession> {
      return this.signIn({ email: `${provider}.demo@playchale.app` });
    },

    async signOut(): Promise<void> {
      await wait(80);
      if (!isBrowser()) return;
      window.localStorage.removeItem(MOCK_SESSION_KEY);
      window.localStorage.setItem(MOCK_SIGNED_OUT_KEY, 'true');
    },

    async completeOnboarding(input: OnboardingProfileInput): Promise<AuthSession> {
      await wait(220);
      const id = `mock-${slugify(input.name || 'athlete')}`;
      const mainSport = input.sports[0] || 'Football';
      const starterStats = {
        gamesPlayed: 0,
        winRate: '0%',
        mvps: 0,
        reliability: '100%',
        rating: input.level === 'Competitive' ? 7.2 : input.level === 'Intermediate' ? 6.4 : 5.8,
      };
      const profile: PlayerProfile = {
        id,
        slug: slugify(input.name || id),
        name: input.name || 'New Athlete',
        avatar: `https://i.pravatar.cc/300?u=${encodeURIComponent(input.email || id)}`,
        mainSport,
        location: input.location,
        attributes: { pace: 74, shooting: 70, passing: 72, dribbling: 76, defending: 66, physical: 70 },
        sportStats: Object.fromEntries(input.sports.map((sport) => [sport, starterStats])),
        stats: starterStats,
        bio: `${input.level || 'Emerging'} ${mainSport} athlete building a PlayChale legacy.`,
        matchHistory: [],
      };

      mockPlayers = [profile, ...mockPlayers.filter((player) => player.id !== id)];

      const session = {
        user: {
          id,
          email: input.email || 'new.athlete@playchale.app',
          name: profile.name,
          avatar: profile.avatar,
        },
        hasProfile: true,
      };
      writeSession(session);
      return session;
    },

    async uploadAvatar(file: File, userId: string): Promise<string> {
      await wait(120);
      const url = isBrowser() ? URL.createObjectURL(file) : `https://i.pravatar.cc/300?u=${userId}`;
      mockPlayers = mockPlayers.map((player) => player.id === userId ? { ...player, avatar: url } : player);
      const session = readStoredSession();
      if (session?.user?.id === userId) {
        writeSession({ ...session, user: { ...session.user, avatar: url } });
      }
      return url;
    },
  },

  games: {
    async list(): Promise<Game[]> {
      await wait();
      return clone(mockGames.filter((game) => game.visibility !== 'private'));
    },

    async get(idOrSlug: string): Promise<Game | null> {
      await wait(80);
      const game = mockGames.find((item) => item.id === idOrSlug || item.slug === idOrSlug);
      return game ? clone(game) : null;
    },

    async create(gameData: Partial<Game>, userId: string): Promise<string> {
      await wait();
      const host = playersById.get(userId) || findProfile(userId) || firstPlayer;
      const id = `g-${Date.now()}`;
      const game: Game = {
        id,
        slug: slugify(gameData.title || id),
        sport: gameData.sport || 'Football',
        title: gameData.title || 'New PlayChale Match',
        location: gameData.location || 'Community Arena',
        time: gameData.time || '18:00',
        date: gameData.date || 'Today',
        spotsTotal: gameData.spotsTotal || 10,
        spotsTaken: 1,
        skillLevel: gameData.skillLevel || 'All Levels',
        organizer: host.name,
        organizer_id: userId,
        imageUrl: gameData.imageUrl || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=1200',
        price: gameData.price || 'Free',
        status: 'upcoming',
        visibility: gameData.visibility || 'public',
        participants: [{ id: userId, name: host.name, avatar: host.avatar, role: 'Host', rating: host.stats.rating }],
      };
      mockGames = [game, ...mockGames];
      return id;
    },

    async join(gameId: string, userId: string): Promise<void> {
      await wait();
      const profile = findProfile(userId) || firstPlayer;
      mockGames = mockGames.map((game) => {
        if (game.id !== gameId) return game;
        if (game.participants?.some((participant) => participant.id === userId)) return game;
        if (game.spotsTaken >= game.spotsTotal) return game;

        return {
          ...game,
          spotsTaken: game.spotsTaken + 1,
          participants: [
            ...(game.participants || []),
            { id: userId, slug: profile.slug, name: profile.name, avatar: profile.avatar, role: 'Player', rating: profile.stats.rating },
          ],
        };
      });
    },

    async listMine(userId: string): Promise<{ hostedGames: Game[]; joinedGames: Game[] }> {
      await wait();
      const hostedGames = mockGames.filter((game) => game.organizer_id === userId);
      const joinedGames = mockGames.filter((game) =>
        game.organizer_id !== userId && game.participants?.some((participant) => participant.id === userId)
      );

      return clone({ hostedGames, joinedGames });
    },

    async complete(gameId: string): Promise<void> {
      await wait();
      mockGames = mockGames.map((game) =>
        game.id === gameId ? { ...game, status: 'completed', completed_at: new Date().toISOString() } : game
      );
    },
  },

  players: {
    async list(limit = 6): Promise<PlayerProfile[]> {
      await wait();
      return clone(mockPlayers.slice(0, limit));
    },

    async listPage(page = 0, pageSize = 12): Promise<PlayerProfile[]> {
      await wait();
      return clone(mockPlayers.slice(page * pageSize, (page + 1) * pageSize));
    },

    async get(idOrSlug: string): Promise<PlayerProfile | null> {
      await wait(80);
      const profile = findProfile(idOrSlug);
      return profile ? clone(profile) : null;
    },
  },

  stats: {
    async getGameResults(_gameId?: string) {
      await wait(80);
      return { results: null, playerStats: [], mvpVotes: [], error: null };
    },

    async pendingApprovals(_userId?: string) {
      await wait(80);
      return [];
    },

    async submitGameResults(_input: GameResultInput, _userId: string) {
      await wait(120);
      return { ok: true };
    },

    async submitPlayerStats(_stats: PlayerStatsInput[]) {
      await wait(120);
      return [];
    },

    async approveStats(_input: StatsApprovalInput) {
      await wait(120);
      return { ok: true };
    },

    async voteForMVP(_input: MvpVoteInput) {
      await wait(120);
      return { ok: true };
    },
  },
};
