const { Server } = require('socket.io');
const { createClient } = require('@supabase/supabase-js');
const { Chess } = require('chess.js');
const http = require('http');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const PORT = process.env.PORT || 3001;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// In-memory game state (in production, use Redis)
const gameStates = new Map();
const playerSockets = new Map();
const matchmakingQueue = new Map();

// Create HTTP server for health checks
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', connections: playerSockets.size }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Game state class
class GameState {
  constructor(gameId, whitePlayerId, blackPlayerId, timeControl) {
    this.gameId = gameId;
    this.whitePlayerId = whitePlayerId;
    this.blackPlayerId = blackPlayerId;
    this.timeControl = timeControl;
    this.engine = new Chess();
    this.whiteTime = timeControl.initial;
    this.blackTime = timeControl.initial;
    this.currentTurn = 'white';
    this.status = 'in_progress';
    this.result = null;
    this.lastMoveTime = Date.now();
    this.moves = [];
    this.drawOfferedBy = null;
    this.timer = null;
  }

  makeMove(playerId, move) {
    // Validate it's player's turn
    const isWhite = playerId === this.whitePlayerId;
    const isBlack = playerId === this.blackPlayerId;
    const isWhiteTurn = this.engine.turn() === 'w';

    if ((isWhite && !isWhiteTurn) || (isBlack && isWhiteTurn)) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate move
    const legalMoves = this.engine.moves();
    if (!legalMoves.includes(move) && !legalMoves.includes(move + 'q')) {
      return { success: false, error: 'Illegal move' };
    }

    // Make move
    const result = this.engine.move(move);
    if (!result) {
      return { success: false, error: 'Invalid move' };
    }

    this.moves.push(move);
    this.currentTurn = this.engine.turn() === 'w' ? 'white' : 'black';

    // Add increment
    if (isWhite) {
      this.whiteTime += this.timeControl.increment;
    } else {
      this.blackTime += this.timeControl.increment;
    }

    // Check game over
    if (this.engine.isCheckmate()) {
      this.status = 'completed';
      this.result = this.engine.turn() === 'w' ? 'black_wins' : 'white_wins';
    } else if (this.engine.isStalemate() || this.engine.isDraw() || this.engine.isInsufficientMaterial()) {
      this.status = 'completed';
      this.result = 'draw';
    }

    return { success: true, fen: this.engine.fen(), result: this.result };
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.status !== 'in_progress') {
        clearInterval(this.timer);
        return;
      }

      if (this.currentTurn === 'white') {
        this.whiteTime--;
        if (this.whiteTime <= 0) {
          this.status = 'completed';
          this.result = 'black_wins';
          clearInterval(this.timer);
        }
      } else {
        this.blackTime--;
        if (this.blackTime <= 0) {
          this.status = 'completed';
          this.result = 'white_wins';
          clearInterval(this.timer);
        }
      }

