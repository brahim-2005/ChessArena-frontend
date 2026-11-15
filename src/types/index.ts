export interface Profile {
  id: string;
  username: string;
  fullName: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  joinDate: string;
  preferences: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Game {
  id: string;
  whitePlayerId: string;
  blackPlayerId: string | null;
  result: 'in_progress' | 'white_wins' | 'black_wins' | 'draw' | 'abandoned';
  whiteRating: number;
  blackRating: number;
  timeControl: string;
  startedAt: string;
  endedAt: string | null;
  pgn: string | null;
  moves: string[];
  status: 'in_progress' | 'completed' | 'abandoned';
  createdAt: string;
  updatedAt: string;
}

export interface GameMove {
  index: number;
  playerId: string;
  moveSan: string;
  fen: string;
}

export interface Puzzle {
  id: string;
  fen: string;
  solutionMoves: string[];
  rating: number;
  category: string;
  difficulty: string;
}

export interface PuzzleProgress {
  id: string;
  userId: string;
  puzzleId: string;
  solved: boolean;
  attempts: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  rating: number;
  gamesPlayed: number;
  winRate: number;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  fullName: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  joinDate: string;
  preferences: Record<string, unknown>;
}