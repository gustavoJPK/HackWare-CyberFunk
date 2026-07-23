// public/js/screens/create.js
// Create room screen controller — automatically transitions host to lobby

const CreateScreen = (() => {
  function init() {
    document.getElementById('back-from-create').addEventListener('click', () => {
      App.showScreen('home');
      reset();
    });

    document.getElementById('btn-create-confirm').addEventListener('click', createRoom);
    document.getElementById('create-username').addEventListener('keydown', e => {
      if (e.key === 'Enter') createRoom();
    });
  }

  function createRoom() {
    const username = document.getElementById('create-username').value.trim();
    if (!username) {
      Effects.toast('Ingresa tu nombre de usuario', 'error');
      document.getElementById('create-username').focus();
      return;
    }

    const socket = SocketClient.connect();
    const btn = document.getElementById('btn-create-confirm');
    btn.disabled = true;
    btn.textContent = 'Creando sala...';

    socket.emit('createRoom', { username });

    socket.once('roomCreated', ({ code, playerId, room }) => {
      btn.disabled = false;
      btn.textContent = 'Crear Sala →';

      SocketClient.setPlayer(playerId, code);
      LobbyScreen.setRoom(room);
      LobbyScreen.render();
      App.showScreen('lobby');

      Effects.toast(`Sala ${code} creada exitosamente`, 'success');
    });

    socket.once('error', ({ message }) => {
      btn.disabled = false;
      btn.textContent = 'Crear Sala →';
      Effects.toast(message || 'Error al crear sala', 'error');
    });
  }

  function reset() {
    document.getElementById('create-username').value = '';
    const btn = document.getElementById('btn-create-confirm');
    btn.disabled = false;
    btn.textContent = 'Crear Sala →';
  }

  return { init, reset };
})();
