(() => {
  const root = document.querySelector('[data-guide-article]');
  if (!root) return;
  if (new URLSearchParams(location.search).get('article') !== 'technique') return;

  const esc = (value = '') => String(value).replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[char]));
  const nl2br = value => esc(value || '').replace(/\r?\n/g, '<br>');
  const safeUrl = value => {
    const raw = String(value || '').trim();
    return !raw || /^(javascript|data|vbscript):/i.test(raw) ? '' : raw;
  };
  const image = (src, alt = '') => src
    ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`
    : `<div class="tech-v2-placeholder" aria-hidden="true"><span>PHOTO</span><strong>${esc(alt || 'IMAGE')}</strong></div>`;

  const fieldNav = () => `
    <nav class="tech-v1-field-nav" aria-label="PHOTO FIELD GUIDE">
      <div class="container tech-v1-field-nav-inner">
        <a class="tech-v1-field-brand" href="guide.html">HAMANAKA<small>PHOTO FIELD GUIDE</small></a>
        <div class="tech-v1-field-links">
          <a href="guide-article.html?article=photo-map">スポット</a>
          <a href="guide-article.html?article=trip">準備</a>
          <a href="guide-article.html?article=gear">機材</a>
          <a href="guide-article.html?article=technique" aria-current="page">テクニック</a>
          <a href="guide-article.html?article=manner">ルール</a>
        </div>
        <a class="tech-v1-field-spot" href="guide-article.html?article=photo-map">フォトスポットを探す <span aria-hidden="true">●</span></a>
      </div>
    </nav>`;

  const heading = section => `
    <header class="tech-v2-heading">
      <p>${esc(section.eyebrow || '')}</p>
      <h2>${esc(section.title || '')}</h2>
      ${section.lead ? `<span>${esc(section.lead)}</span>` : ''}
    </header>`;

  const renderHero = (data, videoEnabled) => `
    <section class="tech-v2-hero" ${data.hero?.image ? `style="--tech-v2-hero:url('${esc(data.hero.image)}')"` : ''}>
      ${fieldNav()}
      <div class="tech-v2-hero-shade"></div>
      <div class="container tech-v2-hero-inner">
        <p>${esc(data.hero?.eyebrow || 'TECHNIQUE')}</p>
        <h1>${nl2br(data.hero?.title || '')}</h1>
        <span>${nl2br(data.hero?.lead || '')}</span>
      </div>
    </section>
    <nav class="tech-v2-section-nav" data-video-enabled="${videoEnabled}" aria-label="テクニック編ページ内ナビゲーション">
      <div class="container">
        ${(data.sectionNav || []).filter(item => videoEnabled || item.id !== 'video').map(item => `<a href="#tech-${esc(item.id)}"><small>${esc(item.sub || '')}</small><b>${esc(item.label || '')}</b></a>`).join('')}
      </div>
    </nav>`;

  const renderTime = section => {
    const sunUrl = safeUrl(section.sun?.url);
    return `
      <section class="tech-v2-section" id="tech-time">
        <div class="container">
          ${heading(section)}
          <div class="tech-v2-keypoint">
            <span>${esc(section.recommendationTitle || '')}</span>
            <strong>${esc(section.recommendationText || '')}</strong>
          </div>
          <div class="tech-v2-compare-grid">
            ${(section.comparisons || []).map(item => `
              <figure class="tech-v2-compare-card">
                <div class="tech-v2-compare-image">${image(item.image, item.title || '時間帯比較')}</div>
                <figcaption>
                  <small>${esc(item.label || '')}</small>
                  <h3>${esc(item.title || '')}</h3>
                  <p>${esc(item.text || '')}</p>
                  ${item.caption ? `<span>${esc(item.caption)}</span>` : ''}
                </figcaption>
              </figure>`).join('')}
          </div>
          <aside class="tech-v2-info-band">
            <div><b>${esc(section.sun?.title || '')}</b><span>${esc(section.sun?.text || '')}</span></div>
            ${sunUrl ? `<a href="${esc(sunUrl)}" target="_blank" rel="noopener noreferrer">${esc(section.sun.buttonLabel || '確認する')} ↗</a>` : ''}
          </aside>
        </div>
      </section>`;
  };

  const renderPlace = section => `
    <section class="tech-v2-section is-soft" id="tech-place">
      <div class="container">
        ${heading(section)}
        <div class="tech-v2-media-block">
          <div class="tech-v2-check-list">
            ${(section.items || []).map(item => `<div><span>✓</span><p>${esc(item)}</p></div>`).join('')}
            <aside><b>${esc(section.fallbackTitle || '')}</b><p>${esc(section.fallbackText || '')}</p></aside>
          </div>
          <figure>
            <div>${image(section.image, section.title || '撮影場所')}</div>
            ${section.imageCaption ? `<figcaption>${esc(section.imageCaption)}</figcaption>` : ''}
          </figure>
        </div>
      </div>
    </section>`;

  const renderZoom = section => `
    <section class="tech-v2-section" id="tech-zoom">
      <div class="container">
        ${heading(section)}
        <div class="tech-v2-step-strip">
          ${(section.steps || []).map(step => `<article><span>${esc(step.number || '')}</span><h3>${esc(step.title || '')}</h3><p>${esc(step.text || '')}</p></article>`).join('')}
        </div>
        <div class="tech-v2-tip-block">
          <div><small>POINT</small><h3>${esc(section.tipTitle || '')}</h3><p>${esc(section.tipText || '')}</p></div>
          <div class="tech-v2-tip-visual">${image(section.image, 'ズームの手順')}</div>
        </div>
      </div>
    </section>`;

  const renderSettings = section => `
    <section class="tech-v2-section is-soft" id="tech-settings">
      <div class="container">
        ${heading(section)}
        <div class="tech-v2-yellow-tip"><span>POINT</span><div><h3>${esc(section.tipTitle || '')}</h3><p>${esc(section.tipText || '')}</p></div></div>
        <div class="tech-v2-shutter-grid">
          ${(section.comparisons || []).map(item => `
            <figure>
              <div>${image(item.image, item.title || 'シャッター速度比較')}</div>
              <figcaption><strong>${esc(item.shutter || '')}</strong><h3>${esc(item.title || '')}</h3><p>${esc(item.text || '')}</p></figcaption>
            </figure>`).join('')}
        </div>
        ${(section.items || []).length ? `
          <details class="tech-v2-detail-settings">
            <summary>${esc(section.detailTitle || 'さらに設定を見る')}</summary>
            <div>
              ${(section.items || []).map(item => `<article><span>${esc(item.label || '')}</span><strong>${esc(item.value || '')}</strong><p>${esc(item.text || '')}</p></article>`).join('')}
            </div>
          </details>` : ''}
      </div>
    </section>`;

  const youtubeId = value => {
    const raw = safeUrl(value);
    if (!raw) return '';

    try {
      const url = new URL(raw, location.href);
      const host = url.hostname.replace(/^www\./, '');

      if (host === 'youtu.be') {
        return url.pathname.split('/').filter(Boolean)[0] || '';
      }

      if (
        host === 'youtube.com' ||
        host === 'm.youtube.com' ||
        host === 'music.youtube.com'
      ) {
        if (url.pathname === '/watch') {
          return url.searchParams.get('v') || '';
        }

        const parts = url.pathname.split('/').filter(Boolean);
        if (['embed', 'shorts', 'live'].includes(parts[0])) {
          return parts[1] || '';
        }
      }
    } catch {
      return '';
    }

    return '';
  };

  const renderVideo = section => {
    const id = youtubeId(section.youtubeUrl);

    return `
      <section class="tech-v2-section is-soft tech-v3-video" id="tech-video">
        <div class="container">
          ${heading(section)}
          <div class="tech-v3-video-frame">
            ${id ? `
              <iframe
                src="https://www.youtube-nocookie.com/embed/${esc(id)}"
                title="${esc(section.title || '撮影方法の解説動画')}"
                loading="lazy"
                referrerpolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen></iframe>` : `
              <div class="tech-v3-video-placeholder">
                <span>05 / MOVIE</span>
                <b>撮影方法の解説動画</b>
                <i aria-hidden="true">▶</i>
                <p>CMSからYouTube URLを設定すると、ここに動画が表示されます。</p>
              </div>`}
          </div>
          ${section.caption ? `
            <p class="tech-v3-video-caption">${esc(section.caption)}</p>` : ''}
        </div>
      </section>`;
  };

  const renderGallery = (section, number) => `
    <section class="tech-v2-section tech-v3-gallery-section" id="tech-gallery">
      <div class="container">
        ${heading({ ...section, eyebrow: `${number} / GALLERY` })}
        ${(section.items || []).length ? `
          <div class="tech-v3-gallery-carousel" data-tech-gallery-carousel>
            <button type="button" data-tech-gallery-prev aria-label="前の作例">←</button>
            <div class="tech-v3-gallery-window" data-tech-gallery-window></div>
            <button type="button" data-tech-gallery-next aria-label="次の作例">→</button>
          </div>` : `
          <div class="tech-v3-gallery-empty">
            <span>${number} / GALLERY</span>
            <strong>作例を準備中です。</strong>
          </div>`}
        ${(section.items || []).length ? `
          <div class="tech-gallery-modal" data-tech-gallery-modal hidden aria-hidden="true">
            <div class="tech-gallery-modal-dialog" role="dialog" aria-modal="true" aria-label="テクニック作例の拡大表示">
              <button type="button" class="tech-gallery-modal-close" data-tech-gallery-modal-close aria-label="拡大表示を閉じる">×</button>
              <button type="button" class="tech-gallery-modal-nav" data-tech-gallery-modal-prev aria-label="前の画像">←</button>
              <figure><img data-tech-gallery-modal-image src="" alt=""><figcaption data-tech-gallery-modal-caption></figcaption></figure>
              <button type="button" class="tech-gallery-modal-nav" data-tech-gallery-modal-next aria-label="次の画像">→</button>
            </div>
          </div>` : ''}
      </div>
    </section>`;

  const initGallery = (scope, section) => {
    const carousel = scope.querySelector('[data-tech-gallery-carousel]');
    if (!carousel) return;

    const items = Array.isArray(section.items) ? section.items : [];
    const windowEl = carousel.querySelector('[data-tech-gallery-window]');
    const prev = carousel.querySelector('[data-tech-gallery-prev]');
    const next = carousel.querySelector('[data-tech-gallery-next]');
    let index = 0;

    const visibleCount = () =>
      window.matchMedia('(max-width: 760px)').matches ? 1 : 3;

    const draw = () => {
      const count = Math.min(visibleCount(), items.length);
      const visible = Array.from({length: count}, (_, offset) =>
        items[(index + offset) % items.length]
      );

      windowEl.innerHTML = visible.map(item => {
        const itemIndex = items.indexOf(item);
        return `
          <figure>
            <button type="button" class="tech-v3-gallery-image-button" data-tech-gallery-open="${itemIndex}" aria-label="${esc(item.caption || '作例')}を拡大表示">${image(item.image, item.caption || '作例')}</button>
            ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}
          </figure>`;
      }).join('');

      const showNav = items.length > count;
      prev.hidden = !showNav;
      next.hidden = !showNav;
    };

    prev.addEventListener('click', () => {
      index = (index - 1 + items.length) % items.length;
      draw();
    });

    next.addEventListener('click', () => {
      index = (index + 1) % items.length;
      draw();
    });

    let timer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(timer);
      timer = window.setTimeout(draw, 100);
    });

    const modal = scope.querySelector('[data-tech-gallery-modal]');
    const modalImage = modal?.querySelector('[data-tech-gallery-modal-image]');
    const modalCaption = modal?.querySelector('[data-tech-gallery-modal-caption]');
    const closeButton = modal?.querySelector('[data-tech-gallery-modal-close]');
    let modalIndex = 0;
    let returnFocus = null;
    const drawModal = () => {
      const item = items[modalIndex];
      if (!item || !modalImage) return;
      modalImage.src = item.image || '';
      modalImage.alt = item.caption || 'テクニック作例';
      modalCaption.textContent = item.caption || '';
      modalCaption.hidden = !item.caption;
    };
    const openModal = selectedIndex => {
      if (!modal || !items[selectedIndex]) return;
      modalIndex = selectedIndex;
      returnFocus = document.activeElement;
      drawModal();
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('is-gallery-modal-open');
      closeButton?.focus();
    };
    const closeModal = () => {
      if (!modal || modal.hidden) return;
      modal.hidden = true;
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('is-gallery-modal-open');
      returnFocus?.focus?.();
    };
    const moveModal = step => {
      modalIndex = (modalIndex + step + items.length) % items.length;
      drawModal();
    };
    windowEl.addEventListener('click', event => {
      const trigger = event.target.closest('[data-tech-gallery-open]');
      if (trigger) openModal(Number(trigger.dataset.techGalleryOpen));
    });
    closeButton?.addEventListener('click', closeModal);
    modal?.querySelector('[data-tech-gallery-modal-prev]')?.addEventListener('click', () => moveModal(-1));
    modal?.querySelector('[data-tech-gallery-modal-next]')?.addEventListener('click', () => moveModal(1));
    modal?.addEventListener('click', event => { if (event.target === modal) closeModal(); });
    document.addEventListener('keydown', event => {
      if (!modal || modal.hidden) return;
      if (event.key === 'Escape') closeModal();
      if (event.key === 'ArrowLeft') moveModal(-1);
      if (event.key === 'ArrowRight') moveModal(1);
    });

    draw();
  };

  const renderNext = section => `
    <section class="tech-v2-next">
      <div class="container tech-v2-next-inner">
        <div><p>${esc(section.eyebrow || '')}</p><h2>${esc(section.title || '')}</h2><span>${esc(section.text || '')}</span></div>
        <div class="tech-v2-next-links">${(section.links || []).map(item => { const url = safeUrl(item.url); return url ? `<a href="${esc(url)}"><small>${esc(item.sub || '')}</small><b>${esc(item.label || '')}</b><i>→</i></a>` : ''; }).join('')}</div>
      </div>
    </section>`;

  const renderPage = data => {
    const videoEnabled = data.video?.enabled !== false;
    const galleryNumber = videoEnabled ? '06' : '05';
    document.body.classList.add('technique-page', 'tech-v2-page');
    document.title = 'ラッコの撮り方｜HAMANAKA PHOTO GUIDE';
    root.innerHTML = `${renderHero(data, videoEnabled)}${renderTime(data.time || {})}${renderPlace(data.place || {})}${renderZoom(data.zoom || {})}${renderSettings(data.settings || {})}${videoEnabled ? renderVideo(data.video || {}) : ''}${renderGallery(data.gallery || {}, galleryNumber)}${renderNext(data.next || {})}`;
    initGallery(root, data.gallery || {});
    root.querySelectorAll('a[href^="#tech-"]').forEach(link => link.addEventListener('click', event => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }));
  };

  fetch('data/technique.json', {cache:'no-cache'})
    .then(response => { if (!response.ok) throw new Error('technique load failed'); return response.json(); })
    .then(renderPage)
    .catch(error => {
      console.error(error);
      root.innerHTML = '<section class="section"><div class="container"><h1>テクニック編</h1><p>ページを読み込めませんでした。</p></div></section>';
    });
})();
