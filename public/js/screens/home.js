// public/js/screens/home.js
// Home screen controller

const HomeScreen = (() => {
  function init() {
    Effects.initParticles();

    document.getElementById('btn-create-room').addEventListener('click', () => {
      App.showScreen('create');
    });

    document.getElementById('btn-join-room').addEventListener('click', () => {
      App.showScreen('join');
    });
  }

  return { init };
})();
