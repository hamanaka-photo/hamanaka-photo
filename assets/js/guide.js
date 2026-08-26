(() => {
  const menu = document.querySelector('[data-guide-menu]');
  if (!menu) return;

  const title = document.querySelector('[data-guide-page-title]');
  const lead = document.querySelector('[data-guide-page-lead]');
  const indexLead = document.querySelector('[data-guide-index-lead]');

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  const articleCard = item => {
    const visual = item.cover
      ? `<img src="${escapeHtml(item.cover)}" alt="" loading="lazy" decoding="async" fetchpriority="low">`
      : `<span class="guide-menu-icon" aria-hidden="true">${escapeHtml(item.icon || 'PHOTO')}</span>`;

    return `
      <a class="guide-menu-card" href="guide-article.html?article=${encodeURIComponent(item.id)}">
        <div class="guide-menu-visual">${visual}</div>
        <div class="guide-menu-copy">
          <p class="guide-menu-eyebrow">${escapeHtml(item.eyebrow)}</p>
          <h3>${escapeHtml(item.cardTitle || item.title)}</h3>
          <p>${escapeHtml(item.summary)}</p>
          <span class="guide-menu-action">詳しく見る →</span>
        </div>
      </a>`;
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
        .filter(item => item.published !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const cards = published.map(articleCard);
      if (settings.guidebook) cards.push(guidebookCard(settings.guidebook));

      menu.innerHTML = cards.join('');
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
