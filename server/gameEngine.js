// server/gameEngine.js
// Core game loop: manages minigame sequence, timing, answer collection

const { getNextMinigame, getMinigame } = require('./minigames/index');
const { applyCorrectAnswer, applyWrongAnswer, calculateRanking } = require('./scoringSystem');
const { saveMatch } = require('./database');

const COUNTDOWN_SECONDS = 3;
const BETWEEN_MINIGAME_DELAY = 800; // ms between minigames

/**
 * Start a game in a room
 * @param {object} room - room state from roomManager
 * @param {object} io - Socket.IO server instance
 */
function startGame(room, io) {
  room.state = 'countdown';
  room.startedAt = Date.now();

  // Countdown
  let count = COUNTDOWN_SECONDS;
  io.to(room.code).emit('gameCountdown', { count });

  const countInterval = setInterval(() => {
    count--;
    if (count > 0) {
      io.to(room.code).emit('gameCountdown', { count });
    } else {
      clearInterval(countInterval);
      room.state = 'playing';
      room.roundNumber = 0;
      nextMinigame(room, io);
    }
  }, 1000);
}

/**
 * Send the next minigame to all alive players
 */
function nextMinigame(room, io) {
  if (room.state !== 'playing') return;

  // Check win condition first
  const alivePlayers = room.players.filter(p => p.alive);
  if (alivePlayers.length <= 1) {
    endGame(room, io);
    return;
  }

  room.roundNumber++;
  room.submittedAnswers = new Map();

  const { minigame, questionData } = getNextMinigame(room.roundNumber);
  room.currentMinigame = { minigame, questionData, startTime: Date.now() };

  // Send minigame data to all players (spectators included)
  io.to(room.code).emit('nextMinigame', {
    round: room.roundNumber,
    minigameData: {
      type: questionData.type,
      instruction: questionData.instruction,
      question: questionData.question,
      code: questionData.code,
      lines: questionData.lines,
      shuffledLines: questionData.shuffledLines,
      correctLines: questionData.correctLines,
      choices: questionData.choices,
      blank: questionData.blank,
      terms: questionData.terms,
      definitions: questionData.definitions,
      topic: questionData.topic,
      difficulty: questionData.difficulty,
      timeLimit: questionData.timeLimit,
    }
  });

  // Auto-fail timeout for non-submitters
  if (room.minigameTimeout) clearTimeout(room.minigameTimeout);
  room.minigameTimeout = setTimeout(() => {
    resolveMinigame(room, io, null);
  }, questionData.timeLimit * 1000 + 200);
}

/**
 * Called when a player submits an answer
 */
function submitAnswer(room, socketId, answer, io) {
  if (room.state !== 'playing' || !room.currentMinigame) return;

  const player = room.players.find(p => p.socketId === socketId && p.alive);
  if (!player) return;

  // Prevent double submission
  if (room.submittedAnswers.has(socketId)) return;

  room.submittedAnswers.set(socketId, answer);

  // Check if all alive players have submitted
  const alivePlayers = room.players.filter(p => p.alive);
  if (room.submittedAnswers.size >= alivePlayers.length) {
    if (room.minigameTimeout) {
      clearTimeout(room.minigameTimeout);
      room.minigameTimeout = null;
    }
    resolveMinigame(room, io, null);
  }
}

/**
 * Resolve the current minigame — score everyone, apply effects
 */
function resolveMinigame(room, io, forcedSocketId) {
  if (!room.currentMinigame) return;

  const { minigame, questionData, startTime } = room.currentMinigame;
  const alivePlayers = room.players.filter(p => p.alive);
  const results = [];
  const eliminated = [];

  for (const player of alivePlayers) {
    const submittedAnswer = room.submittedAnswers.get(player.socketId);
    const responseTime = Math.round((Date.now() - startTime) / 1000 * 10) / 10; // seconds

    let isCorrect = false;
    if (submittedAnswer !== undefined && submittedAnswer !== null) {
      isCorrect = minigame.validate(submittedAnswer, questionData.answer);
    }

    let result;
    if (isCorrect) {
      const scoring = applyCorrectAnswer(player, questionData.difficulty, responseTime * 1000, questionData.timeLimit);
      result = {
        socketId: player.socketId,
        playerId: player.id,
        username: player.username,
        correct: true,
        points: scoring.points,
        combo: player.combo,
        multiplier: player.multiplier,
        lives: player.lives,
        score: player.score,
        lifeGained: scoring.lifeGained,
        responseTime,
      };
    } else {
      const { eliminated: isEliminated } = applyWrongAnswer(player);
      result = {
        socketId: player.socketId,
        playerId: player.id,
        username: player.username,
        correct: false,
        points: 0,
        combo: 0,
        multiplier: 1,
        lives: player.lives,
        score: player.score,
        lifeGained: false,
        responseTime: submittedAnswer !== undefined ? responseTime : questionData.timeLimit,
        timedOut: submittedAnswer === undefined,
      };
      if (isEliminated) {
        player.eliminatedAt = Date.now();
        eliminated.push(player);
      }
    }
    results.push(result);

    // Send private result to each player
    io.to(player.socketId).emit('answerResult', {
      correct: result.correct,
      correctAnswer: questionData.answer,
      points: result.points,
      combo: player.combo,
      multiplier: player.multiplier,
      lives: player.lives,
      score: player.score,
      lifeGained: result.lifeGained,
      timedOut: result.timedOut,
    });
  }

  // Broadcast elimination events
  for (const p of eliminated) {
    const rank = room.players.filter(pl => !pl.alive || pl.id === p.id).length;
    p.rank = rank;
    io.to(room.code).emit('playerEliminated', { playerId: p.id, username: p.username, score: p.score });
  }

  // Broadcast scores update to all (for HUD scoreboard)
  io.to(room.code).emit('scoresUpdate', {
    players: room.players.map(p => ({
      id: p.id,
      username: p.username,
      score: p.score,
      combo: p.combo,
      multiplier: p.multiplier,
      lives: p.lives,
      alive: p.alive,
    }))
  });

  room.currentMinigame = null;

  // Short pause then next minigame
  setTimeout(() => {
    nextMinigame(room, io);
  }, BETWEEN_MINIGAME_DELAY);
}

/**
 * End the game and broadcast ranking
 */
function endGame(room, io) {
  room.state = 'ended';

  if (room.minigameTimeout) {
    clearTimeout(room.minigameTimeout);
    room.minigameTimeout = null;
  }

  const ranking = calculateRanking(room.players);

  // Assign final ranks
  ranking.forEach((entry, i) => {
    const p = room.players.find(pl => pl.id === entry.id);
    if (p) p.rank = i + 1;
  });

  // Save to database
  try {
    saveMatch({
      id: room.matchId,
      roomCode: room.code,
      startedAt: room.startedAt,
      endedAt: Date.now(),
      players: ranking.map(r => ({
        username: r.username,
        score: r.score,
        maxCombo: r.maxCombo,
        correctAnswers: r.correctAnswers,
        totalAnswers: r.totalAnswers,
        avgResponseTime: r.avgResponseTime,
        livesRemaining: r.livesRemaining,
        rank: r.rank,
        eliminatedAt: room.players.find(p => p.username === r.username)?.eliminatedAt || null,
      }))
    });
  } catch (e) {
    console.error('DB save error:', e);
  }

  io.to(room.code).emit('gameOver', { ranking });
}

module.exports = { startGame, nextMinigame, submitAnswer, endGame };
