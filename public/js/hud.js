// public/js/hud.js
// HUD controller: score, combo, lives, timer bar

const HUD = (() => {
  let timerInterval = null;
  let currentLives = 5;

  function update({ lives, score, combo, multiplier, round }) {
    if (lives !== undefined) setLives(lives);
    if (score !== undefined) setScore(score);
    if (combo !== undefined && multiplier !== undefined) setCombo(combo, multiplier);
    if (round !== undefined) setRound(round);
  }

  function setLives(lives) {
    const icons = document.querySelectorAll('#hud-lives .life-icon');
    icons.forEach((icon, i) => {
      const alive = i < lives;
      icon.classList.toggle('dead', !alive);
    });
    currentLives = lives;
  }

  function setScore(score) {
    const el = document.getElementById('hud-score');
    if (!el) return;
    el.textContent = score.toLocaleString();
    el.classList.add('score-pop');
    setTimeout(() => el.classList.remove('score-pop'), 300);
  }

  function setCombo(combo, multiplier) {
    const el = document.getElementById('hud-combo');
    if (!el) return;
    el.textContent = `x${multiplier}`;
    el.className = 'hud-combo-value';
    if (multiplier >= 8) el.classList.add('x8');
    else if (multiplier >= 6) el.classList.add('x6');
    else if (multiplier >= 4) el.classList.add('x4');
  }

  function setRound(round) {
    const el = document.getElementById('hud-round');
    if (el) el.textContent = round;
  }

  function startTimer(timeLimit, onExpire) {
    clearInterval(timerInterval);
    const bar = document.getElementById('timer-bar');
    if (!bar) return;

    const totalMs = timeLimit * 1000;
    const startTime = Date.now();

    bar.style.transition = 'none';
    bar.style.width = '100%';
    bar.className = '';

    timerInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const fraction = Math.max(0, 1 - elapsed / totalMs);
      bar.style.width = (fraction * 100) + '%';
      bar.style.transition = 'width 0.1s linear';

      // Color feedback
      if (fraction < 0.2) {
        bar.className = 'critical';
      } else if (fraction < 0.4) {
        bar.className = 'warning';
      } else {
        bar.className = '';
      }

      if (fraction <= 0) {
        clearInterval(timerInterval);
        if (onExpire) onExpire();
      }
    }, 50);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    const bar = document.getElementById('timer-bar');
    if (bar) bar.style.width = '0%';
  }

  function updateMiniScores(players) {
    const container = document.getElementById('hud-mini-scores');
    if (!container) return;

    const myId = SocketClient.getPlayerId();
    const alivePlayers = players.filter(p => p.alive).sort((a, b) => b.score - a.score);

    container.innerHTML = alivePlayers.slice(0, 4).map(p => {
      const isSelf = p.id === myId;
      const isLeading = alivePlayers[0]?.id === p.id;
      let cls = 'mini-score-chip';
      if (isSelf) cls += ' self';
      else if (isLeading) cls += ' leading';
      return `<div class="${cls}">
        <span>${p.username.substring(0,8)}</span>
        <strong>${p.score.toLocaleString()}</strong>
      </div>`;
    }).join('');
  }

  function reset() {
    setLives(5);
    setScore(0);
    setCombo(0, 1);
    setRound(1);
    stopTimer();
  }

  return { update, setLives, setScore, setCombo, setRound, startTimer, stopTimer, updateMiniScores, reset };
})();
