// public/js/mockSocket.js
// Fallback Mock Socket for offline / static browser play with AI Bot opponents

class MockSocket {
  constructor() {
    this.id = 'mock_' + Math.random().toString(36).substr(2, 9);
    this.connected = true;
    this.listeners = {};

    this.room = null;
    this.minigames = [];
    this.roundNumber = 0;
    this.minigameTimer = null;
    this.botAnswerTimers = [];
    this.currentMinigameData = null;
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, payload = {}) {
    setTimeout(() => this._handleEmit(event, payload), 50);
  }

  _trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  _handleEmit(event, payload) {
    switch (event) {
      case 'createRoom': {
        const code = 'CYBER';
        const myId = 'player_me';
        const bots = [
          { id: 'bot_1', username: 'VaporBot_99', ready: true, alive: true, lives: 5, score: 0, combo: 0, maxCombo: 0, multiplier: 1, isHost: false },
          { id: 'bot_2', username: 'CyberGamer', ready: true, alive: true, lives: 5, score: 0, combo: 0, maxCombo: 0, multiplier: 1, isHost: false },
        ];
        this.room = {
          code,
          hostId: myId,
          state: 'lobby',
          players: [
            { id: myId, socketId: this.id, username: payload.username, isHost: true, ready: true, alive: true, lives: 5, score: 0, combo: 0, maxCombo: 0, multiplier: 1 },
            ...bots
          ]
        };
        this._trigger('roomCreated', { code, playerId: myId, room: this._getRoomState() });
        break;
      }

      case 'joinRoom': {
        const code = payload.code.toUpperCase();
        const myId = 'player_me';
        const bots = [
          { id: 'bot_1', username: 'NeonRider', ready: true, alive: true, lives: 5, score: 0, combo: 0, maxCombo: 0, multiplier: 1, isHost: true },
          { id: 'bot_2', username: 'GlitchMaster', ready: true, alive: true, lives: 5, score: 0, combo: 0, maxCombo: 0, multiplier: 1, isHost: false },
        ];
        this.room = {
          code,
          hostId: 'bot_1',
          state: 'lobby',
          players: [
            bots[0],
            { id: myId, socketId: this.id, username: payload.username, isHost: false, ready: false, alive: true, lives: 5, score: 0, combo: 0, maxCombo: 0, multiplier: 1 },
            bots[1]
          ]
        };
        this._trigger('roomJoined', { code, playerId: myId, room: this._getRoomState() });
        break;
      }

      case 'setReady': {
        if (!this.room) return;
        const p = this.room.players.find(pl => pl.id === 'player_me');
        if (p) p.ready = payload.ready;
        this._trigger('lobbyUpdate', { room: this._getRoomState() });
        break;
      }

      case 'startGame': {
        if (!this.room) return;
        this.room.state = 'playing';
        let count = 3;
        this._trigger('gameCountdown', { count });

        const interval = setInterval(() => {
          count--;
          if (count > 0) {
            this._trigger('gameCountdown', { count });
          } else {
            clearInterval(interval);
            this.roundNumber = 0;
            this._nextMinigame();
          }
        }, 1000);
        break;
      }

      case 'submitAnswer': {
        if (!this.currentMinigameData || !this.room) return;
        this._evaluateAnswer('player_me', payload.answer);
        break;
      }
    }
  }

  _getRoomState() {
    return {
      code: this.room.code,
      state: this.room.state,
      hostId: this.room.hostId,
      players: this.room.players.map(p => ({ ...p }))
    };
  }

  _nextMinigame() {
    const alive = this.room.players.filter(p => p.alive);
    if (alive.length <= 1) {
      this._endGame();
      return;
    }

    this.roundNumber++;
    const question = this._generateQuestion(this.roundNumber);
    this.currentMinigameData = question;

    this._trigger('nextMinigame', {
      round: this.roundNumber,
      minigameData: question
    });

    // Schedule bot answers
    this.botAnswerTimers.forEach(clearTimeout);
    this.botAnswerTimers = [];

    this.room.players.filter(p => p.alive && p.id !== 'player_me').forEach(bot => {
      const isCorrect = Math.random() < 0.75; // 75% bot accuracy
      const delay = Math.random() * (question.timeLimit * 700) + 1200; // 1.2s - 80% time
      const timer = setTimeout(() => {
        if (bot.alive && this.room.state === 'playing') {
          const ans = isCorrect ? question.answer : 'WRONG_BOT_ANS';
          this._evaluateAnswer(bot.id, ans, true);
        }
      }, delay);
      this.botAnswerTimers.push(timer);
    });

    // Auto timeout for round
    if (this.minigameTimer) clearTimeout(this.minigameTimer);
    this.minigameTimer = setTimeout(() => {
      if (this.room && this.room.state === 'playing') {
        this._resolveRound();
      }
    }, question.timeLimit * 1000 + 300);
  }

