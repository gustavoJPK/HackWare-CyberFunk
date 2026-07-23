// server/roomManager.js
// Manages room state, player lists, lobby logic

const { v4: uuidv4 } = require('uuid');

const rooms = new Map(); // roomCode -> roomState

/**
 * Generate a short, unique room code (e.g. "AB7FQ")
 */
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code;
  do {
    code = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  } while (rooms.has(code));
  return code;
}

/**
 * Create a new room
 * @param {string} hostSocketId
 * @param {string} hostUsername
 * @returns {object} room state
 */
function createRoom(hostSocketId, hostUsername) {
  const code = generateRoomCode();
  const hostId = uuidv4();
  const room = {
    code,
    matchId: uuidv4(),
    hostId,
    hostSocketId,
    state: 'lobby',       // lobby | countdown | playing | ended
    players: [{
      id: hostId,
      socketId: hostSocketId,
      username: hostUsername,
      isHost: true,
      ready: false,
      alive: true,
      lives: 5,
      score: 0,
      combo: 0,
      maxCombo: 0,
      multiplier: 1,
      correctAnswers: 0,
      totalAnswers: 0,
      totalResponseTime: 0,
      eliminatedAt: null,
      rank: null,
      consecutiveCorrect: 0,  // for life recovery
    }],
    currentMinigame: null,
    roundNumber: 0,
    startedAt: null,
    lastMinigameAnswer: null,
    minigameTimeout: null,
    submittedAnswers: new Map(), // socketId -> answer
  };
  rooms.set(code, room);
  return room;
}

/**
 * Join an existing room
 */
function joinRoom(code, socketId, username) {
  const room = rooms.get(code);
  if (!room) return { error: 'Sala no encontrada' };
  if (room.state !== 'lobby') return { error: 'La partida ya comenzó' };
  if (room.players.length >= 8) return { error: 'Sala llena (máximo 8 jugadores)' };
  if (room.players.some(p => p.username.toLowerCase() === username.toLowerCase())) {
    return { error: 'Nombre de usuario ya en uso' };
  }

  const playerId = uuidv4();
  const player = {
    id: playerId,
    socketId,
    username,
    isHost: false,
    ready: false,
    alive: true,
    lives: 5,
    score: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    correctAnswers: 0,
    totalAnswers: 0,
    totalResponseTime: 0,
    eliminatedAt: null,
    rank: null,
    consecutiveCorrect: 0,
  };
  room.players.push(player);
  return { room, player };
}

/**
 * Set a player's ready status
 */
function setReady(code, socketId, ready) {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players.find(p => p.socketId === socketId);
  if (player) player.ready = ready;
  return room;
}

/**
 * Remove a player from a room (disconnect)
 */
function removePlayer(socketId) {
  for (const [code, room] of rooms.entries()) {
    const idx = room.players.findIndex(p => p.socketId === socketId);
    if (idx !== -1) {
      const [removed] = room.players.splice(idx, 1);
      // If host left, assign new host
      if (removed.isHost && room.players.length > 0) {
        room.players[0].isHost = true;
        room.hostSocketId = room.players[0].socketId;
        room.hostId = room.players[0].id;
      }
      // Clean empty room
      if (room.players.length === 0) {
        rooms.delete(code);
      }
      return { room: rooms.get(code), removed, code };
    }
  }
  return null;
}

/**
 * Get room by socket ID (find which room a socket is in)
 */
function getRoomBySocket(socketId) {
  for (const room of rooms.values()) {
    if (room.players.some(p => p.socketId === socketId)) return room;
  }
  return null;
}

/**
 * Get room by code
 */
function getRoom(code) {
  return rooms.get(code);
}

/**
 * Get sanitized room state (safe to send to clients)
 */
function getRoomState(room) {
  return {
    code: room.code,
    state: room.state,
    hostId: room.hostId,
    players: room.players.map(p => ({
      id: p.id,
      username: p.username,
      isHost: p.isHost,
      ready: p.ready,
      alive: p.alive,
      lives: p.lives,
      score: p.score,
      combo: p.combo,
      maxCombo: p.maxCombo,
      multiplier: p.multiplier,
      correctAnswers: p.correctAnswers,
      totalAnswers: p.totalAnswers,
      eliminatedAt: p.eliminatedAt,
    }))
  };
}

module.exports = {
  createRoom,
  joinRoom,
  setReady,
  removePlayer,
  getRoomBySocket,
  getRoom,
  getRoomState,
};
