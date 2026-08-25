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

  const isGoogleMapEmbedUrl = (value = '') => {
    try {
      const url = new URL(String(value).trim());
      const host = url.hostname.toLowerCase();
      const googleHost =
        host === 'google.com' ||
        host === 'www.google.com' ||
        host === 'maps.google.com' ||
        host.endsWith('.google.com');

      return (
        url.protocol === 'https:' &&
        googleHost &&
        (
          url.pathname.startsWith('/maps/embed') ||
          url.pathname.startsWith('/maps/d/embed')
        )
      );
    } catch {
      return false;
    }
  };

  function sanitizeHtml(value = '') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(
      `<div>${String(value)}</div>`,
      'text/html'
    );

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
        const allowed = [
          'href', 'src', 'alt', 'title',
          'target', 'rel', 'colspan', 'rowspan'
        ];

        if (!allowed.includes(name)) {
          element.removeAttribute(attribute.name);
        }
      });

      if (element.hasAttribute('href')) {
        const href = safeUrl(element.getAttribute('href'));
        if (href) {
          element.setAttribute('href', href);
        } else {
          element.removeAttribute('href');
        }
      }

      if (element.hasAttribute('src')) {
        const src = safeUrl(element.getAttribute('src'));
        if (src) {
          element.setAttribute('src', src);
        } else {
          element.removeAttribute('src');
        }
      }

      if (element.getAttribute('target') === '_blank') {
        element.setAttribute('rel', 'noopener noreferrer');
      }
    });

    return container.innerHTML;
  }

  const blockHeading = title =>
    title ? `<h2>${escapeHtml(title)}</h2>` : '';

  const renderRichtext = block => `
    <section class="guide-content-block guide-richtext">
      ${sanitizeHtml(block.body || '')}
    </section>`;

  const renderImage = block => {
    if (!block.image) return '';

    return `
      <figure class="guide-content-block guide-image-block">
        <img
          src="${escapeHtml(block.image)}"
          alt="${escapeHtml(block.alt || '')}"
          loading="lazy">
        ${
          block.caption
            ? `<figcaption>${escapeHtml(block.caption)}</figcaption>`
            : ''
        }
      </figure>`;
  };

  const renderGallery = block => {
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';

    const columns = ['2', '3', '4'].includes(String(block.columns))
      ? String(block.columns)
      : '3';

    return `
      <section class="guide-content-block guide-gallery-block">
        ${blockHeading(block.title)}
        <div class="guide-gallery-grid guide-gallery-cols-${columns}">
          ${items.map(item => `
            <figure class="guide-gallery-item">
              <img
                src="${escapeHtml(item.image || '')}"
                alt="${escapeHtml(item.alt || '')}"
                loading="lazy">
              ${
                item.caption
                  ? `<figcaption>${escapeHtml(item.caption)}</figcaption>`
                  : ''
              }
            </figure>
          `).join('')}
        </div>
      </section>`;
  };

  const renderMap = block => {
    const url = String(block.url || '').trim();

    if (!isGoogleMapEmbedUrl(url)) {
      console.warn('許可されていないGoogleマップURLです:', url);
      return '';
    }

    const sizeClass =
      block.size === 'large'
        ? 'guide-map-large'
        : '';

    const openUrl = safeUrl(block.openUrl || '');

    return `
      <section class="guide-content-block guide-map-block ${sizeClass}">
        ${blockHeading(block.title)}
        <div class="guide-map-frame">
          <iframe
            src="${escapeHtml(url)}"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
            title="${escapeHtml(block.title || 'Googleマップ')}">
          </iframe>
        </div>
        ${
          block.caption
            ? `<p class="guide-map-caption">${escapeHtml(block.caption)}</p>`
            : ''
        }
        ${
          openUrl
            ? `<p class="guide-map-open">
                <a
                  class="btn btn-outline"
                  href="${escapeHtml(openUrl)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Googleマップで開く ↗
                </a>
              </p>`
            : ''
        }
      </section>`;
  };

  const renderBasicInfo = block => {
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';

    return `
      <section class="guide-content-block guide-basic-info">
        ${blockHeading(block.title)}
        <dl class="guide-basic-info-list">
          ${items.map(item => `
            <div class="guide-basic-info-row">
              <dt>${escapeHtml(item.label || '')}</dt>
              <dd>${escapeHtml(item.value || '').replace(/\r?\n/g, '<br>')}</dd>
            </div>
          `).join('')}
        </dl>
      </section>`;
  };

  const renderNote = block => {
    const tone = ['info', 'important', 'caution'].includes(block.tone)
      ? block.tone
      : 'info';

    return `
      <aside class="guide-content-block guide-note guide-note-${tone}">
        ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ''}
        <p>${escapeHtml(block.text || '').replace(/\r?\n/g, '<br>')}</p>
      </aside>`;
  };

  const renderChecklist = block => {
    const items = Array.isArray(block.items) ? block.items : [];

    return `
      <section class="guide-content-block guide-checklist">
        ${blockHeading(block.title)}
        <ul>
          ${items.map(item =>
            `<li>${escapeHtml(item.text || '')}</li>`
          ).join('')}
        </ul>
      </section>`;
  };

  const renderTable = block => {
    const headers = Array.isArray(block.headers) ? block.headers : [];
    const rows = Array.isArray(block.rows) ? block.rows : [];

    if (!headers.length && !rows.length) return '';

    const columnCount = Math.max(
      headers.length,
      ...rows.map(row =>
        Array.isArray(row.cells) ? row.cells.length : 0
      ),
      1
    );

    return `
      <section class="guide-content-block guide-table-block">
        ${blockHeading(block.title)}
        <div class="guide-table-scroll">
          <table>
            ${
              block.caption
                ? `<caption>${escapeHtml(block.caption)}</caption>`
                : ''
            }
            ${
              headers.length
                ? `<thead><tr>
                    ${Array.from({ length: columnCount }, (_, index) =>
                      `<th scope="col">${escapeHtml(headers[index] || '')}</th>`
                    ).join('')}
                  </tr></thead>`
                : ''
            }
            <tbody>
              ${rows.map(row => {
                const cells = Array.isArray(row.cells) ? row.cells : [];
                return `<tr>
                  ${Array.from({ length: columnCount }, (_, index) =>
                    `<td>${escapeHtml(cells[index] || '')}</td>`
                  ).join('')}
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        ${
          block.note
            ? `<p class="guide-table-note">${escapeHtml(block.note)}</p>`
            : ''
        }
      </section>`;
  };

  const renderFaq = block => {
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';

    return `
      <section class="guide-content-block guide-faq-block">
        ${blockHeading(block.title)}
        <div class="guide-faq-list">
          ${items.map(item => `
            <details class="guide-faq-item">
              <summary>${escapeHtml(item.question || '')}</summary>
              <div class="guide-faq-answer guide-richtext">
                ${sanitizeHtml(item.answer || '')}
              </div>
            </details>
          `).join('')}
        </div>
      </section>`;
  };

  const renderLinks = block => {
    const items = Array.isArray(block.items) ? block.items : [];

    return `
      <section class="guide-content-block guide-link-block">
        ${blockHeading(block.title)}
        <div class="guide-link-list">
          ${items.map(item => {
            const url = safeUrl(item.url);
            if (!url) return '';
            const external = item.external === true;

            return `
              <a
                class="btn btn-outline"
                href="${escapeHtml(url)}"
                ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
                ${escapeHtml(item.label || 'リンクを開く')}
                ${external ? ' ↗' : ' →'}
              </a>`;
          }).join('')}
        </div>
      </section>`;
  };

  const renderDownload = block => {
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';

    return `
      <section class="guide-content-block guide-download-block">
        ${blockHeading(block.title)}
        ${
          block.text
            ? `<p class="guide-download-lead">${escapeHtml(block.text)}</p>`
            : ''
        }
        <div class="guide-download-list">
          ${items.map(item => {
            const file = safeUrl(item.file);
            if (!file) return '';

            return `
              <a class="guide-download-item" href="${escapeHtml(file)}" download>
                <span class="guide-download-icon" aria-hidden="true">↓</span>
                <span class="guide-download-copy">
                  <strong>${escapeHtml(item.label || 'ファイルをダウンロード')}</strong>
                  ${
                    item.description
                      ? `<small>${escapeHtml(item.description)}</small>`
                      : ''
                  }
                </span>
              </a>`;
          }).join('')}
        </div>
      </section>`;
  };

  const renderCards = block => {
    const items = Array.isArray(block.items) ? block.items : [];

    return `
      <section class="guide-content-block guide-info-cards">
        ${blockHeading(block.title)}
        <div class="guide-info-card-grid">
          ${items.map(item => {
            const content = `
              ${
                item.image
                  ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy">`
                  : ''
              }
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

  const renderCta = block => {
    const url = safeUrl(block.url);
    if (!url) return '';

    const style = ['blue', 'green', 'light'].includes(block.style)
      ? block.style
      : 'blue';

    const external = block.external === true;

    return `
      <aside class="guide-content-block guide-cta guide-cta-${style}">
        <div class="guide-cta-copy">
          ${
            block.eyebrow
              ? `<p class="guide-cta-eyebrow">${escapeHtml(block.eyebrow)}</p>`
              : ''
          }
          <h2>${escapeHtml(block.title || '')}</h2>
          ${
            block.text
              ? `<p>${escapeHtml(block.text).replace(/\r?\n/g, '<br>')}</p>`
              : ''
          }
        </div>
        <a
          class="btn ${style === 'light' ? 'btn-blue' : 'btn-light'}"
          href="${escapeHtml(url)}"
          ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          ${escapeHtml(block.label || '詳しく見る')}
          ${external ? ' ↗' : ' →'}
        </a>
      </aside>`;
  };

  const renderMediaText = block => {
    if (!block.image) return '';

    const side = block.imagePosition === 'right' ? 'right' : 'left';

    return `
      <section class="guide-content-block guide-media-text guide-media-${side}">
        <div class="guide-media-image">
          <img
            src="${escapeHtml(block.image)}"
            alt="${escapeHtml(block.alt || '')}"
            loading="lazy">
        </div>
        <div class="guide-media-copy guide-richtext">
          ${block.title ? `<h2>${escapeHtml(block.title)}</h2>` : ''}
          ${sanitizeHtml(block.body || '')}
        </div>
      </section>`;
  };

  const renderRelated = block => {
    const items = Array.isArray(block.items) ? block.items : [];
    if (!items.length) return '';

    return `
      <section class="guide-content-block guide-related-block">
        ${blockHeading(block.title || '関連記事')}
        <div class="guide-related-grid">
          ${items.map(item => {
            const id = String(item.articleId || '').trim();
            if (!id) return '';

            return `
              <a
                class="guide-related-card"
                href="guide-article.html?article=${encodeURIComponent(id)}">
                ${
                  item.image
                    ? `<img src="${escapeHtml(item.image)}" alt="" loading="lazy">`
                    : ''
                }
                <div>
                  <h3>${escapeHtml(item.title || '')}</h3>
                  ${
                    item.text
                      ? `<p>${escapeHtml(item.text)}</p>`
                      : ''
                  }
                  <span>記事を読む →</span>
                </div>
              </a>`;
          }).join('')}
        </div>
      </section>`;
  };

  const renderQuote = block => `
    <figure class="guide-content-block guide-quote-block">
      <blockquote>
        ${escapeHtml(block.text || '').replace(/\r?\n/g, '<br>')}
      </blockquote>
      ${
        block.author || block.source
          ? `<figcaption>
              ${block.author ? `<strong>${escapeHtml(block.author)}</strong>` : ''}
              ${block.source ? `<span>${escapeHtml(block.source)}</span>` : ''}
            </figcaption>`
          : ''
      }
    </figure>`;

  const renderDivider = block => {
    const style = ['line', 'space', 'dots'].includes(block.style)
      ? block.style
      : 'line';

    return `
      <div
        class="guide-content-block guide-divider guide-divider-${style}"
        aria-hidden="true">
      </div>`;
  };

  const renderers = {
    richtext: renderRichtext,
    image: renderImage,
    gallery: renderGallery,
    map: renderMap,
    basic_info: renderBasicInfo,
    note: renderNote,
    checklist: renderChecklist,
    table: renderTable,
    faq: renderFaq,
    links: renderLinks,
    download: renderDownload,
    cards: renderCards,
    cta: renderCta,
    media_text: renderMediaText,
    related: renderRelated,
    quote: renderQuote,
    divider: renderDivider
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
    element.href =
      `guide-article.html?article=${encodeURIComponent(article.id)}`;

    element.innerHTML =
      direction === 'prev'
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
      const response =
        await fetch(
          'data/guide-articles.json',
          { cache: 'no-store' }
        );

      if (!response.ok) {
        throw new Error(
          'guide-articles.json の読み込みに失敗しました。'
        );
      }

      const articles = await response.json();

      if (!Array.isArray(articles)) {
        throw new Error(
          'guide-articles.json の形式が正しくありません。'
        );
      }

      const published =
        articles
          .filter(item => item.published !== false)
          .sort(
            (a, b) =>
              Number(a.order || 0) -
              Number(b.order || 0)
          );

      const index =
        published.findIndex(
          item => item.id === articleId
        );

      if (index < 0) {
        showNotFound();
        return;
      }

      const article = published[index];

      document.title =
        `${article.title}｜HAMANAKA PHOTO GUIDE`;

      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          'content',
          article.summary ||
          'HAMANAKA PHOTO GUIDEの記事ページです。'
        );

      const eyebrow =
        document.querySelector('[data-article-eyebrow]');

      const title =
        document.querySelector('[data-article-title]');

      const summary =
        document.querySelector('[data-article-summary]');

      const breadcrumb =
        document.querySelector('[data-article-breadcrumb]');

      const coverWrap =
        document.querySelector('[data-article-cover-wrap]');

      const cover =
        document.querySelector('[data-article-cover]');

      const blocks =
        document.querySelector('[data-article-blocks]');

      if (eyebrow) {
        eyebrow.textContent =
          article.eyebrow || 'PHOTO GUIDE';
      }

      if (title) {
        title.textContent =
          article.title || '';
      }

      if (summary) {
        summary.textContent =
          article.summary || '';
      }

      if (breadcrumb) {
        breadcrumb.textContent =
          article.title || '';
      }

      if (
        coverWrap &&
        cover &&
        article.cover
      ) {
        cover.src = article.cover;
        cover.alt = article.title || '';
        coverWrap.hidden = false;
      }

      if (blocks) {
        blocks.innerHTML =
          renderBlocks(article.blocks || []);
      }

      setNavLink(
        document.querySelector('[data-article-prev]'),
        published[index - 1],
        'prev'
      );

      setNavLink(
        document.querySelector('[data-article-next]'),
        published[index + 1],
        'next'
      );

    } catch (error) {
      console.error(error);

      showNotFound(
        '記事を読み込めませんでした。'
      );
    }
  }

  function showNotFound(
    message = '指定された記事が見つかりません。'
  ) {
    const title =
      document.querySelector('[data-article-title]');

    const summary =
      document.querySelector('[data-article-summary]');

    const blocks =
      document.querySelector('[data-article-blocks]');

    if (title) {
      title.textContent =
        '記事が見つかりません';
    }

    if (summary) {
      summary.textContent = message;
    }

    if (blocks) {
      blocks.innerHTML = `
        <p class="section-lead">
          ${escapeHtml(message)}
        </p>
        <p>
          <a class="btn btn-outline" href="guide.html">
            PHOTO GUIDEへ戻る
          </a>
        </p>`;
    }
  }

  loadArticle();
})();
