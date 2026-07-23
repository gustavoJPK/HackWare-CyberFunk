// public/js/screens/lobby.js
// Lobby screen controller

const LobbyScreen = (() => {
  let currentRoom = null;
  let isReady = false;

  function init() {
    const socket = SocketClient.get();

    document.getElementById('lobby-copy-btn').addEventListener('click', () => {
      const code = SocketClient.getRoomCode();
      if (!code) return;
      navigator.clipboard.writeText(code).then(() => {
        Effects.toast('Código copiado', 'success');
      }).catch(() => prompt('Código de sala:', code));
    });

    document.getElementById('btn-ready').addEventListener('click', toggleReady);
    document.getElementById('btn-start-game').addEventListener('click', startGame);

    // Socket events — unified lobby sync
    socket.on('lobbyUpdate', ({ room, joinedPlayerName, leftPlayerName }) => {
      setRoom(room);
      render();

      if (joinedPlayerName) {
        Effects.toast(`👋 ${joinedPlayerName} se unió a la sala`, 'info', 1800);
      }
      if (leftPlayerName) {
        Effects.toast(`🚪 ${leftPlayerName} salió de la sala`, 'info', 1800);
      }
    });

    socket.on('gameCountdown', ({ count }) => {
      App.showScreen('countdown');
      const display = document.getElementById('countdown-display');
      display.textContent = count;
      display.classList.remove('countdown-number');
      void display.offsetWidth;
      display.classList.add('countdown-number');
      Effects.sfxCountdown();

      if (count === 1) {
        setTimeout(() => {
          App.showScreen('game');
          Effects.sfxCountdownGo();
        }, 900);
      }
    });
  }

  function setRoom(room) {
    currentRoom = room;
  }

  function render() {
    if (!currentRoom) return;
    const myId = SocketClient.getPlayerId();
    const myPlayer = currentRoom.players.find(p => p.id === myId);
    const isHost = myPlayer?.isHost;

    // Room code
    document.getElementById('lobby-room-code').textContent = currentRoom.code;
    document.getElementById('lobby-player-count').textContent =
      `${currentRoom.players.length} jugador${currentRoom.players.length !== 1 ? 'es' : ''}`;

    // Player list
    const list = document.getElementById('lobby-player-list');
    list.innerHTML = currentRoom.players.map((p, i) => {
      const isMe = p.id === myId;
      const avatarLetter = p.username.charAt(0).toUpperCase();
      const badges = [];
      if (p.isHost) badges.push('<span class="badge badge-host">👑 Host</span>');
      if (isMe) badges.push('<span class="badge badge-waiting" style="font-size:0.65rem;">TÚ</span>');
      if (p.ready) badges.push('<span class="badge badge-ready">✓ Listo</span>');
      else badges.push('<span class="badge badge-waiting">⌛ Esperando</span>');

      return `
        <div class="player-row ready-${p.ready}" style="animation-delay:${i * 0.05}s;">
          <div class="player-avatar">${avatarLetter}</div>
          <span class="player-name">${p.username}${isMe ? ' (tú)' : ''}</span>
          <div class="player-badges">${badges.join('')}</div>
        </div>
      `;
    }).join('');

    // Ready button state
    const readyBtn = document.getElementById('btn-ready');
    if (myPlayer?.ready) {
      readyBtn.textContent = '❌ Cancelar Listo';
      readyBtn.className = 'btn btn-danger btn-full';
      isReady = true;
    } else {
      readyBtn.textContent = '✅ Listo';
      readyBtn.className = 'btn btn-outline btn-full';
      isReady = false;
    }

    // Start button (host only)
    const startBtn = document.getElementById('btn-start-game');
    startBtn.style.display = isHost ? 'flex' : 'none';

    // Status message
    const allReady = currentRoom.players.every(p => p.ready);
    const readyCount = currentRoom.players.filter(p => p.ready).length;
    const total = currentRoom.players.length;
    const statusEl = document.getElementById('lobby-status');

    if (allReady && total > 0) {
      statusEl.innerHTML = '<span style="color:var(--neon-green);">✓ ¡Todos listos! El anfitrión puede iniciar.</span>';
      if (isHost) {
        startBtn.disabled = false;
        startBtn.style.background = '';
      }
    } else {
      statusEl.textContent = `${readyCount}/${total} jugadores listos...`;
      if (isHost) {
        startBtn.disabled = !allReady;
      }
    }
  }

  function toggleReady() {
    isReady = !isReady;
    SocketClient.get().emit('setReady', { ready: isReady });
  }

  function startGame() {
    SocketClient.get().emit('startGame');
  }

  return { init, setRoom, render };
})();
