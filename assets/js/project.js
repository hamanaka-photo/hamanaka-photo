(() => {
  const root = document.querySelector('[data-project-page]');
  const grid = document.querySelector('[data-project-grid]');
  if (!root || !grid) return;

  const heroEyebrow = document.querySelector('[data-project-hero-eyebrow]');
  const heroTitle = document.querySelector('[data-project-hero-title]');
  const heroLead = document.querySelector('[data-project-hero-lead]');
  const descriptionMeta = document.querySelector('meta[name="description"]');

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[character]));

  const normalizeId = (value = '') => {
    const id = String(value).trim().toLowerCase();
    return /^[a-z0-9][a-z0-9-]*$/.test(id) ? id : '';
  };

  const safeUrl = (value = '') => {
    const url = String(value).trim();
    if (!url) return '';

    try {
      const parsed = new URL(url, window.location.href);
      return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
    } catch (error) {
      return '';
    }
  };

  const toneClass = tone => {
    const allowed = new Set(['coming-soon', 'open', 'report', 'archive', 'neutral']);
    return allowed.has(tone) ? ` status-${tone}` : '';
  };

  const renderCard = item => {
    const id = normalizeId(item.id);
    const url = safeUrl(item.url);
    const image = safeUrl(item.image);
    const external = Boolean(item.external) && /^https?:\/\//i.test(url);
    const target = external ? ' target="_blank" rel="noopener"' : '';

    const visual = image
      ? `
        <div class="project-card-visual">
          <img src="${escapeHtml(image)}" alt="${escapeHtml(item.imageAlt || '')}" loading="lazy" decoding="async">
        </div>`
      : '';

    const status = item.status
      ? `<div class="status${toneClass(item.statusTone)}">${escapeHtml(item.status)}</div>`
      : '';

    const action = url
      ? `<div class="project-card-action"><a class="btn btn-outline" href="${escapeHtml(url)}"${target}>${escapeHtml(item.buttonLabel || '詳しく見る')} →</a></div>`
      : '';

    const footer = status || action
      ? `<div class="project-card-footer">${status}${action}</div>`
      : '';

    return `
      <article class="project-card${image ? ' has-image' : ''}"${id ? ` id="${escapeHtml(id)}"` : ''}>
        ${visual}
        <div class="project-card-body">
          ${item.eyebrow ? `<p class="eyebrow">${escapeHtml(item.eyebrow)}</p>` : ''}
          <h2>${escapeHtml(item.title || '')}</h2>
          ${item.text ? `<p class="project-card-text">${escapeHtml(item.text)}</p>` : ''}
          ${footer}
        </div>
      </article>`;
  };

  const applyPage = data => {
    if (data?.seo?.title) document.title = data.seo.title;
    if (descriptionMeta && data?.seo?.description) {
      descriptionMeta.setAttribute('content', data.seo.description);
    }

    if (heroEyebrow && data?.hero?.eyebrow) heroEyebrow.textContent = data.hero.eyebrow;
    if (heroTitle && data?.hero?.title) heroTitle.textContent = data.hero.title;
    if (heroLead && data?.hero?.lead) heroLead.textContent = data.hero.lead;

    const cards = Array.isArray(data?.cards)
      ? data.cards
          .filter(item => item && item.published !== false)
          .sort((a, b) => Number(a.order || 0) - Number(b.order || 0))
      : [];

    if (!cards.length) {
      grid.innerHTML = `<p class="section-lead project-empty">${escapeHtml(data?.emptyMessage || '現在公開中の写真活動はありません。')}</p>`;
      return;
    }

    grid.innerHTML = cards.map(renderCard).join('');
  };

  const loadProject = async () => {
    try {
      const response = await fetch('data/project.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`project.json: ${response.status}`);

      const data = await response.json();
      applyPage(data);
      root.classList.add('is-project-loaded');
    } catch (error) {
      // project.html 内の初期3カードをフォールバックとして残す。
      console.error('PHOTO PROJECT data could not be loaded.', error);
      root.classList.add('is-project-fallback');
    }
  };

  loadProject();
})();
