
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Game, PlayerProfile } from '@/types';


// --- Keys ---
export const QUERY_KEYS = {
    games: ['games'],
    myGames: (userId: string) => ['myGames', userId],
    players: ['players'],
    profile: (userId: string) => ['profile', userId],
    stats: (userId: string) => ['stats', userId],
    gameResults: (gameId: string) => ['gameResults', gameId],
    pendingApprovals: (userId: string) => ['pendingApprovals', userId],
};

// --- Fetchers ---
const fetchGames = async (): Promise<Game[]> => {
    const supabase = createClient();
    // Join with profiles to get the organizer's name, and nested profiles for participants
    const { data, error } = await supabase
        .from('games')
        .select(`
            *,
            profiles:organizer_id(full_name),
            game_participants(
                user_id,
                status,
                profiles:user_id(id, full_name, avatar_url)
            )
        `);

    if (error) {
        console.error(' Supabase Fetch Error:', error);
        throw error;
    }

    if (!data) return [];

    // Client-side filter: only show public games (or games with no visibility set)
    const visibleGames = data.filter((g: any) => g.visibility === 'public' || !g.visibility);

    // Transform snake_case DB fields to camelCase App types
    return visibleGames.map((g: any) => ({
        ...g,
        imageUrl: g.image_url,
        spotsTotal: g.max_participants,
        spotsTaken: g.game_participants ? g.game_participants.length : g.spots_taken,
        skillLevel: g.skill_level,
        // Map the joined profile name to the organizer string
        organizer: g.profiles?.full_name || 'Unknown Organizer',
        participants: g.game_participants?.map((p: any) => ({
            id: p.user_id,
            name: p.profiles?.full_name || 'User',
            avatar: p.profiles?.avatar_url || 'https://i.pravatar.cc/150', // Fallback
            role: p.user_id === g.organizer_id ? 'Host' : (p.status === 'confirmed' ? 'Player' : 'Pending'),
            rating: '5.0' // Mock rating for now
        })) || []
    })) as Game[];
};

const fetchPlayers = async (): Promise<PlayerProfile[]> => {
    // In a real app, you might not fetch *all* players at once.
    // For now, we simulate the "Top Players" list.
    const supabase = createClient();
    const { data: profiles, error } = await supabase.from('profiles').select('*');
    if (error) throw error;

    if (!profiles) return [];

    // We need to join with stats to form the full PlayerProfile object
    // For optimization, we could do this via a View or a Joined Query.
    // Here we'll do a simple client-side merge for the MVP.
    const { data: stats } = await supabase.from('user_sport_stats').select('*');

    return profiles.map(p => {
        const pStats = stats?.filter(s => s.user_id === p.id) || [];
        const sportStatsMap: any = {};
        pStats.forEach(s => sportStatsMap[s.sport] = s.stats);

        return {
            id: p.id,
            name: p.full_name || 'Anonymous',
            mainSport: p.sports?.[0] || 'Football',
            sportStats: sportStatsMap,
            stats: sportStatsMap[p.sports?.[0]] || {}, // fallback
            attributes: p.attributes || {},
            avatar: p.avatar_url,
            bio: p.bio,
            location: p.location
        } as PlayerProfile;
    });
};

const fetchMyProfile = async (userId: string): Promise<PlayerProfile | null> => {
    if (!userId) return null;
    const supabase = createClient();

    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (error) return null;

    const { data: stats } = await supabase.from('user_sport_stats').select('*').eq('user_id', userId);

    const sportStatsMap: any = {};
    stats?.forEach(s => sportStatsMap[s.sport] = s.stats);

    return {
        id: profile.id,
        name: profile.full_name,
        mainSport: profile.sports?.[0] || 'Football',
        sportStats: sportStatsMap,
        stats: sportStatsMap[profile.sports?.[0]] || {},
        attributes: profile.attributes || {},
        avatar: profile.avatar_url,
        bio: profile.bio,
        location: profile.location
    } as PlayerProfile;
};

// --- Mutations ---
const createGame = async (gameData: Partial<Game>, userId: string): Promise<string> => {
    const supabase = createClient();
    const newId = crypto.randomUUID();

    const dbPayload = {
        id: newId,
        organizer_id: userId,
        title: gameData.title,
        sport: gameData.sport,
        status: 'upcoming',
        location: gameData.location,
        time: gameData.time,
        date: gameData.date,
        max_participants: gameData.spotsTotal,
        spots_taken: 1, // Organizer takes a spot
        price: gameData.price,
        image_url: gameData.imageUrl || `https://source.unsplash.com/800x600/?${gameData.sport?.toLowerCase() || 'sport'}`, // Fallback image
        skill_level: gameData.skillLevel,
        visibility: gameData.visibility || 'public'
    };

    const { error } = await supabase.from('games').insert(dbPayload);
    if (error) throw error;

    // Add organizer as participant
    await supabase.from('game_participants').insert({
        game_id: newId,
        user_id: userId,
        status: 'confirmed'
    });

    return newId;
};

