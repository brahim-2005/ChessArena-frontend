-- Apply in the Supabase SQL Editor to create and seed the puzzle tables only.
-- Safe to rerun: table definitions are guarded and seed IDs are stable.

BEGIN;

CREATE TABLE IF NOT EXISTS public.puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fen TEXT NOT NULL,
  solution_moves JSONB NOT NULL,
  rating INTEGER DEFAULT 1200,
  category TEXT,
  difficulty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.puzzle_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  puzzle_id UUID REFERENCES public.puzzles(id) ON DELETE CASCADE,
  solved BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, puzzle_id)
);

ALTER TABLE public.puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puzzle_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Puzzles public" ON public.puzzles;
DROP POLICY IF EXISTS "Puzzle progress public" ON public.puzzle_progress;
DROP POLICY IF EXISTS "Users read own puzzle progress" ON public.puzzle_progress;
DROP POLICY IF EXISTS "Users insert own puzzle progress" ON public.puzzle_progress;
DROP POLICY IF EXISTS "Users update own puzzle progress" ON public.puzzle_progress;

CREATE POLICY "Puzzles public" ON public.puzzles FOR SELECT USING (true);
CREATE POLICY "Users read own puzzle progress" ON public.puzzle_progress FOR SELECT
  USING (auth.uid() = user_id);

REVOKE ALL ON public.puzzles, public.puzzle_progress FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, fen, rating, category, difficulty, created_at)
  ON public.puzzles TO anon, authenticated;
GRANT SELECT ON public.puzzle_progress TO authenticated;
GRANT ALL ON public.puzzles, public.puzzle_progress TO service_role;

INSERT INTO public.puzzles (id, fen, solution_moves, rating, category, difficulty)
VALUES
  (
    '00000000-0000-4000-8000-000000000001',
    '7k/8/5KQ1/8/8/8/8/8 w - - 0 1',
    '["Qg7#"]'::jsonb,
    800,
    'Checkmate',
    'Beginner'
  ),
  (
    '00000000-0000-4000-8000-000000000002',
    '6k1/5ppp/8/8/8/5Q2/5PPP/6K1 w - - 0 1',
    '["Qa8#"]'::jsonb,
    900,
    'Checkmate',
    'Beginner'
  )
ON CONFLICT (id) DO NOTHING;

COMMIT;