      // Broadcast time update
      io.to(this.gameId).emit('time_update', {
        whiteTime: this.whiteTime,
        blackTime: this.blackTime,
      });
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  getState() {
    return {
      gameId: this.gameId,
      whitePlayerId: this.whitePlayerId,
      blackPlayerId: this.blackPlayerId,
      whiteTime: this.whiteTime,
      blackTime: this.blackTime,
      currentTurn: this.currentTurn,
      status: this.status,
      result: this.result,
      fen: this.engine.fen(),
      moves: this.moves,
    };
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Authentication
  socket.on('authenticate', async (token) => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        socket.emit('auth_error', { message: 'Invalid token' });
        socket.disconnect();
        return;
      }

      socket.userId = user.id;
      playerSockets.set(user.id, socket.id);
      socket.emit('authenticated', { userId: user.id });
      console.log('User authenticated:', user.id);
    } catch (err) {
      socket.emit('auth_error', { message: 'Authentication failed' });
      socket.disconnect();
    }
  });

  // Join game
  socket.on('join_game', async (gameId) => {
    if (!socket.userId) {
      socket.emit('error', { message: 'Not authenticated' });
      return;
    }

    try {
      // Fetch game from database
      const { data: game, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error || !game) {
        socket.emit('error', { message: 'Game not found' });
        return;
      }

      // Verify player is part of this game
      const isWhite = game.white_player_id === socket.userId;
      const isBlack = game.black_player_id === socket.userId;

      if (!isWhite && !isBlack) {
        socket.emit('error', { message: 'Not a participant in this game' });
        return;
      }

      // Join socket room
      socket.join(gameId);

      // Get or create game state
      let gameState = gameStates.get(gameId);
      if (!gameState) {
        const timeControl = parseTimeControl(game.time_control);
        gameState = new GameState(
          gameId,
          game.white_player_id,
          game.black_player_id,
          timeControl
        );
        gameStates.set(gameId, gameState);

        // Replay moves
        if (game.moves) {
          for (const move of game.moves) {
            gameState.engine.move(move);
          }
        }
      }

      // Start timer if game is in progress
      if (game.status === 'in_progress') {
        gameState.startTimer();
      }

      // Send initial state
      socket.emit('game_state', gameState.getState());

      // Notify opponent
      socket.to(gameId).emit('player_joined', {
        playerId: socket.userId,
        color: isWhite ? 'white' : 'black',
      });

      console.log(`User ${socket.userId} joined game ${gameId}`);
    } catch (err) {
      console.error('Error joining game:', err);
      socket.emit('error', { message: 'Failed to join game' });
    }
  });

  // Make move
  socket.on('make_move', (data) => {
    if (!socket.userId) return;

    const { gameId, move } = data;
    const gameState = gameStates.get(gameId);

    if (!gameState) {
      socket.emit('error', { message: 'Game not found' });
      return;
    }

    const result = gameState.makeMove(socket.userId, move);

    if (result.success) {
      // Broadcast move to all players
      io.to(gameId).emit('move', {
        move,
        fen: result.fen,
        turn: gameState.currentTurn,
      });

      // If game over, broadcast result
      if (gameState.status === 'completed') {
        gameState.stopTimer();
        io.to(gameId).emit('game_over', {
          result: gameState.result,
          fen: result.fen,
        });

        // Persist to database
        persistGame(gameState);
        gameStates.delete(gameId);
      }
    } else {
      socket.emit('error', { message: result.error });
    }
  });

  // Resign
  socket.on('resign', (gameId) => {
    if (!socket.userId) return;

    const gameState = gameStates.get(gameId);
    if (!gameState) return;

    const isWhite = socket.userId === gameState.whitePlayerId;
    const result = isWhite ? 'black_wins' : 'white_wins';

    gameState.status = 'completed';
    gameState.result = result;
    gameState.stopTimer();

    io.to(gameId).emit('game_over', { result, fen: gameState.engine.fen() });
    persistGame(gameState);
    gameStates.delete(gameId);
  });

  // Draw offer
  socket.on('offer_draw', (gameId) => {
    if (!socket.userId) return;

    const gameState = gameStates.get(gameId);
    if (!gameState) return;

    gameState.drawOfferedBy = socket.userId;
    socket.to(gameId).emit('draw_offered', { by: socket.userId });
  });

  // Accept draw
  socket.on('accept_draw', (gameId) => {
    if (!socket.userId) return;

    const gameState = gameStates.get(gameId);
    if (!gameState) return;

    gameState.status = 'completed';
    gameState.result = 'draw';
    gameState.stopTimer();

    io.to(gameId).emit('game_over', { result: 'draw', fen: gameState.engine.fen() });
    persistGame(gameState);
    gameStates.delete(gameId);
  });

  // Matchmaking
  socket.on('join_queue', (data) => {
    if (!socket.userId) return;

    const { timeControl = '3+2', rating = 1200 } = data;
    const queueKey = timeControl;

    if (!matchmakingQueue.has(queueKey)) {
      matchmakingQueue.set(queueKey, []);
    }

    const queue = matchmakingQueue.get(queueKey);

    // Check if already in queue
    if (queue.find(p => p.userId === socket.userId)) {
      socket.emit('queue_status', { status: 'already_in_queue' });
      return;
    }

    queue.push({ userId: socket.userId, rating, socketId: socket.id, joinedAt: Date.now() });
    socket.emit('queue_status', { status: 'waiting', queuePosition: queue.length });

    // Try to match
    tryMatch(queueKey);
  });

  socket.on('leave_queue', (data) => {
    if (!socket.userId) return;

    const { timeControl = '3+2' } = data;
    const queueKey = timeControl;
    const queue = matchmakingQueue.get(queueKey);

    if (queue) {
      const index = queue.findIndex(p => p.userId === socket.userId);
      if (index !== -1) {
        queue.splice(index, 1);
      }
    }

    socket.emit('queue_status', { status: 'left' });
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      playerSockets.delete(socket.userId);

      // Remove from matchmaking queues
      for (const [key, queue] of matchmakingQueue.entries()) {
        const index = queue.findIndex(p => p.userId === socket.userId);
        if (index !== -1) {
          queue.splice(index, 1);
        }
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

async function tryMatch(queueKey) {
  const queue = matchmakingQueue.get(queueKey);
  if (!queue || queue.length < 2) return;

  // Sort by rating to find closest match
  queue.sort((a, b) => Math.abs(a.rating - b.rating));

  const player1 = queue.shift();
  const player2 = queue.shift();

  // Create game in database
  const timeControl = parseTimeControl(queueKey);
  const { data: game, error } = await supabase
    .from('games')
    .insert({
      white_player_id: player1.userId,
      black_player_id: player2.userId,
      white_rating: player1.rating,
      black_rating: player2.rating,
      time_control: queueKey,
      status: 'in_progress',
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating game:', error);
    // Put players back in queue
    queue.unshift(player2, player1);
    return;
  }

  // Notify both players
  const player1Socket = io.sockets.sockets.get(player1.socketId);
  const player2Socket = io.sockets.sockets.get(player2.socketId);

  if (player1Socket) {
    player1Socket.emit('match_found', {
      gameId: game.id,
      color: 'white',
      opponentRating: player2.rating,
    });
  }

  if (player2Socket) {
    player2Socket.emit('match_found', {
      gameId: game.id,
      color: 'black',
      opponentRating: player1.rating,
    });
  }
}

function parseTimeControl(control) {
  const parts = control.split('+').map(Number);
  return {
    initial: (parts[0] || 3) * 60,
    increment: parts[1] || 2,
  };
}

async function persistGame(gameState) {
  try {
    await supabase
      .from('games')
      .update({
        status: gameState.status,
        result: gameState.result,
        moves: gameState.moves,
        fen: gameState.engine.fen(),
        ended_at: new Date().toISOString(),
        white_time: gameState.whiteTime,
        black_time: gameState.blackTime,
      })
      .eq('id', gameState.gameId);

    // Save moves
    for (let i = 0; i < gameState.moves.length; i++) {
      await supabase
        .from('game_moves')
        .upsert({
          game_id: gameState.gameId,
          move_number: Math.floor(i / 2) + 1,
          player_id: i % 2 === 0 ? gameState.whitePlayerId : gameState.blackPlayerId,
          move_san: gameState.moves[i],
          fen: gameState.engine.fen(), // This would need proper FEN per move
        });
    }

    console.log(`Game ${gameState.gameId} persisted: ${gameState.result}`);
  } catch (err) {
    console.error('Error persisting game:', err);
  }
}

// Health check endpoint
setInterval(() => {
  console.log(`Active connections: ${playerSockets.size}, Active games: ${gameStates.size}, Queues: ${matchmakingQueue.size}`);
}, 30000);

server.listen(PORT, () => {
  console.log(`Socket server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});