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

export interface BackendClient {
  auth: {
    getSession(): Promise<AuthSession>;
    signIn(input: SignInInput): Promise<AuthSession>;
    signInWithProvider(provider: 'google' | 'github'): Promise<AuthSession>;
    signOut(): Promise<void>;
    completeOnboarding(input: OnboardingProfileInput): Promise<AuthSession>;
    uploadAvatar(file: File, userId: string): Promise<string>;
  };
  games: {
    list(): Promise<Game[]>;
    get(idOrSlug: string): Promise<Game | null>;
    create(gameData: Partial<Game>, userId: string): Promise<string>;
    join(gameId: string, userId: string): Promise<void>;
    listMine(userId: string): Promise<{ hostedGames: Game[]; joinedGames: Game[] }>;
    complete(gameId: string): Promise<void>;
  };
  players: {
    list(limit?: number): Promise<PlayerProfile[]>;
    listPage(page?: number, pageSize?: number): Promise<PlayerProfile[]>;
    get(idOrSlug: string): Promise<PlayerProfile | null>;
  };
  stats: {
    getGameResults(gameId?: string): Promise<unknown>;
    pendingApprovals(userId?: string): Promise<unknown[]>;
    submitGameResults(input: GameResultInput, userId: string): Promise<unknown>;
    submitPlayerStats(stats: PlayerStatsInput[]): Promise<unknown>;
    approveStats(input: StatsApprovalInput): Promise<unknown>;
    voteForMVP(input: MvpVoteInput): Promise<unknown>;
  };
}
