'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, History, LoaderCircle, Search } from 'lucide-react';
import ChessBoard from '@/components/ChessBoard';
import { useI18n } from '@/lib/i18n/context';
import {
  BOT_PROFILE_NAME_KEYS,
  BOT_PROFILES,
  type BotProfileId,
} from '@/lib/chess/botProfiles';
import {
  getBotGameStats,
  getBotGames,
  updateBotGameAnalysis,
  type BotGameRecord,
  type BotGameResult,
} from '@/lib/chess/botGameHistory';
import { analyzeBotGame } from '@/lib/chess/botGameAnalysis';
import { createGame, type GameEngine } from '@/lib/chess/game';
import type { StockfishProgress } from '@/lib/chess/stockfishClient';

type ResultFilter = 'all' | BotGameResult;

const FORMAT_KEYS = {
  bullet: 'formatBullet',
  blitz: 'formatBlitz',
  rapid: 'formatRapid',
  classical: 'formatClassical',
} as const;

function rebuildGame(record: BotGameRecord, plies: number): GameEngine {
  const game = createGame();
  for (const uciMove of record.uciMoves.slice(0, plies)) {
    const match = /^([a-h][1-8])([a-h][1-8])([qrbn])?$/.exec(uciMove);
    if (!match) throw new Error(`Saved game contains an invalid move: ${uciMove}.`);
    const promotion = match[3] === 'q' || match[3] === 'r' || match[3] === 'b' || match[3] === 'n'
      ? match[3]
      : 'q';
    const result = game.moveFromSquares(match[1], match[2], promotion);
    if (!result.success) throw new Error(`Saved game contains an illegal move: ${uciMove}.`);
  }
  return game;
}

function BotGameHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language, t } = useI18n();
  const requestedGameId = searchParams.get('game');
  const [records, setRecords] = useState<BotGameRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [botFilter, setBotFilter] = useState<'all' | BotProfileId>('all');
  const [replayPly, setReplayPly] = useState(0);
  const [replayEngine, setReplayEngine] = useState<GameEngine | null>(null);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [analysisProgress, setAnalysisProgress] = useState<{ completed: number; total: number } | null>(null);
  const [engineProgress, setEngineProgress] = useState<StockfishProgress | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedGames = getBotGames();
      setRecords(savedGames);
      const selectedGame = savedGames.find((game) => game.id === requestedGameId) ?? savedGames[0];
      setSelectedId(selectedGame?.id ?? null);
      setReplayPly(selectedGame?.uciMoves.length ?? 0);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Saved game history could not be loaded.');
    }
  }, [requestedGameId]);

  const selectedGame = records.find((record) => record.id === selectedId) ?? null;
  const filteredGames = records.filter((record) =>
    (resultFilter === 'all' || record.result === resultFilter)
    && (botFilter === 'all' || record.botId === botFilter),
  );
  const stats = getBotGameStats(records, botFilter === 'all' ? undefined : botFilter);

  useEffect(() => {
    if (!selectedGame) {
      setReplayEngine(null);
      setReplayError(null);
      return;
    }
    try {
      setReplayEngine(rebuildGame(selectedGame, replayPly));
      setReplayError(null);
    } catch (replayFailure) {
      setReplayEngine(null);
      setReplayError(replayFailure instanceof Error ? replayFailure.message : 'The saved game cannot be replayed.');
    }
  }, [replayPly, selectedGame]);

  const selectGame = (record: BotGameRecord) => {
    setSelectedId(record.id);
    setReplayPly(record.uciMoves.length);
    router.replace(`/play/bots/history?game=${encodeURIComponent(record.id)}`, { scroll: false });
  };

  const runAnalysis = async () => {
    if (!selectedGame || analyzing) return;
    setAnalyzing(true);
    setError(null);
    setAnalysisProgress({ completed: 0, total: selectedGame.uciMoves.length });
    setEngineProgress(null);
    try {
      const analysis = await analyzeBotGame(
        selectedGame,
        (completed, total) => setAnalysisProgress({ completed, total }),
        setEngineProgress,
      );
      updateBotGameAnalysis(selectedGame.id, analysis);
      setRecords(getBotGames());
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : t('botEngineFailure'));
    } finally {
      setAnalyzing(false);
      setEngineProgress(null);
    }
  };

  const resultText = (result: BotGameResult) => (
    result === 'win' ? t('botVictory') : result === 'loss' ? t('botDefeat') : t('botDraw')
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/play/bots" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-text-secondary hover:text-accent">
            <ArrowLeft className="h-4 w-4" />
            {t('botChangeOpponent')}
          </Link>
          <h1 className="text-3xl font-bold md:text-4xl">{t('botHistoryTitle')}</h1>
          <p className="mt-2 text-sm text-text-secondary">{t('botHistoryDescription')}</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-text-secondary/15 bg-background-secondary px-4 py-3 text-xs text-text-secondary">
          <History className="h-4 w-4 shrink-0 text-accent" />
          {t('botSavedOnDevice')}
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          [t('botGamesPlayed'), stats.games],
          [t('botWins'), stats.wins],
          [t('botLosses'), stats.losses],
          [t('botWinRate'), `${stats.winRate}%`],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-text-secondary/15 bg-background-secondary p-4 shadow-card">
            <p className="text-xs font-semibold text-text-secondary">{label}</p>
            <p className="mt-1 text-2xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <label className="flex items-center gap-2 rounded-xl border border-text-secondary/15 bg-background-secondary px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-accent" />
          <span className="sr-only">{t('botChooseOpponent')}</span>
          <select
            value={botFilter}
            onChange={(event) => setBotFilter(event.target.value as 'all' | BotProfileId)}
            className="bg-transparent text-text-primary focus:outline-none"
          >
            <option value="all">{t('botChooseOpponent')}</option>
            {BOT_PROFILES.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {t(BOT_PROFILE_NAME_KEYS[profile.id])} · {profile.elo}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'win', 'loss', 'draw'] as ResultFilter[]).map((filter) => {
            const labelKey = filter === 'all'
              ? 'botFilterAll'
              : filter === 'win' ? 'botFilterWins' : filter === 'loss' ? 'botFilterLosses' : 'botFilterDraws';
            return (
              <button
                key={filter}
                type="button"
                aria-pressed={resultFilter === filter}
                onClick={() => setResultFilter(filter)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                  resultFilter === filter
                    ? 'border-accent bg-accent/15 text-accent'
                    : 'border-text-secondary/15 bg-background-secondary text-text-secondary hover:border-accent/40'
                }`}
              >
                {t(labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {records.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-text-secondary/25 bg-background-secondary p-10 text-center">
          <BotEmptyState />
          <p className="mt-3 text-text-secondary">{t('botNoGames')}</p>
          <Link href="/play/bots" className="mt-5 inline-flex rounded-xl bg-accent px-5 py-2.5 font-bold text-white hover:bg-accent-hover">
            {t('botStartGame')}
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.5fr)]">
          <section aria-label={t('botHistoryTitle')} className="space-y-3">
            {filteredGames.length === 0 ? (
              <p className="rounded-xl bg-background-secondary p-5 text-sm text-text-secondary">{t('botNoGames')}</p>
            ) : filteredGames.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => selectGame(record)}
                aria-pressed={selectedId === record.id}
                className={`w-full rounded-2xl border p-4 text-start transition-colors ${
                  selectedId === record.id
                    ? 'border-accent bg-accent/10'
                    : 'border-text-secondary/15 bg-background-secondary hover:border-accent/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold">{t(BOT_PROFILE_NAME_KEYS[record.botId])} · {record.botElo}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    record.result === 'win' ? 'bg-green-500/15 text-green-400'
                      : record.result === 'loss' ? 'bg-red-500/15 text-red-400'
                        : 'bg-text-secondary/15 text-text-secondary'
                  }`}>
                    {resultText(record.result)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-text-secondary">
                  {new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(record.playedAt))}
                </p>
                <p className="mt-1 text-xs text-text-secondary">
                  {t(FORMAT_KEYS[record.format])} · {record.timeControl} · {record.sanMoves.length} moves
                </p>
              </button>
            ))}
          </section>

          {selectedGame && (
            <section className="min-w-0 space-y-5">
              <div className="rounded-2xl border border-text-secondary/15 bg-background-secondary p-4 shadow-card">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-bold">{t(BOT_PROFILE_NAME_KEYS[selectedGame.botId])} · {selectedGame.botElo} ELO</h2>
                    <p className="text-xs text-text-secondary">
                      {t(FORMAT_KEYS[selectedGame.format])} · {selectedGame.timeControl}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReplayPly((ply) => Math.max(0, ply - 1))}
                      disabled={replayPly === 0}
                      aria-label="Previous move"
                      className="rounded-lg border border-text-secondary/20 p-2 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplayPly((ply) => Math.min(selectedGame.uciMoves.length, ply + 1))}
                      disabled={replayPly >= selectedGame.uciMoves.length}
                      aria-label="Next move"
                      className="rounded-lg border border-text-secondary/20 p-2 disabled:opacity-40"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <Link
                      href={`/play?mode=bot&bot=${selectedGame.botId}&elo=${selectedGame.botElo}&color=${selectedGame.playerColor}&format=${selectedGame.format}&tc=${encodeURIComponent(selectedGame.timeControl)}`}
                      className="rounded-lg bg-accent px-3 py-2 text-xs font-bold text-white hover:bg-accent-hover"
                    >
                      {t('botRematch')}
                    </Link>
                  </div>
                </div>
                <p className="mb-2 text-center text-xs text-text-secondary">
                  {replayPly} / {selectedGame.uciMoves.length} plies
                </p>
                {replayError ? (
                  <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{replayError}</p>
                ) : replayEngine ? (
                  <ChessBoard
                    key={selectedGame.id}
                    engine={replayEngine}
                    onReset={() => undefined}
                    isWhitePlayer={selectedGame.playerColor === 'w'}
                    isInputEnabled={false}
                    allowUndo={false}
                    allowReset={false}
                    whiteName={selectedGame.playerColor === 'w' ? 'You' : t(BOT_PROFILE_NAME_KEYS[selectedGame.botId])}
                    blackName={selectedGame.playerColor === 'b' ? 'You' : t(BOT_PROFILE_NAME_KEYS[selectedGame.botId])}
                    whiteRating={selectedGame.playerColor === 'w' ? 200 : selectedGame.botElo}
                    blackRating={selectedGame.playerColor === 'b' ? 200 : selectedGame.botElo}
                    initialOrientation={selectedGame.playerColor === 'w' ? 'white' : 'black'}
                  />
                ) : null}
              </div>

              <div className="rounded-2xl border border-text-secondary/15 bg-background-secondary p-5 shadow-card">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-bold">{t('botAnalyzeGame')}</h2>
                    <p className="mt-1 text-xs text-text-secondary">{t('botApproximateElo')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void runAnalysis()}
                    disabled={analyzing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"
                  >
                    {analyzing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                    {analyzing ? t('botAnalyzing') : t('botRunAnalysis')}
                  </button>
                </div>
                {analyzing && (
                  <div role="status" className="mt-4 rounded-xl bg-background-tertiary p-3 text-sm text-text-secondary">
                    {engineProgress?.phase === 'download'
                      ? `${t('botEngineDownloading')} ${engineProgress.totalBytes
                        ? `${Math.floor((engineProgress.loadedBytes / engineProgress.totalBytes) * 100)}%`
                        : `${(engineProgress.loadedBytes / 1024 / 1024).toFixed(1)} MB`}`
                      : `${t('botAnalysisProgress')}: ${analysisProgress?.completed ?? 0} / ${analysisProgress?.total ?? selectedGame.uciMoves.length}`}
                  </div>
                )}
                {selectedGame.analysis && (
                  <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {[
                        [t('botEstimatedAccuracy'), `${selectedGame.analysis.accuracy}%`],
                        [t('botBestMoves'), selectedGame.analysis.best],
                        [t('botGoodMoves'), selectedGame.analysis.good],
                        [t('botInaccuracies'), selectedGame.analysis.inaccuracies],
                        [t('botMistakes'), selectedGame.analysis.mistakes],
                        [t('botBlunders'), selectedGame.analysis.blunders],
                      ].map(([label, value]) => (
                        <div key={String(label)} className="rounded-xl bg-background-tertiary p-3">
                          <p className="text-xs text-text-secondary">{label}</p>
                          <p className="mt-1 text-xl font-black">{value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="max-h-80 overflow-y-auto rounded-xl border border-text-secondary/10">
                      <table className="w-full text-start text-sm">
                        <thead className="sticky top-0 bg-background-tertiary text-xs text-text-secondary">
                          <tr>
                            <th className="p-3">#</th>
                            <th className="p-3">Move</th>
                            <th className="p-3">{t('botBestMove')}</th>
                            <th className="p-3">{t('botEstimatedAccuracy')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedGame.analysis.moves
                            .filter((move) => move.color === selectedGame.playerColor)
                            .map((move) => (
                              <tr key={move.ply} className="border-t border-text-secondary/10">
                                <td className="p-3 text-text-secondary">{Math.ceil(move.ply / 2)}{move.color === 'b' ? '…' : '.'}</td>
                                <td className="p-3 font-semibold">{move.san}</td>
                                <td className="p-3 text-accent">{move.bestMoveSan}</td>
                                <td className="p-3 capitalize text-text-secondary">{move.classification} · {move.lossCp} cp</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function BotEmptyState() {
  return <History className="mx-auto h-10 w-10 text-accent" />;
}

export default function BotGameHistoryPage() {
  return (
    <Suspense fallback={<p role="status" className="p-8 text-center text-text-secondary">Loading game history…</p>}>
      <BotGameHistoryContent />
    </Suspense>
  );
}
