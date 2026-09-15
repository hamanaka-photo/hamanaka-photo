(() => {
  const root = document.querySelector('[data-introduction-page]');
  if (!root) return;

  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
  const safeUrl = value => {
    try {
      const url = new URL(String(value || ''), window.location.href);
      return ['http:', 'https:'].includes(url.protocol) ? String(value) : '';
    } catch (_) { return ''; }
  };
  const paragraphs = items => (Array.isArray(items) ? items : [])
    .map(text => `<p>${escapeHtml(text)}</p>`).join('');
  const setText = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  };
  const image = (item, className = '') => {
    const src = safeUrl(item?.image);
    return src ? `<img class="${className}" src="${escapeHtml(src)}" alt="${escapeHtml(item.alt || item.title || '')}" loading="lazy" decoding="async">` : '';
  };

  const titleWithPreferredBreak = value => {
    const text = String(value || '');
    if (text === '暮らすように旅して、撮る。') return escapeHtml(text);
    const index = text.indexOf('、');
    if (index < 0) return escapeHtml(text);
    return `${escapeHtml(text.slice(0, index + 1))}<br>${escapeHtml(text.slice(index + 1))}`;
  };

  const applyStaticAdjustments = () => {
    const leadTitle = document.querySelector('[data-intro-trip-lead] h3');
    if (leadTitle) leadTitle.innerHTML = titleWithPreferredBreak(leadTitle.textContent);

    const closingTitle = document.querySelector('.intro-closing .intro-section-head h2');
    if (closingTitle) closingTitle.textContent = 'さぁ、何からはじめよう。';

    if (!document.getElementById('introduction-layout-adjustments')) {
      const style = document.createElement('style');
      style.id = 'introduction-layout-adjustments';
      style.textContent = `
        @media (min-width: 901px) {
          .intro-hero h1 {
            max-width: none;
            white-space: nowrap;
            font-size: clamp(42px, 5.3vw, 68px);
          }
          .intro-living-inner { align-items: stretch; }
          .intro-living figure {
            min-height: 0;
            height: 100%;
            align-self: stretch;
          }
          .intro-living figure img {
            width: 100%;
            height: 100%;
            min-height: 0;
            object-fit: cover;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  const renderTrip = trip => {
    if (!trip) return;
    setText('#trip-title', trip.title);
    const cards = document.querySelector('[data-intro-trip-cards]');
    if (cards && Array.isArray(trip.cards)) {
      cards.innerHTML = trip.cards.slice(0, 4).map(card => `
        <article class="intro-trip-card">
          <figure>${image(card)}</figure>
          <div><h3${card.title === '暮らすように旅して、撮る。' ? ' class="intro-trip-title-living"' : ''}>${titleWithPreferredBreak(card.title)}</h3><div class="intro-body">${paragraphs(card.paragraphs)}</div></div>
        </article>`).join('');
    }
  };

  const renderSubjects = subjects => {
    const grid = document.querySelector('[data-intro-subjects]');
    if (!grid || !Array.isArray(subjects)) return;
    grid.innerHTML = subjects.map(item => `<article class="intro-subject-card">${image(item)}<div><p class="eyebrow">${escapeHtml(item.eyebrow)}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></div></article>`).join('');
  };

  const linkMeta = url => /gallery\.html/i.test(url) ? ['GALLERY', 'GALLERYを見る'] : /guide\.html/i.test(url) ? ['PHOTO GUIDE', 'PHOTO GUIDEを見る'] : ['PROJECT', 'PROJECTを見る'];
  const renderLinks = links => {
    const grid = document.querySelector('[data-intro-links]');
    if (!grid || !Array.isArray(links)) return;
    grid.innerHTML = links.map(item => {
      const url = safeUrl(item.url);
      if (!url) return '';
      const [eyebrow, label] = linkMeta(url);
      return `<a class="intro-link-card" href="${escapeHtml(url)}"><p class="eyebrow">${eyebrow}</p><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p><span>${label} →</span></a>`;
    }).join('');
  };

  const applyArticle = article => {
    const page = article?.introduction;
    if (!page) return;
    document.title = '浜中町を知る｜HAMANAKA PHOTO';
    const description = document.querySelector('meta[name="description"]');
    if (description && article.summary) description.setAttribute('content', article.summary);
    setText('[data-intro-hero-eyebrow]', article.eyebrow || 'INTRODUCTION');
    setText('[data-intro-hero-title]', article.title);
    const heroLead = document.querySelector('[data-intro-hero-lead]');
    if (heroLead) heroLead.innerHTML = paragraphs(page.heroLead);
    const heroImage = document.querySelector('[data-intro-hero-image]');
    if (heroImage && safeUrl(article.cover)) { heroImage.src = article.cover; heroImage.alt = article.title || ''; }
    renderTrip(page.trip);
    renderSubjects(page.subjects);
    renderLinks(page.links);
    applyStaticAdjustments();
  };

  applyStaticAdjustments();

  fetch('data/guide-articles.json', { cache: 'no-cache' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error(response.status)))
    .then(articles => applyArticle(Array.isArray(articles) ? articles.find(item => item?.id === 'introduction') : null))
    .catch(() => root.classList.add('is-introduction-fallback'));
})();
