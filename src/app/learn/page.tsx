'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: string;
  completed: boolean;
  description: string;
}

const LESSONS: Lesson[] = [
  {
    id: '1',
    title: 'How the Chess Pieces Move',
    category: 'Chess Fundamentals',
    difficulty: 'Beginner',
    duration: '10 min',
    completed: true,
    description: 'Learn how every piece on the board moves, captures, and controls space.',
  },
  {
    id: '2',
    title: 'The Golden Rules of the Opening',
    category: 'Opening Principles',
    difficulty: 'Beginner',
    duration: '12 min',
    completed: true,
    description: 'Control the center, develop your minor pieces quickly, and keep your king safe.',
  },
  {
    id: '3',
    title: 'Basic Checkmate Patterns (Scholar\'s Mate & Rook Mates)',
    category: 'Checkmate Patterns',
    difficulty: 'Elementary',
    duration: '15 min',
    completed: false,
    description: 'Master the fundamental mating nets every chess player must know.',
  },
  {
    id: '4',
    title: 'Tactical Motifs: Forks, Pins, and Skewers',
    category: 'Tactical Patterns',
    difficulty: 'Intermediate',
    duration: '20 min',
    completed: false,
    description: 'Spot double attacks and win material by exploiting undefended pieces.',
  },
  {
    id: '5',
    title: 'Positional Strategy & Pawn Structures',
    category: 'Positional Strategy',
    difficulty: 'Advanced',
    duration: '25 min',
    completed: false,
    description: 'Understand weak squares, open files, outpost knights, and pawn chains.',
  },
  {
    id: '6',
    title: 'King and Pawn Endgames',
    category: 'Endgame',
    difficulty: 'Expert',
    duration: '30 min',
    completed: false,
    description: 'Master opposition, triangulation, and winning king and pawn endings.',
  },
];

export default function LearnAcademyPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { t, tr } = useI18n();

  const categories = ['All', 'Chess Fundamentals', 'Opening Principles', 'Checkmate Patterns', 'Tactical Patterns', 'Positional Strategy', 'Endgame'];

  const filteredLessons = selectedCategory === 'All'
    ? LESSONS
    : LESSONS.filter(l => l.category === selectedCategory);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              {t('chessAcademy')}
            </span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl text-text-primary">{t('interactiveLessons')}</h1>
          <p className="mt-1 text-text-secondary">{t('interactiveLessonsDesc')}</p>
        </div>
        <div className="bg-background-secondary p-4 rounded-2xl border border-text-secondary/15 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center text-accent font-bold">
            33%
          </div>
          <div>
            <p className="text-xs text-text-secondary">{t('learningProgress')}</p>
            <p className="font-semibold text-text-primary">2 / 6 {tr(t('completed').toLowerCase())}</p>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-8 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary border border-text-secondary/10'
            }`}
          >
            {tr(cat)}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 hover:border-accent/40 transition-all flex flex-col justify-between group shadow-card"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full bg-background-tertiary text-text-secondary border border-text-secondary/10">
                  {tr(lesson.difficulty)}
                </span>
                <span className="text-xs text-text-secondary font-mono">{lesson.duration}</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                {tr(lesson.title)}
              </h3>
              <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                {tr(lesson.description)}
              </p>
            </div>

            <div className="pt-4 border-t border-text-secondary/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lesson.completed ? (
                  <span className="flex items-center gap-1.5 text-xs text-green-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    {t('completed')}
                  </span>
                ) : (
                  <span className="text-xs text-text-secondary font-medium">{t('notStarted')}</span>
                )}
              </div>
              <Link
                href={`/learn/${lesson.id}`}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-md shadow-accent/20"
              >
                <span>{t('startLesson')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
