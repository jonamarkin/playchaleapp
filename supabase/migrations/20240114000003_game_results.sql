-- Post-Game Stats System
-- This migration adds tables for game results, player stats, and MVP voting

-- Add completed_at column to games table
ALTER TABLE public.games ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

-- Game Results (entered by host after game completes)
CREATE TABLE public.game_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id TEXT REFERENCES public.games(id) ON DELETE CASCADE,
    entered_by UUID REFERENCES public.profiles(id),
    result_data JSONB NOT NULL DEFAULT '{}', -- Sport-specific result (e.g., {"team_a_score": 3, "team_b_score": 2})
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'disputed')),
    approval_threshold DECIMAL(3,2) DEFAULT 0.5, -- 50% by default
    approvals_count INT DEFAULT 0,
    rejections_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(game_id)
);

-- Individual Player Stats (per participant per game)
CREATE TABLE public.player_game_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id TEXT REFERENCES public.games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    stats JSONB NOT NULL DEFAULT '{}', -- Sport-specific stats {"goals": 2, "assists": 1}
    showed_up BOOLEAN DEFAULT true,
    approved_by_player BOOLEAN DEFAULT NULL, -- NULL = pending, true = approved, false = rejected
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(game_id, user_id)
);

-- MVP Votes (participants vote for player of the match)
CREATE TABLE public.mvp_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    game_id TEXT REFERENCES public.games(id) ON DELETE CASCADE,
    voter_id UUID REFERENCES public.profiles(id),
    voted_for_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(game_id, voter_id) -- One vote per person per game
);

-- Enable RLS
ALTER TABLE public.game_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mvp_votes ENABLE ROW LEVEL SECURITY;

-- Game Results Policies
CREATE POLICY "Game results viewable by everyone" 
    ON public.game_results FOR SELECT 
    USING (true);

CREATE POLICY "Host can insert game results" 
    ON public.game_results FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.games 
            WHERE id = game_id AND organizer_id = auth.uid()
        )
    );

CREATE POLICY "Host can update game results" 
    ON public.game_results FOR UPDATE 
    USING (entered_by = auth.uid());

-- Player Game Stats Policies
CREATE POLICY "Player stats viewable by everyone" 
    ON public.player_game_stats FOR SELECT 
    USING (true);

CREATE POLICY "Host can insert player stats" 
    ON public.player_game_stats FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.games 
            WHERE id = game_id AND organizer_id = auth.uid()
        )
    );

CREATE POLICY "Players can approve their own stats" 
    ON public.player_game_stats FOR UPDATE 
    USING (user_id = auth.uid());

-- MVP Votes Policies
CREATE POLICY "MVP votes viewable by everyone" 
    ON public.mvp_votes FOR SELECT 
    USING (true);

CREATE POLICY "Players can vote for MVP" 
    ON public.mvp_votes FOR INSERT 
    WITH CHECK (
        voter_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.game_participants 
            WHERE game_id = mvp_votes.game_id AND user_id = auth.uid()
        )
    );

-- Index for faster lookups
CREATE INDEX idx_player_game_stats_game_id ON public.player_game_stats(game_id);
CREATE INDEX idx_player_game_stats_user_id ON public.player_game_stats(user_id);
CREATE INDEX idx_game_results_game_id ON public.game_results(game_id);
CREATE INDEX idx_mvp_votes_game_id ON public.mvp_votes(game_id);
