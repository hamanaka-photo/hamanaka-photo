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

  const renderHero = hero => `
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
        </div>
      </div>
    </section>`;

  const renderIntroPoints = section => {
    const points = Array.isArray(section.points) ? section.points : [];

    return `
      <section class="gear-v2-intro-points" aria-labelledby="gear-intro-title">
        <div class="container">
          <div class="gear-v2-intro-heading">
            <div>
              <p>GEAR BASICS</p>
              <h2 id="gear-intro-title">${escapeHtml(section.title || 'どんな機材が必要？')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          <div class="gear-v2-intro-card-grid">
            ${points.map(point => `
              <article class="gear-v2-intro-card">
                <span>${escapeHtml(point.number || '')}</span>
                <strong>${escapeHtml(point.text || '')}</strong>
              </article>`).join('')}
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

  const renderIntegratedCard = camera => {
    if (!camera) {
      return `<div class="gear-v2-product-empty">条件に合う一体型カメラがありません。</div>`;
    }

    return `
      <article class="gear-v2-integrated-card">
        <div class="gear-v2-product-type">LENS + BODY / 一体型</div>
        <div class="gear-v2-integrated-image">
          ${image(camera.image, camera.name || '一体型カメラ')}
        </div>
        <div class="gear-v2-product-copy">
          <span>${escapeHtml(camera.manufacturer || '')} / INTEGRATED CAMERA</span>
          <h3>${escapeHtml(camera.name || '')}</h3>
          <p>${escapeHtml(camera.summary || '')}</p>
          <dl>
            <div><dt>焦点距離</dt><dd>${escapeHtml(camera.focalLabel || `${camera.minFocal}–${camera.maxFocal}mm`)}</dd></div>
            <div><dt>開放F値</dt><dd>${escapeHtml(camera.aperture || '')}</dd></div>
            <div><dt>解像度</dt><dd>${escapeHtml(camera.resolutionLabel || '')}</dd></div>
            <div><dt>重量</dt><dd>${escapeHtml(camera.weight || '')}</dd></div>
            <div><dt>連写</dt><dd>${escapeHtml(camera.burst || '')}</dd></div>
          </dl>
          <div class="gear-v2-feature-tags">
            ${(camera.features || []).map(id =>
              featureLabels[id] ? `<span>${escapeHtml(featureLabels[id])}</span>` : ''
            ).join('')}
          </div>
        </div>
      </article>`;
  };

  const renderFinder = section => {
    const lenses = Array.isArray(section.lenses) ? section.lenses : [];
    const focalOptions = Array.isArray(section.focalOptions)
      ? section.focalOptions
      : [400, 500];
    const firstLens = lenses[0] || {};

    return `
      <section class="gear-v2-section gear-v7-finder gear-v8-finder" id="gear-finder" data-gear-finder>
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '02 / LENS & BODY')}</p>
              <h2>${escapeHtml(section.title || 'レンズを選ぶ。ボディを選ぶ。')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          <div class="gear-v7-step-heading">
            <span>STEP 1 / LENS</span>
            <div>
              <h3>まず、レンズを選ぶ</h3>
              <p>条件で絞り込み、一覧の行を選ぶと対応するボディ候補を表示します。</p>
            </div>
          </div>

          <div class="gear-v7-filter-shell gear-v8-filter-shell">
            <div class="gear-v7-filter-modes" aria-label="レンズの絞り込み方法">
              <button type="button" data-lens-mode="manufacturer">メーカーで選ぶ</button>
              <button type="button" data-lens-mode="focal">焦点距離で選ぶ</button>
              <button type="button" class="is-reset" data-lens-reset>すべて表示</button>
            </div>

            <div class="gear-v7-filter-panels" data-lens-filter-panel hidden>
              <div data-lens-filter-group="manufacturer" hidden>
                <span>メーカー</span>
                <div>
                  ${(section.manufacturers || []).map(value => `
                    <button type="button" data-lens-filter="manufacturer" data-filter-value="${escapeHtml(value)}">
                      ${escapeHtml(value)}
                    </button>`).join('')}
                </div>
              </div>
              <div data-lens-filter-group="focal" hidden>
                <span>望遠端</span>
                <div>
                  ${focalOptions.map(value => `
                    <button type="button" data-lens-filter="focal" data-filter-value="${escapeHtml(value)}">
                      ${escapeHtml(value)}mm以上
                    </button>`).join('')}
                </div>
              </div>
            </div>
          </div>

          <div class="gear-v8-lens-layout">
            <div class="gear-v7-lens-table-wrap">
              <table class="gear-v7-lens-table gear-v8-lens-table">
                <thead>
                  <tr>
                    <th>レンズ</th>
                    <th>焦点距離</th>
                    <th>開放F値</th>
                    <th>大きさ・重さ</th>
                    <th>AF</th>
                    <th>手ぶれ補正</th>
                    <th>マウント</th>
                  </tr>
                </thead>
                <tbody>
                  ${lenses.map((lens, index) => `
                    <tr
                      data-lens-row
                      data-lens-id="${escapeHtml(lens.id)}"
                      data-manufacturer="${escapeHtml(lens.manufacturer)}"
                      data-max-focal="${escapeHtml(lens.maxFocal)}"
                      tabindex="0"
                      role="button"
                      aria-pressed="${index === 0 ? 'true' : 'false'}"
                      class="${index === 0 ? 'is-selected' : ''}">
                      <td class="gear-v7-lens-name">
                        <span>${escapeHtml(lens.manufacturer || '')}</span>
                        <strong>${escapeHtml(lens.name || '')}</strong>
                      </td>
                      <td>${escapeHtml(lens.minFocal)}–${escapeHtml(lens.maxFocal)}mm</td>
                      <td>${escapeHtml(lens.aperture || '')}</td>
                      <td>
                        <span>${escapeHtml(lens.dimensions || '')}</span>
                        <small>${escapeHtml(lens.weight || '')}</small>
                      </td>
                      <td>${escapeHtml(lens.autofocus || 'AF対応')}</td>
                      <td>${escapeHtml(
                        lens.stabilizationLabel ||
                        ((lens.features || []).includes('stabilization') ? 'あり' : 'なし')
                      )}</td>
                      <td><b>${escapeHtml(lens.mount || '')}</b></td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>

            <aside class="gear-v8-selected-preview" data-selected-lens-preview>
              <span>SELECTED LENS</span>
              <div class="gear-v8-selected-image" data-selected-lens-image>
                ${image(firstLens.image, firstLens.name || '選択レンズ')}
              </div>
              <div class="gear-v8-selected-copy">
                <small data-selected-lens-maker>${escapeHtml(firstLens.manufacturer || '')}</small>
                <h4 data-selected-lens-title>${escapeHtml(firstLens.name || '')}</h4>
                <p data-selected-lens-summary>${escapeHtml(firstLens.summary || '')}</p>
              </div>
            </aside>
          </div>

          <div class="gear-v7-body-stage" data-body-stage>
            <div class="gear-v7-step-heading">
              <span>STEP 2 / BODY</span>
              <div>
                <h3>選んだレンズに合うボディ</h3>
                <p>選択したレンズとマウントが一致するボディ候補を表示します。</p>
              </div>
            </div>
            <div class="gear-v7-selected-lens">
              <span>SELECTED LENS</span>
              <strong data-selected-lens-name>${escapeHtml(firstLens.name || '')}</strong>
            </div>
            <div class="gear-v7-body-grid" data-body-grid></div>
          </div>

          ${(section.integratedCameras || []).length ? `
            <details class="gear-v7-integrated-alternative">
              <summary>レンズ交換不要の一体型カメラも見る</summary>
              <div class="gear-v7-integrated-grid">
                ${(section.integratedCameras || []).map(camera => renderIntegratedCard(camera)).join('')}
              </div>
            </details>` : ''}

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

  const rentalReasonIcon = index => {
    if (index === 0) {
      return `<span class="gear-v6-rental-yen" aria-hidden="true">¥</span>`;
    }

    if (index === 1) {
      return `
        <svg class="gear-v6-rental-svg" viewBox="0 0 48 48" aria-hidden="true">
          <path d="M14 16h7l2-4h8l2 4h3a5 5 0 0 1 5 5v15H7V21a5 5 0 0 1 5-5h2Z"/>
          <circle cx="24" cy="27" r="7"/>
          <path d="M11 21h5"/>
        </svg>`;
    }

    return `
      <svg class="gear-v6-rental-svg" viewBox="0 0 48 48" aria-hidden="true">
        <path d="M17 9h14l3 6v18l-3 6H17l-3-6V15l3-6Z"/>
        <path d="M14 18h20M14 29h20M19 9v30M29 9v30"/>
      </svg>`;
  };

  const renderRental = section => {
    const url = safeUrl(section.url);
    const reasons = Array.isArray(section.reasons) ? section.reasons : [];

    return `
      <section class="gear-v2-section gear-v6-rental" id="gear-rental">
        <div class="container">
          <div class="gear-v6-rental-shell">

            <section class="gear-v6-rental-left" aria-labelledby="gear-rental-title">
              <div class="gear-v6-rental-message">
                <p>${escapeHtml(section.eyebrow || '04 / RENTAL')}</p>
                <h2 id="gear-rental-title">
                  ${escapeHtml(section.title || 'レンタルという選択肢も！')}
                </h2>
                <span class="gear-v6-rental-rule" aria-hidden="true"></span>
                <div class="gear-v6-rental-lead">
                  ${nl2br(section.lead || '')}
                </div>
              </div>

              <div class="gear-v6-rental-reasons">
                ${reasons.slice(0, 3).map((reason, index) => `
                  <article class="gear-v6-rental-reason">
                    <div class="gear-v6-rental-reason-circle">
                      ${rentalReasonIcon(index)}
                      <b>0${index + 1}</b>
                    </div>
                    <strong>${escapeHtml(reason)}</strong>
                  </article>`).join('')}
              </div>
            </section>

            <article class="gear-v6-rental-service">
              <div class="gear-v6-rental-service-copy">
                <span class="gear-v6-rental-service-label">
                  ${escapeHtml(
                    section.serviceLabel ||
                    '撮影機材レンタルサービスの一例'
                  )}
                </span>

                <div class="gear-v6-rental-logo">
                  ${section.image
                    ? image(
                        section.image,
                        section.serviceName || 'GOOPASS'
                      )
                    : `<strong>${escapeHtml(
                        section.serviceName || 'GOOPASS'
                      )}</strong>`}
                </div>

                <p>${escapeHtml(section.serviceText || '')}</p>

                ${url ? `
                  <a
                    href="${escapeHtml(url)}"
                    target="_blank"
                    rel="noopener noreferrer">
                    ${escapeHtml(
                      section.buttonLabel || 'GOOPASSで機材を探す'
                    )}
                    <span aria-hidden="true">↗</span>
                  </a>` : ''}
              </div>

              <div class="gear-v6-rental-service-visual">
                ${section.visualImage
                  ? image(
                      section.visualImage,
                      'GOOPASS レンタル機材イメージ'
                    )
                  : `
                    <div class="gear-v6-rental-visual-placeholder">
                      <span>RENTAL IMAGE</span>
                      <small>右側の横長画像を設定</small>
                    </div>`}
              </div>
            </article>
          </div>

          <p class="gear-v6-rental-note">
            ${escapeHtml(section.note || '')}
          </p>
        </div>
      </section>`;
  };

  const renderExamples = section => {
    const items = Array.isArray(section.items) ? section.items : [];

    return `
      <section class="gear-v2-section gear-v7-examples gear-v8-examples" id="gear-examples">
        <div class="container">
          <div class="gear-v2-heading">
            <div>
              <p>${escapeHtml(section.eyebrow || '05 / EXAMPLES')}</p>
              <h2>${escapeHtml(section.title || '機材で見る、作例ギャラリー。')}</h2>
            </div>
            <span>${escapeHtml(section.lead || '')}</span>
          </div>

          ${items.length ? `
            <div class="gear-v8-example-carousel" data-example-carousel>
              <button
                type="button"
                class="gear-v8-example-nav is-prev"
                data-example-prev
                aria-label="前の作例"
                ${items.length <= 3 ? 'hidden' : ''}>←</button>
              <div class="gear-v8-example-window" data-example-window></div>
              <button
                type="button"
                class="gear-v8-example-nav is-next"
                data-example-next
                aria-label="次の作例"
                ${items.length <= 3 ? 'hidden' : ''}>→</button>
            </div>` : `
            <div class="gear-v7-example-empty">
              <span>PHOTO EXAMPLES</span>
              <strong>作例を準備中です。</strong>
              <p>使用機材が分かる写真を順次掲載します。</p>
            </div>`}
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
    const rows = [...finder.querySelectorAll('[data-lens-row]')];
    const modeButtons = [...finder.querySelectorAll('[data-lens-mode]')];
    const filterButtons = [...finder.querySelectorAll('[data-lens-filter]')];
    const filterPanel = finder.querySelector('[data-lens-filter-panel]');
    const filterGroups = [...finder.querySelectorAll('[data-lens-filter-group]')];
    const reset = finder.querySelector('[data-lens-reset]');
    const bodyStage = finder.querySelector('[data-body-stage]');
    const bodyGrid = finder.querySelector('[data-body-grid]');
    const selectedLensName = finder.querySelector('[data-selected-lens-name]');
    const selectedImage = finder.querySelector('[data-selected-lens-image]');
    const selectedMaker = finder.querySelector('[data-selected-lens-maker]');
    const selectedTitle = finder.querySelector('[data-selected-lens-title]');
    const selectedSummary = finder.querySelector('[data-selected-lens-summary]');

    const state = {
      mode: '',
      value: '',
      selectedLensId: lenses[0]?.id || ''
    };

    const visibleFor = lens => {
      if (!state.mode || !state.value) return true;
      if (state.mode === 'manufacturer') {
        return String(lens.manufacturer) === state.value;
      }
      if (state.mode === 'focal') {
        return Number(lens.maxFocal || 0) >= Number(state.value || 0);
      }
      return true;
    };

    const compatibleBodies = lens =>
      bodies
        .filter(body => String(body.mount) === String(lens.mount))
        .sort((a, b) => Number(b.resolution || 0) - Number(a.resolution || 0));

    const selectLens = (lens, scroll = false) => {
      if (!lens) return;
      state.selectedLensId = lens.id;

      rows.forEach(row => {
        const selected = row.dataset.lensId === lens.id;
        row.classList.toggle('is-selected', selected);
        row.setAttribute('aria-pressed', String(selected));
      });

      selectedLensName.textContent = lens.name || '';
      selectedMaker.textContent = `${lens.manufacturer || ''} / ${lens.mount || ''} MOUNT`;
      selectedTitle.textContent = lens.name || '';
      selectedSummary.textContent = lens.summary || '';
      selectedImage.innerHTML = image(lens.image, lens.name || '選択レンズ');

      const compatible = compatibleBodies(lens);
      bodyGrid.innerHTML = compatible.length
        ? compatible.map((body, index) => `
            <div class="gear-v7-body-choice ${index === 0 ? 'is-primary' : ''}">
              ${index === 0 ? '<span class="gear-v7-recommend-badge">RECOMMENDED</span>' : ''}
              ${renderBodyCard(body)}
            </div>`).join('')
        : '<div class="gear-v2-product-empty">対応する登録ボディがありません。</div>';

      bodyStage.hidden = false;
      if (scroll) {
        bodyStage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    };

    const applyFilter = () => {
      const visibleRows = [];
      rows.forEach(row => {
        const lens = lenses.find(item => item.id === row.dataset.lensId);
        const visible = lens ? visibleFor(lens) : false;
        row.hidden = !visible;
        if (visible && lens) visibleRows.push(lens);
      });

      const selectedStillVisible = visibleRows.some(
        lens => lens.id === state.selectedLensId
      );

      if (!selectedStillVisible && visibleRows[0]) {
        selectLens(visibleRows[0], false);
      }
    };

    const openMode = mode => {
      state.mode = mode;
      state.value = '';
      filterPanel.hidden = false;
      modeButtons.forEach(button => {
        button.setAttribute(
          'aria-pressed',
          String(button.dataset.lensMode === mode)
        );
      });
      filterGroups.forEach(group => {
        group.hidden = group.dataset.lensFilterGroup !== mode;
      });
      filterButtons.forEach(button => button.removeAttribute('aria-pressed'));
      applyFilter();
    };

    modeButtons.forEach(button => {
      button.addEventListener(
        'click',
        () => openMode(button.dataset.lensMode || '')
      );
    });

    filterButtons.forEach(button => {
      button.addEventListener('click', () => {
        state.mode = button.dataset.lensFilter || state.mode;
        state.value = button.dataset.filterValue || '';
        filterButtons.forEach(item => {
          item.setAttribute('aria-pressed', String(item === button));
        });
        applyFilter();
      });
    });

    reset?.addEventListener('click', () => {
      state.mode = '';
      state.value = '';
      modeButtons.forEach(button => button.removeAttribute('aria-pressed'));
      filterButtons.forEach(button => button.removeAttribute('aria-pressed'));
      filterGroups.forEach(group => { group.hidden = true; });
      filterPanel.hidden = true;
      applyFilter();
    });

    const selectFromRow = row => {
      const lens = lenses.find(item => item.id === row.dataset.lensId);
      if (lens) selectLens(lens, false);
    };

    rows.forEach(row => {
      row.addEventListener('click', () => selectFromRow(row));
      row.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        selectFromRow(row);
      });
    });

    applyFilter();
    if (lenses[0]) selectLens(lenses[0], false);
  };

  const initExamples = (scope, section) => {
    const carousel = scope.querySelector('[data-example-carousel]');
    if (!carousel) return;

    const items = Array.isArray(section.items) ? section.items : [];
    const windowEl = carousel.querySelector('[data-example-window]');
    const prev = carousel.querySelector('[data-example-prev]');
    const next = carousel.querySelector('[data-example-next]');
    let index = 0;

    const visibleCount = () =>
      window.matchMedia('(max-width: 760px)').matches ? 1 : 3;

    const render = () => {
      const count = Math.min(visibleCount(), items.length);
      const visible = Array.from({ length: count }, (_, offset) =>
        items[(index + offset) % items.length]
      );

      windowEl.innerHTML = visible.map(item => `
        <figure class="gear-v7-example-card">
          <div class="gear-v7-example-image">
            ${image(item.image, item.caption || item.equipment || '機材作例')}
          </div>
          <figcaption>
            <strong>${escapeHtml(item.equipment || '')}</strong>
            ${item.caption ? `<span>${escapeHtml(item.caption)}</span>` : ''}
          </figcaption>
        </figure>`).join('');

      const needsNav = items.length > count;
      prev.hidden = !needsNav;
      next.hidden = !needsNav;
    };

    prev?.addEventListener('click', () => {
      index = (index - 1 + items.length) % items.length;
      render();
    });

    next?.addEventListener('click', () => {
      index = (index + 1) % items.length;
      render();
    });

    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(render, 100);
    });

    render();
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
      ${renderIntroPoints(data.introPoints || {})}
      ${renderFocal(data.focalExperience || {})}
      ${renderFinder(data.gearFinder || {})}
      ${renderAccessories(data.accessories || {})}
      ${renderRental(data.rental || {})}
      ${renderExamples(data.examples || {})}
      ${renderNext(data.next || {})}`;

    initFocalViewer(root, data.focalExperience || {});
    initFinder(root, data.gearFinder || {});
    initExamples(root, data.examples || {});
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