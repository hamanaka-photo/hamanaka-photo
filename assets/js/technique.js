(() => {
  const root = document.querySelector('[data-guide-article]');
  if (!root) return;

  const articleId = new URLSearchParams(window.location.search).get('article');
  if (articleId !== 'technique') return;

  const esc = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  const safeUrl = value => {
    const raw = String(value || '').trim();
    if (!raw || /^(javascript|data|vbscript):/i.test(raw)) return '';
    return raw;
  };

  const nl2br = value => esc(value || '').replace(/\r?\n/g, '<br>');

  const image = (src, alt = '', cls = '') => {
    if (!src) {
      return `
        <div class="tech-v1-placeholder ${cls}" aria-hidden="true">
          <span>HAMANAKA PHOTO</span>
          <strong>${esc(alt || 'IMAGE')}</strong>
        </div>`;
    }

    return `
      <img
        class="${cls}"
        src="${esc(src)}"
        alt="${esc(alt)}"
        loading="lazy"
        decoding="async">`;
  };

  const renderFieldNav = () => `
    <nav class="tech-v1-field-nav" aria-label="PHOTO FIELD GUIDE">
      <div class="container tech-v1-field-nav-inner">
        <a class="tech-v1-field-brand" href="guide.html">
          HAMANAKA
          <small>PHOTO FIELD GUIDE</small>
        </a>
        <div class="tech-v1-field-links">
          <a href="guide-article.html?article=photo-map">SPOT</a>
          <a href="guide-article.html?article=trip">準備</a>
          <a href="guide-article.html?article=gear">機材</a>
          <a href="guide-article.html?article=technique" aria-current="page">テクニック</a>
          <a href="guide-article.html?article=manner">ルール</a>
        </div>
        <a class="tech-v1-field-spot" href="guide-article.html?article=photo-map">
          フォトスポットを探す
          <span aria-hidden="true">●</span>
        </a>
      </div>
    </nav>`;

  const hasSection = (data, id) => {
    if (id === 'faq') return Boolean(data.faq?.items?.length);
    if (id === 'gallery') return Boolean(data.gallery?.items?.length);
    return true;
  };

  const renderHero = (hero, nav, data) => `
    <section
      class="tech-v1-hero"
      ${hero.image ? `style="--tech-v1-hero-image:url('${esc(hero.image)}')"` : ''}>
      ${renderFieldNav()}
      <div class="tech-v1-hero-shade"></div>
      <div class="container tech-v1-hero-inner">
        <div class="tech-v1-hero-copy">
          <p>${esc(hero.eyebrow || 'TECHNIQUE')}</p>
          <h1>${nl2br(hero.title || 'ラッコを、もっと美しく撮る。')}</h1>
          <span>${nl2br(hero.lead || '')}</span>
        </div>
      </div>

      <div class="tech-v1-hero-nav-wrap">
        <div class="container tech-v1-hero-nav">
          ${(nav || []).filter(item => hasSection(data, item.id)).map(item => `
            <a href="#tech-${esc(item.id)}">
              <b>${esc(item.icon || '')}</b>
              <span>${esc(item.label || '')}</span>
            </a>`).join('')}
        </div>
      </div>
    </section>`;

  const heading = section => `
    <div class="tech-v1-heading">
      <div>
        <b>${esc(section.eyebrow || '')}</b>
        <h2>${esc(section.title || '')}</h2>
      </div>
      <p>${esc(section.lead || '')}</p>
    </div>`;

  const renderTimePlace = section => {
    const spot = section.spot || {};
    const sun = section.sun || {};
    const spotUrl = safeUrl(spot.url);
    const sunUrl = safeUrl(sun.url);

    return `
      <section class="tech-v1-section tech-v1-time" id="tech-time-place">
        <div class="container">
          ${heading(section)}

          <div class="tech-v1-time-grid">
            <article class="tech-v1-spot-card">
              <span>${esc(spot.eyebrow || '撮影スポット')}</span>
              <h3>${esc(spot.title || '')}</h3>
              <p>${esc(spot.text || '')}</p>
              <div class="tech-v1-spot-visual">
                ${spot.image
                  ? image(spot.image, spot.title || '撮影スポット')
                  : `<div class="tech-v1-map-visual"><b>MAP</b><span>PHOTO SPOT</span></div>`}
              </div>
              ${spotUrl ? `
                <a href="${esc(spotUrl)}">
                  ${esc(spot.buttonLabel || 'スポット詳細へ')} →
                </a>` : ''}
            </article>

            <div class="tech-v1-time-cards">
              <h3>おすすめの時間帯</h3>
              ${(section.times || []).map(item => `
                <article class="tech-v1-time-card">
                  <div class="tech-v1-time-copy">
                    <span class="tech-v1-sun-icon" aria-hidden="true">☀</span>
                    <h4>${esc(item.title || '')}</h4>
                    ${item.time ? `<b>${esc(item.time)}</b>` : ''}
                    <p>${esc(item.text || '')}</p>
                  </div>
                  <div class="tech-v1-time-image">
                    ${image(item.image, item.title || '時間帯作例')}
                  </div>
                </article>`).join('')}
            </div>

            <article class="tech-v1-sun-card">
              <h3>${esc(sun.title || '')}</h3>
              <p>${esc(sun.text || '')}</p>
              ${sunUrl ? `
                <a href="${esc(sunUrl)}" target="_blank" rel="noopener noreferrer">
                  ${esc(sun.buttonLabel || '情報を見る')} ↗
                </a>` : ''}
              <div class="tech-v1-sun-diagram" aria-hidden="true">
                <span class="morning">☀</span>
                <b>光の向きを<br>意識しよう</b>
                <span class="evening">●</span>
              </div>
            </article>
          </div>
        </div>
      </section>`;
  };

  const renderFind = section => {
    const behavior = section.behavior || {};
    return `
      <section class="tech-v1-section tech-v1-find" id="tech-find">
        <div class="container">
          ${heading(section)}

          <div class="tech-v1-find-grid">
            <div class="tech-v1-find-image">
              ${image(section.image, 'ラッコを探す')}
            </div>

            <div class="tech-v1-find-tips">
              ${(section.tips || []).map(item => `
                <article>
                  <span aria-hidden="true">✓</span>
                  <div>
                    <h3>${esc(item.title || '')}</h3>
                    <p>${esc(item.text || '')}</p>
                  </div>
                </article>`).join('')}
            </div>

            <article class="tech-v1-behavior-card">
              <div>
                <h3>${esc(behavior.title || '')}</h3>
                <p>${esc(behavior.text || '')}</p>
              </div>
              <div class="tech-v1-behavior-image">
                ${image(behavior.image, behavior.title || 'ラッコの行動')}
              </div>
            </article>
          </div>
        </div>
      </section>`;
  };

  const renderSettings = section => {
    const tips = section.blurTips || {};

    return `
      <section class="tech-v1-section tech-v1-settings" id="tech-settings">
        <div class="container">
          ${heading(section)}

          <div class="tech-v1-settings-grid">
            <div class="tech-v1-setting-cards">
              ${(section.items || []).map((item, index) => `
                <article>
                  <span>0${index + 1}</span>
                  <h3>${esc(item.label || '')}</h3>
                  <strong>${esc(item.value || '')}</strong>
                  <p>${esc(item.text || '')}</p>
                </article>`).join('')}
            </div>

            <article class="tech-v1-blur-card">
              <div class="tech-v1-blur-copy">
                <h3>${esc(tips.title || '')}</h3>
                <ul>
                  ${(tips.items || []).map(item => `<li>${esc(item)}</li>`).join('')}
                </ul>
              </div>
              <div class="tech-v1-blur-image">
                ${image(tips.image, tips.title || 'ブレを防ぐコツ')}
              </div>
            </article>
          </div>
        </div>
      </section>`;
  };

  const renderScenes = section => `
    <section class="tech-v1-section tech-v1-scenes" id="tech-scenes">
      <div class="container">
        ${heading(section)}

        <div class="tech-v1-scene-grid">
          ${(section.items || []).map(item => `
            <article>
              <div>
                <h3>${esc(item.title || '')}</h3>
                <p>${esc(item.text || '')}</p>
              </div>
              <div class="tech-v1-scene-image">
                ${image(item.image, item.title || '撮影シーン')}
              </div>
            </article>`).join('')}
        </div>
      </div>
    </section>`;

  const renderFaq = section => {
    const items = Array.isArray(section.items) ? section.items : [];
    if (!items.length) return '';

    return `
      <section class="tech-v1-section tech-v1-faq" id="tech-faq">
        <div class="container">
          ${heading(section)}
          <div class="tech-v1-faq-list">
            ${items.map((item, index) => `
              <details ${index === 0 ? 'open' : ''}>
                <summary>
                  <span>Q</span>
                  ${esc(item.question || '')}
                </summary>
                <div>
                  <b>A</b>
                  <p>${esc(item.answer || '')}</p>
                </div>
              </details>`).join('')}
          </div>
        </div>
      </section>`;
  };

  const renderGallery = section => {
    const items = Array.isArray(section.items) ? section.items : [];
    if (!items.length) return '';

    return `
      <section class="tech-v1-section tech-v1-gallery" id="tech-gallery">
        <div class="container">
          ${heading(section)}
          <div class="tech-v1-gallery-grid">
            ${items.map(item => `
              <figure>
                <div>${image(item.image, item.caption || '作例')}</div>
                ${item.caption ? `<figcaption>${esc(item.caption)}</figcaption>` : ''}
              </figure>`).join('')}
          </div>
        </div>
      </section>`;
  };

  const renderNext = section => `
    <section class="tech-v1-next">
      <div class="container">
        <div class="tech-v1-next-copy">
          <p>${esc(section.eyebrow || 'NEXT STEP')}</p>
          <h2>${esc(section.title || '')}</h2>
          <span>${esc(section.text || '')}</span>
        </div>
        <div class="tech-v1-next-links">
          ${(section.links || []).map(item => {
            const url = safeUrl(item.url);
            return url ? `
              <a href="${esc(url)}">
                <b>${esc(item.label || '')}</b>
                <span>→</span>
              </a>` : '';
          }).join('')}
        </div>
      </div>
    </section>`;

  const renderPage = data => {
    document.body.classList.add('technique-page', 'tech-v1-page');
    document.title = 'ラッコ撮影テクニック｜HAMANAKA PHOTO GUIDE';

    root.innerHTML = `
      ${renderHero(data.hero || {}, data.sectionNav || [], data)}
      ${renderTimePlace(data.timePlace || {})}
      ${renderFind(data.find || {})}
      ${renderSettings(data.settings || {})}
      ${renderScenes(data.scenes || {})}
      ${renderFaq(data.faq || {})}
      ${renderGallery(data.gallery || {})}
      ${renderNext(data.next || {})}`;

    root.querySelectorAll('a[href^="#tech-"]').forEach(link => {
      link.addEventListener('click', event => {
        const target = document.querySelector(link.getAttribute('href'));
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  };

  const init = async () => {
    try {
      const response = await fetch('data/technique.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('technique.json load failed');
      renderPage(await response.json());
    } catch (error) {
      console.error(error);
      root.innerHTML = `
        <section class="section">
          <div class="container">
            <h1>テクニック編</h1>
            <p class="section-lead">ページを読み込めませんでした。</p>
            <p><a class="btn btn-outline" href="guide.html">PHOTO GUIDEへ戻る</a></p>
          </div>
        </section>`;
    }
  };

  init();
})();