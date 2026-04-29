import { api } from './api';
import type {
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
import type { ApiResponse } from './api';
import type { BackendClient } from './backendTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || '';

const unwrap = <T>(response: ApiResponse<T>): T => {
  if (response.error) {
    throw new Error(response.error);
  }

  if (response.data === null) {
    throw new Error('Backend returned an empty response');
  }

  return response.data;
};

const encode = (value: string) => encodeURIComponent(value);

export const httpBackend: BackendClient = {
  auth: {
    async getSession() {
      return unwrap(await api.get<AuthSession>('/auth/session'));
    },

    async signIn(input: SignInInput) {
      return unwrap(await api.post<AuthSession>('/auth/login', input));
    },

    async signInWithProvider(provider: 'google' | 'github') {
      return unwrap(await api.post<AuthSession>('/auth/oauth', { provider }));
    },

    async signOut() {
      const response = await api.post('/auth/logout', {});
      if (response.error) throw new Error(response.error);
    },

    async completeOnboarding(input: OnboardingProfileInput) {
      return unwrap(await api.post<AuthSession>('/auth/onboarding', input));
    },

    async uploadAvatar(file: File, userId: string) {
      if (!API_BASE_URL) {
        throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured');
      }

      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', userId);

      const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/media/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to upload avatar');
      }

      return typeof data === 'string' ? data : data.url;
    },
  },

  games: {
    async list() {
      return unwrap(await api.get<Game[]>('/games'));
    },

    async get(idOrSlug: string) {
      return unwrap(await api.get<Game | null>(`/games/${encode(idOrSlug)}`));
    },

    async create(gameData: Partial<Game>, userId: string) {
      const response = unwrap(await api.post<{ id: string } | string>('/games', { ...gameData, userId }));
      return typeof response === 'string' ? response : response.id;
    },

    async join(gameId: string, userId: string) {
      await api.post(`/games/${encode(gameId)}/join`, { userId });
    },

    async listMine(_userId: string) {
      return unwrap(await api.get<{ hostedGames: Game[]; joinedGames: Game[] }>('/me/games'));
    },

    async complete(gameId: string) {
      await api.post(`/games/${encode(gameId)}/complete`, {});
    },
  },

  players: {
    async list(limit = 6) {
      return unwrap(await api.get<PlayerProfile[]>(`/players?limit=${limit}`));
    },

    async listPage(page = 0, pageSize = 12) {
      return unwrap(await api.get<PlayerProfile[]>(`/players?page=${page}&pageSize=${pageSize}`));
    },

    async get(idOrSlug: string) {
      return unwrap(await api.get<PlayerProfile | null>(`/players/${encode(idOrSlug)}`));
    },
  },

  stats: {
    async getGameResults(gameId?: string) {
      if (!gameId) return null;
      return unwrap(await api.get(`/games/${encode(gameId)}/results`));
    },

    async pendingApprovals(userId?: string) {
      const query = userId ? `?userId=${encode(userId)}` : '';
      return unwrap(await api.get<unknown[]>(`/stats/pending-approvals${query}`));
    },

    async submitGameResults(input: GameResultInput, userId: string) {
      return unwrap(await api.post(`/games/${encode(input.gameId)}/results`, { ...input, userId }));
    },

    async submitPlayerStats(stats: PlayerStatsInput[]) {
      const gameId = stats[0]?.gameId;
      if (!gameId) return { ok: true };
      return unwrap(await api.post(`/games/${encode(gameId)}/player-stats`, { stats }));
    },

    async approveStats(input: StatsApprovalInput) {
      return unwrap(await api.post(`/games/${encode(input.gameId)}/stats/approval`, input));
    },

    async voteForMVP(input: MvpVoteInput) {
      return unwrap(await api.post(`/games/${encode(input.gameId)}/mvp-votes`, input));
    },
  },
};
