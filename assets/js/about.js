(() => {
  const root = document.querySelector('[data-about-page]');
  if (!root) return;

  const esc = (value = '') => String(value).replace(/[&<>"']/g, ch => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[ch]));
  const nl2br = value => esc(value || '').replace(/\r?\n/g, '<br>');
  const safeUrl = value => {
    const raw = String(value || '').trim();
    if (!raw || /^(javascript|data|vbscript):/i.test(raw)) return '';
    return raw;
  };
  const setText = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value !== undefined && value !== null) el.textContent = String(value);
  };
  const setHtml = (selector, value) => {
    const el = document.querySelector(selector);
    if (el && value !== undefined && value !== null) el.innerHTML = nl2br(value);
  };

  const render = data => {
    if (data.seo?.title) document.title = data.seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && data.seo?.description) meta.setAttribute('content', data.seo.description);

    const hero = data.hero || {};
    setText('[data-about-hero-eyebrow]', hero.eyebrow);
    setHtml('[data-about-hero-title]', hero.title);
    setHtml('[data-about-hero-lead]', hero.lead);
    const heroImage = document.querySelector('[data-about-hero-image]');
    if (heroImage && hero.image) heroImage.style.backgroundImage = `url("${String(hero.image).replace(/"/g, '%22')}")`;

    const intro = data.intro || {};
    setText('[data-about-intro-eyebrow]', intro.eyebrow);
    setHtml('[data-about-intro-title]', intro.title);
    const introCopy = document.querySelector('[data-about-intro-copy]');
    if (introCopy && Array.isArray(intro.paragraphs)) {
      introCopy.innerHTML = intro.paragraphs.map(p => `<p>${esc(p)}</p>`).join('');
    }

    const flow = data.flow || {};
    setText('[data-about-flow-eyebrow]', flow.eyebrow);
    setText('[data-about-flow-title]', flow.title);
    setText('[data-about-flow-lead]', flow.lead);
    const flowGrid = document.querySelector('[data-about-flow-items]');
    if (flowGrid && Array.isArray(flow.items)) {
      flowGrid.innerHTML = flow.items.map(item => `
        <li><span>${esc(item.number || '')}</span><b>${esc(item.title || '')}</b><p>${esc(item.text || '')}</p></li>
      `).join('');
    }

    const contents = data.contents || {};
    setText('[data-about-contents-eyebrow]', contents.eyebrow);
    setText('[data-about-contents-title]', contents.title);
    const contentGrid = document.querySelector('[data-about-content-items]');
    if (contentGrid && Array.isArray(contents.items)) {
      contentGrid.innerHTML = contents.items.map(item => {
        const url = safeUrl(item.url) || '#';
        const image = item.image ? `<img src="${esc(item.image)}" alt="" loading="lazy" decoding="async">` : '<div class="about-content-card-placeholder"></div>';
        return `<a class="about-content-card" href="${esc(url)}">
          ${image}
          <div>
            <p class="eyebrow">${esc(item.eyebrow || '')}</p>
            <h3>${esc(item.title || '')}</h3>
            <p>${esc(item.text || '')}</p>
            <span>${esc(item.buttonLabel || '詳しく見る →')}</span>
          </div>
        </a>`;
      }).join('');
    }

    const message = data.message || {};
    setText('[data-about-message-eyebrow]', message.eyebrow);
    setHtml('[data-about-message-title]', message.title);
    setText('[data-about-message-text]', message.text);
    const messageSection = document.querySelector('[data-about-message]');
    if (messageSection && message.image) {
      messageSection.style.backgroundImage = `linear-gradient(rgba(14,54,79,.86),rgba(21,58,91,.92)),url("${String(message.image).replace(/"/g, '%22')}")`;
      messageSection.style.backgroundSize = 'cover';
      messageSection.style.backgroundPosition = 'center';
    }
    const messageLink = document.querySelector('[data-about-message-link]');
    if (messageLink) {
      const url = safeUrl(message.url);
      if (url) messageLink.href = url;
      if (message.buttonLabel) messageLink.textContent = message.buttonLabel;
      messageLink.hidden = !url;
    }

    const info = data.information || {};
    setText('[data-about-info-eyebrow]', info.eyebrow);
    setText('[data-about-info-title]', info.title);
    const infoGrid = document.querySelector('[data-about-info-items]');
    if (infoGrid && Array.isArray(info.items)) {
      infoGrid.innerHTML = info.items.map(item => {
        const url = safeUrl(item.url);
        const link = url && item.linkLabel ? `<a href="${esc(url)}" ${item.external ? 'target="_blank" rel="noopener"' : ''}>${esc(item.linkLabel)}</a>` : '';
        return `<div class="about-info-card">
          <small>${esc(item.eyebrow || '')}</small>
          <h3>${esc(item.title || '')}</h3>
          <p>${esc(item.text || '')}</p>
          ${link}
        </div>`;
      }).join('');
    }

    root.classList.add('is-cms-loaded');
  };

  fetch('data/about.json', { cache: 'no-cache' })
    .then(response => {
      if (!response.ok) throw new Error(`about.json: ${response.status}`);
      return response.json();
    })
    .then(render)
    .catch(error => console.error('ABOUT CMS data could not be loaded.', error));
})();
