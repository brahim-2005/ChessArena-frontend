'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Radio, Eye, MessageSquare, Play, Send } from 'lucide-react';
import ChessBoard from '@/components/ChessBoard';
import { createGame, GameEngine } from '@/lib/chess/game';
import { useI18n } from '@/lib/i18n/context';

export default function LiveStreamRoomPage() {
  const { tr } = useI18n();
  const [engine] = useState<GameEngine>(() => createGame());
  const [messages, setMessages] = useState<{ user: string; text: string }[]>([
    { user: 'ChessFan99', text: 'Amazing rook sacrifice coming up!' },
    { user: 'Grandmaster_Fan', text: 'GM Alexander is calculating deeply here.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { user: 'You', text: input }]);
    setInput('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full border border-red-500/30 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              {tr('LIVE BROADCAST')}
            </span>
            <span className="text-xs text-text-secondary flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-accent" /> 1,420 {tr('viewers')}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{tr('GM Alexander vs IM Petrov — Blitz Arena Final')}</h1>
        </div>
        <Link href="/live" className="px-4 py-2 bg-background-secondary hover:bg-background-tertiary text-text-secondary hover:text-text-primary border border-text-secondary/15 rounded-xl text-sm font-semibold">
          {tr('Back to Live Hub')}
        </Link>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-background-secondary rounded-2xl p-6 border border-text-secondary/15 flex flex-col items-center justify-center shadow-card">
          <div className="w-full max-w-lg">
            <ChessBoard
              engine={engine}
              onReset={() => engine.reset()}
              isWhitePlayer={true}
              isHotSeat={false}
              isInputEnabled={false}
            />
          </div>
        </div>

        {/* Live Chat */}
        <div className="bg-background-secondary rounded-2xl p-4 border border-text-secondary/15 flex flex-col h-[520px] shadow-card">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            {tr('Live Viewer Chat')}
          </h3>
          <div className="flex-1 space-y-3 overflow-y-auto mb-3 pe-1">
            {messages.map((m, i) => (
              <div key={i} className="bg-background-tertiary rounded-xl p-3 text-sm">
                <p className="font-bold text-xs text-accent mb-0.5">{m.user}</p>
                <p className="text-text-primary">{m.text}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              placeholder={tr('Send a message...')}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 rounded-xl border border-text-secondary/20 bg-background-tertiary px-3 py-2 text-sm text-text-primary"
            />
            <button type="submit" aria-label={tr('Send message')} className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-xl font-semibold transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
