(() => {
  const root = document.querySelector('[data-introduction-page]');
  if (!root) return;
  const descriptionMeta = document.querySelector('meta[name="description"]');

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[character]));

  const safeUrl = (value = '') => {
    const url = String(value || '').trim();
    if (!url) return '';
    try {
      const parsed = new URL(url, window.location.href);
      return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
    } catch (error) {
      return '';
    }
  };

  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  };

  const setImage = (selector, image, alt = '') => {
    const node = document.querySelector(selector);
    const src = safeUrl(image);
    if (!node || !src) return;
    node.src = src;
    node.alt = alt || '';
  };

  const renderParagraphs = (selector, value) => {
    const node = document.querySelector(selector);
    if (!node || !value) return;
    const paragraphs = String(value).split(/\n\s*\n/).map(text => text.trim()).filter(Boolean);
    node.innerHTML = paragraphs.map(text => `<p>${escapeHtml(text)}</p>`).join('');
  };

  const renderSubjects = items => {
    const grid = document.querySelector('[data-intro-subjects]');
    if (!grid || !Array.isArray(items) || !items.length) return;
    grid.innerHTML = items.map(item => {
      const image = safeUrl(item.image);
      return `<article class="intro-subject-card">
        ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.imageAlt || '')}" loading="lazy" decoding="async">` : ''}
        <div>
          ${item.eyebrow ? `<p class="eyebrow">${escapeHtml(item.eyebrow)}</p>` : ''}
          <h3>${escapeHtml(item.title || '')}</h3>
          ${item.text ? `<p>${escapeHtml(item.text)}</p>` : ''}
        </div>
      </article>`;
    }).join('');
  };

  const renderCycle = items => {
    const grid = document.querySelector('[data-intro-cycle]');
    if (!grid || !Array.isArray(items) || !items.length) return;
    grid.innerHTML = items.map(item => `<div class="intro-cycle-item"><strong>${escapeHtml(item.label || '')}</strong><span>${escapeHtml(item.text || '')}</span></div>`).join('');
  };

  const renderLinks = items => {
    const grid = document.querySelector('[data-intro-links]');
    if (!grid || !Array.isArray(items) || !items.length) return;
    grid.innerHTML = items.map(item => {
      const url = safeUrl(item.url);
      if (!url) return '';
      return `<a class="intro-link-card" href="${escapeHtml(url)}">
        ${item.eyebrow ? `<p class="eyebrow">${escapeHtml(item.eyebrow)}</p>` : ''}
        <h3>${escapeHtml(item.title || '')}</h3>
        ${item.text ? `<p>${escapeHtml(item.text)}</p>` : ''}
        <span>${escapeHtml(item.label || '詳しく見る')} →</span>
      </a>`;
    }).join('');
  };

  const applyData = data => {
    if (data?.seo?.title) document.title = data.seo.title;
    if (descriptionMeta && data?.seo?.description) descriptionMeta.setAttribute('content', data.seo.description);

    setText('[data-intro-hero-eyebrow]', data?.hero?.eyebrow);
    setText('[data-intro-hero-title]', data?.hero?.title);
    setText('[data-intro-hero-lead]', data?.hero?.lead);
    setImage('[data-intro-hero-image]', data?.hero?.image, data?.hero?.imageAlt);

    setText('[data-intro-why-eyebrow]', data?.why?.eyebrow);
    setText('[data-intro-why-title]', data?.why?.title);
    renderParagraphs('[data-intro-why-body]', data?.why?.body);
    setImage('[data-intro-why-image]', data?.why?.image, data?.why?.imageAlt);

    setText('[data-intro-subjects-eyebrow]', data?.subjects?.eyebrow);
    setText('[data-intro-subjects-title]', data?.subjects?.title);
    setText('[data-intro-subjects-lead]', data?.subjects?.lead);
    renderSubjects(data?.subjects?.items);

    setText('[data-intro-perspective-eyebrow]', data?.perspective?.eyebrow);
    setText('[data-intro-perspective-title]', data?.perspective?.title);
    renderParagraphs('[data-intro-perspective-body]', data?.perspective?.body);
    setImage('[data-intro-perspective-image]', data?.perspective?.image, data?.perspective?.imageAlt);

    setText('[data-intro-promotion-eyebrow]', data?.promotion?.eyebrow);
    setText('[data-intro-promotion-title]', data?.promotion?.title);
    setText('[data-intro-promotion-lead]', data?.promotion?.lead);
    setText('[data-intro-promotion-body]', data?.promotion?.body);
    renderCycle(data?.promotion?.cycle);

    setText('[data-intro-closing-eyebrow]', data?.closing?.eyebrow);
    setText('[data-intro-closing-title]', data?.closing?.title);
    setText('[data-intro-closing-lead]', data?.closing?.lead);
    renderLinks(data?.closing?.links);
  };

  fetch('data/introduction.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`introduction.json: ${response.status}`);
      return response.json();
    })
    .then(applyData)
    .catch(error => console.error('INTRODUCTION data could not be loaded.', error));
})();
