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
    <div class="gear-v2-placeholder" aria-hidden="true">
      <span>HAMANAKA PHOTO</span>
      <strong>${escapeHtml(label)}</strong>
    </div>`;

  const image = (src, alt = '', cls = '') => {
    const imageUrl = safeUrl(src);
    if (!imageUrl) return placeholder(alt || 'IMAGE');

    return `<img
      class="${escapeHtml(cls)}"
      src="${escapeHtml(imageUrl)}"
      alt="${escapeHtml(alt)}"
      loading="lazy"
      decoding="async"
      fetchpriority="low">`;
  };

  const renderFieldNav = () => `
    <nav class="gear-v2-field-nav" aria-label="PHOTO FIELD GUIDE">
      <div class="container gear-v2-field-nav-inner">
        <a class="gear-v2-field-brand" href="guide.html">
          HAMANAKA
          <small>PHOTO FIELD GUIDE</small>
        </a>
        <div class="gear-v2-field-links">
          <a href="guide-article.html?article=photo-map">スポット</a>
          <a href="guide-article.html?article=trip">準備</a>
          <a href="guide-article.html?article=gear" aria-current="page">機材</a>
          <a href="guide-article.html?article=technique">テクニック</a>
          <a href="guide-article.html?article=manner">ルール</a>
        </div>
        <a class="gear-v2-field-spot" href="guide-article.html?article=photo-map">
          撮影スポットを探す
          <span aria-hidden="true">●</span>
        </a>
      </div>
    </nav>`;

  const renderHero = hero => `
    <section
      class="gear-v2-hero"
      ${hero.image ? `style="--gear-v2-hero-image:url('${escapeHtml(hero.image)}')"` : ''}>
      ${renderFieldNav()}
      <div class="gear-v2-hero-shade"></div>
      <div class="container gear-v2-hero-inner">
        <div class="gear-v2-hero-copy">
          <p class="gear-v2-eyebrow">${escapeHtml(hero.eyebrow || 'GEAR')}</p>
          <h1>${nl2br(hero.title || 'ラッコ撮影の、\n機材選び。')}</h1>
          <p class="gear-v2-hero-lead">${nl2br(hero.lead || '')}</p>
        </div>
      </div>
    </section>`;

  const renderFocal = section => {
    const samples = Array.isArray(section.samples) ? section.samples : [];
    if (!samples.length) return '';

    const defaultIndex = Math.max(
      0,
      samples.findIndex(item => Number(item.focal) === Number(section.defaultFocal))
    );
    const current = samples[defaultIndex] || samples[0];

    return `
      <section class="gear-v2-section gear-v2-focal" id="gear-focal">
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '01 / FOCAL LENGTH')}</p>
              <h2>${escapeHtml(section.title || '')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          ${section.point ? `
            <aside class="gear-v2-focal-point">
              <span>${escapeHtml(section.point.label || 'POINT')}</span>
              <div>
                <h3>${escapeHtml(section.point.title || '')}</h3>
                <p>${escapeHtml(section.point.text || '')}</p>
                ${section.point.note ? `<small>${escapeHtml(section.point.note)}</small>` : ''}
              </div>
            </aside>` : ''}

          <div class="gear-v2-focal-viewer" data-focal-viewer data-index="${defaultIndex}">
            <figure class="gear-v2-focal-figure">
              <div class="gear-v2-focal-image" data-focal-image>
                ${image(current.image, `${current.focal}mmの見え方`)}
              </div>
              <figcaption>
                <strong><span data-focal-number>${escapeHtml(current.focal)}</span>mm</strong>
                <div>
                  <b data-focal-label>${escapeHtml(current.label || '')}</b>
                  <span data-focal-description>${escapeHtml(current.description || '')}</span>
                </div>
              </figcaption>
            </figure>

            <div class="gear-v2-focal-controls">
              <input
                type="range"
                min="0"
                max="${Math.max(0, samples.length - 1)}"
                step="1"
                value="${defaultIndex}"
                aria-label="焦点距離を切り替える"
                data-focal-range>
              <div class="gear-v2-focal-buttons">
                ${samples.map((item, index) => `
                  <button
                    type="button"
                    data-focal-button="${index}"
                    ${index === defaultIndex ? 'aria-current="true"' : ''}>
                    ${escapeHtml(item.focal)}<small>mm</small>
                  </button>`).join('')}
              </div>
            </div>
          </div>

          ${section.note ? `<p class="gear-v2-note">${escapeHtml(section.note)}</p>` : ''}
        </div>
      </section>`;
  };

  const renderGearGuide = section => {
    const styles = Array.isArray(section.styles) ? section.styles : [];

    return `
      <section class="gear-v2-section gear-choice" id="gear-choice">
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '02 / CHOOSE BY STYLE')}</p>
              <h2>${escapeHtml(section.title || '')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          <div class="gear-choice-grid">
            ${styles.map(style => {
              const points = Array.isArray(style.points) ? style.points : [];
              return `
              <article class="gear-choice-card">
                <span class="gear-choice-label">${escapeHtml(style.label || '')}</span>
                <h3>${escapeHtml(style.title || '')}</h3>
                <div class="gear-choice-range">
                  <strong>${escapeHtml(style.range || '')}</strong>
                  <span>${escapeHtml(style.rangeLabel || '')}</span>
                </div>
                <div class="gear-choice-points">
                  ${points.map((point, index) => `
                    <section>
                      <span>${String(index + 1).padStart(2, '0')}</span>
                      <div>
                        <h4>${escapeHtml(point.title || '')}</h4>
                        <p>${escapeHtml(point.text || '')}</p>
                      </div>
                    </section>`).join('')}
                </div>
              </article>`;
            }).join('')}
          </div>

          ${section.wideShooting ? `
            <aside class="gear-wide-shooting">
              <h3>${escapeHtml(section.wideShooting.title || '')}</h3>
              <p>${escapeHtml(section.wideShooting.text || '')}</p>
            </aside>` : ''}

          ${section.teleconverter ? `
            <article class="gear-teleconverter">
              <div class="gear-teleconverter-copy">
                <p class="gear-teleconverter-label">SUPPLEMENT</p>
                <h3>${escapeHtml(section.teleconverter.title || '')}</h3>
                <p>${escapeHtml(section.teleconverter.text || '')}</p>
                <div class="gear-teleconverter-formula" aria-label="焦点距離の計算例">
                  <strong>${escapeHtml(section.teleconverter.formulaBase || '')}</strong>
                  <span>${escapeHtml(section.teleconverter.formulaFactor || '')}</span>
                  <b>${escapeHtml(section.teleconverter.formulaResult || '')}</b>
                </div>
                <p>${escapeHtml(section.teleconverter.example || '')}</p>
              </div>
              ${Array.isArray(section.teleconverter.cautions) && section.teleconverter.cautions.length ? `
                <div class="gear-teleconverter-cautions">
                  <h4>確認しておきたいこと</h4>
                  <ul>
                    ${section.teleconverter.cautions.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
                  </ul>
                </div>` : ''}
            </article>` : ''}

          ${section.alternative ? `
            <aside class="gear-alternative">
              <span>${escapeHtml(section.alternative.label || '')}</span>
              <div>
                <h3>${escapeHtml(section.alternative.title || '')}</h3>
                <p>${escapeHtml(section.alternative.text || '')}</p>
              </div>
            </aside>` : ''}
        </div>
      </section>`;
  };

  const renderSelectionPoints = section => {
    const items = Array.isArray(section.items) ? section.items : [];

    return `
      <section class="gear-v2-section gear-selection" id="gear-selection">
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '03 / SELECTION POINTS')}</p>
              <h2>${escapeHtml(section.title || '')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          <div class="gear-selection-grid">
            ${items.map((item, index) => `
              <article class="gear-selection-card">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <h3>${escapeHtml(item.title || '')}</h3>
                <p>${escapeHtml(item.text || '')}</p>
              </article>`).join('')}
          </div>

          ${section.tip ? `
            <aside class="gear-selection-tip">
              <span>${escapeHtml(section.tip.label || 'TIPS')}</span>
              <div>
                <h3>${escapeHtml(section.tip.title || '')}</h3>
                <p>${escapeHtml(section.tip.text || '')}</p>
              </div>
            </aside>` : ''}
        </div>
      </section>`;
  };

  const renderAccessories = section => {
    const items = Array.isArray(section.items) ? section.items : [];

    return `
      <section class="gear-v2-section gear-v2-accessories" id="gear-accessories">
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '04 / ACCESSORIES')}</p>
              <h2>${escapeHtml(section.title || '')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          <div class="gear-v2-accessory-grid">
            ${items.map(item => `
              <article class="gear-v2-accessory-card">
                <div>${image(item.image, item.title)}</div>
                <h3>${escapeHtml(item.title || '')}</h3>
                <p>${escapeHtml(item.text || '')}</p>
              </article>`).join('')}
          </div>
        </div>
      </section>`;
  };

  const renderExamples = section => {
    if (section.published !== true) return '';

    const items = Array.isArray(section.items) ? section.items : [];
    if (!items.length) return '';

    return `
      <section class="gear-v2-section gear-examples" id="gear-examples">
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '05 / EXAMPLES')}</p>
              <h2>${escapeHtml(section.title || '')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          ${section.note ? `<p class="gear-examples-note">${escapeHtml(section.note)}</p>` : ''}

          <div class="gear-example-grid">
            ${items.map(item => `
              <figure class="gear-example-card">
                <div>${image(item.image, item.caption || 'ラッコ撮影の作例')}</div>
                <figcaption>
                  <strong>${escapeHtml(item.caption || '')}</strong>
                  <span>${escapeHtml(item.equipment || '')}</span>
                </figcaption>
              </figure>`).join('')}
          </div>
        </div>
      </section>`;
  };

  const renderNext = section => `
    <section
      class="gear-v2-next"
      ${section.image ? `style="--gear-v2-next-image:url('${escapeHtml(section.image)}')"` : ''}>
      <div class="gear-v2-next-shade"></div>
      <div class="container gear-v2-next-inner">
        <div>
          <p>${escapeHtml(section.eyebrow || 'NEXT STEP')}</p>
          <h2>${escapeHtml(section.title || '')}</h2>
          <span>${escapeHtml(section.text || '')}</span>
        </div>
        <a href="${escapeHtml(safeUrl(section.url) || 'guide-article.html?article=technique')}">
          ${escapeHtml(section.buttonLabel || 'テクニック編へ')}
          <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>`;

  const initFocalViewer = (scope, section) => {
    const viewer = scope.querySelector('[data-focal-viewer]');
    if (!viewer) return;

    const samples = Array.isArray(section.samples) ? section.samples : [];
    const range = viewer.querySelector('[data-focal-range]');
    const number = viewer.querySelector('[data-focal-number]');
    const label = viewer.querySelector('[data-focal-label]');
    const description = viewer.querySelector('[data-focal-description]');
    const imageWrap = viewer.querySelector('[data-focal-image]');

    const update = nextIndex => {
      const index = Math.max(0, Math.min(samples.length - 1, Number(nextIndex) || 0));
      const sample = samples[index];
      if (!sample) return;

      viewer.dataset.index = String(index);
      if (range) range.value = String(index);
      if (number) number.textContent = sample.focal;
      if (label) label.textContent = sample.label || '';
      if (description) description.textContent = sample.description || '';
      if (imageWrap) imageWrap.innerHTML = image(sample.image, `${sample.focal}mmの見え方`);

      viewer.querySelectorAll('[data-focal-button]').forEach(button => {
        if (Number(button.dataset.focalButton) === index) {
          button.setAttribute('aria-current', 'true');
        } else {
          button.removeAttribute('aria-current');
        }
      });
    };

    range?.addEventListener('input', event => update(event.target.value));
    viewer.addEventListener('click', event => {
      const button = event.target.closest('[data-focal-button]');
      if (button) update(button.dataset.focalButton);
    });
  };

  const renderPage = data => {
    document.body.classList.add('gear-page', 'gear-v2-page');
    document.title = 'ラッコ撮影の機材選び｜HAMANAKA PHOTO GUIDE';

    const hero = data.hero || {};
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        String(hero.lead || '浜中町でのラッコ撮影に向く機材の選び方を紹介します。')
          .replace(/\r?\n/g, ' ')
      );

    root.innerHTML = `
      ${renderHero(hero)}
      ${renderFocal(data.focalExperience || {})}
      ${renderGearGuide(data.gearGuide || {})}
      ${renderSelectionPoints(data.selectionPoints || {})}
      ${renderAccessories(data.accessories || {})}
      ${renderExamples(data.examples || {})}
      ${renderNext(data.next || {})}`;

    initFocalViewer(root, data.focalExperience || {});
  };

  const init = async () => {
    try {
      const response = await fetch('data/gear.json', { cache: 'no-cache' });
      if (!response.ok) {
        throw new Error('機材編データを読み込めませんでした。');
      }

      renderPage(await response.json());
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
