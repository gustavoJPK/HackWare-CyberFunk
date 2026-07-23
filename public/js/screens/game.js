// public/js/screens/game.js
// Main game screen controller — handles all mid-game socket events

const GameScreen = (() => {
  let currentMinigameData = null;
  let answerSubmitted = false;
  let myState = { lives: 5, score: 0, combo: 0, multiplier: 1 };

  function init() {
    const socket = SocketClient.get();

    // Next minigame event
    socket.on('nextMinigame', ({ round, minigameData }) => {
      answerSubmitted = false;
      currentMinigameData = minigameData;

      HUD.update({ round });

      // Start timer
      HUD.startTimer(minigameData.timeLimit, () => {
        // Time's up: auto-submit null (timeout)
        if (!answerSubmitted) {
          answerSubmitted = true;
          submitAnswer(null);
        }
      });

      // Render minigame
      const container = document.getElementById('minigame-container');
      MinigameRegistry.render(container, minigameData, (answer) => {
        if (answerSubmitted) return;
        answerSubmitted = true;
        submitAnswer(answer);
      });
    });

    // Answer result (private, only for this player)
    socket.on('answerResult', ({ correct, correctAnswer, points, combo, multiplier, lives, score, lifeGained, timedOut }) => {
      const prevLives = myState.lives;
      myState = { lives, score, combo, multiplier };

      HUD.update({ lives, score, combo, multiplier });

      if (correct) {
        Effects.flashCorrect();
        Effects.sfxCorrect();
        if (multiplier > 1) {
          Effects.showComboPopup(combo, multiplier);
          Effects.sfxCombo(multiplier);
        }
        if (lifeGained) {
          Effects.toast('❤️ +1 vida recuperada!', 'success', 2000);
          Effects.animateLifeGained(lives - 1);
        }
        // Flash +points
        showPointsPopup(points, multiplier);
      } else {
        Effects.flashWrong();
        Effects.sfxWrong();
        if (lives < prevLives) {
          Effects.sfxLifeLost();
          Effects.animateLifeLost(lives); // lives is current (post-deduction)
          if (lives === 0) {
            // Will be eliminated
            Effects.sfxEliminated();
          }
          if (timedOut) {
            Effects.toast('⏰ ¡Tiempo agotado!', 'error', 1500);
          } else {
            Effects.toast('✗ Respuesta incorrecta', 'error', 1200);
          }
        }
      }
    });

    // Scores update (all players)
    socket.on('scoresUpdate', ({ players }) => {
      HUD.updateMiniScores(players);

      // Update spectator view if eliminated
      const spectatorEl = document.getElementById('spectator-scores');
      if (spectatorEl) {
        renderSpectatorScores(players, spectatorEl);
      }
    });

    // Player eliminated
    socket.on('playerEliminated', ({ playerId, username, score }) => {
      const myId = SocketClient.getPlayerId();
      if (playerId === myId) {
        // I got eliminated
        setTimeout(() => App.showScreen('eliminated'), 600);
      } else {
        Effects.toast(`💀 ${username} fue eliminado!`, 'info', 2000);
      }
    });

    // Game over
    socket.on('gameOver', ({ ranking }) => {
      HUD.stopTimer();
      setTimeout(() => {
        ResultsScreen.show(ranking);
        App.showScreen('results');
      }, 1000);
    });
  }

  function submitAnswer(answer) {
    SocketClient.get().emit('submitAnswer', { answer });
  }

  function showPointsPopup(points, multiplier) {
    const container = document.getElementById('minigame-area');
    const popup = document.createElement('div');
    popup.className = 'answer-flash';
    popup.innerHTML = `<span class="answer-flash-text correct fade-in-scale">+${points.toLocaleString()}</span>`;
    container.appendChild(popup);
    setTimeout(() => popup.remove(), 700);
  }

  function renderSpectatorScores(players, container) {
    const myId = SocketClient.getPlayerId();
    const sorted = [...players].sort((a, b) => b.score - a.score);
    container.innerHTML = sorted.map((p, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;
                  background:${p.id === myId ? 'rgba(176,38,255,0.1)' : 'var(--bg-card2)'};
                  border:1px solid ${p.alive ? 'rgba(176,38,255,0.3)' : 'rgba(255,68,68,0.2)'};
                  border-radius:var(--radius-md);margin-bottom:6px;">
        <span style="font-family:var(--font-display);font-size:0.9rem;color:var(--text-muted);min-width:24px;">${i + 1}</span>
        <span style="font-family:var(--font-ui);font-weight:700;flex:1;color:${p.alive ? 'var(--text-primary)' : 'var(--text-muted)'};">
          ${p.username}${p.id === myId ? ' (tú)' : ''}
        </span>
        ${p.alive ? `<span style="font-size:0.75rem;color:var(--neon-green);">x${p.multiplier}</span>` : '<span style="font-size:0.75rem;">💀</span>'}
        <span style="font-family:var(--font-display);font-size:0.9rem;color:var(--neon-yellow);">${p.score.toLocaleString()}</span>
      </div>
    `).join('');
  }

  function reset() {
    myState = { lives: 5, score: 0, combo: 0, multiplier: 1 };
    answerSubmitted = false;
    currentMinigameData = null;
    HUD.reset();
    document.getElementById('minigame-container').innerHTML = '';
  }

  return { init, reset };
})();
