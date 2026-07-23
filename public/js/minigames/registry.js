// public/js/minigames/registry.js
// Client-side minigame renderer registry

const MinigameRegistry = (() => {
  const renderers = {};

  function register(type, renderer) {
    renderers[type] = renderer;
  }

  function render(container, minigameData, onAnswer) {
    const renderer = renderers[minigameData.type];
    if (!renderer) {
      console.warn('No renderer for type:', minigameData.type);
      return;
    }
    container.innerHTML = '';
    container.classList.remove('minigame-in');
    void container.offsetWidth;
    container.classList.add('minigame-in');
    renderer.render(container, minigameData, onAnswer);
  }

  // Helper: build code block HTML
  function buildCodeBlock(codeText, options = {}) {
    const lines = codeText.split('\n');
    const linesHtml = lines.map((line, i) => `
      <div class="code-line ${options.clickable ? 'clickable' : ''}" data-index="${i}">
        <span class="code-line-number">${i + 1}</span>
        <span class="code-line-text">${escapeHtml(line)}</span>
      </div>
    `).join('');
    return `
      <div class="code-block">
        <div class="code-block-header">
          <div class="code-dot code-dot-red"></div>
          <div class="code-dot code-dot-yellow"></div>
          <div class="code-dot code-dot-green"></div>
        </div>
        <div class="code-content">${linesHtml}</div>
      </div>
    `;
  }

  // Helper: build choices grid
  function buildChoices(choices, single = false) {
    const gridClass = single || choices.some(c => c.length > 30)
      ? 'choices-grid single-col' : 'choices-grid';
    return `<div class="${gridClass}">
      ${choices.map((c, i) => `
        <button class="choice-btn" data-choice="${i}" data-value="${escapeAttr(c)}">
          ${escapeHtml(c)}
        </button>
      `).join('')}
    </div>`;
  }

  // Helper: topic badge
  function topicBadge(topic) {
    return `<span class="topic-badge topic-${topic || 'algorithms'}">${topic || '?'}</span>`;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }
  function escapeAttr(s) {
    return String(s).replace(/"/g, '&quot;');
  }

  return { register, render, buildCodeBlock, buildChoices, topicBadge, escapeHtml, escapeAttr };
})();
