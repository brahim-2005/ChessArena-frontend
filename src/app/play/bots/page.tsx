'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Bot, Check, History, Shield, Sparkles, Zap } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import {
  BOT_PROFILES,
  BOT_PROFILE_DESCRIPTION_KEYS,
  BOT_PROFILE_NAME_KEYS,
  BOT_TIME_CONTROLS,
  type BotFormat,
  type BotProfileId,
} from '@/lib/chess/botProfiles';
import type { TranslationKey } from '@/lib/i18n/translations';

const FORMAT_KEYS: Record<BotFormat, TranslationKey> = {
  bullet: 'formatBullet',
  blitz: 'formatBlitz',
  rapid: 'formatRapid',
  classical: 'formatClassical',
};

export default function PlayBotsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [selectedBotId, setSelectedBotId] = useState<BotProfileId>('casual');
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [format, setFormat] = useState<BotFormat>('blitz');
  const [timeControl, setTimeControl] = useState(BOT_TIME_CONTROLS.blitz[0]);

  const startGame = () => {
    const profile = BOT_PROFILES.find((bot) => bot.id === selectedBotId);
    if (!profile) throw new Error('The selected computer opponent is unavailable.');
    const query = new URLSearchParams({
      mode: 'bot',
      bot: profile.id,
      elo: String(profile.elo),
      color: playerColor,
      format,
      tc: timeControl,
    });
    router.push(`/play?${query.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            <Bot className="h-3.5 w-3.5" />
            {t('botChooseOpponent')}
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">{t('botArenaTitle')}</h1>
          <p className="mt-2 max-w-2xl text-sm text-text-secondary md:text-base">
            {t('botArenaDescription')}
          </p>
        </div>
        <Link
          href="/play/bots/history"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-text-secondary/20 bg-background-secondary px-4 py-2.5 text-sm font-semibold hover:border-accent/50 hover:text-accent"
        >
          <History className="h-4 w-4" />
          {t('botHistory')}
        </Link>
      </header>

      <section aria-labelledby="opponent-heading">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 id="opponent-heading" className="text-xl font-bold">{t('botChooseOpponent')}</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BOT_PROFILES.map((profile) => {
            const selected = profile.id === selectedBotId;
            const nameKey = BOT_PROFILE_NAME_KEYS[profile.id];
            return (
              <button
                type="button"
                key={profile.id}
                aria-pressed={selected}
                onClick={() => setSelectedBotId(profile.id)}
                className={`group rounded-2xl border p-5 text-start shadow-card transition-all hover:-translate-y-0.5 ${
                  selected
                    ? 'border-accent bg-accent/10 ring-2 ring-accent/30'
                    : 'border-text-secondary/15 bg-background-secondary hover:border-accent/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-text-secondary/10 bg-background-tertiary text-3xl">
                    {profile.avatar}
                  </span>
                  <div className="flex flex-col items-end gap-2">
                    <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-1 font-mono text-xs font-bold text-accent">
                      {profile.elo} ELO
                    </span>
                    {selected && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">
                        <Check className="h-3 w-3" />
                        {t('botSelected')}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-bold group-hover:text-accent">{t(nameKey)}</h3>
                <p className="mt-1 min-h-10 text-sm text-text-secondary">
                  {t(BOT_PROFILE_DESCRIPTION_KEYS[profile.id])}
                </p>
                <div className="mt-4 flex items-center gap-2 border-t border-text-secondary/10 pt-3 text-xs text-text-secondary">
                  <Zap className="h-3.5 w-3.5 text-accent" />
                  <span>{profile.elo} ELO · {t('botApproximateElo')}</span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
          <Shield className="h-4 w-4 shrink-0 text-accent" />
          {t('botApproximateElo')}
        </p>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-text-secondary/15 bg-background-secondary p-5 shadow-card">
          <h2 className="mb-4 text-lg font-bold">{t('botChooseColor')}</h2>
          <div className="grid grid-cols-2 gap-3">
            {(['w', 'b'] as const).map((color) => (
              <button
                key={color}
                type="button"
                aria-pressed={playerColor === color}
                onClick={() => setPlayerColor(color)}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  playerColor === color
                    ? 'border-accent bg-accent text-white'
                    : 'border-text-secondary/20 bg-background-tertiary hover:border-accent/50'
                }`}
              >
                {color === 'w' ? t('white') : t('black')}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-text-secondary/15 bg-background-secondary p-5 shadow-card">
          <h2 className="mb-4 text-lg font-bold">{t('botChooseFormat')}</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(BOT_TIME_CONTROLS) as BotFormat[]).map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={format === item}
                onClick={() => {
                  setFormat(item);
                  setTimeControl(BOT_TIME_CONTROLS[item][0]);
                }}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  format === item
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-text-secondary/20 bg-background-tertiary text-text-secondary hover:border-accent/50'
                }`}
              >
                {t(FORMAT_KEYS[item])}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-text-secondary">
            {t('timeControl')}
            <select
              value={timeControl}
              onChange={(event) => setTimeControl(event.target.value)}
              className="mt-2 block w-full rounded-xl border border-text-secondary/20 bg-background-tertiary px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-text-primary focus:border-accent focus:outline-none"
            >
              {BOT_TIME_CONTROLS[format].map((control) => (
                <option key={control} value={control}>{control}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-accent/25 bg-accent/5 p-4 text-sm text-text-secondary sm:flex-row sm:items-center">
        <Sparkles className="h-5 w-5 shrink-0 text-accent" />
        <p>{t('botFullStrengthNote')}</p>
      </div>

      <div className="sticky bottom-3 z-10 mt-6 flex flex-col gap-3 rounded-2xl border border-text-secondary/15 bg-background/95 p-3 shadow-2xl backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="text-sm">
          <p className="font-bold">{t(BOT_PROFILE_NAME_KEYS[selectedBotId])} · {BOT_PROFILES.find((bot) => bot.id === selectedBotId)?.elo} ELO</p>
          <p className="text-xs text-text-secondary">
            {playerColor === 'w' ? t('white') : t('black')} · {t(FORMAT_KEYS[format])} · {timeControl}
          </p>
        </div>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-white shadow-lg shadow-accent/20 transition-colors hover:bg-accent-hover"
        >
          {t('botStartGame')}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
