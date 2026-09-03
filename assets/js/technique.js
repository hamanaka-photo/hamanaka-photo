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
          <a href="guide-article.html?article=photo-map">SPOT</a>
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

  const renderHero = data => `
    <section class="tech-v2-hero" ${data.hero?.image ? `style="--tech-v2-hero:url('${esc(data.hero.image)}')"` : ''}>
      ${fieldNav()}
      <div class="tech-v2-hero-shade"></div>
      <div class="container tech-v2-hero-inner">
        <p>${esc(data.hero?.eyebrow || 'TECHNIQUE')}</p>
        <h1>${nl2br(data.hero?.title || '')}</h1>
        <span>${nl2br(data.hero?.lead || '')}</span>
      </div>
    </section>
    <nav class="tech-v2-section-nav" aria-label="テクニック編ページ内ナビゲーション">
      <div class="container">
        ${(data.sectionNav || []).map(item => `<a href="#tech-${esc(item.id)}"><small>${esc(item.sub || '')}</small><b>${esc(item.label || '')}</b></a>`).join('')}
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

  const renderGallery = section => `
    <section class="tech-v2-section" id="tech-gallery">
      <div class="container">
        ${heading(section)}
        <div class="tech-v2-gallery">
          ${(section.items || []).map(item => `<figure><div>${image(item.image, item.caption || '作例')}</div>${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}</figure>`).join('')}
        </div>
      </div>
    </section>`;

  const renderNext = section => `
    <section class="tech-v2-next">
      <div class="container tech-v2-next-inner">
        <div><p>${esc(section.eyebrow || '')}</p><h2>${esc(section.title || '')}</h2><span>${esc(section.text || '')}</span></div>
        <div class="tech-v2-next-links">${(section.links || []).map(item => { const url = safeUrl(item.url); return url ? `<a href="${esc(url)}"><small>${esc(item.sub || '')}</small><b>${esc(item.label || '')}</b><i>→</i></a>` : ''; }).join('')}</div>
      </div>
    </section>`;

  const renderPage = data => {
    document.body.classList.add('technique-page', 'tech-v2-page');
    document.title = 'ラッコの撮り方｜HAMANAKA PHOTO GUIDE';
    root.innerHTML = `${renderHero(data)}${renderTime(data.time || {})}${renderPlace(data.place || {})}${renderZoom(data.zoom || {})}${renderSettings(data.settings || {})}${renderGallery(data.gallery || {})}${renderNext(data.next || {})}`;
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
