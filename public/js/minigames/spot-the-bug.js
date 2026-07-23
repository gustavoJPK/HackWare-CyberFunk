// public/js/minigames/spot-the-bug.js
// Renderer for spot-the-bug type — click the buggy line

MinigameRegistry.register('spot-the-bug', {
  render(container, data, onAnswer) {
    const linesHtml = data.lines.map((line, i) => `
      <div class="code-line clickable" data-index="${i}">
        <span class="code-line-number">${i + 1}</span>
        <span class="code-line-text">${MinigameRegistry.escapeHtml(line)}</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="minigame-instruction">
        ${MinigameRegistry.topicBadge(data.topic)}
        <br/>¡Encuentra el bug! Toca la línea con el error.
      </div>
      <div class="code-block" style="max-width:640px;width:100%;">
        <div class="code-block-header">
          <div class="code-dot code-dot-red"></div>
          <div class="code-dot code-dot-yellow"></div>
          <div class="code-dot code-dot-green"></div>
        </div>
        <div class="code-content">${linesHtml}</div>
      </div>
    `;

    container.querySelectorAll('.code-line.clickable').forEach(line => {
      line.addEventListener('click', () => {
        const index = parseInt(line.dataset.index);
        // Highlight selected
        container.querySelectorAll('.code-line.clickable').forEach(l => {
          l.classList.remove('clickable');
          l.style.cursor = 'default';
        });
        line.classList.add('selected-bug');
        onAnswer(index);
      }, { once: true });
    });
  }
});
