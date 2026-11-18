'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export const dynamic = 'force-dynamic';

interface LessonDetail {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  description: string;
  content: string[];
}

const LESSON_DATA: Record<string, LessonDetail> = {
  '1': {
    id: '1',
    title: 'How the Chess Pieces Move',
    category: 'Chess Fundamentals',
    difficulty: 'Beginner',
    description: 'Learn how every piece on the board moves, captures, and controls space.',
    content: [
      'Welcome to ChessAcademy! The chess board consists of 64 squares in an 8x8 grid. Each player starts with 16 pieces: 1 King, 1 Queen, 2 Rooks, 2 Knights, 2 Bishops, and 8 Pawns.',
      'The Rook moves in straight lines horizontally or vertically. The Bishop moves diagonally. The Queen combines the power of both Rook and Bishop.',
      'The Knight moves in an "L-shape": two squares in one direction and one square perpendicular. Knights are the only pieces that can jump over other pieces.',
      'The Pawn moves forward one square (or two on its first move), and captures diagonally. Congratulations on completing the introduction to piece movement!'
    ]
  },
  '2': {
    id: '2',
    title: 'The Golden Rules of the Opening',
    category: 'Opening Principles',
    difficulty: 'Beginner',
    description: 'Control the center, develop your minor pieces quickly, and keep your king safe.',
    content: [
      'Rule 1: Control the center squares (e4, d4, e5, d5) with your pawns and pieces.',
      'Rule 2: Develop your Knights before your Bishops (Knights usually go to c3/f3 and c6/f6).',
      'Rule 3: Do not move the same piece twice in the opening unless necessary.',
      'Rule 4: Castle early to secure your King and bring your Rooks into the game.'
    ]
  }
};

export default function LessonDetailPage({ params }: { params: { lessonId: string } }) {
  const lessonId = params.lessonId || '1';
  const lesson = LESSON_DATA[lessonId] || LESSON_DATA['1'];
  const { tr } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

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
        ← {tr('Back to Lessons Library')}
      </Link>

      <div className="bg-background-secondary rounded-2xl p-6 md:p-8 border border-text-secondary/15 shadow-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30">
            {tr(lesson.category)}
          </span>
          <span className="text-xs text-text-secondary">{tr('Step')} {currentStep + 1} {tr('of')} {lesson.content.length}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{tr(lesson.title)}</h1>
        <p className="text-lg text-text-primary leading-relaxed bg-background-tertiary p-6 rounded-xl border border-text-secondary/10 mb-6">
          {tr(lesson.content[currentStep])}
        </p>

        {completed ? (
          <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-xl text-center">
            <h3 className="text-xl font-bold text-green-300 mb-2">{tr('Lesson Completed! 🎉')}</h3>
            <p className="text-sm text-text-secondary mb-4">{tr('You have successfully finished this lesson and earned XP.')}</p>
            <Link
              href="/learn"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl inline-block transition-colors"
            >
              {tr('Continue Learning')}
            </Link>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-xs text-text-secondary">{tr('Read and understand the concept to proceed.')}</span>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors shadow-md shadow-accent/20 flex items-center gap-2"
            >
              <span>{tr(currentStep === lesson.content.length - 1 ? 'Complete Lesson' : 'Next Step')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
