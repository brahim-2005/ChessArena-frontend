'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Radio, Users, Eye, Play, Plus, Video, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface LiveStream {
  id: string;
  title: string;
  streamer: string;
  rating: number;
  viewers: number;
  timeControl: string;
  fen: string;
  isTournament: boolean;
}

const MOCK_STREAMS: LiveStream[] = [
  {
    id: 'stream-1',
    title: 'Grandmaster Blitz Arena Showcase — Road to 3000',
    streamer: 'GM Alexander',
    rating: 2780,
    viewers: 1420,
    timeControl: '3+0 Blitz',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/4p3/1b1PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 2 5',
    isTournament: false,
  },
  {
    id: 'stream-2',
    title: 'ChessArena Friday Championship Final - Round 5',
    streamer: 'ChessArena Official',
    rating: 2550,
    viewers: 890,
    timeControl: '5+2 Rapid',
    fen: 'r1b2rk1/pp3ppp/2n1p3/3pP3/3P4/2PB1N2/P4PPP/R2Q1RK1 b - - 1 12',
    isTournament: true,
  },
  {
    id: 'stream-3',
    title: 'Tactical Puzzle Battle & Viewer Challenges',
    streamer: 'IM Elena',
    rating: 2490,
    viewers: 410,
    timeControl: 'Bullet 1+0',
    fen: '8/8/4k3/8/3K4/8/4Q3/8 w - - 0 1',
    isTournament: false,
  },
];

export default function LiveBroadcastsPage() {
  const [streams] = useState<LiveStream[]>(MOCK_STREAMS);
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              {t('liveBroadcasts')}
            </span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{t('watchLiveChess')}</h1>
          <p className="mt-1 text-text-secondary">{t('liveBroadcastsDesc')}</p>
        </div>
        <Link
          href="/play"
          className="px-5 py-3 bg-accent hover:bg-accent-hover text-white font-semibold rounded-xl transition-colors shadow-lg shadow-accent/30 flex items-center gap-2 self-start"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{t('broadcastYourGame')}</span>
        </Link>
      </header>

      {/* Featured Stream Banner */}
      <div className="bg-background-secondary rounded-2xl p-6 md:p-8 border border-text-secondary/15 mb-8 relative overflow-hidden shadow-card">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center relative z-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-md uppercase tracking-wider">
                {t('liveNow')}
              </span>
              <span className="text-sm text-text-secondary flex items-center gap-1">
                <Eye className="w-4 h-4 text-accent" />
                1,420 {t('watching')}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold">Grandmaster Blitz Arena Showcase — Road to 3000</h2>
            <p className="text-text-secondary text-sm">
              GM Alexander is playing high-stakes blitz games with live evaluation bar and real-time move commentary. Join the chat and analyze along!
            </p>
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/20 text-accent font-bold flex items-center justify-center">
                  GM
                </div>
                <div>
                  <p className="font-bold">GM Alexander</p>
                  <p className="text-xs text-text-secondary">Rating 2780 · {t('blitzSpecialist')}</p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <Link
              href="/live/stream-1"
              className="w-full py-4 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-colors shadow-lg shadow-accent/30 flex items-center justify-center gap-2"
            >
              <Radio className="w-5 h-5 animate-pulse" />
              <span>{t('watchLiveBroadcast')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stream Grid */}
      <h2 className="text-xl font-bold mb-4">{t('allActiveBroadcasts')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {streams.map((stream) => (
          <div
            key={stream.id}
            className="bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 hover:border-accent/40 transition-all flex flex-col justify-between group shadow-card"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2.5 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  {t('liveNow')}
                </span>
                <span className="text-xs text-text-secondary flex items-center gap-1 font-mono">
                  <Eye className="w-3.5 h-3.5 text-accent" />
                  {stream.viewers} {t('viewers')}
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                {stream.title}
              </h3>
              <p className="text-text-secondary text-sm mb-4">
                {stream.streamer} ({stream.rating}) · {stream.timeControl}
              </p>
            </div>

            <div className="pt-4 border-t border-text-secondary/10 flex items-center justify-between">
              <span className="text-xs text-text-secondary">{stream.isTournament ? t('officialTournament') : t('casualStream')}</span>
              <Link
                href={`/live/${stream.id}`}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-accent/20"
              >
                {t('watch')}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
