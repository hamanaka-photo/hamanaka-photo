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

  const renderTrip = trip => {
    if (!trip) return;
    setText('#trip-title', trip.title);
    const lead = document.querySelector('[data-intro-trip-lead]');
    if (lead && trip.lead) lead.innerHTML = `<div class="intro-copy"><h3>${escapeHtml(trip.lead.title)}</h3><div class="intro-body">${paragraphs(trip.lead.paragraphs)}</div></div><figure class="intro-image">${image(trip.lead)}</figure>`;
    const points = document.querySelector('[data-intro-trip-points]');
    if (points && Array.isArray(trip.points)) points.innerHTML = trip.points.map(point => `<article class="intro-trip-point">${image(point)}<div><h3>${escapeHtml(point.title)}</h3>${paragraphs(point.paragraphs)}</div></article>`).join('');
  };

  const renderLiving = living => {
    const section = document.querySelector('[data-intro-living]');
    if (!section || !living) return;
    section.querySelector('h2').textContent = living.title || '';
    section.querySelector('.intro-body').innerHTML = paragraphs(living.paragraphs);
    const figure = section.querySelector('figure');
    if (figure) figure.innerHTML = image(living);
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
    renderLiving(page.living);
    renderSubjects(page.subjects);
    renderLinks(page.links);
  };

  fetch('data/guide-articles.json', { cache: 'no-cache' })
    .then(response => response.ok ? response.json() : Promise.reject(new Error(response.status)))
    .then(articles => applyArticle(Array.isArray(articles) ? articles.find(item => item?.id === 'introduction') : null))
    .catch(() => root.classList.add('is-introduction-fallback'));
})();
