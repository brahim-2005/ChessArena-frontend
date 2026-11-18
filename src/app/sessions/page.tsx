'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Video, Calendar, Star, Users, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface Coach {
  id: string;
  name: string;
  title: string;
  rating: number;
  hourlyRate: number;
  ratingScore: number;
  reviewsCount: number;
  specialization: string;
  bio: string;
}

const COACHES: Coach[] = [
  {
    id: 'coach-1',
    name: 'GM David Vance',
    title: 'Grandmaster',
    rating: 2620,
    hourlyRate: 75,
    ratingScore: 4.9,
    reviewsCount: 142,
    specialization: 'Tactics & Opening Repertoires',
    bio: 'FIDE Grandmaster with 10+ years of professional coaching experience. Specialized in positional mastery and tactical calculation.',
  },
  {
    id: 'coach-2',
    name: 'IM Sarah Jenkins',
    title: 'International Master',
    rating: 2450,
    hourlyRate: 55,
    ratingScore: 5.0,
    reviewsCount: 98,
    specialization: 'Endgame Mastery & Strategy',
    bio: 'Professional chess coach and national team trainer. Focused on structured improvement for intermediate and advanced players.',
  },
  {
    id: 'coach-3',
    name: 'FM Marcus Aurelius',
    title: 'FIDE Master',
    rating: 2340,
    hourlyRate: 40,
    ratingScore: 4.8,
    reviewsCount: 76,
    specialization: 'Beginner Foundations & Tactics',
    bio: 'Passionate coach helping players break through the 1500 and 2000 rating barriers with personalized game reviews.',
  },
];

export default function SessionsPage() {
  const [coaches] = useState<Coach[]>(COACHES);
  const { t, tr } = useI18n();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30 flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5" />
              {t('coachingAndClassrooms')}
            </span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{t('coachingAndClassrooms')}</h1>
          <p className="mt-1 text-text-secondary">{t('coachingDesc')}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/sessions/history"
            className="px-4 py-2.5 bg-background-secondary hover:bg-background-tertiary text-text-primary font-semibold rounded-xl border border-text-secondary/15 transition-colors text-sm"
          >
            {t('mySessions')}
          </Link>
        </div>
      </header>

      {/* Featured Banner */}
      <div className="bg-background-secondary rounded-2xl p-6 md:p-8 border border-text-secondary/15 mb-8 shadow-card">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-bold mb-2">{tr('Accelerate Your Chess Rating with Expert Coaches')}</h2>
          <p className="text-text-secondary text-sm mb-6">
            {tr('Get personalized game analysis, custom opening repertoires, and live interactive board coaching with certified masters.')}
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" /> {tr('Shared Interactive Board')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" /> {tr('Live Video & Audio Calls')}</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-accent" /> {tr('Recorded Session Playback')}</span>
          </div>
        </div>
      </div>

      {/* Coach Directory */}
      <h2 className="text-xl font-bold mb-6">{tr('Featured Chess Coaches')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 hover:border-accent/40 transition-all flex flex-col justify-between group shadow-card"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30">
                  {tr(coach.title)}
                </span>
                <span className="text-sm font-bold font-mono text-accent">${coach.hourlyRate}/hr</span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-1 group-hover:text-accent transition-colors">
                {coach.name}
              </h3>
              <p className="text-xs text-text-secondary mb-3">{tr('Rating')}: {coach.rating} · ⭐ {coach.ratingScore} ({coach.reviewsCount} {tr('reviews')})</p>
              <p className="text-xs font-semibold text-accent mb-3">{tr(coach.specialization)}</p>
              <p className="text-text-secondary text-sm mb-6 line-clamp-3">
                {tr(coach.bio)}
              </p>
            </div>

            <div className="pt-4 border-t border-text-secondary/10 flex items-center justify-between">
              <span className="text-xs text-text-secondary">{tr('Available Today')}</span>
              <Link
                href={`/sessions/book?coach=${coach.id}`}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-accent/20 flex items-center gap-1.5"
              >
                <span>{t('bookLesson')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
