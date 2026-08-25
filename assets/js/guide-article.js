(() => {
  const root = document.querySelector('[data-guide-article]');
  if (!root) return;

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  const safeUrl = (value = '') => {
    const url = String(value).trim();
    if (!url) return '';
    if (/^(javascript|data|vbscript):/i.test(url)) return '';
    return url;
  };

  function sanitizeHtml(value = '') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(`<div>${String(value)}</div>`, 'text/html');
    const container = doc.body.firstElementChild;

    const allowedTags = new Set([
      'A', 'P', 'BR', 'STRONG', 'EM', 'B', 'I',
      'H2', 'H3', 'H4', 'UL', 'OL', 'LI',
      'BLOCKQUOTE', 'HR', 'CODE', 'PRE',
      'FIGURE', 'FIGCAPTION', 'IMG',
      'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD'
    ]);

    const dangerousTags = new Set([
      'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED',
      'FORM', 'INPUT', 'BUTTON', 'TEXTAREA', 'SELECT',
      'LINK', 'META'
    ]);

    [...container.querySelectorAll('*')].forEach(element => {
      if (dangerousTags.has(element.tagName)) {
        element.remove();
        return;
      }

      if (!allowedTags.has(element.tagName)) {
        element.replaceWith(...element.childNodes);
        return;
      }

      [...element.attributes].forEach(attribute => {
        const name = attribute.name.toLowerCase();
        const allowed = ['href', 'src', 'alt', 'title', 'target', 'rel', 'colspan', 'rowspan'];
        if (!allowed.includes(name)) {
          element.removeAttribute(attribute.name);
        }
      });

      if (element.hasAttribute('href')) {
        const href = safeUrl(element.getAttribute('href'));
        if (href) element.setAttribute('href', href);
        else element.removeAttribute('href');
      }

      if (element.hasAttribute('src')) {
        const src = safeUrl(element.getAttribute('src'));
        if (src) element.setAttribute('src', src);
        else element.removeAttribute('src');
      }

      if (element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }
    });

    return container.innerHTML;
  }

  const renderRichtext = block => `
    <section class="guide-content-block guide-richtext">
      ${sanitizeHtml(block.body || '')}
    </section>`;

  const renderImage = block => {
    if (!block.image) return '';
    return `
      <figure class="guide-content-block guide-image-block">
        <img src="${escapeHtml(block.image)}" alt="${escapeHtml(block.alt || '')}" loading="lazy">
        ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
      </figure>`;
  };

  const renderNote = block => `
    <aside class="guide-content-block guide-note guide-note-${escapeHtml(block.tone || 'info')}">
      ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ''}
      <p>${escapeHtml(block.text || '')}</p>
    </aside>`;

  const renderChecklist = block => {
    const items = Array.isArray(block.items) ? block.items : [];
    return `
      <section class="guide-content-block guide-checklist">
        ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ''}
        <ul>
          ${items.map(item => `<li>${escapeHtml(item.text || '')}</li>`).join('')}
        </ul>
      </section>`;
  };

  const renderLinks = block => {
    const items = Array.isArray(block.items) ? block.items : [];
    return `
      <section class="guide-content-block guide-link-block">
        ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ''}
        <div class="guide-link-list">
          ${items.map(item => {
            const url = safeUrl(item.url);
            if (!url) return '';
            const external = item.external === true;
            return `
              <a class="btn btn-outline" href="${escapeHtml(url)}"
                ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                ${escapeHtml(item.label || 'リンクを開く')}${external ? ' ↗' : ' →'}
              </a>`;
          }).join('')}
        </div>
      </section>`;
  };

  const renderCards = block => {
    const items = Array.isArray(block.items) ? block.items : [];
    return `
      <section class="guide-content-block guide-info-cards">
        ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ''}
        <div class="guide-info-card-grid">
          ${items.map(item => {
            const content = `
              ${item.image ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy">` : ''}
              <div class="guide-info-card-copy">
                <h3>${escapeHtml(item.title || '')}</h3>
                <p>${escapeHtml(item.text || '')}</p>
                ${item.url ? '<span>詳しく見る →</span>' : ''}
              </div>`;
            const url = safeUrl(item.url);
            return url
              ? `<a class="guide-info-card" href="${escapeHtml(url)}">${content}</a>`
              : `<div class="guide-info-card">${content}</div>`;
          }).join('')}
        </div>
      </section>`;
  };

  const renderers = {
    richtext: renderRichtext,
    image: renderImage,
    note: renderNote,
    checklist: renderChecklist,
    links: renderLinks,
    cards: renderCards
  };

  function renderBlocks(blocks = []) {
    return blocks
      .map(block => {
        const render = renderers[block.type];
        return render ? render(block) : '';
      })
      .join('');
  }

  function setNavLink(element, article, direction) {
    if (!element || !article) return;
    element.hidden = false;
    element.href = `guide-article.html?article=${encodeURIComponent(article.id)}`;
    element.innerHTML = direction === 'prev'
      ? `<small>← PREVIOUS</small><span>${escapeHtml(article.title)}</span>`
      : `<small>NEXT →</small><span>${escapeHtml(article.title)}</span>`;
  }

  async function loadArticle() {
    const params = new URLSearchParams(window.location.search);
    const articleId = params.get('article');

    if (!articleId) {
      showNotFound();
      return;
    }

    try {
      const response = await fetch('data/guide-articles.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('guide-articles.json の読み込みに失敗しました。');
      }

      const articles = await response.json();
      if (!Array.isArray(articles)) {
        throw new Error('guide-articles.json の形式が正しくありません。');
      }

      const published = articles
        .filter(item => item.published !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const index = published.findIndex(item => item.id === articleId);
      if (index < 0) {
        showNotFound();
        return;
      }

      const article = published[index];

      document.title = `${article.title}｜HAMANAKA PHOTO GUIDE`;
      document.querySelector('meta[name="description"]')
        ?.setAttribute('content', article.summary || 'HAMANAKA PHOTO GUIDEの記事ページです。');

      const eyebrow = document.querySelector('[data-article-eyebrow]');
      const title = document.querySelector('[data-article-title]');
      const summary = document.querySelector('[data-article-summary]');
      const breadcrumb = document.querySelector('[data-article-breadcrumb]');
      const coverWrap = document.querySelector('[data-article-cover-wrap]');
      const cover = document.querySelector('[data-article-cover]');
      const blocks = document.querySelector('[data-article-blocks]');

      if (eyebrow) eyebrow.textContent = article.eyebrow || 'PHOTO GUIDE';
      if (title) title.textContent = article.title || '';
      if (summary) summary.textContent = article.summary || '';
      if (breadcrumb) breadcrumb.textContent = article.title || '';

      if (coverWrap && cover && article.cover) {
        cover.src = article.cover;
        cover.alt = article.title || '';
        coverWrap.hidden = false;
      }

      if (blocks) {
        blocks.innerHTML = renderBlocks(article.blocks || []);
      }

      setNavLink(document.querySelector('[data-article-prev]'), published[index - 1], 'prev');
      setNavLink(document.querySelector('[data-article-next]'), published[index + 1], 'next');
    } catch (error) {
      console.error(error);
      showNotFound('記事を読み込めませんでした。');
    }
  }

  function showNotFound(message = '指定された記事が見つかりません。') {
    const title = document.querySelector('[data-article-title]');
    const summary = document.querySelector('[data-article-summary]');
    const blocks = document.querySelector('[data-article-blocks]');
    if (title) title.textContent = '記事が見つかりません';
    if (summary) summary.textContent = message;
    if (blocks) {
      blocks.innerHTML = `
        <p class="section-lead">${escapeHtml(message)}</p>
        <p><a class="btn btn-outline" href="guide.html">PHOTO GUIDEへ戻る</a></p>`;
    }
  }

  loadArticle();
})();