const joinGame = async (gameId: string, userId: string): Promise<void> => {
    const supabase = createClient();
    const { error } = await supabase.from('game_participants').insert({
        game_id: gameId,
        user_id: userId,
        status: 'confirmed' // or pending
    });
    if (error) throw error;
};

// --- Hooks ---

export const useGames = () => {
    return useQuery({
        queryKey: QUERY_KEYS.games,
        queryFn: fetchGames,
    });
};

export const usePlayers = () => {
    return useQuery({
        queryKey: QUERY_KEYS.players,
        queryFn: fetchPlayers,
    });
};

export const useProfile = (userId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.profile(userId || ''),
        queryFn: () => fetchMyProfile(userId!),
        enabled: !!userId,
    });
};

export const useCreateGame = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ game, userId }: { game: Partial<Game>, userId: string }) => createGame(game, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
        },
    });
};

export const useJoinGame = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, userId }: { gameId: string, userId: string }) => joinGame(gameId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
        },
    });
};

// --- My Games (Hosted + Joined) ---
const fetchMyGames = async (userId: string): Promise<{ hostedGames: Game[], joinedGames: Game[] }> => {
    const supabase = createClient();

    // Games where user is the organizer
    const { data: hosted, error: hostedError } = await supabase
        .from('games')
        .select(`
            *,
            profiles:organizer_id(full_name),
            game_participants(user_id, status, profiles:user_id(id, full_name, avatar_url))
        `)
        .eq('organizer_id', userId);

    if (hostedError) throw hostedError;

    // Games where user is a participant (but not the organizer)
    const { data: participations, error: partError } = await supabase
        .from('game_participants')
        .select('game_id')
        .eq('user_id', userId);

    if (partError) throw partError;

    const joinedGameIds = participations?.map(p => p.game_id).filter(id => !hosted?.find(h => h.id === id)) || [];

    let joined: any[] = [];
    if (joinedGameIds.length > 0) {
        const { data: joinedData, error: joinedError } = await supabase
            .from('games')
            .select(`
                *,
                profiles:organizer_id(full_name),
                game_participants(user_id, status, profiles:user_id(id, full_name, avatar_url))
            `)
            .in('id', joinedGameIds);

        if (joinedError) throw joinedError;
        joined = joinedData || [];
    }

    const transformGame = (g: any): Game => ({
        ...g,
        imageUrl: g.image_url,
        spotsTotal: g.max_participants,
        spotsTaken: g.game_participants?.length || g.spots_taken,
        skillLevel: g.skill_level,
        organizer: g.profiles?.full_name || 'Unknown Organizer',
        participants: g.game_participants?.map((p: any) => ({
            id: p.user_id,
            name: p.profiles?.full_name || 'User',
            avatar: p.profiles?.avatar_url || 'https://i.pravatar.cc/150',
            role: p.user_id === g.organizer_id ? 'Host' : 'Player',
            rating: '5.0'
        })) || []
    });

    return {
        hostedGames: (hosted || []).map(transformGame),
        joinedGames: joined.map(transformGame)
    };
};

export const useMyGames = (userId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.myGames(userId || ''),
        queryFn: () => fetchMyGames(userId!),
        enabled: !!userId,
    });
};

// --- Game Results & Stats ---

interface GameResultInput {
    gameId: string;
    resultData: Record<string, any>;
    approvalThreshold: number;
}

interface PlayerStatsInput {
    gameId: string;
    userId: string;
    stats: Record<string, any>;
    showedUp: boolean;
}

// Fetch game results for a specific game
const fetchGameResults = async (gameId: string) => {
    const supabase = createClient();

    const [resultsRes, statsRes, mvpRes] = await Promise.all([
        supabase.from('game_results').select('*').eq('game_id', gameId).single(),
        supabase.from('player_game_stats').select(`
            *,
            profiles:user_id(id, full_name, avatar_url)
        `).eq('game_id', gameId),
        supabase.from('mvp_votes').select('*').eq('game_id', gameId)
    ]);

    return {
        results: resultsRes.data,
        playerStats: statsRes.data || [],
        mvpVotes: mvpRes.data || [],
        error: resultsRes.error || statsRes.error || mvpRes.error
    };
};

