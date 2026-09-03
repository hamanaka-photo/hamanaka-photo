(() => {
  const root = document.querySelector('[data-guide-article]');
  if (!root) return;
  const articleId = new URLSearchParams(window.location.search).get('article');
  if (articleId !== 'manner') return;

  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[c]));
  const nl2br = value => esc(value || '').replace(/\r?\n/g, '<br>');
  const safeUrl = value => {
    const raw = String(value || '').trim();
    if (!raw || /^(javascript|data|vbscript):/i.test(raw)) return '';
    return raw;
  };
  const image = (src, alt = '', cls = '') => src
    ? `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy" decoding="async">`
    : `<div class="manner-v1-placeholder ${cls}" aria-hidden="true"><span>HAMANAKA PHOTO</span><strong>${esc(alt || 'IMAGE')}</strong></div>`;

  const icon = name => {
    const common = 'viewBox="0 0 64 64" aria-hidden="true"';
    const map = {
      boat: `<svg ${common}><path d="M10 35h44l-7 12H18L10 35Z"/><path d="M25 35V20h17v15M30 20v-6h8v6M8 50c6 4 12 4 18 0 6 4 12 4 18 0 4 2 8 3 12 2"/></svg>`,
      food: `<svg ${common}><path d="M10 34c10-11 24-14 39-8l7-7-2 14 2 14-7-7c-15 6-29 3-39-8Z"/><circle cx="23" cy="30" r="1.5"/><path d="M30 23v18"/></svg>`,
      sound: `<svg ${common}><path d="M20 39V23l14-8v32L20 39Z"/><path d="M40 24c5 4 5 12 0 16M47 18c9 8 9 20 0 28"/></svg>`,
      water: `<svg ${common}><path d="M8 36c7 5 13 5 20 0s13-5 20 0 8 4 10 3"/><path d="M12 26c7 5 13 5 20 0s13-5 20 0"/><path d="M13 48c7 4 13 4 20 0s13-4 20 0"/></svg>`,
      drone: `<svg ${common}><path d="M22 28h20v12H22zM16 34h32M32 28v-8"/><circle cx="12" cy="25" r="7"/><circle cx="52" cy="25" r="7"/><circle cx="12" cy="45" r="7"/><circle cx="52" cy="45" r="7"/></svg>`,
      path: `<svg ${common}><path d="M22 10c-5 9-6 19-4 28 2 8 1 13-3 16M42 10c5 9 6 19 4 28-2 8-1 13 3 16"/><path d="M27 19h10M25 31h14M23 43h18"/></svg>`
    };
    return map[name] || map.path;
  };

  const fieldNav = () => `
    <nav class="manner-v1-field-nav" aria-label="PHOTO FIELD GUIDE">
      <div class="container manner-v1-field-nav-inner">
        <a class="manner-v1-field-brand" href="guide.html">HAMANAKA<small>PHOTO FIELD GUIDE</small></a>
        <div class="manner-v1-field-links">
          <a href="guide-article.html?article=photo-map">SPOT</a>
          <a href="guide-article.html?article=trip">準備</a>
          <a href="guide-article.html?article=gear">機材</a>
          <a href="guide-article.html?article=technique">テクニック</a>
          <a href="guide-article.html?article=manner" aria-current="page">ルール</a>
        </div>
        <a class="manner-v1-field-spot" href="guide-article.html?article=photo-map">フォトスポットを探す <span aria-hidden="true">●</span></a>
      </div>
    </nav>`;

  const renderHero = hero => `
    <section class="manner-v1-hero" ${hero.image ? `style="--manner-hero:url('${esc(hero.image)}')"` : ''}>
      ${fieldNav()}
      <div class="manner-v1-hero-shade"></div>
      <div class="container manner-v1-hero-inner">
        <div class="manner-v1-hero-copy">
          <p>${esc(hero.eyebrow || 'RULES')}</p>
          <h1>${nl2br(hero.title || '')}</h1>
          <span>${nl2br(hero.lead || '')}</span>
        </div>
      </div>
    </section>`;

  const renderRules = data => `
    <section class="manner-v1-section manner-v1-rules">
      <div class="container">
        <div class="manner-v1-heading manner-v1-heading-center">
          <h2>${esc(data.intro?.title || '')}</h2>
          <p>${esc(data.intro?.lead || '')}</p>
        </div>
        <div class="manner-v1-rule-grid">
          ${(data.rules || []).map(rule => `
            <article class="manner-v1-rule-card">
              <span class="manner-v1-rule-number">${esc(rule.number || '')}</span>
              <div class="manner-v1-rule-icon">${icon(rule.icon)}</div>
              <h3>${nl2br(rule.title || '')}</h3>
              <p>${esc(rule.text || '')}</p>
              <div class="manner-v1-rule-image">${rule.image ? image(rule.image, rule.title || 'ルール') : `<div class="manner-v1-rule-pattern">${icon(rule.icon)}</div>`}</div>
            </article>`).join('')}
        </div>
      </div>
    </section>`;

  const renderPhotographer = section => `
    <section class="manner-v1-section manner-v1-photographer">
      <div class="container manner-v1-photographer-card">
        <div class="manner-v1-photographer-copy">
          <span>${esc(section.eyebrow || '')}</span>
          <h2>${esc(section.title || '')}</h2>
          <ul>${(section.items || []).map(item => `<li>${esc(item)}</li>`).join('')}</ul>
        </div>
        <div class="manner-v1-visual-grid">
          ${(section.visuals || []).map(item => `
            <figure>
              <div>${image(item.image, item.caption || '撮影マナー')}</div>
              <figcaption>${esc(item.caption || '')}</figcaption>
            </figure>`).join('')}
        </div>
      </div>
    </section>`;

  const renderMessages = items => `
    <section class="manner-v1-section manner-v1-messages">
      <div class="container manner-v1-message-grid">
        ${(items || []).map(item => {
          const url = safeUrl(item.url);
          return `
            <article class="manner-v1-message-card is-${esc(item.type || 'plain')}">
              <div class="manner-v1-message-copy">
                <h2>${esc(item.title || '')}</h2>
                <p>${esc(item.text || '')}</p>
                ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(item.buttonLabel || '詳しく見る')} ↗</a>` : ''}
              </div>
              ${item.image ? `<div class="manner-v1-message-image">${image(item.image, item.title || '')}</div>` : ''}
            </article>`;
        }).join('')}
      </div>
    </section>`;

  const renderNext = section => `
    <section class="manner-v1-next" ${section.image ? `style="--manner-next:url('${esc(section.image)}')"` : ''}>
      <div class="manner-v1-next-shade"></div>
      <div class="container manner-v1-next-inner">
        <div class="manner-v1-next-copy">
          <p>${esc(section.eyebrow || 'NEXT STEP')}</p>
          <h2>${nl2br(section.title || '')}</h2>
          <span>${esc(section.text || '')}</span>
        </div>
        <div class="manner-v1-next-links">
          ${(section.links || []).map(item => {
            const url = safeUrl(item.url);
            return url ? `<a href="${esc(url)}"><span>${esc(item.sub || '')}</span><b>${esc(item.label || '')}</b><i aria-hidden="true">→</i></a>` : '';
          }).join('')}
        </div>
      </div>
    </section>`;

  const renderPage = data => {
    document.body.classList.add('manner-page', 'manner-v1-page');
    document.title = '撮影ルール・マナー｜HAMANAKA PHOTO GUIDE';
    root.innerHTML = `${renderHero(data.hero || {})}${renderRules(data)}${renderPhotographer(data.photographerManner || {})}${renderMessages(data.messages || [])}${renderNext(data.next || {})}`;
  };

  const init = async () => {
    try {
      const response = await fetch('data/manner.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('manner.json load failed');
      renderPage(await response.json());
    } catch (error) {
      console.error(error);
      root.innerHTML = `<section class="section"><div class="container"><h1>ルール編</h1><p class="section-lead">ページを読み込めませんでした。</p><p><a class="btn btn-outline" href="guide.html">PHOTO GUIDEへ戻る</a></p></div></section>`;
    }
  };
  init();
})();
