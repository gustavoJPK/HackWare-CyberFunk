// public/js/minigames/what-prints.js
// Renderer for what-prints type

MinigameRegistry.register('what-prints', {
  render(container, data, onAnswer) {
    container.innerHTML = `
      <div class="minigame-instruction">
        ${MinigameRegistry.topicBadge(data.topic)}
        <br/>¿Qué imprime este código?
      </div>
      ${MinigameRegistry.buildCodeBlock(data.code)}
      ${MinigameRegistry.buildChoices(data.choices, false)}
    `;

    container.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.choice-btn').forEach(b => b.classList.add('disabled'));
        btn.classList.remove('disabled');
        btn.classList.add('selected');
        onAnswer(btn.dataset.value);
      }, { once: true });
    });
  }
});
