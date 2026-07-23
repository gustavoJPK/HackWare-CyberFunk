// public/js/screens/join.js
// Join room screen controller — joins room and renders lobby immediately

const JoinScreen = (() => {
  function init() {
    document.getElementById('back-from-join').addEventListener('click', () => {
      App.showScreen('home');
      reset();
    });

    document.getElementById('btn-join-confirm').addEventListener('click', joinRoom);

    // Auto uppercase the code input
    const codeInput = document.getElementById('join-code');
    codeInput.addEventListener('input', () => {
      codeInput.value = codeInput.value.toUpperCase();
    });
    codeInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('join-username').focus();
    });

    document.getElementById('join-username').addEventListener('keydown', e => {
      if (e.key === 'Enter') joinRoom();
    });
  }

  function joinRoom() {
    const code = document.getElementById('join-code').value.trim().toUpperCase();
    const username = document.getElementById('join-username').value.trim();

    if (code.length !== 5) {
      Effects.toast('El código debe tener 5 caracteres', 'error');
      document.getElementById('join-code').focus();
      return;
    }
    if (!username) {
      Effects.toast('Ingresa tu nombre de usuario', 'error');
      document.getElementById('join-username').focus();
      return;
    }

    const socket = SocketClient.connect();
    const btn = document.getElementById('btn-join-confirm');
    btn.disabled = true;
    btn.textContent = 'Uniéndose...';

    socket.emit('joinRoom', { code, username });

    socket.once('roomJoined', ({ code: roomCode, playerId, room }) => {
      btn.disabled = false;
      btn.textContent = 'Entrar a la Sala →';

      SocketClient.setPlayer(playerId, roomCode);
      LobbyScreen.setRoom(room);
      LobbyScreen.render();
      App.showScreen('lobby');

      Effects.toast(`¡Te uniste a la sala ${roomCode}!`, 'success');
    });

    socket.once('error', ({ message }) => {
      btn.disabled = false;
      btn.textContent = 'Entrar a la Sala →';
      Effects.toast(message || 'Error al unirse a la sala', 'error');
    });
  }

  function reset() {
    document.getElementById('join-code').value = '';
    document.getElementById('join-username').value = '';
    const btn = document.getElementById('btn-join-confirm');
    btn.disabled = false;
    btn.textContent = 'Entrar a la Sala →';
  }

  return { init, reset };
})();
