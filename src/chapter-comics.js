function croppedImage(artwork, [left, top, right, bottom], alt, esc, preview = false) {
  const frameWidth = right - left;
  const frameHeight = bottom - top;
  const frameStyle = `aspect-ratio: ${frameWidth} / ${frameHeight}`;
  const imageStyle = [
    `width: ${artwork.width / frameWidth * 100}%`,
    `height: ${artwork.height / frameHeight * 100}%`,
    `left: ${-left / frameWidth * 100}%`,
    `top: ${-top / frameHeight * 100}%`
  ].join(';');
  const file = preview ? artwork.preview?.file ?? artwork.file : artwork.file;
  return `<div class="${preview ? 'comic-cover-crop' : 'story-frame'}" style="${frameStyle}">
    <img src="./${esc(file)}" width="${artwork.width}" height="${artwork.height}"
      style="${imageStyle}" alt="${esc(alt)}"${preview ? ' loading="lazy" decoding="async"' : ''}>
  </div>`;
}

export function chapterCoverHTML(story, artwork, esc) {
  const [left, top, right, bottom] = artwork.panelBounds[0];
  const ratio = 16 / 10;
  const width = Math.min(right - left, (bottom - top) * ratio);
  const height = width / ratio;
  const x = left + (right - left - width) / 2;
  const y = top + (bottom - top - height) * .38;
  return croppedImage(artwork, [x, y, x + width, y + height], `${story.title}漫画封面`, esc, true);
}

function panelHTML(story, artwork, index, esc) {
  const panel = story.panels[index];
  const {section} = panel;
  const label = section ? `${section.number} ${section.title}` : panel.recap ? '故事收尾' : '故事开场';

  return `
    <div class="story-panel-meta">
      <span>第 ${index + 1} / ${story.panels.length} 格</span>
      <b>${esc(label)}</b>
    </div>
    ${croppedImage(artwork, artwork.panelBounds[index], panel.visual, esc)}
    <div class="story-dialogue">
      ${panel.question ? `<p class="fox-line"><b>栗栗</b><span>${esc(panel.question)}</span></p>` : ''}
      <p><b>${section ? '阿澄' : '旁白'}</b><span>${esc(panel.discovery)}</span></p>
    </div>
    ${section ? `
      <details class="story-facts">
        <summary>展开本格知识${section.formulas.length ? '与公式' : ''} <span>${section.knowledge.length}条知识</span></summary>
        <ul>${section.knowledge.map(point =>
          `<li data-story-knowledge="${esc(point.id)}"><b>${esc(point.title)}</b> ${esc(point.explanation)}</li>`
        ).join('')}</ul>
        ${section.formulas.length ? `<div class="story-formulas">${section.formulas.map(formula =>
          `<p><b>${esc(formula.expression)}</b><span>${esc(formula.condition)}</span></p>`
        ).join('')}</div>` : ''}
        <a class="text-button" href="#chapter/${story.chapterId}/${section.id}">读这一节的完整讲解 →</a>
      </details>` : ''}
  `;
}

export function chapterComicHTML(story, artwork, esc) {
  return `
    <section id="chapter-comic" class="chapter-comic story-section">
      <div class="section-label">CHAPTER COMIC / 章回漫画 · 情景示意</div>
      <div class="story-heading">
        <h2>${esc(story.title)}</h2>
        <button id="open-comic" class="button light">查看整页</button>
      </div>
      <p class="story-premise">${esc(story.premise)}</p>
      <div class="chapter-story-reader" tabindex="0" aria-label="漫画阅读器，可使用左右方向键翻格">
        <div class="story-panel" aria-live="polite">${panelHTML(story, artwork, 0, esc)}</div>
        <div class="story-controls">
          <button type="button" class="button light" data-story-move="-1" disabled>← 上一格</button>
          <span class="story-progress" role="status">1 / ${story.panels.length}</span>
          <button type="button" class="button light" data-story-move="1">下一格 →</button>
        </div>
      </div>
      <div class="story-index" role="group" aria-label="选择故事分格">
        ${story.panels.map((panel, index) => `
          <button type="button" data-story-panel="${index}" aria-current="${index === 0 ? 'step' : 'false'}">
            <span>${String(index + 1).padStart(2, '0')}</span>
            ${esc(panel.section?.title ?? (panel.recap ? '收尾' : '开场'))}
          </button>`).join('')}
      </div>
    </section>
  `;
}

export function bindChapterComic(section, story, artwork, esc) {
  const reader = section.querySelector('.chapter-story-reader');
  const display = reader.querySelector('.story-panel');
  const progress = reader.querySelector('.story-progress');
  const previous = reader.querySelector('[data-story-move="-1"]');
  const next = reader.querySelector('[data-story-move="1"]');
  const selectors = [...section.querySelectorAll('[data-story-panel]')];
  let current = 0;

  function show(index) {
    if (index < 0 || index >= story.panels.length || index === current) return;
    current = index;
    display.innerHTML = panelHTML(story, artwork, current, esc);
    progress.textContent = `${current + 1} / ${story.panels.length}`;
    previous.disabled = current === 0;
    next.disabled = current === story.panels.length - 1;
    selectors.forEach((button, i) => button.setAttribute('aria-current', i === current ? 'step' : 'false'));
    if (reader.getBoundingClientRect().top < 0) reader.scrollIntoView({block: 'start'});
  }

  previous.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  selectors.forEach((button, index) => button.addEventListener('click', () => {
    show(index);
    section.querySelector('.story-heading').scrollIntoView({block: 'start'});
  }));
  reader.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    show(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
}
