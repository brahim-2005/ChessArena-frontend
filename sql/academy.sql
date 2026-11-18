-- Academy content and progress schema. Apply in the Supabase SQL Editor.
-- Answers remain server-only; clients receive questions through authenticated API routes.

BEGIN;

CREATE TABLE IF NOT EXISTS public.academy_lessons (
  id TEXT PRIMARY KEY,
  level_number SMALLINT NOT NULL CHECK (level_number BETWEEN 1 AND 4),
  lesson_number SMALLINT NOT NULL CHECK (lesson_number BETWEEN 1 AND 10),
  title JSONB NOT NULL CHECK (jsonb_typeof(title) = 'object'),
  summary JSONB NOT NULL CHECK (jsonb_typeof(summary) = 'object'),
  content JSONB NOT NULL CHECK (jsonb_typeof(content) = 'object'),
  published BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (level_number, lesson_number)
);

CREATE TABLE IF NOT EXISTS public.academy_questions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  question_number SMALLINT NOT NULL CHECK (question_number BETWEEN 1 AND 20),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  question_type TEXT NOT NULL CHECK (question_type IN (
    'multiple_choice', 'true_false', 'best_move', 'identify_mistake',
    'find_checkmate', 'interactive_board', 'complete_move',
    'position_evaluation', 'strategic_decision'
  )),
  prompt JSONB NOT NULL CHECK (jsonb_typeof(prompt) = 'object'),
  choices JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(choices) = 'array'),
  correct_answer TEXT NOT NULL,
  explanation JSONB NOT NULL CHECK (jsonb_typeof(explanation) = 'object'),
  hint JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(hint) = 'object'),
  fen TEXT,
  solution_moves JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(solution_moves) = 'array'),
  UNIQUE (lesson_id, question_number)
);

CREATE TABLE IF NOT EXISTS public.academy_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  best_score SMALLINT NOT NULL DEFAULT 0 CHECK (best_score BETWEEN 0 AND 20),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  xp_awarded INTEGER NOT NULL DEFAULT 0 CHECK (xp_awarded >= 0),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.academy_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES public.academy_lessons(id) ON DELETE CASCADE,
  answers JSONB NOT NULL CHECK (jsonb_typeof(answers) = 'object'),
  score SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 20),
  duration_seconds INTEGER NOT NULL CHECK (duration_seconds BETWEEN 0 AND 86400),
  difficulty_results JSONB NOT NULL CHECK (jsonb_typeof(difficulty_results) = 'object'),
  xp_earned INTEGER NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS academy_questions_lesson_order_idx
  ON public.academy_questions (lesson_id, question_number);
CREATE INDEX IF NOT EXISTS academy_progress_user_idx
  ON public.academy_progress (user_id, lesson_id);
CREATE INDEX IF NOT EXISTS academy_attempts_user_lesson_idx
  ON public.academy_quiz_attempts (user_id, lesson_id, created_at DESC);

ALTER TABLE public.academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academy_quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published Academy lessons are readable" ON public.academy_lessons;
DROP POLICY IF EXISTS "Users read own Academy progress" ON public.academy_progress;
DROP POLICY IF EXISTS "Users read own Academy attempts" ON public.academy_quiz_attempts;

CREATE POLICY "Published Academy lessons are readable"
  ON public.academy_lessons FOR SELECT USING (published = TRUE);
CREATE POLICY "Users read own Academy progress"
  ON public.academy_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users read own Academy attempts"
  ON public.academy_quiz_attempts FOR SELECT USING (auth.uid() = user_id);

REVOKE ALL ON public.academy_lessons, public.academy_questions,
  public.academy_progress, public.academy_quiz_attempts
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.academy_lessons TO authenticated;
GRANT SELECT ON public.academy_progress, public.academy_quiz_attempts TO authenticated;
GRANT ALL ON public.academy_lessons, public.academy_questions,
  public.academy_progress, public.academy_quiz_attempts TO service_role;

