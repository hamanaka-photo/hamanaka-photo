(() => {
  const FILTERS = [
    { value: 'coast', label: '海岸', icon: '≋' },
    { value: 'wetland', label: '湿原', icon: '♒' },
    { value: 'wildlife', label: '野生動物', icon: '◇' },
    { value: 'sunset', label: '夕景', icon: '◒' },
    { value: 'sunrise', label: '朝景', icon: '☀' },
    { value: 'stars', label: '星空', icon: '✦' },
    { value: 'beginner', label: '初心者向け', icon: '◆' },
    { value: 'parking', label: '駐車場あり', icon: 'P' }
  ];

  const MARKERS = {
    coast: {
      label: '海岸',
      description: '海岸や岬など、海が主役のスポット'
    },
    wetland: {
      label: '湿原',
      description: '湿原や湖沼など、自然の景観スポット'
    },
    wildlife: {
      label: '野生動物',
      description: '野鳥や野生動物が見られるスポット'
    },
    observatory: {
      label: '展望',
      description: '展望台や見晴らしの良いスポット'
    }
  };

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
    if (!raw) return '';
    if (/^(javascript|data|vbscript):/i.test(raw)) return '';
    return raw;
  };

  const normalizeArray = value =>
    Array.isArray(value) ? value.map(String) : [];

  const sortByOrder = items =>
    [...items].sort(
      (a, b) =>
        Number(a.order || 0) - Number(b.order || 0)
    );

  const placeholderVisual = title => `
    <div class="photo-map-image-placeholder" aria-hidden="true">
      <span>HAMANAKA</span>
      <strong>${escapeHtml(title || 'PHOTO SPOT')}</strong>
    </div>
  `;

  const renderSpotImage = spot =>
    spot.image
      ? `<img
          src="${escapeHtml(spot.image)}"
          alt="${escapeHtml(spot.name || '')}"
          loading="lazy"
          decoding="async"
          fetchpriority="low">`
      : placeholderVisual(spot.name);

  const markerClass = spot => {
    const type =
      Object.prototype.hasOwnProperty.call(MARKERS, spot.markerType)
        ? spot.markerType
        : 'coast';

    return `photo-map-marker-${type}`;
  };

  const renderPin = spot => {
    const x = Math.min(100, Math.max(0, Number(spot.x || 50)));
    const y = Math.min(100, Math.max(0, Number(spot.y || 50)));

    return `
      <button
        class="photo-map-pin ${markerClass(spot)}"
        type="button"
        style="--map-x:${x}%;--map-y:${y}%"
        data-map-pin="${escapeHtml(spot.id)}"
        data-map-tags="${escapeHtml(normalizeArray(spot.tags).join(','))}"
        data-map-area="${escapeHtml(spot.area || '')}"
        aria-label="${escapeHtml(spot.name)}を選択">
        <span class="photo-map-pin-dot" aria-hidden="true"></span>
        <span class="photo-map-pin-label">
          ${escapeHtml(spot.name)}
        </span>
      </button>`;
  };

  const renderMeta = (label, value) => {
    if (!value) return '';

    return `
      <span class="photo-spot-meta-item">
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value)}</strong>
      </span>`;
  };

  const renderSpotCard = spot => {
    const detailUrl = safeUrl(spot.detailUrl);

    return `
      <article
        class="photo-spot-card"
        data-spot-card="${escapeHtml(spot.id)}"
        data-map-tags="${escapeHtml(normalizeArray(spot.tags).join(','))}"
        data-map-area="${escapeHtml(spot.area || '')}">
        <div class="photo-spot-card-visual">
          ${renderSpotImage(spot)}
        </div>

        <div class="photo-spot-card-copy">
          <div class="photo-spot-card-titleline">
            <h3>${escapeHtml(spot.name)}</h3>
            <span class="photo-spot-type ${markerClass(spot)}">
              ${escapeHtml(
                MARKERS[spot.markerType]?.label || 'スポット'
              )}
            </span>
          </div>

          ${
            spot.description
              ? `<p>${escapeHtml(spot.description)}</p>`
              : ''
          }

          <div class="photo-spot-meta">
            ${renderMeta('おすすめ時期', spot.bestSeason)}
            ${renderMeta('おすすめ時間', spot.bestTime)}
            ${renderMeta('アクセス', spot.access)}
          </div>

          ${
            detailUrl
              ? `<a
                  class="photo-spot-detail"
                  href="${escapeHtml(detailUrl)}">
                  詳細を見る →
                </a>`
              : ''
          }
        </div>
      </article>`;
  };

  const renderListCard = spot => {
    const detailUrl = safeUrl(spot.detailUrl);

    return `
      <article
        class="photo-spot-list-card"
        data-list-spot="${escapeHtml(spot.id)}"
        data-map-tags="${escapeHtml(normalizeArray(spot.tags).join(','))}"
        data-map-area="${escapeHtml(spot.area || '')}">
        <div class="photo-spot-list-visual">
          ${renderSpotImage(spot)}
        </div>
        <div class="photo-spot-list-copy">
          <p class="photo-spot-list-area">
            ${escapeHtml(spot.area || '浜中町')}
          </p>
          <h3>${escapeHtml(spot.name)}</h3>
          ${
            spot.description
              ? `<p>${escapeHtml(spot.description)}</p>`
              : ''
          }
          <div class="photo-spot-meta">
            ${renderMeta('時期', spot.bestSeason)}
            ${renderMeta('時間', spot.bestTime)}
            ${renderMeta('アクセス', spot.access)}
          </div>
          ${
            detailUrl
              ? `<a href="${escapeHtml(detailUrl)}">詳細を見る →</a>`
              : ''
          }
        </div>
      </article>`;
  };

  const renderCourse = course => `
    <article class="photo-map-course">
      <div class="photo-map-course-image">
        ${
          course.image
            ? `<img
                src="${escapeHtml(course.image)}"
                alt=""
                loading="lazy"
                decoding="async"
                fetchpriority="low">`
            : placeholderVisual(course.title)
        }
      </div>
      <div class="photo-map-course-copy">
        <p class="photo-map-course-eyebrow">
          ${escapeHtml(course.eyebrow || 'MODEL COURSE')}
        </p>
        <h3>${escapeHtml(course.title || '')}</h3>
        ${
          course.text
            ? `<p>${escapeHtml(course.text).replace(/\r?\n/g, '<br>')}</p>`
            : ''
        }
        ${
          course.duration
            ? `<span>所要時間：${escapeHtml(course.duration)}</span>`
            : ''
        }
      </div>
    </article>`;

  const renderFieldNav = activeId => {
    const links = [
      ['photo-map', 'SPOT', '撮影スポット'],
      ['trip', '準備', '旅行準備'],
      ['gear', '機材', 'カメラ・レンズ'],
      ['technique', 'テクニック', '撮影テクニック'],
      ['manner', 'ルール', '撮影マナー']
    ];

    return `
      <nav class="field-guide-nav" aria-label="PHOTO GUIDE">
        <div class="container field-guide-nav-inner">
          <a class="field-guide-brand" href="guide.html">
            HAMANAKA
            <small>PHOTO FIELD GUIDE</small>
          </a>
          <div class="field-guide-links">
            ${links.map(([id, label, sub]) => `
              <a
                href="guide-article.html?article=${id}"
                ${id === activeId ? 'aria-current="page"' : ''}
                title="${escapeHtml(sub)}">
                ${escapeHtml(label)}
              </a>
            `).join('')}
          </div>
          <a
            class="field-guide-spot-button"
            href="#photo-map-explorer">
            フォトスポットを探す
            <span aria-hidden="true">●</span>
          </a>
        </div>
      </nav>`;
  };

  const renderExplorer = (settings, spots) => {
    const mapImage =
      String(settings.map?.image || '').trim();

    const mapAlt =
      settings.map?.alt || '浜中町フォトマップ';

    return `
      <section
        class="photo-map-explorer"
        id="photo-map-explorer">

        <div class="container">

          <div class="photo-map-view-tabs" role="tablist">
            <button
              class="is-active"
              type="button"
              role="tab"
              aria-selected="true"
              data-map-view="map">
              MAP
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="false"
              data-map-view="list">
              一覧
            </button>
          </div>

          <div
            class="photo-map-search-mode"
            aria-label="スポットの探し方">

            <button
              class="is-active"
              type="button"
              data-search-mode="subject">
              被写体・条件で探す
            </button>

            <button
              type="button"
              data-search-mode="area">
              エリアで探す
            </button>

          </div>

          <div class="photo-map-filters" data-map-filters></div>

          <div class="photo-map-map-view" data-map-panel="map">

            <div class="photo-map-canvas">
              ${
                mapImage
                  ? `<img
                      class="photo-map-base-image"
                      src="${escapeHtml(mapImage)}"
                      alt="${escapeHtml(mapAlt)}"
                      loading="eager"
                      decoding="async">`
                  : `<div class="photo-map-base-placeholder" aria-hidden="true">
                      <span class="photo-map-placeholder-north">N</span>
                      <strong>HAMANAKA</strong>
                      <small>CMSから地図画像を登録してください</small>
                    </div>`
              }

              <div class="photo-map-pins">
                ${spots.map(renderPin).join('')}
              </div>
            </div>

            <div class="photo-map-side-list" data-map-side-list>
              ${spots.map(renderSpotCard).join('')}
              <p class="photo-map-empty" data-map-empty hidden>
                条件に合うスポットがありません。
              </p>
            </div>

          </div>

          <div
            class="photo-map-list-view"
            data-map-panel="list"
            hidden>
            <div class="photo-map-list-grid">
              ${spots.map(renderListCard).join('')}
            </div>
            <p class="photo-map-empty" data-list-empty hidden>
              条件に合うスポットがありません。
            </p>
          </div>

          <div class="photo-map-legend">
            <h2>MAPの見方</h2>
            <div class="photo-map-legend-grid">
              ${Object.entries(MARKERS).map(([key, marker]) => `
                <div>
                  <span
                    class="photo-map-legend-pin photo-map-marker-${key}"
                    aria-hidden="true"></span>
                  <strong>${escapeHtml(marker.label)}</strong>
                  <small>${escapeHtml(marker.description)}</small>
                </div>
              `).join('')}
              <div>
                <span class="photo-map-weather-icon" aria-hidden="true">☀</span>
                <strong>撮影前に確認</strong>
                <small>天候・道路状況・現地ルールを確認しましょう</small>
              </div>
            </div>
          </div>

        </div>
      </section>`;
  };

  const renderPage = (root, settings, spots) => {
    const hero = settings.hero || {};
    const courses = Array.isArray(settings.courses)
      ? settings.courses
      : [];

    const heroImage = String(hero.image || '').trim();

    document.title =
      `${hero.title || 'フォトマップ'}｜HAMANAKA PHOTO GUIDE`;

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        hero.lead ||
        '浜中町の撮影スポットを地図から探します。'
      );

    document.body.classList.add('photo-map-page');

    root.innerHTML = `
      ${renderFieldNav('photo-map')}

      <section
        class="photo-map-hero"
        ${
          heroImage
            ? `style="--photo-map-hero:url('${escapeHtml(heroImage)}')"`
            : ''
        }>
        <div class="photo-map-hero-overlay"></div>
        <div class="container photo-map-hero-inner">
          <p class="photo-map-hero-eyebrow">
            ${escapeHtml(hero.eyebrow || 'PHOTO MAP')}
          </p>
          <h1>${escapeHtml(hero.title || 'MAPから探す')}</h1>
          <p class="photo-map-hero-lead">
            ${escapeHtml(
              hero.lead ||
              '浜中町の撮影スポットを、エリアや撮りたい被写体から探せます。'
            )}
          </p>
          <div class="photo-map-hero-actions">
            <a
              class="photo-map-hero-button photo-map-hero-button-primary"
              href="#photo-map-explorer"
              data-hero-mode="area">
              エリアで探す
            </a>
            <a
              class="photo-map-hero-button"
              href="#photo-map-explorer"
              data-hero-mode="subject">
              撮りたい被写体で探す
            </a>
          </div>
        </div>
      </section>

      ${renderExplorer(settings, spots)}

      ${
        courses.length
          ? `<section class="photo-map-courses">
              <div class="container">
                <div class="photo-map-section-heading">
                  <p>MODEL COURSE</p>
                  <h2>${escapeHtml(
                    settings.coursesTitle || 'おすすめの回り方'
                  )}</h2>
                </div>
                <div class="photo-map-course-grid">
                  ${courses.map(renderCourse).join('')}
                </div>
              </div>
            </section>`
          : ''
      }

      <section class="photo-map-manner-cta">
        <div class="container">
          <div class="photo-map-manner-inner">
            <div>
              <p>${escapeHtml(
                settings.manner?.eyebrow || 'PHOTO MANNER'
              )}</p>
              <h2>${escapeHtml(
                settings.manner?.title ||
                '撮影マナーを守って楽しみましょう'
              )}</h2>
              <span>${escapeHtml(
                settings.manner?.text ||
                '自然や地域の方々への思いやりが、素晴らしい景色を未来へつなぎます。'
              )}</span>
            </div>
            <a
              href="${escapeHtml(
                safeUrl(settings.manner?.url) ||
                'guide-article.html?article=manner'
              )}">
              ${escapeHtml(
                settings.manner?.buttonLabel ||
                'ルールを見る'
              )}
              →
            </a>
          </div>
        </div>
      </section>`;
  };

  const initInteractions = (root, spots) => {
    let view = 'map';
    let mode = 'subject';
    let activeFilter = 'all';

    const filterWrap =
      root.querySelector('[data-map-filters]');

    const renderFilters = () => {
      const filters =
        mode === 'subject'
          ? FILTERS
          : [...new Set(
              spots
                .map(spot => String(spot.area || '').trim())
                .filter(Boolean)
            )].map(area => ({
              value: area,
              label: area,
              icon: '●'
            }));

      filterWrap.innerHTML = `
        <button
          class="is-active"
          type="button"
          data-map-filter="all">
          すべて
        </button>
        ${filters.map(filter => `
          <button
            type="button"
            data-map-filter="${escapeHtml(filter.value)}">
            <span aria-hidden="true">${escapeHtml(filter.icon)}</span>
            ${escapeHtml(filter.label)}
          </button>
        `).join('')}`;

      activeFilter = 'all';
    };

    const matches = element => {
      if (activeFilter === 'all') return true;

      if (mode === 'area') {
        return (
          String(element.dataset.mapArea || '') === activeFilter
        );
      }

      return String(element.dataset.mapTags || '')
        .split(',')
        .filter(Boolean)
        .includes(activeFilter);
    };

    const applyFilter = () => {
      const pins =
        [...root.querySelectorAll('[data-map-pin]')];

      const sideCards =
        [...root.querySelectorAll('[data-spot-card]')];

      const listCards =
        [...root.querySelectorAll('[data-list-spot]')];

      pins.forEach(pin => {
        pin.hidden = !matches(pin);
      });

      sideCards.forEach(card => {
        card.hidden = !matches(card);
      });

      listCards.forEach(card => {
        card.hidden = !matches(card);
      });

      const visibleSide =
        sideCards.some(card => !card.hidden);

      const visibleList =
        listCards.some(card => !card.hidden);

      const mapEmpty =
        root.querySelector('[data-map-empty]');

      const listEmpty =
        root.querySelector('[data-list-empty]');

      if (mapEmpty) mapEmpty.hidden = visibleSide;
      if (listEmpty) listEmpty.hidden = visibleList;
    };

    const setMode = nextMode => {
      mode =
        nextMode === 'area'
          ? 'area'
          : 'subject';

      root
        .querySelectorAll('[data-search-mode]')
        .forEach(button => {
          button.classList.toggle(
            'is-active',
            button.dataset.searchMode === mode
          );
        });

      renderFilters();
      applyFilter();
    };

    const setView = nextView => {
      view =
        nextView === 'list'
          ? 'list'
          : 'map';

      root
        .querySelectorAll('[data-map-view]')
        .forEach(button => {
          const active =
            button.dataset.mapView === view;

          button.classList.toggle(
            'is-active',
            active
          );

          button.setAttribute(
            'aria-selected',
            String(active)
          );
        });

      root
        .querySelectorAll('[data-map-panel]')
        .forEach(panel => {
          panel.hidden =
            panel.dataset.mapPanel !== view;
        });
    };

    const selectSpot = spotId => {
      root
        .querySelectorAll('[data-map-pin]')
        .forEach(pin => {
          pin.classList.toggle(
            'is-selected',
            pin.dataset.mapPin === spotId
          );
        });

      root
        .querySelectorAll('[data-spot-card]')
        .forEach(card => {
          const selected =
            card.dataset.spotCard === spotId;

          card.classList.toggle(
            'is-selected',
            selected
          );

          if (selected) {
            card.scrollIntoView({
              block: 'nearest',
              behavior: 'smooth'
            });
          }
        });
    };

    renderFilters();
    applyFilter();

    root.addEventListener('click', event => {
      const viewButton =
        event.target.closest('[data-map-view]');

      if (viewButton) {
        setView(viewButton.dataset.mapView);
        return;
      }

      const modeButton =
        event.target.closest('[data-search-mode]');

      if (modeButton) {
        setMode(modeButton.dataset.searchMode);
        return;
      }

      const filterButton =
        event.target.closest('[data-map-filter]');

      if (filterButton) {
        activeFilter =
          filterButton.dataset.mapFilter || 'all';

        filterWrap
          .querySelectorAll('[data-map-filter]')
          .forEach(button => {
            button.classList.toggle(
              'is-active',
              button === filterButton
            );
          });

        applyFilter();
        return;
      }

      const pin =
        event.target.closest('[data-map-pin]');

      if (pin) {
        selectSpot(pin.dataset.mapPin);
        return;
      }

      const card =
        event.target.closest('[data-spot-card]');

      if (card) {
        selectSpot(card.dataset.spotCard);
      }
    });

    root
      .querySelectorAll('[data-hero-mode]')
      .forEach(link => {
        link.addEventListener('click', () => {
          setMode(link.dataset.heroMode);
        });
      });
  };

  const init = async root => {
    try {
      const [settingsResponse, spotsResponse] =
        await Promise.all([
          fetch('data/photo-map.json', { cache: 'no-cache' }),
          fetch('data/photo-spots.json', { cache: 'no-cache' })
        ]);

      if (!settingsResponse.ok || !spotsResponse.ok) {
        throw new Error('PHOTO MAPデータを読み込めませんでした。');
      }

      const settings =
        await settingsResponse.json();

      const spotData =
        await spotsResponse.json();

      const spots =
        sortByOrder(
          Array.isArray(spotData)
            ? spotData.filter(
                spot => spot.published !== false
              )
            : []
        );

      renderPage(root, settings, spots);
      initInteractions(root, spots);

    } catch (error) {
      console.error(error);

      root.innerHTML = `
        <section class="section">
          <div class="container">
            <h1>フォトマップ</h1>
            <p class="section-lead">
              フォトマップを読み込めませんでした。
            </p>
            <p>
              <a class="btn btn-outline" href="guide.html">
                PHOTO GUIDEへ戻る
              </a>
            </p>
          </div>
        </section>`;
    }
  };

  window.HAMANAKA_PHOTO_MAP = { init };
})();