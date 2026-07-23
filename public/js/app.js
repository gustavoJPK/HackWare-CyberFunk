// public/js/app.js
// Main application shell — screen router and init

const App = (() => {
  const screens = {
    home:        document.getElementById('screen-home'),
    create:      document.getElementById('screen-create'),
    join:        document.getElementById('screen-join'),
    lobby:       document.getElementById('screen-lobby'),
    countdown:   document.getElementById('screen-countdown'),
    game:        document.getElementById('screen-game'),
    eliminated:  document.getElementById('screen-eliminated'),
    results:     document.getElementById('screen-results'),
  };

  let currentScreen = 'home';

  function showScreen(name) {
    if (!screens[name]) {
      console.warn('Unknown screen:', name);
      return;
    }
    // Hide all
    Object.values(screens).forEach(el => el.classList.remove('active'));
    // Show target
    screens[name].classList.add('active');
    currentScreen = name;

    // Reset game state when returning to game
    if (name === 'game') {
      GameScreen.reset();
    }
  }

  function init() {
    // Initialize all screen controllers
    HomeScreen.init();
    CreateScreen.init();
    JoinScreen.init();
    LobbyScreen.init();
    GameScreen.init();
    ResultsScreen.init();

    // Connect socket early to prevent first-event delay
    SocketClient.connect();

    // Handle browser back button (basic)
    window.addEventListener('popstate', () => {
      showScreen('home');
    });

    console.log('🎮 HackWare CyberFunk initialized');
  }

  // Auto-init on DOM ready
  document.addEventListener('DOMContentLoaded', init);

  return { showScreen, currentScreen: () => currentScreen };
})();
