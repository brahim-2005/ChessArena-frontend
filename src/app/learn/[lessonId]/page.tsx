'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { getLesson } from '@/lib/learning/lessons';

export const dynamic = 'force-dynamic';

export default function LessonDetailPage() {
  const params = useParams<{ lessonId: string }>();
  const { language, t } = useI18n();
  const lesson = getLesson(params.lessonId, language);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!lesson) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-text-primary">
        <p className="mb-4">{t('lessonNotFound')}</p>
        <Link href="/learn" className="text-sm text-accent hover:underline">
          {t('backToLessons')}
        </Link>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep < lesson.content.length - 1) {
      setCurrentStep(s => s + 1);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 text-text-primary">
      <Link href="/learn" className="text-sm text-text-secondary hover:text-accent mb-6 inline-block">
        {t('backToLessons')}
      </Link>

      <div className="bg-background-secondary rounded-2xl p-6 md:p-8 border border-text-secondary/15 shadow-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30">
            {lesson.category}
          </span>
          <span className="text-xs text-text-secondary">{t('step')} {currentStep + 1} {t('of')} {lesson.content.length}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{lesson.title}</h1>
        <p className="text-lg text-text-primary leading-relaxed bg-background-tertiary p-6 rounded-xl border border-text-secondary/10 mb-6">
          {lesson.content[currentStep]}
        </p>

        {completed ? (
          <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
            <h3 className="text-xl font-bold text-green-300 mb-2">{t('lessonCompleted')}</h3>
            <p className="text-sm text-text-secondary mb-4">{t('lessonCompletedDescription')}</p>
            <Link
              href="/learn"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl inline-block transition-colors"
            >
              {t('continueLearning')}
            </Link>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">{t('lessonReadToContinue')}</span>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors shadow-md shadow-accent/20 flex items-center gap-2"
            >
              <span>{currentStep === lesson.content.length - 1 ? t('completeLesson') : t('nextStep')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
