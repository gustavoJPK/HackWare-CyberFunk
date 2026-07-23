// server/index.js
// Express + Socket.IO entry point — fully synchronized multiplayer

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const roomManager = require('./roomManager');
const gameEngine = require('./gameEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
  },
  transports: ['polling', 'websocket']
});

app.use(cors({ origin: '*' }));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  next();
});
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Catch-all: serve index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─────────────────────────────────────────────
// Socket.IO events
// ─────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] Connected: ${socket.id}`);

  // ── CREATE ROOM ──────────────────────────────
  socket.on('createRoom', ({ username }) => {
    if (!username || username.trim().length < 1) {
      return socket.emit('error', { message: 'Nombre de usuario requerido' });
    }
    const room = roomManager.createRoom(socket.id, username.trim());
    socket.join(room.code);

    const roomState = roomManager.getRoomState(room);

    // Confirm to host
    socket.emit('roomCreated', {
      code: room.code,
      playerId: room.players[0].id,
      room: roomState
    });

    console.log(`[Room] ${room.code} created by ${username}`);
  });

  // ── JOIN ROOM ────────────────────────────────
  socket.on('joinRoom', ({ code, username }) => {
    if (!code || !username) {
      return socket.emit('error', { message: 'Código y nombre requeridos' });
    }

    const roomCode = code.toUpperCase().trim();
    const result = roomManager.joinRoom(roomCode, socket.id, username.trim());

    if (result.error) {
      return socket.emit('error', { message: result.error });
    }

    socket.join(roomCode);

    const roomState = roomManager.getRoomState(result.room);

    // Confirm to joiner
    socket.emit('roomJoined', {
      code: roomCode,
      playerId: result.player.id,
      room: roomState
    });

    // Broadcast updated lobby to ALL players in the room (including host)
    io.to(roomCode).emit('lobbyUpdate', {
      room: roomState,
      joinedPlayerName: result.player.username
    });

    console.log(`[Room] ${username} joined ${roomCode}`);
  });

  // ── SET READY ────────────────────────────────
  socket.on('setReady', ({ ready }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || room.state !== 'lobby') return;

    roomManager.setReady(room.code, socket.id, ready);
    const roomState = roomManager.getRoomState(room);

    // Broadcast to entire room
    io.to(room.code).emit('lobbyUpdate', { room: roomState });
  });

  // ── START GAME (host only) ───────────────────
  socket.on('startGame', () => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room) return;

    if (room.hostSocketId !== socket.id) {
      return socket.emit('error', { message: 'Solo el anfitrión puede iniciar la partida' });
    }
    if (room.state !== 'lobby') return;

    const notReady = room.players.filter(p => !p.ready);
    if (notReady.length > 0) {
      return socket.emit('error', { message: 'Todos los jugadores deben estar listos' });
    }

    gameEngine.startGame(room, io);
  });

  // ── SUBMIT ANSWER ────────────────────────────
  socket.on('submitAnswer', ({ answer }) => {
    const room = roomManager.getRoomBySocket(socket.id);
    if (!room || room.state !== 'playing') return;
    gameEngine.submitAnswer(room, socket.id, answer, io);
  });

  // ── DISCONNECT ───────────────────────────────
  socket.on('disconnect', () => {
    console.log(`[-] Disconnected: ${socket.id}`);
    const result = roomManager.removePlayer(socket.id);
    if (result && result.room) {
      const roomState = roomManager.getRoomState(result.room);
      io.to(result.code).emit('lobbyUpdate', {
        room: roomState,
        leftPlayerName: result.removed.username
      });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n🎮 HackWare CyberFunk server running at http://localhost:${PORT}\n`);
});
