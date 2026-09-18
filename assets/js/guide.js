(() => {
  const menu = document.querySelector('[data-guide-menu]');
  if (!menu) return;

  const title = document.querySelector('[data-guide-page-title]');
  const lead = document.querySelector('[data-guide-page-lead]');
  const indexLead = document.querySelector('[data-guide-index-lead]');
  const guidebookSection = document.querySelector('[data-guidebook-section]');
  const guidebookMenu = document.querySelector('[data-guidebook]');

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  const articleCard = (item, menuItem = {}) => {
    const visual = item.cover
      ? `<img src="${escapeHtml(item.cover)}" alt="" loading="lazy" decoding="async" fetchpriority="low">`
      : `<span class="guide-menu-icon" aria-hidden="true">${escapeHtml(item.icon || 'PHOTO')}</span>`;

    return `
      <a class="guide-menu-card" href="guide-article.html?article=${encodeURIComponent(item.id)}">
        <div class="guide-menu-visual">${visual}</div>
        <div class="guide-menu-copy">
          <p class="guide-menu-eyebrow">${escapeHtml(menuItem.eyebrow || item.eyebrow)}</p>
          <h3>${escapeHtml(menuItem.title || item.cardTitle || item.title)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <span class="guide-menu-action">詳しく見る →</span>
        </div>
      </a>`;
  };

  const groupCard = (group, children) => {
    const representative = children[0]?.article;
    const visual = representative?.cover
      ? `<img src="${escapeHtml(representative.cover)}" alt="" loading="lazy" decoding="async" fetchpriority="low">`
      : '<span class="guide-menu-icon" aria-hidden="true">PHOTO</span>';

    return `
      <article class="guide-menu-card guide-menu-group">
        <div class="guide-menu-visual">${visual}</div>
        <div class="guide-menu-copy">
          <p class="guide-menu-eyebrow">${escapeHtml(group.eyebrow || '')}</p>
          <h3>${escapeHtml(group.title || '')}</h3>
          <p>${escapeHtml(group.summary || '')}</p>
          <nav class="guide-menu-children" aria-label="${escapeHtml(group.title || '')}の記事">
            ${children.map(({ entry, article }, index) => `
              <a href="guide-article.html?article=${encodeURIComponent(article.id)}">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <b>${escapeHtml(entry.title || article.cardTitle || article.title)}</b>
                <span aria-hidden="true">→</span>
              </a>`).join('')}
          </nav>
        </div>
      </article>`;
  };

  const guidebookCard = book => {
    const visual = book.cover
      ? `<img src="${escapeHtml(book.cover)}" alt="" loading="lazy" decoding="async" fetchpriority="low">`
      : `<span class="guide-menu-icon" aria-hidden="true">PDF</span>`;

    if (book.enabled && book.pdf) {
      return `
        <a class="guide-menu-card guide-menu-card-book" href="${escapeHtml(book.pdf)}" download>
          <div class="guide-menu-visual">${visual}<span class="guide-pdf-badge">PDF</span></div>
          <div class="guide-menu-copy">
            <p class="guide-menu-eyebrow">${escapeHtml(book.eyebrow || 'PHOTO GUIDE BOOK')}</p>
            <h3>${escapeHtml(book.cardTitle || book.title)}</h3>
            <p>${escapeHtml(book.summary || '')}</p>
            <span class="guide-menu-action">${escapeHtml(book.buttonLabel || 'PDFをダウンロード ↓')}</span>
          </div>
        </a>`;
    }

    return `
      <div class="guide-menu-card guide-menu-card-book is-disabled" aria-disabled="true">
        <div class="guide-menu-visual">${visual}<span class="guide-pdf-badge">PDF</span></div>
        <div class="guide-menu-copy">
          <p class="guide-menu-eyebrow">${escapeHtml(book.eyebrow || 'PHOTO GUIDE BOOK')}</p>
          <h3>${escapeHtml(book.cardTitle || book.title)}</h3>
          <p>${escapeHtml(book.summary || '')}</p>
          <span class="guide-menu-action">PDF版は準備中</span>
        </div>
      </div>`;
  };

  async function loadGuide() {
    try {
      const [articlesResponse, settingsResponse] = await Promise.all([
        fetch('data/guide-articles.json'),
        fetch('data/guide-settings.json')
      ]);

      if (!articlesResponse.ok || !settingsResponse.ok) {
        throw new Error('フォトガイドデータの読み込みに失敗しました。');
      }

      const articles = await articlesResponse.json();
      const settings = await settingsResponse.json();

      if (!Array.isArray(articles)) {
        throw new Error('guide-articles.json の形式が正しくありません。');
      }

      if (title && settings.pageTitle) title.textContent = settings.pageTitle;
      if (lead && settings.pageLead) lead.textContent = settings.pageLead;
      if (indexLead && settings.indexLead) indexLead.textContent = settings.indexLead;

      const published = articles
        .filter(item => item && item.id !== 'introduction' && item.published !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
      const articleMap = new Map(published.map(item => [item.id, item]));
      const menuItems = Array.isArray(settings.menu)
        ? settings.menu
        : published.map(item => ({ articleId: item.id }));

      menu.innerHTML = menuItems.map(entry => {
        if (Array.isArray(entry.children) && entry.children.length) {
          const children = entry.children
            .map(child => ({ entry: child, article: articleMap.get(child.articleId) }))
            .filter(child => child.article);
          return children.length ? groupCard(entry, children) : '';
        }
        const article = articleMap.get(entry.articleId);
        return article ? articleCard(article, entry) : '';
      }).join('');

      if (guidebookSection && guidebookMenu && settings.guidebook) {
        guidebookMenu.innerHTML = guidebookCard(settings.guidebook);
        guidebookSection.hidden = false;
      }
    } catch (error) {
      console.error(error);
      menu.innerHTML = `
        <p class="section-lead">
          フォトガイドを読み込めませんでした。しばらくしてから再度お試しください。
        </p>`;
    }
  }

  loadGuide();
})();
