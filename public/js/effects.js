// public/js/effects.js
// Visual effects: toast, screen flash, combo popup, Web Audio SFX

const Effects = (() => {
  // ── TOAST NOTIFICATIONS ──────────────────────
  function toast(message, type = 'info', duration = 2800) {
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // ── SCREEN FLASH ─────────────────────────────
  const flashEl = document.getElementById('screen-flash');
  function flashCorrect() {
    flashEl.style.background = 'rgba(57, 255, 20, 0.3)';
    setTimeout(() => { flashEl.style.background = 'transparent'; }, 400);
  }
  function flashWrong() {
    flashEl.style.background = 'rgba(255, 45, 45, 0.5)';
    setTimeout(() => { flashEl.style.background = 'rgba(255, 45, 45, 0.25)'; }, 100);
    setTimeout(() => { flashEl.style.background = 'transparent'; }, 500);
    // Screen shake on #app
    const app = document.getElementById('app');
    app.classList.add('screen-shake');
    setTimeout(() => app.classList.remove('screen-shake'), 400);
  }

  // ── COMBO POPUP ───────────────────────────────
  let comboPopupTimeout = null;
  function showComboPopup(combo, multiplier) {
    let el = document.querySelector('.combo-popup');
    if (!el) {
      el = document.createElement('div');
      el.className = 'combo-popup';
      document.body.appendChild(el);
    }
    clearTimeout(comboPopupTimeout);

    const colors = {
      1: 'var(--neon-purple)',
      2: 'var(--neon-purple)',
      3: 'var(--neon-cyan)',
      4: 'var(--neon-cyan)',
      5: 'var(--neon-pink)',
      6: 'var(--neon-pink)',
      7: 'var(--neon-yellow)',
      8: 'var(--neon-yellow)',
    };
    const color = colors[Math.min(combo, 8)] || 'var(--neon-purple)';

    el.innerHTML = `<span class="combo-popup-text combo-pop" style="color:${color};text-shadow:0 0 20px ${color};">x${multiplier} COMBO!</span>`;
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';

    comboPopupTimeout = setTimeout(() => {
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.5s ease';
    }, 900);
  }

  // ── LIFE LOST ANIMATION ───────────────────────
  function animateLifeLost(lifeIndex) {
    const icons = document.querySelectorAll('.life-icon');
    if (icons[lifeIndex]) {
      icons[lifeIndex].classList.add('life-lost');
      setTimeout(() => {
        icons[lifeIndex].classList.add('dead');
      }, 500);
    }
  }

  function animateLifeGained(lifeIndex) {
    const icons = document.querySelectorAll('.life-icon');
    if (icons[lifeIndex]) {
      icons[lifeIndex].classList.remove('dead', 'life-lost', 'life-gained');
      void icons[lifeIndex].offsetWidth; // force reflow
      icons[lifeIndex].classList.add('life-gained');
    }
  }

  // ── WEB AUDIO SFX ────────────────────────────
  let audioCtx = null;
  function getAudio() {
    if (!audioCtx) {
      try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
    }
    return audioCtx;
  }

  function beep(freq = 440, duration = 0.1, type = 'square', vol = 0.15) {
    try {
      const ctx = getAudio();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch(e) {}
  }

  function sfxCorrect() {
    beep(523, 0.08, 'square', 0.12);
    setTimeout(() => beep(659, 0.08, 'square', 0.12), 80);
    setTimeout(() => beep(784, 0.12, 'square', 0.12), 160);
  }

  function sfxWrong() {
    beep(200, 0.15, 'sawtooth', 0.15);
    setTimeout(() => beep(150, 0.2, 'sawtooth', 0.12), 100);
  }

  function sfxCombo(level) {
    const freqs = [523, 659, 784, 880, 1047, 1175, 1319, 1568];
    const f = freqs[Math.min(level - 1, freqs.length - 1)];
    beep(f, 0.1, 'square', 0.1);
  }

  function sfxLifeLost() {
    beep(300, 0.1, 'sawtooth', 0.2);
    setTimeout(() => beep(220, 0.15, 'sawtooth', 0.18), 120);
    setTimeout(() => beep(150, 0.25, 'sawtooth', 0.15), 250);
  }

  function sfxCountdown() {
    beep(440, 0.15, 'square', 0.15);
  }
  function sfxCountdownGo() {
    beep(880, 0.05, 'square', 0.18);
    setTimeout(() => beep(1320, 0.15, 'square', 0.18), 60);
  }

  function sfxEliminated() {
    [400, 300, 200, 130].forEach((f, i) => setTimeout(() => beep(f, 0.2, 'sawtooth', 0.15), i * 120));
  }

  // ── PARTICLES ON HOME SCREEN ─────────────────
  function initParticles() {
    const field = document.getElementById('particle-field');
    if (!field) return;
    const colors = ['#B026FF', '#FF2D78', '#00F5FF', '#FFE600', '#39FF14'];
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.cssText = `
        left: ${Math.random() * 100}%;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${Math.random() * 3 + 1}px;
        height: ${Math.random() * 3 + 1}px;
        animation-duration: ${Math.random() * 10 + 8}s;
        animation-delay: ${Math.random() * 10}s;
        opacity: ${Math.random() * 0.6 + 0.2};
      `;
      field.appendChild(p);
    }
  }

  return {
    toast, flashCorrect, flashWrong,
    showComboPopup,
    animateLifeLost, animateLifeGained,
    sfxCorrect, sfxWrong, sfxCombo, sfxLifeLost,
    sfxCountdown, sfxCountdownGo, sfxEliminated,
    initParticles
  };
})();
