// public/js/minigames/match-concepts.js
// Renderer for match-concepts type — tap term, then tap definition

MinigameRegistry.register('match-concepts', {
  render(container, data, onAnswer) {
    let selectedTerm = null;
    let matches = {}; // { term: definition }
    let answered = false;

    const rerender = () => {
      const termsHtml = data.terms.map(term => {
        const isMatched = matches[term] !== undefined;
        const isSelected = selectedTerm === term;
        let cls = 'match-chip match-term';
        if (isMatched) cls += ' matched';
        else if (isSelected) cls += ' selected';
        return `<div class="${cls}" data-term="${MinigameRegistry.escapeAttr(term)}">${MinigameRegistry.escapeHtml(term)}</div>`;
      }).join('');

      const matchedDefs = Object.values(matches);
      const defsHtml = data.definitions.map(def => {
        const isMatched = matchedDefs.includes(def);
        let cls = 'match-chip match-definition';
        if (isMatched) cls += ' matched';
        else if (selectedTerm) cls += ' selectable';
        return `<div class="${cls}" data-def="${MinigameRegistry.escapeAttr(def)}">${MinigameRegistry.escapeHtml(def)}</div>`;
      }).join('');

      const allMatched = Object.keys(matches).length === data.terms.length;

      container.innerHTML = `
        <div class="minigame-instruction">
          ${MinigameRegistry.topicBadge(data.topic)}
          <br/>Conecta cada término con su definición
        </div>
        <div class="match-area">
          <div>
            <p class="match-col-label">Términos</p>
            <div class="match-terms">${termsHtml}</div>
          </div>
          <div>
            <p class="match-col-label">Definiciones</p>
            <div class="match-definitions">${defsHtml}</div>
          </div>
        </div>
        ${allMatched && !answered ? `
          <button class="btn btn-success btn-full" id="match-submit" style="max-width:640px;width:100%;">
            ✓ Confirmar Respuestas
          </button>
        ` : ''}
        ${selectedTerm ? `<p style="text-align:center;font-family:var(--font-ui);font-size:0.8rem;color:var(--neon-cyan);letter-spacing:0.1em;">
          Seleccionado: <strong>${MinigameRegistry.escapeHtml(selectedTerm)}</strong> — ahora elige su definición
        </p>` : ''}
      `;

      // Term click
      container.querySelectorAll('.match-term:not(.matched)').forEach(el => {
        el.addEventListener('click', () => {
          selectedTerm = selectedTerm === el.dataset.term ? null : el.dataset.term;
          rerender();
        });
      });

      // Definition click
      container.querySelectorAll('.match-definition:not(.matched)').forEach(el => {
        el.addEventListener('click', () => {
          if (!selectedTerm) return;
          matches[selectedTerm] = el.dataset.def;
          selectedTerm = null;
          rerender();
        });
      });

      // Submit
      const submitBtn = document.getElementById('match-submit');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          onAnswer(matches);
        });
      }
    };

    rerender();
  }
});
