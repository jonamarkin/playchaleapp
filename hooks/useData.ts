import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backend } from '@/services';
import type { Game, GameResultInput, MvpVoteInput, PlayerStatsInput, StatsApprovalInput } from '@/types';

export const QUERY_KEYS = {
  games: ['games'],
  myGames: (userId: string) => ['myGames', userId],
  players: ['players'],
  profile: (userId: string) => ['profile', userId],
  stats: (userId: string) => ['stats', userId],
  gameResults: (gameId: string) => ['gameResults', gameId],
  pendingApprovals: (userId: string) => ['pendingApprovals', userId],
};

export const useGames = () => {
  return useQuery({
    queryKey: QUERY_KEYS.games,
    queryFn: () => backend.games.list(),
  });
};

export const usePlayers = () => {
  return useQuery({
    queryKey: QUERY_KEYS.players,
    queryFn: () => backend.players.list(6),
  });
};

export const useInfinitePlayers = () => {
  return useInfiniteQuery({
    queryKey: ['players', 'infinite'],
    queryFn: ({ pageParam = 0 }) => backend.players.listPage(pageParam, 12),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 12 ? allPages.length : undefined;
    },
  });
};

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.profile(userId || ''),
    queryFn: () => backend.players.get(userId!),
    enabled: !!userId,
  });
};

export const useCreateGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ game, userId }: { game: Partial<Game>; userId: string }) => backend.games.create(game, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myGames(userId) });
    },
  });
};

export const useJoinGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ gameId, userId }: { gameId: string; userId: string }) => backend.games.join(gameId, userId),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myGames(userId) });
    },
  });
};

export const useMyGames = (userId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.myGames(userId || ''),
    queryFn: () => backend.games.listMine(userId!),
    enabled: !!userId,
  });
};

export const useGameResults = (gameId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.gameResults(gameId || ''),
    queryFn: () => backend.stats.getGameResults(gameId),
    enabled: !!gameId,
  });
};

export const usePendingApprovals = (userId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.pendingApprovals(userId || ''),
    queryFn: () => backend.stats.pendingApprovals(userId),
    enabled: !!userId,
  });
};

export const useSubmitGameResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, userId }: { input: GameResultInput; userId: string }) => backend.stats.submitGameResults(input, userId),
    onSuccess: (_, { input }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(input.gameId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
    },
  });
};

export const useSubmitPlayerStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (stats: PlayerStatsInput[]) => backend.stats.submitPlayerStats(stats),
    onSuccess: (_, stats) => {
      if (stats[0]) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(stats[0].gameId) });
      }
    },
  });
};

export const useApproveStats = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: StatsApprovalInput) => backend.stats.approveStats(input),
    onSuccess: (_, { gameId, userId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(gameId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingApprovals(userId) });
    },
  });
};

export const useVoteForMVP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MvpVoteInput) => backend.stats.voteForMVP(input),
    onSuccess: (_, { gameId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(gameId) });
    },
  });
};

export const useCompleteGame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (gameId: string) => backend.games.complete(gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
    },
  });
};
