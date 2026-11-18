'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import ChessBoard from '@/components/ChessBoard';
import PlayAFriendModal from '@/components/PlayAFriendModal';
import { chooseBotMoveAsync } from '@/lib/chess/bot';
import { createGame, GameEngine } from '@/lib/chess/game';
import { Bot, User, ArrowLeft, RotateCcw, UserPlus, Sparkles } from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';

const TIME_CONTROLS = ['1+0', '3+0', '3+2', '5+0', '10+0', '10+5', '15+10'];

type MatchStatus = 'idle' | 'queued';
type LocalOpponent = 'bot' | 'hotseat';

function PlayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { tr } = useI18n();

  const modeParam = searchParams.get('mode');
  const botParam = searchParams.get('bot');
  const eloParam = searchParams.get('elo');

  const [gameEngine, setGameEngine] = useState<GameEngine | null>(() => createGame());
  const [mode, setMode] = useState<'online' | 'local'>(modeParam === 'bot' ? 'local' : 'online');
  const [localOpponent, setLocalOpponent] = useState<LocalOpponent>(modeParam === 'bot' ? 'bot' : 'bot');
  const [humanColor, setHumanColor] = useState<'w' | 'b'>('w');
  const [botDifficulty, setBotDifficulty] = useState<string>(eloParam || 'medium');
  const [botName, setBotName] = useState<string>(botParam ? botParam.charAt(0).toUpperCase() + botParam.slice(1) : 'Computer');
  const [botElo, setBotElo] = useState<number>(eloParam ? parseInt(eloParam, 10) : 200);
  const [botThinking, setBotThinking] = useState(false);
  const botRequestRef = useRef(0);
  const [timeControl, setTimeControl] = useState('3+2');
  const [matchStatus, setMatchStatus] = useState<MatchStatus>('idle');
  const [matching, setMatching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPlayAFriendOpen, setIsPlayAFriendOpen] = useState(false);
  const [incomingInvitesCount, setIncomingInvitesCount] = useState(0);

  useEffect(() => {
    if (modeParam === 'bot' && botParam) {
      setMode('local');
      setLocalOpponent('bot');
      if (eloParam) {
        setBotDifficulty(eloParam);
        setBotElo(parseInt(eloParam, 10));
      }
      setBotName(botParam.charAt(0).toUpperCase() + botParam.slice(1));
    }
  }, [modeParam, botParam, eloParam]);

  // Poll for incoming invitations count badge
  useEffect(() => {
    if (!user) return;
    let active = true;
    const checkInvites = async () => {
      try {
        const response = await fetch('/api/invitations', { cache: 'no-store' });
        const payload = await response.json();
        if (active && response.ok) {
          setIncomingInvitesCount((payload.received || []).length);
        }
      } catch (err) {
        // silent
      }
    };
    void checkInvites();
    const interval = setInterval(() => void checkInvites(), 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [user]);

  useEffect(() => {
    if (!user || matchStatus !== 'queued') return;

    let active = true;
    const checkMatch = async () => {
      try {
        const response = await fetch('/api/matchmaking', { cache: 'no-store' });
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to check matchmaking.');
        }
        if (active && payload.status === 'matched' && typeof payload.gameId === 'string') {
          setMatchStatus('idle');
          router.push(`/game/${encodeURIComponent(payload.gameId)}`);
        } else if (active && payload.status === 'idle') {
          setMatchStatus('idle');
        }
      } catch (pollError) {
        if (active) {
          setError(pollError instanceof Error ? pollError.message : 'Unable to check matchmaking.');
        }
      }
    };

    const intervalId = window.setInterval(() => void checkMatch(), 2000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [matchStatus, router, user]);

  const runBotTurn = async (engine: GameEngine, playerColor: 'w' | 'b', difficulty: string) => {
    const requestId = ++botRequestRef.current;
    setBotThinking(true);
    setError(null);
    try {
      await new Promise<void>((resolve) => window.setTimeout(resolve, 400));
      if (botRequestRef.current !== requestId) return;
      const botColor = playerColor === 'w' ? 'b' : 'w';
      const move = await chooseBotMoveAsync(engine.fen, botColor, difficulty, () => botRequestRef.current !== requestId);
      if (botRequestRef.current !== requestId) return;
      if (!move) {
        if (!engine.gameOver) setError('The computer could not find a legal move.');
        return;
      }

      const result = engine.moveFromSquares(move.from, move.to, move.promotion);
      if (!result.success) {
        setError('The computer returned an invalid move. Start a new game to continue.');
        return;
      }
    } catch (botError) {
      if (botRequestRef.current === requestId) {
        console.error('Computer move search failed:', botError);
        setError(botError instanceof Error ? botError.message : 'The computer could not calculate a move.');
      }
    } finally {
      if (botRequestRef.current === requestId) setBotThinking(false);
    }
  };

  const handleLocalMove = () => {
    if (!gameEngine) return;
    if (localOpponent === 'bot' && gameEngine.turn !== humanColor && !gameEngine.gameOver) {
      void runBotTurn(gameEngine, humanColor, botDifficulty);
    }
  };

  const startLocalGame = (opponent: LocalOpponent, color = humanColor, difficulty = botDifficulty) => {
    botRequestRef.current += 1;
    setLocalOpponent(opponent);
    setHumanColor(color);
    setBotDifficulty(difficulty);
    setError(null);
    setBotThinking(false);
    const newGame = createGame();
    setGameEngine(newGame);
    if (opponent === 'bot' && color === 'b') {
      void runBotTurn(newGame, color, difficulty);
    }
  };

  const handleJoinMatch = async () => {
    setMatching(true);
    setError(null);
    try {
      const response = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'join', timeControl }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to join matchmaking.');
      }
      if (payload.status === 'matched' && typeof payload.gameId === 'string') {
        router.push(`/game/${encodeURIComponent(payload.gameId)}`);
      } else if (payload.status === 'queued') {
        setMatchStatus('queued');
      } else {
        throw new Error('The matchmaking service returned an unexpected response.');
      }
    } catch (joinError) {
      setError(joinError instanceof Error ? joinError.message : 'Unable to join matchmaking.');
    } finally {
      setMatching(false);
    }
  };

  const handleLeaveMatch = async () => {
    setMatching(true);
    setError(null);
    try {
      const response = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'leave' }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to leave matchmaking.');
      }
      setMatchStatus('idle');
    } catch (leaveError) {
      setError(leaveError instanceof Error ? leaveError.message : 'Unable to leave matchmaking.');
    } finally {
      setMatching(false);
    }
  };

  if (authLoading) {
    return <p role="status" className="p-8 text-center text-text-secondary">{tr('Loading account…')}</p>;
  }

  const effectiveMode = !authLoading && !user ? 'local' : mode;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 text-text-primary">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href={modeParam === 'bot' ? '/play/bots' : '/play'}
              className="px-3 py-1 bg-background-secondary hover:bg-background-tertiary text-text-secondary hover:text-text-primary text-xs font-semibold rounded-full border border-text-secondary/15 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              {tr(modeParam === 'bot' ? 'Back to Bot Arena' : 'Game Modes')}
            </Link>
          </div>
          <h1 className="text-3xl font-bold md:text-4xl">
            {effectiveMode === 'local' && localOpponent === 'bot'
              ? `${tr('Playing vs')} ${botName} (~${botElo} ELO)`
              : tr('Chess Arena Online')}
          </h1>
          <p className="mt-1 text-text-secondary">
            {effectiveMode === 'local' && localOpponent === 'bot'
              ? tr('Test your tactical skills against our advanced chess bot engine.')
              : tr('Challenge players worldwide in real-time ranked matches.')}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {user && (
            <button
              onClick={() => setIsPlayAFriendOpen(true)}
              className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-accent/25 flex items-center gap-2 text-sm relative"
            >
              <UserPlus className="w-4 h-4" />
              <span>{tr('PLAY A FRIEND')}</span>
              {incomingInvitesCount > 0 && (
                <span className="absolute -top-1.5 -end-1.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow animate-bounce">
                  {incomingInvitesCount}
                </span>
              )}
            </button>
          )}

          {user && (
            <button
              onClick={() => setMode(m => m === 'online' ? 'local' : 'online')}
              className="px-4 py-2.5 bg-background-secondary hover:bg-background-tertiary text-text-primary font-semibold rounded-xl border border-text-secondary/15 transition-colors text-sm flex items-center gap-2"
            >
              <User className="w-4 h-4 text-accent" />
              <span>{tr(mode === 'online' ? 'Switch to Bot / Local' : 'Switch to Online Matchmaking')}</span>
            </button>
          )}
        </div>
      </header>

      {error && (
        <div role="alert" className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">
          {tr(error)}
        </div>
      )}

      {user && mode === 'online' && (
        <section className="mb-8 rounded-2xl border border-text-secondary/15 bg-background-secondary p-6 shadow-card">
          <h2 className="text-xl font-bold text-text-primary mb-2">{tr('Online Quick Match')}</h2>
          <p className="text-sm text-text-secondary mb-6">
            {tr('Find an opponent matched by your ELO rating and time control.')}
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {tr('Time Control')}
              </label>
              <select
                value={timeControl}
                onChange={(event) => setTimeControl(event.target.value)}
                disabled={matching || matchStatus === 'queued'}
                className="block rounded-xl border border-text-secondary/25 bg-background-tertiary px-4 py-2.5 text-text-primary text-sm font-medium focus:border-accent focus:outline-none"
              >
                {TIME_CONTROLS.map((control) => <option key={control} value={control}>{control} {tr('Blitz / Rapid')}</option>)}
              </select>
            </div>
            {matchStatus === 'idle' ? (
              <button
                onClick={() => void handleJoinMatch()}
                disabled={matching}
                className="rounded-xl bg-accent hover:bg-accent-hover px-6 py-2.5 font-bold text-white shadow-lg shadow-accent/25 transition-colors disabled:opacity-50"
              >
                {matching ? tr('Connecting…') : tr('Find Opponent')}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <p role="status" className="text-sm font-semibold text-accent animate-pulse">{tr('Searching for opponent…')}</p>
                <button
                  onClick={() => void handleLeaveMatch()}
                  disabled={matching}
                  className="rounded-xl border border-text-secondary/20 px-4 py-2.5 text-text-primary hover:bg-background-tertiary transition-colors disabled:opacity-50 text-sm font-semibold"
                >
                  {tr('Cancel Search')}
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {effectiveMode === 'local' && gameEngine && (
        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 bg-background-secondary p-4 rounded-2xl border border-text-secondary/15 shadow-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center text-accent">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">
                  {localOpponent === 'bot' ? `${botName} (~${botElo} ELO)` : tr('Hotseat Two Player')}
                </h3>
                <p className="text-xs text-text-secondary">
                  {localOpponent === 'bot'
                    ? `${tr('Playing as')} ${tr(humanColor === 'w' ? 'White' : 'Black')}`
                    : tr('Alternate moves on this device')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {botThinking && (
                <span className="text-xs px-3 py-1.5 rounded-lg bg-accent/20 text-accent font-semibold animate-pulse">
                  {botName} {tr('is thinking…')}
                </span>
              )}
              <button
                onClick={() => startLocalGame(localOpponent)}
                className="px-4 py-2 bg-background-tertiary hover:bg-background text-text-primary text-xs font-semibold rounded-xl border border-text-secondary/20 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-accent" />
                <span>{tr('Restart Game')}</span>
              </button>
            </div>
          </div>

          <ChessBoard
            engine={gameEngine}
            onReset={() => startLocalGame(localOpponent)}
            onMove={handleLocalMove}
            isWhitePlayer={humanColor === 'w'}
            isHotSeat={localOpponent === 'hotseat'}
            undoPlies={localOpponent === 'bot' && gameEngine.moveHistory.length > 1 ? 2 : 1}
            allowUndo={!botThinking}
            isInputEnabled={!botThinking && (localOpponent === 'hotseat' || gameEngine.turn === humanColor)}
            whiteName={humanColor === 'w' ? (user?.email || 'Player') : botName}
            blackName={humanColor === 'b' ? (user?.email || 'Player') : botName}
            whiteRating={humanColor === 'w' ? 200 : botElo}
            blackRating={humanColor === 'b' ? 200 : botElo}
            initialOrientation={humanColor === 'w' ? 'white' : 'black'}
          />
        </div>
      )}

      {/* Play a Friend Modal */}
      <PlayAFriendModal
        isOpen={isPlayAFriendOpen}
        onClose={() => setIsPlayAFriendOpen(false)}
      />
    </div>
  );
}

export default function PlayPage() {
  const { tr } = useI18n();

  return (
    <Suspense fallback={<div className="p-8 text-center text-text-secondary">{tr('Loading play arena…')}</div>}>
      <PlayContent />
    </Suspense>
  );
}
