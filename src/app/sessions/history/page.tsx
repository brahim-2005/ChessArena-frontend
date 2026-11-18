'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Video, Calendar, Clock, ArrowRight, Play, CheckCircle2 } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

export default function SessionsHistoryPage() {
  const { tr } = useI18n();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">{tr('My Coaching Sessions')}</h1>
          <p className="mt-1 text-text-secondary">{tr('View upcoming scheduled classes and past session recordings.')}</p>
        </div>
        <Link
          href="/sessions"
          className="px-5 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors shadow-lg shadow-accent/30 self-start"
        >
          {tr('Book New Session')}
        </Link>
      </header>

      <div className="space-y-6">
        <div className="bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
          <div className="flex items-center gap-x-4">
            <div className="w-12 h-12 rounded-xl bg-accent/20 text-accent flex items-center justify-center font-bold text-lg">
              GM
            </div>
            <div>
              <span className="px-2.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                {tr('Upcoming')}
              </span>
              <h3 className="text-lg font-bold text-text-primary mt-1">{tr('1-on-1 Tactical Mastery with GM David Vance')}</h3>
              <p className="text-sm text-text-secondary flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {tr('Nov 15, 2026')}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> 14:00 UTC</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              href="/classroom/demo-session"
              className="flex-1 md:flex-none px-6 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors shadow-md shadow-accent/25 flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>{tr('Join Virtual Classroom')}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
