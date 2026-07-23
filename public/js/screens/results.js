// public/js/screens/results.js
// Results screen controller

const ResultsScreen = (() => {
  function init() {
    document.getElementById('btn-play-again').addEventListener('click', () => {
      App.showScreen('lobby');
      LobbyScreen.render();
    });
    document.getElementById('btn-results-home').addEventListener('click', () => {
      App.showScreen('home');
    });
  }

  function show(ranking) {
    // Podium (top 3)
    const podiumEl = document.getElementById('results-podium');
    const medals = ['🥇', '🥈', '🥉'];
    const top3 = ranking.slice(0, 3);

    // Reorder for display: 2nd, 1st, 3rd (visual podium style)
    const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
    const podiumClasses = top3[1] ? ['podium-place-2', 'podium-place-1', 'podium-place-3'] : ['podium-place-1', 'podium-place-3'];

    podiumEl.innerHTML = podiumOrder.map((player, vi) => {
      const realIdx = [1, 0, 2][vi]; // map visual index to rank index
      const rankClass = podiumClasses[vi];
      const letter = player.username.charAt(0).toUpperCase();
      const animClass = ['podium-2', 'podium-1', 'podium-3'][vi];
      return `
        <div class="podium-place ${rankClass} ${animClass}">
          <div class="podium-avatar">${letter}</div>
          <p class="podium-username">${player.username}</p>
          <p class="podium-score">${player.score.toLocaleString()}</p>
          <div class="podium-block">
            <span class="podium-medal">${medals[realIdx] || ''}</span>
          </div>
        </div>
      `;
    }).join('');

    // Full ranking table
    const rankingEl = document.getElementById('results-ranking');
    rankingEl.innerHTML = ranking.map((p, i) => {
      const delay = `animation-delay:${i * 0.08}s;`;
      const rankClass = i < 3 ? `rank-${i + 1}` : '';
      const medal = medals[i] || `${i + 1}`;
      return `
        <div class="ranking-row ${rankClass}" style="${delay}">
          <span class="rank-number">${medal}</span>
          <div>
            <p class="ranking-username">${p.username}</p>
            <div class="ranking-stats">
              <span>❤️ ${p.livesRemaining}</span>
              <span>⚡ x${p.maxCombo}</span>
              <span>✓ ${p.correctAnswers}/${p.totalAnswers}</span>
              <span>⏱ ${(p.avgResponseTime / 1000).toFixed(1)}s</span>
            </div>
          </div>
          <span></span>
          <span class="ranking-score">${p.score.toLocaleString()}</span>
        </div>
      `;
    }).join('');
  }

  return { init, show };
})();
