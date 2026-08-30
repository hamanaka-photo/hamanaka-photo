(() => {
  const root = document.querySelector('[data-guide-article]');
  if (!root) return;

  const articleId = new URLSearchParams(window.location.search).get('article');
  if (articleId !== 'gear') return;

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  const safeUrl = (value = '') => {
    const raw = String(value || '').trim();
    if (!raw || /^(javascript|data|vbscript):/i.test(raw)) return '';
    return raw;
  };

  const nl2br = value =>
    escapeHtml(value || '').replace(/\r?\n/g, '<br>');

  const placeholder = (label = 'GEAR') => `
    <div class="gear-image-placeholder" aria-hidden="true">
      <span>HAMANAKA PHOTO</span>
      <strong>${escapeHtml(label)}</strong>
    </div>`;

  const image = (src, alt, priority = false) => {
    if (!src) return placeholder(alt);
    return `<img
      src="${escapeHtml(src)}"
      alt="${escapeHtml(alt || '')}"
      ${priority ? '' : 'loading="lazy"'}
      decoding="async"
      ${priority ? 'fetchpriority="high"' : 'fetchpriority="low"'}>`;
  };

  const link = (url, label, cls = '') => {
    const href = safeUrl(url);
    if (!href || !label) return '';
    const external = /^https?:\/\//i.test(href);
    return `<a
      class="${cls}"
      href="${escapeHtml(href)}"
      ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>
      ${escapeHtml(label)}
      <span aria-hidden="true">→</span>
    </a>`;
  };

  const renderFieldNav = () => `
    <nav class="gear-field-nav" aria-label="PHOTO FIELD GUIDE">
      <div class="container gear-field-nav-inner">
        <a class="gear-field-brand" href="guide.html">
          HAMANAKA
          <small>PHOTO FIELD GUIDE</small>
        </a>
        <div class="gear-field-links">
          <a href="guide-article.html?article=photo-map">SPOT</a>
          <a href="guide-article.html?article=trip">準備</a>
          <a href="guide-article.html?article=gear" aria-current="page">機材</a>
          <a href="guide-article.html?article=technique">テクニック</a>
          <a href="guide-article.html?article=manner">ルール</a>
        </div>
        <a class="gear-field-spot" href="guide-article.html?article=photo-map">
          フォトスポットを探す
          <span aria-hidden="true">●</span>
        </a>
      </div>
    </nav>`;

  const renderHero = data => {
    const hero = data.hero || {};
    const subjects = data.subjects || {};
    const points = Array.isArray(hero.points) ? hero.points : [];
    const subjectItems = Array.isArray(subjects.items) ? subjects.items : [];

    return `
      <section
        class="gear-hero"
        ${hero.image ? `style="--gear-hero-image:url('${escapeHtml(hero.image)}')"` : ''}>
        ${renderFieldNav()}
        <div class="gear-hero-shade"></div>
        <div class="container gear-hero-inner">
          <div class="gear-hero-copy">
            <p class="gear-eyebrow">${escapeHtml(hero.eyebrow || 'GEAR')}</p>
            <h1>${nl2br(hero.title || '撮影機材を選ぼう。')}</h1>
            <p class="gear-hero-lead">${nl2br(hero.lead || '')}</p>

            <aside class="gear-hero-points">
              <h2>${escapeHtml(hero.pointsTitle || '機材選びのポイント')}</h2>
              <ul>
                ${points.map(point => `<li>${escapeHtml(point)}</li>`).join('')}
              </ul>
            </aside>
          </div>

          <aside class="gear-subject-panel">
            <p>SUBJECT</p>
            <h2>${escapeHtml(subjects.title || '浜中町で出会える被写体')}</h2>
            <div class="gear-subject-grid">
              ${subjectItems.map(item => `
                <div class="gear-subject-item">
                  <span>${escapeHtml(item.short || '')}</span>
                  <strong>${escapeHtml(item.label || '')}</strong>
                </div>`).join('')}
            </div>
            <p class="gear-subject-lead">${escapeHtml(subjects.lead || '')}</p>
            <a href="guide-article.html?article=photo-map">
              フォトスポットを探す
              <span aria-hidden="true">→</span>
            </a>
          </aside>
        </div>
      </section>`;
  };

  const renderRecommended = section => {
    const items = Array.isArray(section.items) ? section.items : [];

    return `
      <section class="gear-section gear-recommended" id="gear-recommended">
        <div class="container">
          <div class="gear-section-heading gear-section-heading-center">
            <p>${escapeHtml(section.eyebrow || 'RECOMMENDED')}</p>
            <h2>${escapeHtml(section.title || '')}</h2>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          <div class="gear-recommended-note">${escapeHtml(section.note || '')}</div>

          <div class="gear-product-grid">
            ${items.map(item => `
              <article class="gear-product-card">
                <span class="gear-product-badge">${escapeHtml(item.badge || '')}</span>
                <div class="gear-product-image">
                  ${image(item.image, item.title)}
                </div>
                <div class="gear-product-copy">
                  <h3>${escapeHtml(item.title || '')}</h3>
                  <p>${escapeHtml(item.text || '')}</p>

                  <dl class="gear-product-meta">
                    <div>
                      <dt>焦点距離</dt>
                      <dd>${escapeHtml(item.range || '')}</dd>
                    </div>
                  </dl>

                  <div class="gear-tag-row">
                    ${(Array.isArray(item.uses) ? item.uses : []).map(use =>
                      `<span>${escapeHtml(use)}</span>`
                    ).join('')}
                  </div>
                </div>
              </article>`).join('')}
          </div>
        </div>
      </section>`;
  };

  const renderLensGuide = section => {
    const samples = Array.isArray(section.samples) ? section.samples : [];
    const tele = section.teleconverter || {};

    return `
      <article class="gear-guide-card gear-lens-card" id="gear-lens-guide">
        <div class="gear-guide-heading">
          <p>${escapeHtml(section.eyebrow || 'LENS')}</p>
          <h2>${escapeHtml(section.title || '')}</h2>
          <span>${escapeHtml(section.lead || '')}</span>
        </div>

        <div class="gear-focal-grid">
          ${samples.map(sample => `
            <figure class="gear-focal-item">
              <div>${image(sample.image, sample.focal)}</div>
              <figcaption>
                <strong>${escapeHtml(sample.focal || '')}</strong>
                <span>${escapeHtml(sample.label || '')}</span>
              </figcaption>
            </figure>`).join('')}
        </div>

        <div class="gear-teleconverter">
          <div>
            <p>OPTION</p>
            <h3>${escapeHtml(tele.title || '')}</h3>
            <span>${escapeHtml(tele.text || '')}</span>
          </div>
          <div class="gear-tele-image">${image(tele.image, tele.title)}</div>
        </div>
      </article>`;
  };

  const renderBodyGuide = section => {
    const items = Array.isArray(section.items) ? section.items : [];

    return `
      <article class="gear-guide-card">
        <div class="gear-guide-heading">
          <p>${escapeHtml(section.eyebrow || 'CAMERA BODY')}</p>
          <h2>${escapeHtml(section.title || '')}</h2>
          <span>${escapeHtml(section.lead || '')}</span>
        </div>

        <div class="gear-body-grid">
          ${items.map((item, index) => `
            <div class="gear-body-item">
              <div class="gear-body-icon" aria-hidden="true">0${index + 1}</div>
              <h3>${escapeHtml(item.title || '')}</h3>
              <strong>${escapeHtml(item.value || '')}</strong>
              <p>${escapeHtml(item.text || '')}</p>
            </div>`).join('')}
        </div>
      </article>`;
  };

  const renderAccessories = section => {
    const items = Array.isArray(section.items) ? section.items : [];

    return `
      <article class="gear-guide-card">
        <div class="gear-guide-heading">
          <p>${escapeHtml(section.eyebrow || 'ACCESSORIES')}</p>
          <h2>${escapeHtml(section.title || '')}</h2>
        </div>

        <div class="gear-accessory-grid">
          ${items.map(item => `
            <div class="gear-accessory-item">
              <div>${image(item.image, item.title)}</div>
              <h3>${escapeHtml(item.title || '')}</h3>
              <p>${escapeHtml(item.text || '')}</p>
            </div>`).join('')}
        </div>
      </article>`;
  };

  const renderSettings = section => {
    const items = Array.isArray(section.items) ? section.items : [];

    return `
      <article class="gear-guide-card gear-settings-card">
        <div class="gear-guide-heading">
          <p>${escapeHtml(section.eyebrow || 'BASIC SETTINGS')}</p>
          <h2>${escapeHtml(section.title || '')}</h2>
          <span>${escapeHtml(section.lead || '')}</span>
        </div>

        <div class="gear-settings-grid">
          ${items.map((item, index) => `
            <div class="gear-setting-item">
              <span aria-hidden="true">0${index + 1}</span>
              <h3>${escapeHtml(item.title || '')}</h3>
              <strong>${escapeHtml(item.value || '')}</strong>
              <p>${escapeHtml(item.text || '')}</p>
            </div>`).join('')}
        </div>

        ${link(
          section.techniqueUrl,
          section.techniqueLabel,
          'gear-outline-button gear-settings-link'
        )}
      </article>`;
  };

  const renderBottomCards = data => {
    const rental = data.rental || {};
    const diagnosis = data.diagnosis || {};

    return `
      <section class="gear-bottom-section">
        <div class="container gear-bottom-grid">
          <article class="gear-rental-card">
            <div class="gear-rental-image">
              ${image(rental.image, rental.title)}
            </div>
            <div class="gear-rental-copy">
              <p>${escapeHtml(rental.eyebrow || 'RENTAL')}</p>
              <h2>${escapeHtml(rental.title || '')}</h2>
              <span>${escapeHtml(rental.text || '')}</span>
              ${link(rental.url, rental.buttonLabel, 'gear-solid-button')}
            </div>
          </article>

          <article class="gear-diagnosis-card">
            <p>${escapeHtml(diagnosis.eyebrow || 'CHOOSING GEAR')}</p>
            <h2>${escapeHtml(diagnosis.title || '')}</h2>
            <span>${escapeHtml(diagnosis.text || '')}</span>
            ${link(
              diagnosis.url,
              diagnosis.buttonLabel,
              'gear-solid-button'
            )}
          </article>
        </div>
      </section>`;
  };

  const renderNext = next => `
    <section
      class="gear-next"
      ${next.image ? `style="--gear-next-image:url('${escapeHtml(next.image)}')"` : ''}>
      <div class="gear-next-shade"></div>
      <div class="container gear-next-inner">
        <div>
          <p>${escapeHtml(next.eyebrow || 'NEXT STEP')}</p>
          <h2>${escapeHtml(next.title || '')}</h2>
        </div>

        <div class="gear-next-links">
          <a href="guide-article.html?article=photo-map">
            <b>SPOT</b>
            <span>撮影スポットを探す</span>
          </a>
          <a href="guide-article.html?article=trip">
            <b>PREPARATION</b>
            <span>準備を整える</span>
          </a>
          <a href="guide-article.html?article=technique">
            <b>TECHNIQUE</b>
            <span>撮り方を学ぶ</span>
          </a>
          <a href="guide-article.html?article=manner">
            <b>RULES</b>
            <span>ルール・マナー</span>
          </a>
        </div>
      </div>
    </section>`;

  const renderPage = data => {
    const hero = data.hero || {};

    document.body.classList.add('gear-page');
    document.title = '撮影機材を考える｜HAMANAKA PHOTO GUIDE';

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        String(hero.lead || '浜中町での撮影に向くカメラ・レンズ・アクセサリーを紹介します。')
          .replace(/\r?\n/g, ' ')
      );

    root.innerHTML = `
      ${renderHero(data)}
      ${renderRecommended(data.recommended || {})}

      <section class="gear-section gear-guide-section">
        <div class="container gear-guide-grid">
          ${renderLensGuide(data.lensGuide || {})}
          ${renderBodyGuide(data.bodyGuide || {})}
          ${renderAccessories(data.accessories || {})}
          ${renderSettings(data.settings || {})}
        </div>
      </section>

      ${renderBottomCards(data)}
      ${renderNext(data.next || {})}`;
  };

  const init = async () => {
    try {
      const response = await fetch('data/gear.json', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error('機材編データを読み込めませんでした。');
      }

      const data = await response.json();
      renderPage(data);
    } catch (error) {
      console.error(error);
      root.innerHTML = `
        <section class="section">
          <div class="container">
            <h1>機材編</h1>
            <p class="section-lead">ページを読み込めませんでした。</p>
            <p><a class="btn btn-outline" href="guide.html">PHOTO GUIDEへ戻る</a></p>
          </div>
        </section>`;
    }
  };

  init();
})();