export const useGameResults = (gameId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.gameResults(gameId || ''),
        queryFn: () => fetchGameResults(gameId!),
        enabled: !!gameId,
    });
};

// Fetch games pending approval for a user
const fetchPendingApprovals = async (userId: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('player_game_stats')
        .select(`
            *,
            games:game_id(id, title, sport, date, time, image_url),
            game_results:game_id(result_data, status)
        `)
        .eq('user_id', userId)
        .is('approved_by_player', null); // Pending approval

    if (error) throw error;
    return data || [];
};

export const usePendingApprovals = (userId: string | undefined) => {
    return useQuery({
        queryKey: QUERY_KEYS.pendingApprovals(userId || ''),
        queryFn: () => fetchPendingApprovals(userId!),
        enabled: !!userId,
    });
};

// Submit game results (host only)
const submitGameResults = async (input: GameResultInput, userId: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('game_results')
        .upsert({
            game_id: input.gameId,
            entered_by: userId,
            result_data: input.resultData,
            approval_threshold: input.approvalThreshold,
            status: 'pending'
        }, { onConflict: 'game_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const useSubmitGameResults = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ input, userId }: { input: GameResultInput, userId: string }) =>
            submitGameResults(input, userId),
        onSuccess: (_, { input }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(input.gameId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
        },
    });
};

// Submit individual player stats (host only)
const submitPlayerStats = async (stats: PlayerStatsInput[]) => {
    const supabase = createClient();

    const payload = stats.map(s => ({
        game_id: s.gameId,
        user_id: s.userId,
        stats: s.stats,
        showed_up: s.showedUp,
    }));

    const { data, error } = await supabase
        .from('player_game_stats')
        .upsert(payload, { onConflict: 'game_id,user_id' })
        .select();

    if (error) throw error;
    return data;
};

export const useSubmitPlayerStats = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (stats: PlayerStatsInput[]) => submitPlayerStats(stats),
        onSuccess: (_, stats) => {
            if (stats[0]) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(stats[0].gameId) });
            }
        },
    });
};

// Approve/reject stats (player)
const approveStats = async (gameId: string, userId: string, approved: boolean) => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('player_game_stats')
        .update({
            approved_by_player: approved,
            approved_at: new Date().toISOString()
        })
        .eq('game_id', gameId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw error;

    // Check if approval threshold is met and update game_results status
    const { data: allStats } = await supabase
        .from('player_game_stats')
        .select('approved_by_player')
        .eq('game_id', gameId);

    const { data: gameResult } = await supabase
        .from('game_results')
        .select('approval_threshold')
        .eq('game_id', gameId)
        .single();

    if (allStats && gameResult) {
        const totalPlayers = allStats.length;
        const approvedCount = allStats.filter(s => s.approved_by_player === true).length;
        const rejectedCount = allStats.filter(s => s.approved_by_player === false).length;
        const approvalRate = approvedCount / totalPlayers;

        // Update counts on game_results
        await supabase
            .from('game_results')
            .update({
                approvals_count: approvedCount,
                rejections_count: rejectedCount,
                status: approvalRate >= gameResult.approval_threshold ? 'approved' : 'pending'
            })
            .eq('game_id', gameId);
    }

    return data;
};

export const useApproveStats = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, userId, approved }: { gameId: string, userId: string, approved: boolean }) =>
            approveStats(gameId, userId, approved),
        onSuccess: (_, { gameId, userId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(gameId) });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.pendingApprovals(userId) });
        },
    });
};

// Vote for MVP
const voteForMVP = async (gameId: string, voterId: string, votedForId: string) => {
    const supabase = createClient();

    const { data, error } = await supabase
        .from('mvp_votes')
        .upsert({
            game_id: gameId,
            voter_id: voterId,
            voted_for_id: votedForId
        }, { onConflict: 'game_id,voter_id' })
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const useVoteForMVP = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ gameId, voterId, votedForId }: { gameId: string, voterId: string, votedForId: string }) =>
            voteForMVP(gameId, voterId, votedForId),
        onSuccess: (_, { gameId }) => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.gameResults(gameId) });
        },
    });
};

// Mark game as complete
const completeGame = async (gameId: string) => {
    const supabase = createClient();

    const { error } = await supabase
        .from('games')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', gameId);

    if (error) throw error;
};

export const useCompleteGame = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (gameId: string) => completeGame(gameId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.games });
        },
    });
};
