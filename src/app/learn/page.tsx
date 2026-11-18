'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen, CheckCircle2, LockKeyhole } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

type LocalizedText = Record<'en' | 'fr' | 'ar', string>;
interface AcademyLesson {
  id: string;
  level_number: number;
  lesson_number: number;
  title: LocalizedText;
  summary: LocalizedText;
  progress: { passed: boolean; bestScore: number; attempts: number } | null;
  unlocked: boolean;
}

const copy = {
  en: {
    title: 'Chess Academy',
    description: 'Build your chess skills step by step with structured lessons and verified quizzes.',
    progress: 'Your progress',
    passed: 'passed',
    level: 'Level 1 · Chess Foundations',
    duration: '10–20 min',
    start: 'Start lesson',
    review: 'Review lesson',
    locked: 'Pass the previous quiz to unlock',
    loading: 'Loading lessons…',
    error: 'Could not load Academy lessons. Apply the Academy database schema and Level 1 seed, then try again.',
    retry: 'Try again',
    empty: 'No published lessons are available yet.',
    quiz: '20-question quiz',
  },
  fr: {
    title: 'Académie d’échecs',
    description: 'Progressez étape par étape grâce à des leçons structurées et des quiz vérifiés.',
    progress: 'Votre progression',
    passed: 'réussies',
    level: 'Niveau 1 · Fondamentaux des échecs',
    duration: '10–20 min',
    start: 'Commencer',
    review: 'Revoir la leçon',
    locked: 'Réussissez le quiz précédent pour débloquer',
    loading: 'Chargement des leçons…',
    error: 'Impossible de charger les leçons. Appliquez le schéma Academy et les données du niveau 1, puis réessayez.',
    retry: 'Réessayer',
    empty: 'Aucune leçon publiée pour le moment.',
    quiz: 'Quiz de 20 questions',
  },
  ar: {
    title: 'أكاديمية الشطرنج',
    description: 'طوّر مهاراتك خطوة بخطوة عبر دروس منظّمة واختبارات موثوقة.',
    progress: 'تقدّمك',
    passed: 'دروس مجتازة',
    level: 'المستوى 1 · أساسيات الشطرنج',
    duration: '10–20 دقيقة',
    start: 'ابدأ الدرس',
    review: 'راجع الدرس',
    locked: 'اجتز الاختبار السابق لفتح هذا الدرس',
    loading: 'جارٍ تحميل الدروس…',
    error: 'تعذّر تحميل الدروس. طبّق مخطط الأكاديمية وبيانات المستوى الأول ثم أعد المحاولة.',
    retry: 'أعد المحاولة',
    empty: 'لا توجد دروس منشورة حالياً.',
    quiz: 'اختبار من 20 سؤالاً',
  },
} as const;

export default function LearnAcademyPage() {
  const { language, t } = useI18n();
  const labels = copy[language];
  const [lessons, setLessons] = useState<AcademyLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLessons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/academy/lessons');
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || labels.error);
      setLessons(payload.lessons);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : labels.error);
    } finally {
      setLoading(false);
    }
  }, [labels.error]);

  useEffect(() => {
    void loadLessons();
  }, [loadLessons]);

  const completedCount = lessons.filter((lesson) => lesson.progress?.passed).length;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
            <BookOpen className="h-3.5 w-3.5" />
            {t('chessAcademy')}
          </span>
          <h1 className="text-3xl font-bold md:text-4xl">{labels.title}</h1>
          <p className="mt-2 max-w-2xl text-text-secondary">{labels.description}</p>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-text-secondary/15 bg-background-secondary p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/20 font-bold text-accent">
            {lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0}%
          </div>
          <div>
            <p className="text-xs text-text-secondary">{labels.progress}</p>
            <p className="font-semibold">{completedCount} / {lessons.length} {labels.passed}</p>
          </div>
        </div>
      </header>

      <section aria-labelledby="level-one-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-accent">{labels.level}</p>
            <h2 id="level-one-heading" className="mt-1 text-2xl font-bold">{labels.level}</h2>
          </div>
          <p className="text-sm text-text-secondary">{labels.quiz}</p>
        </div>

        {loading ? (
          <p className="rounded-2xl border border-text-secondary/15 bg-background-secondary p-6 text-text-secondary" role="status">
            {labels.loading}
          </p>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6" role="alert">
            <p>{error}</p>
            <button onClick={() => void loadLessons()} className="mt-4 rounded-xl bg-accent px-4 py-2 font-semibold text-white">
              {labels.retry}
            </button>
          </div>
        ) : lessons.length === 0 ? (
          <p className="rounded-2xl border border-text-secondary/15 bg-background-secondary p-6 text-text-secondary">
            {labels.empty}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson) => {
              const isCompleted = lesson.progress?.passed === true;
              return (
                <article key={lesson.id} className="flex flex-col justify-between rounded-2xl border border-text-secondary/15 bg-background-secondary p-5 shadow-card transition-colors hover:border-accent/40">
                  <div>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="rounded-full border border-text-secondary/10 bg-background-tertiary px-2.5 py-1 text-xs text-text-secondary">
                        {lesson.lesson_number} / 10
                      </span>
                      <span className="text-xs text-text-secondary">{labels.duration}</span>
                    </div>
                    <h3 className="text-lg font-bold">{lesson.title[language]}</h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-text-secondary">{lesson.summary[language]}</p>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-text-secondary/10 pt-4">
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-400">
                        <CheckCircle2 className="h-4 w-4" />
                        {t('completed')} · {lesson.progress?.bestScore}/20
                      </span>
                    ) : lesson.unlocked ? (
                      <span className="text-xs text-text-secondary">{lesson.progress?.attempts ? `${lesson.progress.attempts} attempts` : labels.quiz}</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-text-secondary">
                        <LockKeyhole className="h-3.5 w-3.5" />
                        {labels.locked}
                      </span>
                    )}
                    {lesson.unlocked && (
                      <Link
                        href={`/learn/${lesson.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-md shadow-accent/20 transition-colors hover:bg-accent-hover"
                      >
                        {isCompleted ? labels.review : labels.start}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
