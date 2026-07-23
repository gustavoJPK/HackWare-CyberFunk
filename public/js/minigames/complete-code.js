// public/js/minigames/complete-code.js
// Renderer for complete-code type

MinigameRegistry.register('complete-code', {
  render(container, data, onAnswer) {
    // Highlight the blank in the code
    const codeWithHighlight = data.code.replace(
      data.blank,
      `<span style="color:var(--neon-yellow);background:rgba(255,230,0,0.15);padding:0 4px;border-radius:3px;text-shadow:var(--glow-yellow);">${MinigameRegistry.escapeHtml(data.blank)}</span>`
    );

    container.innerHTML = `
      <div class="minigame-instruction">
        ${MinigameRegistry.topicBadge(data.topic)}
        <br/>Completa el código — ¿qué va en el espacio?
      </div>
      <div class="code-block" style="max-width:640px;width:100%;">
        <div class="code-block-header">
          <div class="code-dot code-dot-red"></div>
          <div class="code-dot code-dot-yellow"></div>
          <div class="code-dot code-dot-green"></div>
        </div>
        <div style="padding:16px;font-family:var(--font-code);font-size:0.9rem;color:var(--text-code);white-space:pre-wrap;line-height:1.7;">${codeWithHighlight}</div>
      </div>
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
