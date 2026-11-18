'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bot, ArrowRight, Zap, Target, Award } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

interface BotProfile {
  id: string;
  name: string;
  difficulty: string;
  elo: number;
  style: string;
  avatar: string;
  description: string;
}

const BOT_LIST: BotProfile[] = [
  { id: 'martin', name: 'Martin', difficulty: 'Beginner', elo: 100, style: 'Beginner Bot', avatar: '👶', description: 'Friendly and learning the rules.' },
  { id: 'simon', name: 'Simon', difficulty: 'Easy', elo: 300, style: 'Defensive Bot', avatar: '🛡️', description: 'Focuses on keeping his pieces safe.' },
  { id: 'pos', name: 'Positional', difficulty: 'Casual', elo: 500, style: 'Positional Bot', avatar: '♟️', description: 'Likes to control center squares.' },
  { id: 'agg', name: 'Aggressive', difficulty: 'Novice', elo: 700, style: 'Aggressive Bot', avatar: '🔥', description: 'Attacks early and often.' },
  { id: 'tactic', name: 'Tactical', difficulty: 'Intermediate', elo: 900, style: 'Tactical Bot', avatar: '⚡', description: 'Looks for simple forks and pins.' },
  { id: 'skilled', name: 'Nelson', difficulty: 'Skilled', elo: 1100, style: 'Advanced Bot', avatar: '🎯', description: 'Solid foundational play.' },
  { id: 'adv', name: 'Antonio', difficulty: 'Advanced', elo: 1300, style: 'Tactical Master', avatar: '🦊', description: 'Calculates sharp tactical lines.' },
  { id: 'expert', name: 'Wally', difficulty: 'Expert', elo: 1500, style: 'Expert Bot', avatar: '🧙‍♂️', description: 'Experienced tournament player.' },
  { id: 'master', name: 'Master', difficulty: 'Master', elo: 1800, style: 'Master Bot', avatar: '👑', description: 'Strong positional understanding.' },
  { id: 'gm', name: 'Grandmaster', difficulty: 'Grandmaster', elo: 2200, style: 'Grandmaster', avatar: '🏆', description: 'Professional FIDE Grandmaster level.' },
  { id: 'elite', name: 'Elite Bot', difficulty: 'Elite', elo: 2500, style: 'Elite Specialist', avatar: '💎', description: 'Flawless calculation and endgame mastery.' },
  { id: 'legend', name: 'Legendary', difficulty: 'Legendary', elo: 2800, style: 'Legendary AI', avatar: '🐉', description: 'Maximum engine depth and supreme skill.' },
];

export default function PlayBotsPage() {
  const [filter, setFilter] = useState('All');
  const { tr } = useI18n();

  const filteredBots = filter === 'All' ? BOT_LIST : BOT_LIST.filter(b => b.difficulty === filter);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full border border-accent/30 flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              {tr('Bot Arena & Practice')}
            </span>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{tr('Play Against Chess Bots')}</h1>
          <p className="mt-1 text-text-secondary">{tr('Choose from 12 difficulty tiers ranging from 100 ELO to 2800+ Grandmaster AI.')}</p>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-8 no-scrollbar">
        {['All', 'Beginner', 'Easy', 'Casual', 'Intermediate', 'Advanced', 'Expert', 'Master', 'Grandmaster'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary hover:text-text-primary border border-text-secondary/10'
            }`}
          >
            {tr(f)}
          </button>
        ))}
      </div>

      {/* Bot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBots.map((bot) => (
          <div
            key={bot.id}
            className="bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 hover:border-accent/40 transition-all flex flex-col justify-between group shadow-card"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl p-2 bg-background-tertiary rounded-2xl border border-text-secondary/10">
                  {bot.avatar}
                </span>
                <div className="text-end">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-accent/10 text-accent font-mono font-bold border border-accent/20">
                    {bot.elo} ELO
                  </span>
                  <p className="text-xs text-text-secondary mt-1">{tr(bot.difficulty)}</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-accent transition-colors">
                {bot.name}
              </h3>
              <p className="text-xs font-semibold text-accent mb-2">{tr(bot.style)}</p>
              <p className="text-text-secondary text-sm mb-6 line-clamp-2">
                {tr(bot.description)}
              </p>
            </div>

            <div className="pt-4 border-t border-text-secondary/10 flex items-center justify-between">
              <span className="text-xs text-text-secondary">{tr('Ready to play')}</span>
              <Link
                href={`/play?mode=bot&bot=${bot.id}&elo=${bot.elo}`}
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-accent/20 flex items-center gap-1.5"
              >
                <span>{tr('Play Now')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
