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
    if (!src) return placeholder(alt || 'IMAGE');
    return `<img
      class="${cls}"
      src="${escapeHtml(src)}"
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
          <a href="guide-article.html?article=photo-map">SPOT</a>
          <a href="guide-article.html?article=trip">準備</a>
          <a href="guide-article.html?article=gear" aria-current="page">機材</a>
          <a href="guide-article.html?article=technique">テクニック</a>
          <a href="guide-article.html?article=manner">ルール</a>
        </div>
        <a class="gear-v2-field-spot" href="guide-article.html?article=photo-map">
          フォトスポットを探す
          <span aria-hidden="true">●</span>
        </a>
      </div>
    </nav>`;

  const renderHero = hero => {
    const points = Array.isArray(hero.points) ? hero.points : [];

    return `
      <section
        class="gear-v2-hero"
        ${hero.image ? `style="--gear-v2-hero-image:url('${escapeHtml(hero.image)}')"` : ''}>
        ${renderFieldNav()}
        <div class="gear-v2-hero-shade"></div>
        <div class="container gear-v2-hero-inner">
          <div class="gear-v2-hero-copy">
            <p class="gear-v2-eyebrow">${escapeHtml(hero.eyebrow || 'GEAR')}</p>
            <h1>${nl2br(hero.title || '撮影機材を選ぼう。')}</h1>
            <p class="gear-v2-hero-lead">${nl2br(hero.lead || '')}</p>

            <div class="gear-v2-hero-points">
              <p>${escapeHtml(hero.pointsTitle || 'どんな機材が必要？')}</p>
              <div class="gear-v2-point-grid">
                ${points.map(point => `
                  <div class="gear-v2-point">
                    <span>${escapeHtml(point.number || '')}</span>
                    <strong>${escapeHtml(point.text || '')}</strong>
                  </div>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </section>`;
  };

  const renderFocal = section => {
    const samples = Array.isArray(section.samples) ? section.samples : [];
    const defaultIndex = Math.max(
      0,
      samples.findIndex(item => Number(item.focal) === Number(section.defaultFocal))
    );
    const current = samples[defaultIndex] || {};

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

          <div class="gear-v2-focal-viewer" data-focal-viewer data-index="${defaultIndex}">
            <figure class="gear-v2-focal-figure">
              <div class="gear-v2-focal-image" data-focal-image>
                ${image(current.image, `${current.focal || ''}mm 作例`)}
              </div>
              <figcaption>
                <strong><span data-focal-number>${escapeHtml(current.focal || '')}</span>mm</strong>
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

          <p class="gear-v2-note">${escapeHtml(section.note || '')}</p>
        </div>
      </section>`;
  };

  const productImage = (product, type) => `
    <div class="gear-v2-product-image">
      ${image(product?.image, product?.name || type)}
    </div>`;

  const featureLabels = {
    'animal-af': '動物AF',
    'high-speed-burst': '高速連写',
    'stabilization': '手ブレ補正',
    'weather-sealed': '防塵・防滴'
  };

  const renderLensCard = lens => {
    if (!lens) return `<div class="gear-v2-product-empty">条件に合うレンズがありません。</div>`;

    return `
      <article class="gear-v2-product-card">
        <div class="gear-v2-product-type">LENS</div>
        ${productImage(lens, 'LENS')}
        <div class="gear-v2-product-copy">
          <span>${escapeHtml(lens.manufacturer || '')} / ${escapeHtml(lens.mount || '')} MOUNT</span>
          <h3>${escapeHtml(lens.name || '')}</h3>
          <p>${escapeHtml(lens.summary || '')}</p>
          <dl>
            <div><dt>焦点距離</dt><dd>${escapeHtml(lens.minFocal)}–${escapeHtml(lens.maxFocal)}mm</dd></div>
            <div><dt>開放F値</dt><dd>${escapeHtml(lens.aperture || '')}</dd></div>
            <div><dt>重量</dt><dd>${escapeHtml(lens.weight || '')}</dd></div>
          </dl>
          <div class="gear-v2-feature-tags">
            ${(lens.features || []).map(id =>
              featureLabels[id] ? `<span>${escapeHtml(featureLabels[id])}</span>` : ''
            ).join('')}
          </div>
        </div>
      </article>`;
  };

  const renderBodyCard = body => {
    if (!body) return `<div class="gear-v2-product-empty">条件に合うボディがありません。</div>`;

    return `
      <article class="gear-v2-product-card">
        <div class="gear-v2-product-type">BODY</div>
        ${productImage(body, 'BODY')}
        <div class="gear-v2-product-copy">
          <span>${escapeHtml(body.manufacturer || '')} / ${escapeHtml(body.mount || '')} MOUNT</span>
          <h3>${escapeHtml(body.name || '')}</h3>
          <p>${escapeHtml(body.summary || '')}</p>
          <dl>
            <div><dt>解像度</dt><dd>${escapeHtml(body.resolutionLabel || '')}</dd></div>
            <div><dt>連写</dt><dd>${escapeHtml(body.burst || '')}</dd></div>
          </dl>
          <div class="gear-v2-feature-tags">
            ${(body.features || []).map(id =>
              featureLabels[id] ? `<span>${escapeHtml(featureLabels[id])}</span>` : ''
            ).join('')}
          </div>
        </div>
      </article>`;
  };

  const renderFinder = section => {
    const modes = Array.isArray(section.modes) ? section.modes : [];
    const firstMode = modes[0]?.id || 'manufacturer';

    return `
      <section class="gear-v2-section gear-v2-finder" id="gear-finder" data-gear-finder data-mode="${escapeHtml(firstMode)}">
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '02 / GEAR FINDER')}</p>
              <h2>${escapeHtml(section.title || '')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          <div class="gear-v2-mode-tabs" role="tablist" aria-label="機材の選び方">
            ${modes.map((mode, index) => `
              <button
                type="button"
                role="tab"
                data-finder-mode="${escapeHtml(mode.id)}"
                aria-selected="${index === 0 ? 'true' : 'false'}">
                ${escapeHtml(mode.label || '')}
              </button>`).join('')}
          </div>

          <div class="gear-v2-finder-grid">
            <aside class="gear-v2-filter-panel">
              <div class="gear-v2-filter-head">
                <span>CONDITION</span>
                <strong>条件を選ぶ</strong>
              </div>
              <div data-finder-filters></div>
            </aside>

            <div class="gear-v2-product-column">
              <div class="gear-v2-column-label">LENS</div>
              <div data-finder-lens></div>
            </div>

            <div class="gear-v2-multiply" aria-hidden="true">×</div>

            <div class="gear-v2-product-column">
              <div class="gear-v2-column-label">CAMERA BODY</div>
              <div data-finder-body></div>
            </div>
          </div>

          <div class="gear-v2-pair-nav">
            <button type="button" data-pair-prev aria-label="前の組み合わせ">←</button>
            <span data-pair-count>候補 0 / 0</span>
            <button type="button" data-pair-next aria-label="次の組み合わせ">→</button>
          </div>

          <p class="gear-v2-note">${escapeHtml(section.disclaimer || '')}</p>
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
              <p>${escapeHtml(section.eyebrow || '03 / ACCESSORIES')}</p>
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

  const renderRental = section => {
    const url = safeUrl(section.url);
    const reasons = Array.isArray(section.reasons) ? section.reasons : [];

    return `
      <section class="gear-v2-section gear-v2-rental" id="gear-rental">
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '04 / RENTAL')}</p>
              <h2>${escapeHtml(section.title || '')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          <div class="gear-v2-rental-grid">
            <div class="gear-v2-rental-reasons">
              <span>${escapeHtml(section.reasonTitle || 'こんなときに')}</span>
              ${reasons.map((reason, index) => `
                <div>
                  <b>0${index + 1}</b>
                  <strong>${escapeHtml(reason)}</strong>
                </div>`).join('')}
            </div>

            <article class="gear-v2-rental-service">
              <div class="gear-v2-rental-service-image">
                ${image(section.image, section.serviceName || 'GOOPASS')}
              </div>
              <div class="gear-v2-rental-service-copy">
                <span>${escapeHtml(section.serviceLabel || '')}</span>
                <h3>${escapeHtml(section.serviceName || '')}</h3>
                <p>${escapeHtml(section.serviceText || '')}</p>
                ${url ? `
                  <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">
                    ${escapeHtml(section.buttonLabel || '公式サイトを見る')}
                    <span aria-hidden="true">↗</span>
                  </a>` : ''}
                <small>${escapeHtml(section.note || '')}</small>
              </div>
            </article>
          </div>
        </div>
      </section>`;
  };

  const renderNext = section => {
    const url = safeUrl(section.url);

    return `
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
          ${url ? `
            <a href="${escapeHtml(url)}">
              ${escapeHtml(section.buttonLabel || '次へ')}
              <span aria-hidden="true">→</span>
            </a>` : ''}
        </div>
      </section>`;
  };

  const initFocalViewer = (scope, section) => {
    const viewer = scope.querySelector('[data-focal-viewer]');
    if (!viewer) return;

    const samples = Array.isArray(section.samples) ? section.samples : [];
    const range = viewer.querySelector('[data-focal-range]');
    const buttons = [...viewer.querySelectorAll('[data-focal-button]')];
    const imageBox = viewer.querySelector('[data-focal-image]');
    const number = viewer.querySelector('[data-focal-number]');
    const label = viewer.querySelector('[data-focal-label]');
    const description = viewer.querySelector('[data-focal-description]');

    const update = index => {
      const safeIndex = Math.max(0, Math.min(samples.length - 1, Number(index) || 0));
      const sample = samples[safeIndex];
      if (!sample) return;

      viewer.dataset.index = String(safeIndex);
      range.value = String(safeIndex);
      number.textContent = String(sample.focal || '');
      label.textContent = sample.label || '';
      description.textContent = sample.description || '';
      imageBox.innerHTML = image(sample.image, `${sample.focal || ''}mm 作例`);

      buttons.forEach((button, buttonIndex) => {
        if (buttonIndex === safeIndex) {
          button.setAttribute('aria-current', 'true');
        } else {
          button.removeAttribute('aria-current');
        }
      });
    };

    range.addEventListener('input', () => update(range.value));
    buttons.forEach(button => {
      button.addEventListener('click', () => update(button.dataset.focalButton));
    });

    samples.forEach(sample => {
      if (!sample.image) return;
      const preload = new Image();
      preload.src = sample.image;
    });
  };

  const initFinder = (scope, section) => {
    const finder = scope.querySelector('[data-gear-finder]');
    if (!finder) return;

    const lenses = Array.isArray(section.lenses) ? section.lenses : [];
    const bodies = Array.isArray(section.bodies) ? section.bodies : [];
    const modes = Array.isArray(section.modes) ? section.modes : [];
    const filters = finder.querySelector('[data-finder-filters]');
    const lensBox = finder.querySelector('[data-finder-lens]');
    const bodyBox = finder.querySelector('[data-finder-body]');
    const count = finder.querySelector('[data-pair-count]');
    const prev = finder.querySelector('[data-pair-prev]');
    const next = finder.querySelector('[data-pair-next]');
    const modeButtons = [...finder.querySelectorAll('[data-finder-mode]')];

    const state = {
      mode: modes[0]?.id || 'manufacturer',
      manufacturer: section.manufacturers?.[0] || '',
      focal: Number(section.focalOptions?.[0] || 400),
      resolution: Number(section.resolutionOptions?.[0] || 24),
      functions: [],
      pairIndex: 0
    };

    const allPairs = () => {
      const pairs = [];
      lenses.forEach(lens => {
        bodies.forEach(body => {
          if (String(lens.mount) === String(body.mount)) {
            pairs.push({ lens, body });
          }
        });
      });
      return pairs;
    };

    const filteredPairs = () => {
      return allPairs().filter(pair => {
        if (state.mode === 'manufacturer') {
          return pair.body.manufacturer === state.manufacturer;
        }

        if (state.mode === 'focal') {
          return Number(pair.lens.maxFocal || 0) >= state.focal;
        }

        if (state.mode === 'resolution') {
          return Number(pair.body.resolution || 0) >= state.resolution;
        }

        if (state.mode === 'function' && state.functions.length) {
          const union = new Set([
            ...(pair.lens.features || []),
            ...(pair.body.features || [])
          ]);
          return state.functions.every(feature => union.has(feature));
        }

        return true;
      });
    };

    const radioList = (name, values, current, formatter = value => String(value)) => `
      <div class="gear-v2-filter-options">
        ${values.map(value => `
          <label>
            <input
              type="radio"
              name="${escapeHtml(name)}"
              value="${escapeHtml(value)}"
              ${String(value) === String(current) ? 'checked' : ''}>
            <span>${escapeHtml(formatter(value))}</span>
          </label>`).join('')}
      </div>`;

    const renderFilters = () => {
      if (state.mode === 'manufacturer') {
        filters.innerHTML = `
          <p>使いたいカメラメーカーを選択</p>
          ${radioList(
            'gear-manufacturer',
            section.manufacturers || [],
            state.manufacturer
          )}`;
      } else if (state.mode === 'focal') {
        filters.innerHTML = `
          <p>必要な望遠端を選択</p>
          ${radioList(
            'gear-focal',
            section.focalOptions || [],
            state.focal,
            value => `${value}mm以上`
          )}`;
      } else if (state.mode === 'resolution') {
        filters.innerHTML = `
          <p>ボディの解像度を選択</p>
          ${radioList(
            'gear-resolution',
            section.resolutionOptions || [],
            state.resolution,
            value => `${value}MP以上`
          )}`;
      } else {
        filters.innerHTML = `
          <p>ほしい機能を複数選択できます</p>
          <div class="gear-v2-filter-options gear-v2-filter-checks">
            ${(section.featureOptions || []).map(option => `
              <label>
                <input
                  type="checkbox"
                  value="${escapeHtml(option.id)}"
                  ${state.functions.includes(option.id) ? 'checked' : ''}>
                <span>${escapeHtml(option.label || '')}</span>
              </label>`).join('')}
          </div>`;
      }
    };

    const renderPair = () => {
      const pairs = filteredPairs();
      if (!pairs.length) {
        state.pairIndex = 0;
        lensBox.innerHTML = renderLensCard(null);
        bodyBox.innerHTML = renderBodyCard(null);
        count.textContent = '候補 0 / 0';
        prev.disabled = true;
        next.disabled = true;
        return;
      }

      state.pairIndex = Math.max(0, Math.min(state.pairIndex, pairs.length - 1));
      const pair = pairs[state.pairIndex];

      lensBox.innerHTML = renderLensCard(pair.lens);
      bodyBox.innerHTML = renderBodyCard(pair.body);
      count.textContent = `候補 ${state.pairIndex + 1} / ${pairs.length}`;
      prev.disabled = pairs.length <= 1;
      next.disabled = pairs.length <= 1;
    };

    const resetPair = () => {
      state.pairIndex = 0;
      renderPair();
    };

    modeButtons.forEach(button => {
      button.addEventListener('click', () => {
        state.mode = button.dataset.finderMode || 'manufacturer';
        finder.dataset.mode = state.mode;
        modeButtons.forEach(item => {
          item.setAttribute(
            'aria-selected',
            String(item === button)
          );
        });
        renderFilters();
        resetPair();
      });
    });

    filters.addEventListener('change', event => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement)) return;

      if (state.mode === 'manufacturer') {
        state.manufacturer = input.value;
      } else if (state.mode === 'focal') {
        state.focal = Number(input.value);
      } else if (state.mode === 'resolution') {
        state.resolution = Number(input.value);
      } else {
        state.functions = [...filters.querySelectorAll('input[type="checkbox"]:checked')]
          .map(item => item.value);
      }

      resetPair();
    });

    prev.addEventListener('click', () => {
      const pairs = filteredPairs();
      if (!pairs.length) return;
      state.pairIndex = (state.pairIndex - 1 + pairs.length) % pairs.length;
      renderPair();
    });

    next.addEventListener('click', () => {
      const pairs = filteredPairs();
      if (!pairs.length) return;
      state.pairIndex = (state.pairIndex + 1) % pairs.length;
      renderPair();
    });

    renderFilters();
    renderPair();
  };

  const renderPage = data => {
    document.body.classList.add('gear-page', 'gear-v2-page');
    document.title = '撮影機材を考える｜HAMANAKA PHOTO GUIDE';

    const hero = data.hero || {};
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        String(hero.lead || '浜中町での撮影機材選びを紹介します。')
          .replace(/\r?\n/g, ' ')
      );

    root.innerHTML = `
      ${renderHero(hero)}
      ${renderFocal(data.focalExperience || {})}
      ${renderFinder(data.gearFinder || {})}
      ${renderAccessories(data.accessories || {})}
      ${renderRental(data.rental || {})}
      ${renderNext(data.next || {})}`;

    initFocalViewer(root, data.focalExperience || {});
    initFinder(root, data.gearFinder || {});
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