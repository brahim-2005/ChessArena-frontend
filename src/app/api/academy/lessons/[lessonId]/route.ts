import { NextResponse } from 'next/server';
import { createAdminClient, SupabaseAdminConfigurationError } from '@/lib/supabase/admin';

type RouteContext = { params: Promise<{ lessonId: string }> };
const LESSON_ID_PATTERN = /^l[1-4]-(0[1-9]|10)$/;

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { lessonId } = await params;
    if (!LESSON_ID_PATTERN.test(lessonId)) {
      return NextResponse.json({ error: 'Invalid Academy lesson ID' }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: lesson, error: lessonError } = await admin
      .from('academy_lessons')
      .select('id, level_number, lesson_number, title, summary, content')
      .eq('id', lessonId)
      .eq('published', true)
      .maybeSingle();

    if (lessonError) {
      console.error('Academy lesson lookup failed:', lessonError.message);
      return NextResponse.json({ error: 'Unable to load Academy lesson' }, { status: 500 });
    }
    if (!lesson) {
      return NextResponse.json({ error: 'Academy lesson not found' }, { status: 404 });
    }

    const { data: questions, error: questionsError } = await admin
      .from('academy_questions')
      .select('id, question_number, difficulty, question_type, prompt, choices, hint, fen')
      .eq('lesson_id', lessonId)
      .order('question_number', { ascending: true });

    if (questionsError) {
      console.error('Academy questions lookup failed:', questionsError.message);
      return NextResponse.json({ error: 'Unable to load Academy quiz' }, { status: 500 });
    }
    if (!questions || questions.length !== 20) {
      return NextResponse.json({ error: 'Academy quiz is not ready yet' }, { status: 503 });
    }

    return NextResponse.json({ lesson, questions });
  } catch (error) {
    console.error('Academy lesson request failed:', error);
    if (error instanceof SupabaseAdminConfigurationError) {
      return NextResponse.json({
        error: 'Academy database access is not configured. Set SUPABASE_SERVICE_KEY as a private environment variable.',
      }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unable to load Academy lesson' }, { status: 500 });
  }
}
