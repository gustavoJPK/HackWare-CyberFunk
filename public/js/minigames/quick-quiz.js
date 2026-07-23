// public/js/minigames/quick-quiz.js
// Renderer for quick-quiz type

MinigameRegistry.register('quick-quiz', {
  render(container, data, onAnswer) {
    const isSingleCol = data.choices.some(c => c.length > 35);
    container.innerHTML = `
      <div class="minigame-instruction">
        ${MinigameRegistry.topicBadge(data.topic)}
        <br/>${MinigameRegistry.escapeHtml(data.question)}
      </div>
      ${MinigameRegistry.buildChoices(data.choices, isSingleCol)}
    `;

    container.querySelectorAll('.choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = btn.dataset.value;
        // Disable all buttons
        container.querySelectorAll('.choice-btn').forEach(b => b.classList.add('disabled'));
        btn.classList.remove('disabled');
        btn.classList.add('selected');
        onAnswer(answer);
      }, { once: true });
    });
  }
});