CREATE OR REPLACE FUNCTION public.submit_academy_quiz(
  p_user_id UUID,
  p_lesson_id TEXT,
  p_answers JSONB,
  p_duration_seconds INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  question_count INTEGER;
  final_score SMALLINT;
  result_by_difficulty JSONB;
  was_passed BOOLEAN;
  awarded_xp INTEGER;
BEGIN
  IF p_user_id IS NULL
    OR p_lesson_id IS NULL
    OR p_answers IS NULL
    OR p_duration_seconds IS NULL
    OR jsonb_typeof(p_answers) <> 'object'
    OR p_duration_seconds NOT BETWEEN 0 AND 86400 THEN
    RAISE EXCEPTION 'Invalid Academy quiz submission' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.academy_progress (user_id, lesson_id)
  VALUES (p_user_id, p_lesson_id)
  ON CONFLICT (user_id, lesson_id) DO NOTHING;

  PERFORM 1 FROM public.academy_progress
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id
  FOR UPDATE;

  SELECT COUNT(*)::INTEGER
  INTO question_count
  FROM public.academy_questions
  WHERE lesson_id = p_lesson_id;

  IF question_count <> 20
    OR jsonb_object_length(p_answers) <> question_count
    OR EXISTS (
      SELECT 1
      FROM jsonb_each(p_answers) AS submitted(key, value)
      WHERE jsonb_typeof(submitted.value) <> 'string'
        OR NOT EXISTS (
          SELECT 1 FROM public.academy_questions question
          WHERE question.lesson_id = p_lesson_id AND question.id = submitted.key
        )
    )
    OR EXISTS (
      SELECT 1 FROM public.academy_questions question
      WHERE question.lesson_id = p_lesson_id
        AND NOT (p_answers ? question.id)
    ) THEN
    RAISE EXCEPTION 'Academy quiz is incomplete or invalid' USING ERRCODE = '22023';
  END IF;

  SELECT
    COALESCE(SUM(result.correct), 0)::SMALLINT,
    jsonb_object_agg(
      result.difficulty,
      jsonb_build_object('correct', result.correct, 'total', result.total)
    )
  INTO final_score, result_by_difficulty
  FROM (
    SELECT
      question.difficulty,
      COUNT(*)::INTEGER AS total,
      COUNT(*) FILTER (
        WHERE p_answers ->> question.id = question.correct_answer
      )::INTEGER AS correct
    FROM public.academy_questions question
    WHERE question.lesson_id = p_lesson_id
    GROUP BY question.difficulty
  ) AS result;

  IF COALESCE(result_by_difficulty -> 'easy' ->> 'total', '0') <> '5'
    OR COALESCE(result_by_difficulty -> 'medium' ->> 'total', '0') <> '10'
    OR COALESCE(result_by_difficulty -> 'hard' ->> 'total', '0') <> '5' THEN
    RAISE EXCEPTION 'Academy quiz difficulty distribution is invalid' USING ERRCODE = '22023';
  END IF;

  SELECT passed INTO was_passed
  FROM public.academy_progress
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id;

  awarded_xp := CASE WHEN final_score >= 15 AND NOT was_passed THEN 50 + final_score ELSE 0 END;

  INSERT INTO public.academy_quiz_attempts (
    user_id, lesson_id, answers, score, duration_seconds, difficulty_results, xp_earned
  )
  VALUES (
    p_user_id, p_lesson_id, p_answers, final_score, p_duration_seconds,
    result_by_difficulty, awarded_xp
  );

  UPDATE public.academy_progress
  SET best_score = GREATEST(best_score, final_score),
      attempts = attempts + 1,
      passed = passed OR final_score >= 15,
      xp_awarded = xp_awarded + awarded_xp,
      completed_at = CASE
        WHEN completed_at IS NULL AND final_score >= 15 THEN NOW()
        ELSE completed_at
      END,
      updated_at = NOW()
  WHERE user_id = p_user_id AND lesson_id = p_lesson_id;

  RETURN jsonb_build_object(
    'score', final_score,
    'percentage', final_score * 5,
    'passed', final_score >= 15,
    'xpEarned', awarded_xp,
    'byDifficulty', result_by_difficulty
  );
END;
$$;

REVOKE ALL ON FUNCTION public.submit_academy_quiz(UUID, TEXT, JSONB, INTEGER)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_academy_quiz(UUID, TEXT, JSONB, INTEGER)
  TO service_role;

COMMIT;
