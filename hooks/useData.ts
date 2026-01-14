
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Game, PlayerProfile } from '@/types';
import { GAMES as INITIAL_GAMES, TOP_PLAYERS as INITIAL_PLAYERS } from '@/constants';

// --- Keys ---
export const QUERY_KEYS = {
    games: ['games'],
    players: ['players'],
    profile: (userId: string) => ['profile', userId],
    stats: (userId: string) => ['stats', userId],
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
        return INITIAL_GAMES;
    }

    if (!data || data.length === 0) return INITIAL_GAMES;

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

    if (!profiles || profiles.length === 0) return INITIAL_PLAYERS;

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
