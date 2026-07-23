// public/js/minigames/order-lines.js
// Renderer for order-lines type — tap to build code order

MinigameRegistry.register('order-lines', {
  render(container, data, onAnswer) {
    // State: pool (remaining), answer (selected in order)
    let pool = [...data.shuffledLines];
    let answer = [];
    let answered = false;

    const render = () => {
      const poolHtml = pool.map((line, i) => `
        <div class="order-line-chip" data-source="pool" data-index="${i}">
          <span style="color:var(--text-muted);font-size:0.75rem;">+</span>
          ${MinigameRegistry.escapeHtml(line)}
        </div>
      `).join('');

      const answerHtml = answer.map((line, i) => `
        <div class="order-line-chip in-answer" data-source="answer" data-index="${i}">
          <span style="color:var(--neon-cyan);font-size:0.75rem;min-width:16px;">${i + 1}.</span>
          ${MinigameRegistry.escapeHtml(line)}
        </div>
      `).join('');

      container.innerHTML = `
        <div class="minigame-instruction">
          ${MinigameRegistry.topicBadge(data.topic)}
          <br/>${MinigameRegistry.escapeHtml(data.instruction)}
        </div>
        <div class="order-lines-area">
          <div>
            <p class="order-label">Líneas disponibles (toca para agregar)</p>
            <div id="order-pool">${poolHtml || '<p style="color:var(--text-muted);font-size:0.8rem;padding:8px;">✓ Todas las líneas colocadas</p>'}</div>
          </div>
          <div>
            <p class="order-label">Tu código (toca para quitar)</p>
            <div class="order-answer-area" id="order-answer">
              ${answer.length === 0 ? '<p class="order-answer-placeholder">Toca una línea para agregarla aquí</p>' : answerHtml}
            </div>
          </div>
          ${answer.length === data.correctLines.length && !answered ? `
            <button class="btn btn-success btn-full order-submit-btn" id="order-submit">
              ✓ Confirmar Orden
            </button>
          ` : ''}
        </div>
      `;

      // Pool: tap to add to answer
      document.querySelectorAll('#order-pool .order-line-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (answered) return;
          const idx = parseInt(chip.dataset.index);
          const line = pool.splice(idx, 1)[0];
          answer.push(line);
          render();
        });
      });

      // Answer: tap to remove back to pool
      document.querySelectorAll('#order-answer .order-line-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (answered) return;
          const idx = parseInt(chip.dataset.index);
          const line = answer.splice(idx, 1)[0];
          pool.push(line);
          render();
        });
      });

      // Submit button
      const submitBtn = document.getElementById('order-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          onAnswer(answer);
        });
      }
    };

    render();
  }
});
