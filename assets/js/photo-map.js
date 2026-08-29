(() => {
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

  const FEATURE_FILTERS = [
    {
      id: 'beginner',
      label: '初心者向け',
      icon: '◆'
    },
    {
      id: 'parking',
      label: '駐車場あり',
      icon: 'P'
    }
  ];

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

    if (!raw) {
      return '';
    }

    if (/^(javascript|data|vbscript):/i.test(raw)) {
      return '';
    }

    return raw;
  };

  const sortByOrder = items =>
    [...items].sort(
      (a, b) =>
        Number(a.order || 0) -
        Number(b.order || 0)
    );

  const subjectIds = spot => {
    if (Array.isArray(spot.subjects)) {
      return spot.subjects
        .map(item => {
          if (typeof item === 'string') {
            return item;
          }

          return item && item.id
            ? String(item.id)
            : '';
        })
        .filter(Boolean);
    }

    if (Array.isArray(spot.tags)) {
      return spot.tags.map(String);
    }

    return [];
  };

  const featureIds = spot =>
    Array.isArray(spot.features)
      ? spot.features.map(String)
      : [];

  const gridCoordinateToPercent = value => {
    const number = Number(value);

    if (!Number.isFinite(number)) {
      return 49.5;
    }

    const cell = Math.min(
      100,
      Math.max(1, number)
    );

    return cell - 0.5;
  };

  const getSpotPosition = spot => {
    const raw =
      String(spot.position || '')
        .trim()
        .replace(/[，\s]/g, match =>
          match === '，' ? ',' : ''
        );

    const matched =
      raw.match(
        /^(100|[1-9][0-9]?),(100|[1-9][0-9]?)$/
      );

    if (matched) {
      return {
        x: Number(matched[1]),
        y: Number(matched[2])
      };
    }

    const legacyX =
      Number(spot.x);

    const legacyY =
      Number(spot.y);

    return {
      x:
        Number.isFinite(legacyX)
          ? legacyX
          : 50,
      y:
        Number.isFinite(legacyY)
          ? legacyY
          : 50
    };
  };

  const subjectDefinitionMap = settings => {
    const map = new Map();

    const definitions =
      Array.isArray(settings.subjects)
        ? settings.subjects
        : [];

    definitions.forEach(subject => {
      if (!subject || !subject.id) {
        return;
      }

      map.set(
        String(subject.id),
        subject
      );
    });

    return map;
  };

  const placeholderVisual = title => `
    <div
      class="photo-map-image-placeholder"
      aria-hidden="true">
      <span>HAMANAKA</span>
      <strong>
        ${escapeHtml(title || 'PHOTO SPOT')}
      </strong>
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
      Object.prototype.hasOwnProperty.call(
        MARKERS,
        spot.markerType
      )
        ? spot.markerType
        : 'coast';

    return `photo-map-marker-${type}`;
  };

  const renderPin = spot => {
    const position =
      getSpotPosition(spot);

    const x =
      gridCoordinateToPercent(
        position.x
      );

    const y =
      gridCoordinateToPercent(
        position.y
      );

    return `
      <button
        class="photo-map-pin ${markerClass(spot)}"
        type="button"
        style="--map-x:${x}%;--map-y:${y}%"
        data-map-x="${escapeHtml(position.x)}"
        data-map-y="${escapeHtml(position.y)}"
        data-map-pin="${escapeHtml(spot.id)}"
        data-map-area="${escapeHtml(spot.area || '')}"
        data-map-subjects="${escapeHtml(subjectIds(spot).join(','))}"
        data-map-features="${escapeHtml(featureIds(spot).join(','))}"
        aria-label="${escapeHtml(spot.name)}を選択">

        <svg
          class="photo-map-pin-icon"
          viewBox="0 0 32 40"
          aria-hidden="true"
          focusable="false">
          <path
            class="photo-map-pin-shape"
            d="M16 1.5C8.54 1.5 2.5 7.54 2.5 15c0 10.24 10.55 20.97 13.5 23.5 2.95-2.53 13.5-13.26 13.5-23.5C29.5 7.54 23.46 1.5 16 1.5Z" />
          <circle
            class="photo-map-pin-hole"
            cx="16"
            cy="15"
            r="5" />
        </svg>

        <span
          class="photo-map-pin-caption"
          role="tooltip">
          ${escapeHtml(spot.name)}
        </span>

      </button>`;
  };

  const renderMeta = (label, value) => {
    if (!value) {
      return '';
    }

    return `
      <span class="photo-spot-meta-item">
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value)}</strong>
      </span>`;
  };

  const renderSubjectBadges = (
    spot,
    subjectMap
  ) => {
    const items =
      Array.isArray(spot.subjects)
        ? spot.subjects
        : [];

    if (!items.length) {
      return '';
    }

    const html =
      items
        .map(item => {
          const id =
            typeof item === 'string'
              ? item
              : item.id;

          if (!id) {
            return '';
          }

          const definition =
            subjectMap.get(String(id));

          const label =
            definition?.label ||
            String(id);

          const note =
            typeof item === 'object'
              ? String(item.note || '')
              : '';

          return `
            <span
              class="photo-spot-subject"
              title="${escapeHtml(note)}">
              ${
                definition?.icon
                  ? `<i aria-hidden="true">${escapeHtml(definition.icon)}</i>`
                  : ''
              }
              ${escapeHtml(label)}
            </span>`;
        })
        .join('');

    return html
      ? `<div class="photo-spot-subjects">${html}</div>`
      : '';
  };

  const renderSelectedSpot = (
    spot,
    subjectMap
  ) => {
    if (!spot) {
      return `
        <div class="photo-map-selected-empty">
          <strong>MAPのピンを選択してください</strong>
          <p>
            ピンにマウスを合わせるとスポット名を表示します。
            クリックすると詳しい情報を確認できます。
          </p>
        </div>`;
    }

    const detailUrl =
      safeUrl(spot.detailUrl);

    return `
      <article class="photo-map-selected-card">

        <div class="photo-map-selected-visual">
          ${renderSpotImage(spot)}
        </div>

        <div class="photo-map-selected-copy">

          <p class="photo-map-selected-area">
            ${escapeHtml(spot.area || '浜中町')}
          </p>

          <div class="photo-map-selected-title">
            <h2>
              ${escapeHtml(spot.name)}
            </h2>

            <span
              class="photo-spot-type ${markerClass(spot)}">
              ${escapeHtml(
                MARKERS[spot.markerType]?.label ||
                'スポット'
              )}
            </span>
          </div>

          ${
            spot.description
              ? `<p class="photo-map-selected-description">
                  ${escapeHtml(spot.description)}
                </p>`
              : ''
          }

          ${renderSubjectBadges(spot, subjectMap)}

          <div class="photo-spot-meta">
            ${renderMeta(
              'おすすめ時期',
              spot.bestSeason
            )}
            ${renderMeta(
              'おすすめ時間',
              spot.bestTime
            )}
            ${renderMeta(
              'アクセス',
              spot.access
            )}
          </div>

          ${
            detailUrl
              ? `<a
                  class="photo-spot-detail"
                  href="${escapeHtml(detailUrl)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Google Mapで開く →
                </a>`
              : ''
          }

        </div>

      </article>`;
  };

  const renderListCard = (
    spot,
    subjectMap
  ) => {
    const detailUrl =
      safeUrl(spot.detailUrl);

    return `
      <article
        class="photo-spot-list-card"
        data-list-spot="${escapeHtml(spot.id)}">

        <div class="photo-spot-list-visual">
          ${renderSpotImage(spot)}
        </div>

        <div class="photo-spot-list-copy">

          <p class="photo-spot-list-area">
            ${escapeHtml(spot.area || '浜中町')}
          </p>

          <h3>
            ${escapeHtml(spot.name)}
          </h3>

          ${
            spot.description
              ? `<p>${escapeHtml(spot.description)}</p>`
              : ''
          }

          ${renderSubjectBadges(spot, subjectMap)}

          <div class="photo-spot-meta">
            ${renderMeta(
              '時期',
              spot.bestSeason
            )}
            ${renderMeta(
              '時間',
              spot.bestTime
            )}
            ${renderMeta(
              'アクセス',
              spot.access
            )}
          </div>

          ${
            detailUrl
              ? `<a
                  href="${escapeHtml(detailUrl)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Google Mapで開く →
                </a>`
              : ''
          }

        </div>

      </article>`;
  };

  const renderCourseStop = stop => {
    const url =
      safeUrl(stop.url);

    return `
      <li class="photo-map-course-stop">

        <div class="photo-map-course-time">
          ${escapeHtml(stop.time || '')}
        </div>

        <div class="photo-map-course-stop-body">

          ${
            stop.image
              ? `<div class="photo-map-course-stop-image">
                  <img
                    src="${escapeHtml(stop.image)}"
                    alt=""
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low">
                </div>`
              : ''
          }

          <div class="photo-map-course-stop-copy">

            <h4>
              ${escapeHtml(stop.name || '')}
            </h4>

            ${
              stop.text
                ? `<p>
                    ${escapeHtml(stop.text)
                      .replace(/\r?\n/g, '<br>')}
                  </p>`
                : ''
            }

            ${
              url
                ? `<a href="${escapeHtml(url)}">
                    この地点を見る →
                  </a>`
                : ''
            }

          </div>

        </div>

      </li>`;
  };

  const renderCourse = course => {
    const stops =
      Array.isArray(course.stops)
        ? course.stops
        : [];

    return `
      <details class="photo-map-course">

        <summary class="photo-map-course-summary">

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
              ${escapeHtml(
                course.eyebrow ||
                'MODEL COURSE'
              )}
            </p>

            <h3>
              ${escapeHtml(course.title || '')}
            </h3>

            ${
              course.summary
                ? `<p class="photo-map-course-summary-text">
                    ${escapeHtml(course.summary)}
                  </p>`
                : ''
            }

            ${
              course.duration
                ? `<span class="photo-map-course-duration">
                    所要時間：
                    ${escapeHtml(course.duration)}
                  </span>`
                : ''
            }

            <span
              class="photo-map-course-open"
              aria-hidden="true">
              詳細を見る
              <b>＋</b>
            </span>

          </div>

        </summary>

        <div class="photo-map-course-expanded">

          <div class="photo-map-course-expanded-head">
            <p>COURSE SCHEDULE</p>
            <h4>
              ${escapeHtml(course.title || '')}
            </h4>

            ${
              course.duration
                ? `<strong>
                    所要時間：
                    ${escapeHtml(course.duration)}
                  </strong>`
                : ''
            }
          </div>

          ${
            stops.length
              ? `<ol class="photo-map-course-timeline">
                  ${stops.map(renderCourseStop).join('')}
                </ol>`
              : `<p class="photo-map-course-no-stops">
                  CMSから地点と時刻を登録してください。
                </p>`
          }

        </div>

      </details>`;
  };

  const renderFieldNav = activeId => {
    const links = [
      ['photo-map', 'SPOT', '撮影スポット'],
      ['trip', '準備', '旅行準備'],
      ['gear', '機材', 'カメラ・レンズ'],
      ['technique', 'テクニック', '撮影テクニック'],
      ['manner', 'ルール', '撮影マナー']
    ];

    return `
      <nav
        class="field-guide-nav"
        aria-label="PHOTO GUIDE">

        <div
          class="container field-guide-nav-inner">

          <a
            class="field-guide-brand"
            href="guide.html">
            HAMANAKA
            <small>
              PHOTO FIELD GUIDE
            </small>
          </a>

          <div class="field-guide-links">
            ${links.map(
              ([id, label, sub]) => `
                <a
                  href="guide-article.html?article=${id}"
                  ${
                    id === activeId
                      ? 'aria-current="page"'
                      : ''
                  }
                  title="${escapeHtml(sub)}">
                  ${escapeHtml(label)}
                </a>`
            ).join('')}
          </div>

          <a
            class="field-guide-spot-button"
            href="#photo-map-explorer">
            フォトスポットを探す
            <span aria-hidden="true">
              ●
            </span>
          </a>

        </div>

      </nav>`;
  };

  const renderMapFilters = (
    settings,
    spots
  ) => {
    const subjectMap =
      subjectDefinitionMap(settings);

    const usedSubjects =
      new Set(
        spots.flatMap(subjectIds)
      );

    const subjects =
      [...subjectMap.values()]
        .filter(subject =>
          usedSubjects.has(String(subject.id))
        );

    const areas =
      [...new Set(
        spots
          .map(spot =>
            String(spot.area || '').trim()
          )
          .filter(Boolean)
      )];

    return {
      subjects,
      areas
    };
  };

  const renderExplorer = (
    settings,
    spots
  ) => {
    const mapImage =
      String(settings.map?.image || '').trim();

    const mapAlt =
      settings.map?.alt ||
      '浜中町フォトマップ';

    const subjectMap =
      subjectDefinitionMap(settings);

    return `
      <section
        class="photo-map-explorer"
        id="photo-map-explorer">

        <div class="container">

          <div
            class="photo-map-view-tabs"
            role="tablist"
            aria-label="スポット表示方法">

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
            class="photo-map-map-panel"
            data-map-panel="map">

            <div class="photo-map-map-toolbar">

              <div>
                <p class="photo-map-control-label">
                  MAPを絞り込む
                </p>

                <div
                  class="photo-map-search-mode"
                  aria-label="MAPの探し方">

                  <button
                    class="is-active"
                    type="button"
                    data-search-mode="subject">
                    被写体で探す
                  </button>

                  <button
                    type="button"
                    data-search-mode="area">
                    エリアで探す
                  </button>

                  <button
                    type="button"
                    data-search-mode="feature">
                    条件で探す
                  </button>

                </div>
              </div>

              <div
                class="photo-map-filters"
                data-map-filters>
              </div>

            </div>

            <div class="photo-map-map-view">

              <div class="photo-map-canvas">

                ${
                  mapImage
                    ? `<img
                        class="photo-map-base-image"
                        src="${escapeHtml(mapImage)}"
                        alt="${escapeHtml(mapAlt)}"
                        loading="eager"
                        decoding="async">`
                    : `<div
                        class="photo-map-base-placeholder"
                        aria-hidden="true">

                        <span
                          class="photo-map-placeholder-north">
                          N
                        </span>

                        <strong>
                          HAMANAKA
                        </strong>

                        <small>
                          CMSから地図画像を登録してください
                        </small>

                      </div>`
                }

                <div class="photo-map-pins">
                  ${spots.map(renderPin).join('')}
                </div>

              </div>

              <aside
                class="photo-map-selected"
                data-map-selected>
                ${renderSelectedSpot(
                  spots[0] || null,
                  subjectMap
                )}
              </aside>

            </div>

          </div>

          <div
            class="photo-map-list-view"
            data-map-panel="list"
            hidden>

            <div class="photo-map-list-head">

              <div>
                <p class="photo-map-control-label">
                  一覧の見方
                </p>
                <h2>
                  スポットを一覧から探す
                </h2>
              </div>

              <div
                class="photo-map-list-modes"
                role="tablist"
                aria-label="一覧表示方法">

                <button
                  class="is-active"
                  type="button"
                  data-list-mode="all">
                  すべて
                </button>

                <button
                  type="button"
                  data-list-mode="area">
                  エリア別
                </button>

                <button
                  type="button"
                  data-list-mode="subject">
                  被写体別
                </button>

              </div>

            </div>

            <div
              class="photo-map-list-results"
              data-list-results>
            </div>

          </div>

          <div class="photo-map-legend">

            <h2>
              MAPの見方
            </h2>

            <div class="photo-map-legend-grid">

              ${Object.entries(MARKERS)
                .map(([key, marker]) => `
                  <div>
                    <span
                      class="photo-map-legend-pin photo-map-marker-${key}"
                      aria-hidden="true">
                    </span>

                    <strong>
                      ${escapeHtml(marker.label)}
                    </strong>

                    <small>
                      ${escapeHtml(marker.description)}
                    </small>
                  </div>`
                )
                .join('')}

              <div>
                <span
                  class="photo-map-weather-icon"
                  aria-hidden="true">
                  ☀
                </span>

                <strong>
                  撮影前に確認
                </strong>

                <small>
                  天候・道路状況・現地ルールを確認しましょう
                </small>
              </div>

            </div>

          </div>

        </div>

      </section>`;
  };

  const renderPage = (
    root,
    settings,
    spots
  ) => {
    const hero =
      settings.hero || {};

    const courses =
      Array.isArray(settings.courses)
        ? settings.courses
        : [];

    const heroImage =
      String(hero.image || '').trim();

    document.title =
      `${hero.title || 'フォトマップ'}｜HAMANAKA PHOTO GUIDE`;

    document
      .querySelector(
        'meta[name="description"]'
      )
      ?.setAttribute(
        'content',
        hero.lead ||
        '浜中町の撮影スポットを地図から探します。'
      );

    document.body.classList.add(
      'photo-map-page'
    );

    root.innerHTML = `
      ${renderFieldNav('photo-map')}

      <section
        class="photo-map-hero"
        ${
          heroImage
            ? `style="--photo-map-hero:url('${escapeHtml(heroImage)}')"`
            : ''
        }>

        <div
          class="photo-map-hero-overlay">
        </div>

        <div
          class="container photo-map-hero-inner">

          <p class="photo-map-hero-eyebrow">
            ${escapeHtml(
              hero.eyebrow ||
              'PHOTO MAP'
            )}
          </p>

          <h1>
            ${escapeHtml(
              hero.title ||
              'MAPから探す'
            )}
          </h1>

          <p class="photo-map-hero-lead">
            ${escapeHtml(
              hero.lead ||
              '浜中町の撮影スポットを、エリアや撮りたい被写体から探せます。'
            )}
          </p>

        </div>

      </section>

      ${renderExplorer(settings, spots)}

      ${
        courses.length
          ? `<section class="photo-map-courses">

              <div class="container">

                <div class="photo-map-section-heading">

                  <p>
                    MODEL COURSE
                  </p>

                  <h2>
                    ${escapeHtml(
                      settings.coursesTitle ||
                      'モデルコース'
                    )}
                  </h2>

                  <span>
                    コースをクリックすると、
                    時刻と各地点の情報を確認できます。
                  </span>

                </div>

                <div class="photo-map-course-grid">
                  ${courses
                    .map(renderCourse)
                    .join('')}
                </div>

              </div>

            </section>`
          : ''
      }

      <section class="photo-map-manner-cta">

        <div class="container">

          <div class="photo-map-manner-inner">

            <div>

              <p>
                ${escapeHtml(
                  settings.manner?.eyebrow ||
                  'PHOTO MANNER'
                )}
              </p>

              <h2>
                ${escapeHtml(
                  settings.manner?.title ||
                  '撮影マナーを守って楽しみましょう'
                )}
              </h2>

              <span>
                ${escapeHtml(
                  settings.manner?.text ||
                  '自然や地域の方々への思いやりが、素晴らしい景色を未来へつなぎます。'
                )}
              </span>

            </div>

            <a
              href="${escapeHtml(
                safeUrl(
                  settings.manner?.url
                ) ||
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

  const initInteractions = (
    root,
    settings,
    spots
  ) => {
    const subjectMap =
      subjectDefinitionMap(settings);

    const mapFilterData =
      renderMapFilters(
        settings,
        spots
      );

    let mapMode =
      'subject';

    let activeMapFilter =
      'all';

    let selectedSpotId =
      spots[0]?.id || '';

    let listMode =
      'all';

    const mapFilters =
      root.querySelector(
        '[data-map-filters]'
      );

    const selectedPanel =
      root.querySelector(
        '[data-map-selected]'
      );

    const listResults =
      root.querySelector(
        '[data-list-results]'
      );

    const findSpot =
      id =>
        spots.find(
          spot =>
            String(spot.id) ===
            String(id)
        ) || null;

    const mapElementMatches =
      element => {
        if (activeMapFilter === 'all') {
          return true;
        }

        if (mapMode === 'area') {
          return (
            String(
              element.dataset.mapArea ||
              ''
            ) === activeMapFilter
          );
        }

        if (mapMode === 'feature') {
          return String(
            element.dataset.mapFeatures ||
            ''
          )
            .split(',')
            .filter(Boolean)
            .includes(activeMapFilter);
        }

        return String(
          element.dataset.mapSubjects ||
          ''
        )
          .split(',')
          .filter(Boolean)
          .includes(activeMapFilter);
      };

    const currentMapSpots = () =>
      spots.filter(spot => {
        if (activeMapFilter === 'all') {
          return true;
        }

        if (mapMode === 'area') {
          return (
            String(spot.area || '') ===
            activeMapFilter
          );
        }

        if (mapMode === 'feature') {
          return featureIds(spot)
            .includes(activeMapFilter);
        }

        return subjectIds(spot)
          .includes(activeMapFilter);
      });

    const updateSelectedPanel =
      spot => {
        if (!selectedPanel) {
          return;
        }

        selectedPanel.innerHTML =
          renderSelectedSpot(
            spot,
            subjectMap
          );
      };

    const selectSpot = spotId => {
      const spot =
        findSpot(spotId);

      if (!spot) {
        return;
      }

      selectedSpotId =
        String(spot.id);

      root
        .querySelectorAll(
          '[data-map-pin]'
        )
        .forEach(pin => {
          pin.classList.toggle(
            'is-selected',
            pin.dataset.mapPin ===
            selectedSpotId
          );
        });

      updateSelectedPanel(spot);
    };

    const applyMapFilter = () => {
      const pins =
        [...root.querySelectorAll(
          '[data-map-pin]'
        )];

      pins.forEach(pin => {
        pin.hidden =
          !mapElementMatches(pin);
      });

      const visible =
        currentMapSpots();

      if (
        !visible.some(
          spot =>
            String(spot.id) ===
            selectedSpotId
        )
      ) {
        selectedSpotId =
          visible[0]?.id || '';

        updateSelectedPanel(
          visible[0] || null
        );
      }

      pins.forEach(pin => {
        pin.classList.toggle(
          'is-selected',
          pin.dataset.mapPin ===
          String(selectedSpotId)
        );
      });
    };

    const renderMapFilterButtons = () => {
      if (!mapFilters) {
        return;
      }

      let filters = [];

      if (mapMode === 'area') {
        filters =
          mapFilterData.areas
            .map(area => ({
              id: area,
              label: area,
              icon: '●'
            }));
      } else if (mapMode === 'feature') {
        filters =
          FEATURE_FILTERS;
      } else {
        filters =
          mapFilterData.subjects
            .map(subject => ({
              id: String(subject.id),
              label: subject.label,
              icon: subject.icon || '●'
            }));
      }

      mapFilters.innerHTML = `
        <button
          class="is-active"
          type="button"
          data-map-filter="all">
          すべて
        </button>

        ${filters
          .map(filter => `
            <button
              type="button"
              data-map-filter="${escapeHtml(filter.id)}">

              ${
                filter.icon
                  ? `<span aria-hidden="true">
                      ${escapeHtml(filter.icon)}
                    </span>`
                  : ''
              }

              ${escapeHtml(filter.label)}

            </button>`
          )
          .join('')}`;

      activeMapFilter =
        'all';

      applyMapFilter();
    };

    const setMapMode = mode => {
      mapMode =
        ['subject', 'area', 'feature']
          .includes(mode)
          ? mode
          : 'subject';

      root
        .querySelectorAll(
          '[data-search-mode]'
        )
        .forEach(button => {
          button.classList.toggle(
            'is-active',
            button.dataset.searchMode ===
            mapMode
          );
        });

      renderMapFilterButtons();
    };

    const renderList = () => {
      if (!listResults) {
        return;
      }

      if (listMode === 'area') {
        const areas =
          [...new Set(
            spots
              .map(spot =>
                String(spot.area || '').trim()
              )
              .filter(Boolean)
          )];

        listResults.innerHTML =
          areas
            .map(area => {
              const items =
                spots.filter(
                  spot =>
                    String(spot.area || '') ===
                    area
                );

              return `
                <section
                  class="photo-map-list-group">

                  <div
                    class="photo-map-list-group-heading">

                    <p>AREA</p>

                    <h3>
                      ${escapeHtml(area)}
                    </h3>

                    <span>
                      ${items.length} SPOTS
                    </span>

                  </div>

                  <div
                    class="photo-map-list-grid">

                    ${items
                      .map(spot =>
                        renderListCard(
                          spot,
                          subjectMap
                        )
                      )
                      .join('')}

                  </div>

                </section>`;
            })
            .join('');

        return;
      }

      if (listMode === 'subject') {
        const sections =
          (Array.isArray(settings.subjects)
            ? settings.subjects
            : []
          )
            .map(subject => {
              const items =
                spots.filter(
                  spot =>
                    subjectIds(spot)
                      .includes(
                        String(subject.id)
                      )
                );

              return {
                subject,
                items
              };
            })
            .filter(
              item =>
                item.items.length
            );

        listResults.innerHTML =
          sections
            .map(({ subject, items }) => `
              <section
                class="photo-map-list-group">

                <div
                  class="photo-map-list-group-heading">

                  <p>
                    SUBJECT
                  </p>

                  <h3>
                    ${
                      subject.icon
                        ? `<span aria-hidden="true">
                            ${escapeHtml(subject.icon)}
                          </span>`
                        : ''
                    }
                    ${escapeHtml(subject.label)}
                  </h3>

                  ${
                    subject.description
                      ? `<small>
                          ${escapeHtml(subject.description)}
                        </small>`
                      : ''
                  }

                  <span>
                    ${items.length} SPOTS
                  </span>

                </div>

                <div
                  class="photo-map-list-grid">

                  ${items
                    .map(spot =>
                      renderListCard(
                        spot,
                        subjectMap
                      )
                    )
                    .join('')}

                </div>

              </section>`
            )
            .join('');

        return;
      }

      listResults.innerHTML = `
        <section
          class="photo-map-list-group">

          <div
            class="photo-map-list-group-heading">

            <p>ALL SPOTS</p>

            <h3>
              すべての撮影スポット
            </h3>

            <span>
              ${spots.length} SPOTS
            </span>

          </div>

          <div class="photo-map-list-grid">

            ${spots
              .map(spot =>
                renderListCard(
                  spot,
                  subjectMap
                )
              )
              .join('')}

          </div>

        </section>`;
    };

    const setListMode = mode => {
      listMode =
        ['all', 'area', 'subject']
          .includes(mode)
          ? mode
          : 'all';

      root
        .querySelectorAll(
          '[data-list-mode]'
        )
        .forEach(button => {
          button.classList.toggle(
            'is-active',
            button.dataset.listMode ===
            listMode
          );
        });

      renderList();
    };

    const setView = view => {
      const nextView =
        view === 'list'
          ? 'list'
          : 'map';

      root
        .querySelectorAll(
          '[data-map-view]'
        )
        .forEach(button => {
          const active =
            button.dataset.mapView ===
            nextView;

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
        .querySelectorAll(
          '[data-map-panel]'
        )
        .forEach(panel => {
          panel.hidden =
            panel.dataset.mapPanel !==
            nextView;
        });

      if (nextView === 'list') {
        renderList();
      }
    };

    renderMapFilterButtons();
    renderList();

    setView('map');

    if (selectedSpotId) {
      selectSpot(selectedSpotId);
    }

    root.addEventListener(
      'click',
      event => {
        const viewButton =
          event.target.closest(
            '[data-map-view]'
          );

        if (viewButton) {
          setView(
            viewButton.dataset.mapView
          );
          return;
        }

        const modeButton =
          event.target.closest(
            '[data-search-mode]'
          );

        if (modeButton) {
          setMapMode(
            modeButton.dataset.searchMode
          );
          return;
        }

        const filterButton =
          event.target.closest(
            '[data-map-filter]'
          );

        if (filterButton) {
          activeMapFilter =
            filterButton.dataset.mapFilter ||
            'all';

          mapFilters
            ?.querySelectorAll(
              '[data-map-filter]'
            )
            .forEach(button => {
              button.classList.toggle(
                'is-active',
                button === filterButton
              );
            });

          applyMapFilter();
          return;
        }

        const listButton =
          event.target.closest(
            '[data-list-mode]'
          );

        if (listButton) {
          setListMode(
            listButton.dataset.listMode
          );
          return;
        }

        const pin =
          event.target.closest(
            '[data-map-pin]'
          );

        if (pin) {
          selectSpot(
            pin.dataset.mapPin
          );
        }
      }
    );

    root
      .querySelectorAll(
        '[data-hero-mode]'
      )
      .forEach(link => {
        link.addEventListener(
          'click',
          () => {
            setView('map');

            setMapMode(
              link.dataset.heroMode
            );
          }
        );
      });
  };

  const init = async root => {
    try {
      const [
        settingsResponse,
        spotsResponse
      ] =
        await Promise.all([
          fetch(
            'data/photo-map.json',
            {
              cache: 'no-cache'
            }
          ),
          fetch(
            'data/photo-spots.json',
            {
              cache: 'no-cache'
            }
          )
        ]);

      if (
        !settingsResponse.ok ||
        !spotsResponse.ok
      ) {
        throw new Error(
          'PHOTO MAPデータを読み込めませんでした。'
        );
      }

      const settings =
        await settingsResponse.json();

      const spotData =
        await spotsResponse.json();

      const spots =
        sortByOrder(
          Array.isArray(spotData)
            ? spotData.filter(
                spot =>
                  spot.published !== false
              )
            : []
        );

      renderPage(
        root,
        settings,
        spots
      );

      initInteractions(
        root,
        settings,
        spots
      );

    } catch (error) {
      console.error(error);

      root.innerHTML = `
        <section class="section">
          <div class="container">

            <h1>
              フォトマップ
            </h1>

            <p class="section-lead">
              フォトマップを読み込めませんでした。
            </p>

            <p>
              <a
                class="btn btn-outline"
                href="guide.html">
                PHOTO GUIDEへ戻る
              </a>
            </p>

          </div>
        </section>`;
    }
  };

  window.HAMANAKA_PHOTO_MAP = {
    init
  };
})();