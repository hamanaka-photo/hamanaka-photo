(() => {
  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));

  const safeUrl = (value = '') => {
    const raw = String(value || '').trim();
    if (!raw || /^(javascript|data|vbscript):/i.test(raw)) return '';
    return raw;
  };

  const nl2br = value => escapeHtml(value || '').replace(/\r?\n/g, '<br>');

  const placeholder = title => `
    <div class="trip-image-placeholder" aria-hidden="true">
      <span>HAMANAKA</span><strong>${escapeHtml(title || 'PHOTO TRIP')}</strong>
    </div>`;

  const image = (src, alt, priority = false) => src
    ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt || '')}" ${priority ? '' : 'loading="lazy"'} decoding="async" ${priority ? 'fetchpriority="high"' : 'fetchpriority="low"'}>`
    : placeholder(alt);

  const link = (url, label, cls = '') => {
    const href = safeUrl(url);
    if (!href || !label) return '';
    const external = /^https?:\/\//i.test(href);
    return `<a class="${cls}" href="${escapeHtml(href)}" ${external ? 'target="_blank" rel="noopener noreferrer"' : ''}>${escapeHtml(label)} <span aria-hidden="true">→</span></a>`;
  };

  const renderFieldNav = () => `
    <nav class="field-guide-nav trip-field-guide-nav" aria-label="PHOTO GUIDE">
      <div class="container field-guide-nav-inner">
        <a class="field-guide-brand" href="guide.html">HAMANAKA<small>PHOTO FIELD GUIDE</small></a>
        <div class="field-guide-links">
          <a href="guide-article.html?article=photo-map">SPOT</a>
          <a href="guide-article.html?article=trip" aria-current="page">準備</a>
          <a href="guide-article.html?article=gear">機材</a>
          <a href="guide-article.html?article=technique">テクニック</a>
          <a href="guide-article.html?article=manner">ルール</a>
        </div>
        <a class="field-guide-spot-button" href="guide-article.html?article=photo-map">フォトスポットを探す <span aria-hidden="true">●</span></a>
      </div>
    </nav>`;

  const renderSteps = data => {
    const steps = Array.isArray(data.steps) ? data.steps : [];
    return `
      <section class="trip-steps">
        <div class="container">
          <div class="trip-section-heading trip-section-heading-center">
            <h2>${escapeHtml(data.stepsTitle || '撮影旅行までの 5 STEP')}</h2>
          </div>
          <div class="trip-step-grid">
            ${steps.map(step => `
              <a class="trip-step-card" href="#${escapeHtml(step.anchor || '')}">
                <div class="trip-step-image">${image(step.image, step.title)}</div>
                <div class="trip-step-overlay"></div>
                <div class="trip-step-copy">
                  <span>STEP <b>${escapeHtml(step.number || '')}</b></span>
                  <strong>${escapeHtml(step.title || '')}</strong>
                </div>
              </a>`).join('')}
          </div>
        </div>
      </section>`;
  };

  const renderFlight = flight => {
    const href = safeUrl(flight.url);
    if (!href) return '';
    return `
      <a class="trip-method-card trip-method-card-link" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
        <div class="trip-method-icon" aria-hidden="true">AIR</div>
        <div class="trip-method-content">
          <span class="trip-method-kicker">GOOGLE SEARCH</span>
          <h3>${escapeHtml(flight.title || '飛行機で行く')}</h3>
          <p>${escapeHtml(flight.text || '')}</p>
          <strong class="trip-method-action">${escapeHtml(flight.buttonLabel || '飛行機で行く')} <span aria-hidden="true">↗</span></strong>
        </div>
      </a>`;
  };

  const renderRental = rental => {
    const companies = Array.isArray(rental.companies) ? rental.companies : [];
    return `
      <details class="trip-method-card trip-rental-card">
        <summary>
          <div class="trip-method-icon" aria-hidden="true">CAR</div>
          <div class="trip-method-content">
            <span class="trip-method-kicker">RENT A CAR</span>
            <h3>${escapeHtml(rental.title || 'レンタカーで行く')}</h3>
            <p>${escapeHtml(rental.text || '')}</p>
            <strong class="trip-method-action">営業所を見る <span class="trip-details-plus" aria-hidden="true">＋</span></strong>
          </div>
        </summary>
        <div class="trip-rental-expanded">
          <h4>${escapeHtml(rental.companiesTitle || '釧路空港周辺のレンタカー営業所')}</h4>
          <div class="trip-rental-links">
            ${companies.map(company => {
              const url = safeUrl(company.url);
              return url ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer"><span>${escapeHtml(company.name || '')}</span><b aria-hidden="true">↗</b></a>` : '';
            }).join('')}
          </div>
        </div>
      </details>`;
  };

  const renderNoCar = noCar => `
    <article class="trip-no-car-compact">
      <p>${escapeHtml(noCar.eyebrow || 'NO CAR?')}</p>
      <h3>${escapeHtml(noCar.title || '車を運転しない方へ')}</h3>
      <span>${escapeHtml(noCar.text || '')}</span>
      ${link(noCar.url, noCar.buttonLabel, 'trip-compact-button')}
    </article>`;

  const renderAccess = (access, noCar) => {
    const route = Array.isArray(access.route) ? access.route : [];
    const notes = Array.isArray(access.routeNotes) ? access.routeNotes : [];
    const tips = Array.isArray(access.driveTips) ? access.driveTips : [];
    return `
      <section class="trip-section trip-access" id="access">
        <div class="container">
          <div class="trip-section-heading trip-access-heading">
            <p>${escapeHtml(access.eyebrow || 'ACCESS')}</p>
            <div class="trip-heading-row">
              <h2>${escapeHtml(access.title || '')}</h2>
              ${access.lead ? `<span>${escapeHtml(access.lead)}</span>` : ''}
            </div>
          </div>
          <div class="trip-access-layout">
            <div class="trip-access-main">
              <div class="trip-route">
                ${route.map((stop, i) => `
                  <div class="trip-route-stop">
                    <div class="trip-route-image">${image(stop.image, stop.title)}</div>
                    <strong>${escapeHtml(stop.title || '')}</strong>
                    ${stop.sub ? `<small>${escapeHtml(stop.sub)}</small>` : ''}
                  </div>
                  ${i < route.length - 1 ? `<div class="trip-route-arrow"><b aria-hidden="true">→</b><span>${escapeHtml(notes[i] || '')}</span></div>` : ''}
                `).join('')}
              </div>
              <div class="trip-method-grid">
                ${renderFlight(access.flight || {})}
                ${renderRental(access.rental || {})}
              </div>
            </div>
            <div class="trip-access-side">
              <aside class="trip-drive-tips">
                <h3>${escapeHtml(access.driveTipsTitle || '車で撮影する人へ')}</h3>
                <div class="trip-tip-grid">
                  ${tips.map(tip => `<div class="trip-tip"><b>${escapeHtml(tip.title || '')}</b><span>${escapeHtml(tip.text || '')}</span></div>`).join('')}
                </div>
                ${link(access.tipsUrl, access.tipsButtonLabel, 'trip-text-link')}
              </aside>
              ${renderNoCar(noCar || {})}
            </div>
          </div>
        </div>
      </section>`;
  };

  const renderStayWeatherClothing = data => {
    const stay = data.stay || {};
    const weather = data.weather || {};
    const clothing = data.clothing || {};
    const weatherItems = Array.isArray(weather.items) ? weather.items : [];
    const seasons = Array.isArray(clothing.seasons) ? clothing.seasons : [];
    return `
      <section class="trip-feature-section">
        <div class="container">
          <div class="trip-feature-row">
            <article class="trip-feature trip-stay" id="stay">
              <div class="trip-feature-bg">${image(stay.image, stay.title)}</div>
              <div class="trip-feature-shade"></div>
              <div class="trip-feature-copy trip-feature-copy-light">
                <p>${escapeHtml(stay.eyebrow || 'STAY')}</p>
                <h2>${escapeHtml(stay.title || '')}</h2>
                <span>${escapeHtml(stay.text || '')}</span>
                ${link(stay.url, stay.buttonLabel, 'trip-solid-link')}
              </div>
            </article>
            <article class="trip-feature trip-weather" id="weather">
              <div class="trip-feature-copy">
                <p>${escapeHtml(weather.eyebrow || 'WEATHER')}</p>
                <h2>${escapeHtml(weather.title || '')}</h2>
              </div>
              <div class="trip-weather-grid">
                ${weatherItems.map(item => `
                  <div class="trip-weather-item">
                    <div>${image(item.image, item.title)}</div>
                    <h3>${escapeHtml(item.title || '')}</h3>
                    <p>${escapeHtml(item.text || '')}</p>
                  </div>`).join('')}
              </div>
              ${link(weather.url, weather.buttonLabel, 'trip-outline-link')}
            </article>
            <article class="trip-feature trip-clothing" id="clothing">
              <div class="trip-feature-copy">
                <p>${escapeHtml(clothing.eyebrow || 'WHAT TO WEAR')}</p>
                <h2>${escapeHtml(clothing.title || '')}</h2>
              </div>
              <div class="trip-season-tabs" data-trip-season-tabs>
                ${seasons.map((season, i) => `<button type="button" class="${i === 0 ? 'is-active' : ''}" data-season-tab="${i}">${escapeHtml(season.label || '')}</button>`).join('')}
              </div>
              <div class="trip-season-panels">
                ${seasons.map((season, i) => `
                  <div class="trip-season-panel" data-season-panel="${i}" ${i === 0 ? '' : 'hidden'}>
                    <div class="trip-season-list">
                      ${season.note ? `<p>${escapeHtml(season.note)}</p>` : ''}
                      <ul>${(Array.isArray(season.items) ? season.items : []).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
                    </div>
                    <div class="trip-season-image">${image(season.image, `${season.label}の服装`)}</div>
                  </div>`).join('')}
              </div>
              ${link(clothing.url, clothing.buttonLabel, 'trip-outline-link')}
            </article>
          </div>
        </div>
      </section>`;
  };

  const renderChecklist = checklist => {
    const categories = Array.isArray(checklist.categories) ? checklist.categories : [];
    return `
      <section class="trip-section trip-checklist" id="checklist">
        <div class="container">
          <div class="trip-section-heading trip-heading-inline">
            <div>
              <p>${escapeHtml(checklist.eyebrow || 'CHECK LIST')}</p>
              <h2>${escapeHtml(checklist.title || '')}</h2>
            </div>
            <button class="trip-check-reset" type="button" data-trip-check-reset>チェックをリセット</button>
          </div>
          <div class="trip-check-grid">
            ${categories.map((category, categoryIndex) => `
              <article class="trip-check-card">
                <h3>${escapeHtml(category.title || '')}</h3>
                <div class="trip-check-items">
                  ${(Array.isArray(category.items) ? category.items : []).map((item, itemIndex) => {
                    const key = `c${categoryIndex}-i${itemIndex}`;
                    return `<label class="trip-check-item"><input type="checkbox" data-trip-check="${key}"><span class="trip-check-box" aria-hidden="true"></span><span>${escapeHtml(item)}</span></label>`;
                  }).join('')}
                </div>
              </article>`).join('')}
          </div>
        </div>
      </section>`;
  };

  const renderReady = ready => `
    <section class="trip-ready" ${ready.image ? `style="--trip-ready-image:url('${escapeHtml(ready.image)}')"` : ''}>
      <div class="trip-ready-shade"></div>
      <div class="container trip-ready-inner">
        <div>
          <p>${escapeHtml(ready.eyebrow || 'READY FOR HAMANAKA?')}</p>
          <h2>${escapeHtml(ready.title || '')}</h2>
        </div>
        ${link(ready.url, ready.buttonLabel, 'trip-ready-link')}
        <div class="trip-next-links">
          <a href="guide-article.html?article=photo-map"><b>SPOT</b><span>撮影場所</span></a>
          <a href="guide-article.html?article=gear"><b>GEAR</b><span>機材</span></a>
          <a href="guide-article.html?article=technique"><b>TECHNIQUE</b><span>撮り方</span></a>
          <a href="guide-article.html?article=manner"><b>RULES</b><span>撮影の心得</span></a>
        </div>
      </div>
    </section>`;

  const renderPage = (root, data) => {
    const hero = data.hero || {};
    document.body.classList.add('trip-page');
    document.title = `${String(hero.title || '準備').replace(/\n/g, '')}｜HAMANAKA PHOTO GUIDE`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', String(hero.lead || '').replace(/\n/g, ' '));

    root.innerHTML = `
      ${renderFieldNav()}
      <section class="trip-hero" ${hero.image ? `style="--trip-hero-image:url('${escapeHtml(hero.image)}')"` : ''}>
        <div class="trip-hero-shade"></div>
        <div class="container trip-hero-inner">
          <p class="trip-hero-eyebrow">${escapeHtml(hero.eyebrow || 'PREPARATION')}</p>
          <h1>${nl2br(hero.title || '浜中町へ、撮りに行こう。')}</h1>
          <p class="trip-hero-lead">${nl2br(hero.lead || '')}</p>
          <div class="trip-hero-actions">
            ${link(hero.primaryUrl, hero.primaryLabel, 'trip-hero-button trip-hero-button-primary')}
            ${link(hero.secondaryUrl, hero.secondaryLabel, 'trip-hero-button')}
          </div>
        </div>
      </section>
      ${renderSteps(data)}
      ${renderAccess(data.access || {}, data.noCar || {})}
      ${renderStayWeatherClothing(data)}
      ${renderChecklist(data.checklist || {})}
      ${renderReady(data.ready || {})}`;
  };

  const CHECK_STORAGE_PREFIX = 'hamanaka-trip-check:';

  const initInteractions = root => {
    root.addEventListener('click', event => {
      const seasonButton = event.target.closest('[data-season-tab]');
      if (seasonButton) {
        const index = seasonButton.dataset.seasonTab;
        root.querySelectorAll('[data-season-tab]').forEach(el => el.classList.toggle('is-active', el === seasonButton));
        root.querySelectorAll('[data-season-panel]').forEach(panel => { panel.hidden = panel.dataset.seasonPanel !== index; });
        return;
      }

      const resetButton = event.target.closest('[data-trip-check-reset]');
      if (resetButton) {
        root.querySelectorAll('[data-trip-check]').forEach(input => {
          input.checked = false;
          try { localStorage.removeItem(CHECK_STORAGE_PREFIX + input.dataset.tripCheck); } catch (error) { /* storage may be unavailable */ }
        });
      }
    });

    root.querySelectorAll('[data-trip-check]').forEach(input => {
      const storageKey = CHECK_STORAGE_PREFIX + input.dataset.tripCheck;
      try { input.checked = localStorage.getItem(storageKey) === '1'; } catch (error) { /* storage may be unavailable */ }
      input.addEventListener('change', () => {
        try {
          if (input.checked) localStorage.setItem(storageKey, '1');
          else localStorage.removeItem(storageKey);
        } catch (error) { /* storage may be unavailable */ }
      });
    });
  };

  const init = async root => {
    try {
      const response = await fetch('data/trip.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('準備編データを読み込めませんでした。');
      const data = await response.json();
      renderPage(root, data);
      initInteractions(root);
    } catch (error) {
      console.error(error);
      root.innerHTML = `<section class="section"><div class="container"><h1>準備編</h1><p class="section-lead">ページを読み込めませんでした。</p><p><a class="btn btn-outline" href="guide.html">PHOTO GUIDEへ戻る</a></p></div></section>`;
    }
  };

  window.HAMANAKA_TRIP = { init };
})();
