// public/js/socket.js
// Socket.IO client wrapper for local or production deployments

const SocketClient = (() => {
  let socket = null;
  let myPlayerId = null;
  let myRoomCode = null;

  function connect() {
    if (socket && (socket.connected || socket.isMock)) return socket;

    // Direct file:// protocol -> use MockSocket offline
    if (window.location.protocol === 'file:') {
      console.log('[Socket] Running offline from file:// -> using MockSocket');
      socket = new MockSocket();
      socket.isMock = true;
      return socket;
    }

    if (typeof io !== 'undefined') {
      console.log('[Socket] Connecting to live server at', window.location.origin);
      socket = io(window.location.origin, {
        transports: ['polling', 'websocket'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        timeout: 10000
      });

      socket.on('connect', () => {
        console.log('[Socket] Connected to server! ID:', socket.id);
        updateStatusIndicator(true);
      });

      socket.on('disconnect', () => {
        console.warn('[Socket] Disconnected from server');
        updateStatusIndicator(false);
      });

      socket.on('connect_error', (err) => {
        console.warn('[Socket] Connection error:', err.message);
        updateStatusIndicator(false);
      });

      socket.on('error', ({ message }) => {
        if (typeof Effects !== 'undefined') {
          Effects.toast(message, 'error');
        }
      });

      return socket;
    } else {
      console.warn('[Socket] Socket.IO script not found, using MockSocket');
      socket = new MockSocket();
      socket.isMock = true;
      return socket;
    }
  }

  function updateStatusIndicator(connected) {
    let indicator = document.getElementById('network-status-indicator');
    if (!indicator) {
      indicator = document.createElement('div');
      indicator.id = 'network-status-indicator';
      indicator.style.cssText = `
        position: fixed;
        bottom: 12px;
        left: 12px;
        z-index: 10000;
        font-family: var(--font-ui);
        font-size: 0.75rem;
        font-weight: 700;
        padding: 4px 10px;
        border-radius: 20px;
        display: flex;
        align-items: center;
        gap: 6px;
        letter-spacing: 0.08em;
        pointer-events: none;
      `;
      document.body.appendChild(indicator);
    }

    if (connected) {
      indicator.style.background = 'rgba(57, 255, 20, 0.15)';
      indicator.style.color = '#39FF14';
      indicator.style.border = '1px solid rgba(57, 255, 20, 0.4)';
      indicator.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#39FF14;box-shadow:0 0 8px #39FF14;"></span> SERVIDOR EN VIVO';
    } else {
      indicator.style.background = 'rgba(255, 68, 68, 0.2)';
      indicator.style.color = '#FF4444';
      indicator.style.border = '1px solid rgba(255, 68, 68, 0.4)';
      indicator.innerHTML = '<span style="width:8px;height:8px;border-radius:50%;background:#FF4444;"></span> CONECTANDO...';
    }
  }

  function get() {
    if (!socket) return connect();
    return socket;
  }

  function setPlayer(id, code) {
    myPlayerId = id;
    myRoomCode = code;
  }

  function getPlayerId() { return myPlayerId; }
  function getRoomCode()  { return myRoomCode; }

  return { connect, get, setPlayer, getPlayerId, getRoomCode };
})();
