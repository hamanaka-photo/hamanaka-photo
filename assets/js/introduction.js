(() => {
  const root = document.querySelector('[data-introduction-page]');
  if (!root) return;

  const descriptionMeta = document.querySelector('meta[name="description"]');

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
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
    if (node && value !== undefined && value !== null && String(value).trim() !== '') {
      node.textContent = String(value);
    }
  };

  const setImage = (selector, image, alt = '') => {
    const node = document.querySelector(selector);
    const src = safeUrl(image);
    if (!node || !src) return;
    node.src = src;
    node.alt = alt || '';
  };

  const setRichText = (selector, html) => {
    const node = document.querySelector(selector);
    if (!node || !html) return;
    node.innerHTML = String(html);
  };

  const subjectEyebrows = ['WILDLIFE', 'COAST', 'WETLAND', 'LIFE', 'SEASON'];

  const renderSubjects = block => {
    const grid = document.querySelector('[data-intro-subjects]');
    const items = Array.isArray(block?.items) ? block.items : [];
    if (!grid || !items.length) return;

    grid.innerHTML = items.map((item, index) => {
      const image = safeUrl(item.image);
      const eyebrow = subjectEyebrows[index] || `SUBJECT ${String(index + 1).padStart(2, '0')}`;
      return `
        <article class="intro-subject-card">
          ${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.title || '')}" loading="lazy" decoding="async">` : ''}
          <div>
            <p class="eyebrow">${escapeHtml(eyebrow)}</p>
            <h3>${escapeHtml(item.title || '')}</h3>
            ${item.text ? `<p>${escapeHtml(item.text)}</p>` : ''}
          </div>
        </article>`;
    }).join('');
  };

  const renderCycle = block => {
    const grid = document.querySelector('[data-intro-cycle]');
    const items = Array.isArray(block?.items) ? block.items : [];
    if (!grid || !items.length) return;

    grid.innerHTML = items.map(item => {
      const parts = String(item.text || '').split('｜');
      const label = parts.shift() || '';
      const text = parts.join('｜');
      return `
        <div class="intro-cycle-item">
          <strong>${escapeHtml(label)}</strong>
          <span>${escapeHtml(text)}</span>
        </div>`;
    }).join('');
  };

  const linkMeta = url => {
    if (/gallery\.html/i.test(url)) return { eyebrow: 'GALLERY', label: 'GALLERYを見る' };
    if (/guide\.html/i.test(url)) return { eyebrow: 'PHOTO GUIDE', label: 'PHOTO GUIDEを見る' };
    if (/project\.html/i.test(url)) return { eyebrow: 'PROJECT', label: 'PROJECTを見る' };
    return { eyebrow: 'LINK', label: '詳しく見る' };
  };

  const renderLinks = block => {
    const grid = document.querySelector('[data-intro-links]');
    const items = Array.isArray(block?.items) ? block.items : [];
    if (!grid || !items.length) return;

    grid.innerHTML = items.map(item => {
      const url = safeUrl(item.url);
      if (!url) return '';
      const meta = linkMeta(url);
      return `
        <a class="intro-link-card" href="${escapeHtml(url)}">
          <p class="eyebrow">${escapeHtml(meta.eyebrow)}</p>
          <h3>${escapeHtml(item.title || '')}</h3>
          ${item.text ? `<p>${escapeHtml(item.text)}</p>` : ''}
          <span>${escapeHtml(meta.label)} →</span>
        </a>`;
    }).join('');
  };

  const applyPromotion = block => {
    if (!block?.body) return;

    const parser = document.createElement('div');
    parser.innerHTML = block.body;

    const heading = parser.querySelector('h1, h2, h3');
    const paragraphs = [...parser.querySelectorAll('p')];

    if (heading) setText('[data-intro-promotion-title]', heading.textContent.trim());
    if (paragraphs[0]) setText('[data-intro-promotion-lead]', paragraphs[0].textContent.trim());
    if (paragraphs.length > 1) {
      setText(
        '[data-intro-promotion-body]',
        paragraphs.slice(1).map(node => node.textContent.trim()).filter(Boolean).join('\n\n')
      );
    }
  };

  const applyArticle = article => {
    if (!article) return;

    document.title = '浜中町を知る｜HAMANAKA PHOTO';
    if (descriptionMeta && article.summary) {
      descriptionMeta.setAttribute('content', article.summary);
    }

    setText('[data-intro-hero-eyebrow]', article.eyebrow || 'INTRODUCTION');
    setText('[data-intro-hero-title]', article.title);
    setText('[data-intro-hero-lead]', article.summary);
    setImage('[data-intro-hero-image]', article.cover, article.title || '浜中町の風景');

    const blocks = Array.isArray(article.blocks) ? article.blocks : [];
    const mediaBlocks = blocks.filter(block => block?.type === 'media_text');
    const cardBlocks = blocks.filter(block => block?.type === 'cards');
    const promotionBlock = blocks.find(block => block?.type === 'styled_text');
    const cycleBlock = blocks.find(block => block?.type === 'checklist');

    const why = mediaBlocks[0];
    if (why) {
      setText('[data-intro-why-title]', why.title);
      setRichText('[data-intro-why-body]', why.body);
      setImage('[data-intro-why-image]', why.image, why.alt || why.title || '浜中町の風景');
    }

    const subjects = cardBlocks[0];
    if (subjects) {
      setText('[data-intro-subjects-title]', subjects.title);
      renderSubjects(subjects);
    }

    const perspective = mediaBlocks[1];
    if (perspective) {
      setText('[data-intro-perspective-title]', perspective.title);
      setRichText('[data-intro-perspective-body]', perspective.body);
      setImage(
        '[data-intro-perspective-image]',
        perspective.image,
        perspective.alt || perspective.title || '浜中町の風景'
      );
    }

    applyPromotion(promotionBlock);
    renderCycle(cycleBlock);

    const closing = cardBlocks[1];
    if (closing) {
      setText('[data-intro-closing-title]', closing.title);
      renderLinks(closing);
    }
  };

  const loadIntroduction = async () => {
    try {
      const response = await fetch('data/guide-articles.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error(`guide-articles.json: ${response.status}`);

      const articles = await response.json();
      if (!Array.isArray(articles)) throw new Error('guide-articles.json の形式が正しくありません。');

      const introduction = articles.find(item => item && item.id === 'introduction');
      if (!introduction) throw new Error('INTRODUCTIONデータが見つかりません。');

      applyArticle(introduction);
      root.classList.add('is-introduction-loaded');
    } catch (error) {
      // データが読めない場合も introduction.html 内の初期表示を残します。
      console.error('INTRODUCTION data could not be loaded.', error);
      root.classList.add('is-introduction-fallback');
    }
  };

  loadIntroduction();
})();
