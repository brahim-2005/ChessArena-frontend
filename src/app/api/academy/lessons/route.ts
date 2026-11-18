import { NextResponse } from 'next/server';
import { createAdminClient, SupabaseAdminConfigurationError } from '@/lib/supabase/admin';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const admin = createAdminClient();
    const { data: lessons, error: lessonsError } = await admin
      .from('academy_lessons')
      .select('id, level_number, lesson_number, title, summary')
      .eq('published', true)
      .order('level_number', { ascending: true })
      .order('lesson_number', { ascending: true });

    if (lessonsError) {
      console.error('Academy lesson list lookup failed:', lessonsError.message);
      return NextResponse.json({ error: 'Unable to load Academy lessons' }, { status: 500 });
    }

    const authClient = await createServerClient();
    const { data: { user } } = await authClient.auth.getUser();
    let progressByLesson = new Map<string, { passed: boolean; bestScore: number; attempts: number }>();
    if (user) {
      const { data: progress, error: progressError } = await admin
        .from('academy_progress')
        .select('lesson_id, passed, best_score, attempts')
        .eq('user_id', user.id);
      if (progressError) {
        console.error('Academy progress lookup failed:', progressError.message);
        return NextResponse.json({ error: 'Unable to load Academy progress' }, { status: 500 });
      }
      progressByLesson = new Map((progress ?? []).map((item) => [
        item.lesson_id,
        { passed: item.passed, bestScore: item.best_score, attempts: item.attempts },
      ]));
    }

    const passedLessons = new Set(
      Array.from(progressByLesson.entries())
        .filter(([, progress]) => progress.passed)
        .map(([lessonId]) => lessonId)
    );
    const response = (lessons ?? []).map((lesson) => {
      const progress = progressByLesson.get(lesson.id) ?? null;
      const unlocked = lesson.level_number === 1 && lesson.lesson_number === 1
        ? true
        : lesson.lesson_number > 1
          ? passedLessons.has(`l${lesson.level_number}-${String(lesson.lesson_number - 1).padStart(2, '0')}`)
          : Array.from({ length: 10 }, (_, index) =>
              passedLessons.has(`l${lesson.level_number - 1}-${String(index + 1).padStart(2, '0')}`)
            ).every(Boolean);
      return { ...lesson, progress, unlocked };
    });

    return NextResponse.json({ lessons: response });
  } catch (error) {
    console.error('Academy lesson list request failed:', error);
    if (error instanceof SupabaseAdminConfigurationError) {
      return NextResponse.json({
        error: 'Academy database access is not configured. Set SUPABASE_SERVICE_KEY as a private environment variable.',
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unable to load Academy lessons' }, { status: 500 });
  }
}