  _evaluateAnswer(playerId, playerAns, isBot = false) {
    const p = this.room.players.find(pl => pl.id === playerId);
    if (!p || p.answeredThisRound) return;
    p.answeredThisRound = true;

    const q = this.currentMinigameData;
    let correct = false;

    if (Array.isArray(q.answer)) {
      correct = JSON.stringify(playerAns) === JSON.stringify(q.answer);
    } else if (typeof q.answer === 'number') {
      correct = parseInt(playerAns) === q.answer;
    } else if (typeof q.answer === 'object') {
      correct = JSON.stringify(playerAns) === JSON.stringify(q.answer);
    } else {
      correct = String(playerAns).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
    }

    if (correct) {
      p.combo++;
      p.multiplier = Math.min(p.combo, 8);
      p.maxCombo = Math.max(p.maxCombo, p.combo);
      p.score += 100 * p.multiplier;
      p.correctAnswers = (p.correctAnswers || 0) + 1;
      p.totalAnswers = (p.totalAnswers || 0) + 1;
    } else {
      p.combo = 0;
      p.multiplier = 1;
      p.lives = Math.max(0, p.lives - 1);
      p.totalAnswers = (p.totalAnswers || 0) + 1;
      if (p.lives === 0) {
        p.alive = false;
      }
    }

    if (!isBot) {
      this._trigger('answerResult', {
        correct,
        correctAnswer: q.answer,
        points: correct ? 100 * p.multiplier : 0,
        combo: p.combo,
        multiplier: p.multiplier,
        lives: p.lives,
        score: p.score,
        lifeGained: false,
        timedOut: playerAns === null
      });

      if (!p.alive) {
        this._trigger('playerEliminated', { playerId: p.id, username: p.username, score: p.score });
      }
    }

    // Check if everyone answered
    const alive = this.room.players.filter(pl => pl.alive);
    if (alive.every(pl => pl.answeredThisRound)) {
      if (this.minigameTimer) clearTimeout(this.minigameTimer);
      this._resolveRound();
    }
  }

  _resolveRound() {
    if (!this.room) return;
    this.room.players.forEach(p => { p.answeredThisRound = false; });

    this._trigger('scoresUpdate', {
      players: this.room.players.map(p => ({
        id: p.id,
        username: p.username,
        score: p.score,
        combo: p.combo,
        multiplier: p.multiplier,
        lives: p.lives,
        alive: p.alive,
      }))
    });

    setTimeout(() => {
      if (this.room && this.room.state === 'playing') {
        this._nextMinigame();
      }
    }, 800);
  }

  _endGame() {
    if (!this.room) return;
    this.room.state = 'ended';
    const ranking = [...this.room.players].sort((a, b) => b.score - a.score).map((p, i) => ({
      rank: i + 1,
      id: p.id,
      username: p.username,
      score: p.score,
      maxCombo: p.maxCombo,
      correctAnswers: p.correctAnswers || 5,
      totalAnswers: p.totalAnswers || 6,
      avgResponseTime: 1400,
      livesRemaining: p.lives,
      alive: p.alive
    }));

    this._trigger('gameOver', { ranking });
  }

  _generateQuestion(round) {
    const questions = [
      {
        type: 'quick-quiz',
        question: '¿Qué keyword se usa para declarar una variable inmutable en JS?',
        choices: ['const', 'let', 'var', 'static'],
        answer: 'const',
        topic: 'javascript',
        timeLimit: 10
      },
      {
        type: 'what-prints',
        instruction: '¿Qué imprime este código?',
        code: 'console.log(typeof null);',
        choices: ['"object"', '"null"', '"undefined"', '"number"'],
        answer: '"object"',
        topic: 'javascript',
        timeLimit: 10
      },
      {
        type: 'spot-the-bug',
        instruction: 'Toca la línea con el bug',
        lines: [
          'const nombre = "Ana";',
          'if (nombre = "Ana") {',
          '  console.log("Hola Ana");',
          '}'
        ],
        answer: 1,
        topic: 'javascript',
        timeLimit: 12
      },
      {
        type: 'complete-code',
        instruction: 'Completa el espacio',
        code: 'const nums = [1,2,3];\nnums.___(4);',
        blank: '___',
        choices: ['push', 'append', 'add', 'insert'],
        answer: 'push',
        topic: 'javascript',
        timeLimit: 10
      },
      {
        type: 'order-lines',
        instruction: 'Ordena estas líneas correctamente',
        shuffledLines: [
          'saludar("Mundo");',
          '  console.log("Hola " + n);',
          'function saludar(n) {',
          '}'
        ],
        correctLines: [
          'function saludar(n) {',
          '  console.log("Hola " + n);',
          '}',
          'saludar("Mundo");'
        ],
        answer: [
          'function saludar(n) {',
          '  console.log("Hola " + n);',
          '}',
          'saludar("Mundo");'
        ],
        topic: 'javascript',
        timeLimit: 15
      },
      {
        type: 'match-concepts',
        instruction: 'Conecta los términos',
        terms: ['let', 'const', 'var'],
        definitions: ['Reasignable', 'Inmutable', 'Function scope'],
        answer: {
          'let': 'Reasignable',
          'const': 'Inmutable',
          'var': 'Function scope'
        },
        topic: 'javascript',
        timeLimit: 15
      }
    ];

    return questions[(round - 1) % questions.length];
  }
}
