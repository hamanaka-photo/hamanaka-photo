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

  const FEATURED_SPOT_IDS = [
    'SPOT-013',
    'SPOT-009',
    'SPOT-014'
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

  const markerTypes = spot => {
    const types =
      Array.isArray(spot.markerTypes)
        ? spot.markerTypes
        : spot.markerType
          ? [spot.markerType]
          : [];

    return [...new Set(
      types
        .map(String)
        .filter(type =>
          Object.prototype.hasOwnProperty.call(
            MARKERS,
            type
          )
        )
    )];
  };

  const primaryMarkerType = spot =>
    markerTypes(spot)[0] || 'coast';

  const spotImages = spot => {
    const images =
      Array.isArray(spot.images)
        ? spot.images
            .map(image => ({
              src: safeUrl(image?.src),
              alt: String(image?.alt || ''),
              caption: String(image?.caption || '')
            }))
            .filter(image => image.src)
        : [];

    if (images.length) {
      return images;
    }

    const legacyImage = safeUrl(spot.image);

    return legacyImage
      ? [{
          src: legacyImage,
          alt: String(spot.name || ''),
          caption: ''
        }]
      : [];
  };

  const getPrimarySpotImage = spot =>
    spotImages(spot)[0] || null;

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
    const overrideXValue =
      spot.positionOverride?.x;

    const overrideYValue =
      spot.positionOverride?.y;

    const overrideX =
      overrideXValue === '' || overrideXValue == null
        ? NaN
        : Number(overrideXValue);

    const overrideY =
      overrideYValue === '' || overrideYValue == null
        ? NaN
        : Number(overrideYValue);

    if (
      Number.isFinite(overrideX) &&
      Number.isFinite(overrideY)
    ) {
      return {
        x: overrideX,
        y: overrideY
      };
    }

    const lat = Number(spot.lat);
    const lng = Number(spot.lng);

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng)
    ) {
      return {
        x: Math.round((
          60 +
          164.55920145 * (lng - 145.1700181) +
          110.77104343 * (lat - 43.0768315)
        ) * 10) / 10,
        y: Math.round((
          61 -
          6.88187091 * (lng - 145.1700181) -
          327.50472 * (lat - 43.0768315)
        ) * 10) / 10
      };
    }

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

  const renderSpotImage = spot => {
    const image = getPrimarySpotImage(spot);

    return image
      ? `<img
          src="${escapeHtml(image.src)}"
          alt="${escapeHtml(image.alt || spot.name || '')}"
          loading="lazy"
          decoding="async"
          fetchpriority="low">`
      : placeholderVisual(spot.name);
  };

  const markerClass = spot => {
    const type = primaryMarkerType(spot);

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
        data-map-types="${escapeHtml(markerTypes(spot).join(','))}"
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

  const renderCautions = spot => {
    const cautions =
      Array.isArray(spot.cautions)
        ? spot.cautions
            .map(String)
            .map(item => item.trim())
            .filter(Boolean)
        : [];

    if (!cautions.length) {
      return '';
    }

    return `
      <div class="photo-spot-cautions">
        <strong>注意事項・マナー</strong>
        <ul>
          ${cautions
            .map(item =>
              `<li>${escapeHtml(item)}</li>`
            )
            .join('')}
        </ul>
      </div>`;
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

    const type = primaryMarkerType(spot);

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
                MARKERS[type]?.label ||
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
              '駐車場',
              spot.parking
            )}
            ${renderMeta(
              'トイレ',
              spot.toilet
            )}
          </div>

          ${renderCautions(spot)}

          <button
            class="photo-spot-detail photo-spot-detail-button"
            type="button"
            data-open-spot="${escapeHtml(spot.id)}">
            写真と詳細を見る →
          </button>

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
    { featured = false } = {}
  ) => {
    return `
      <article
        class="photo-spot-list-card photo-spot-gallery-card${featured ? ' is-featured' : ''}"
        data-list-spot="${escapeHtml(spot.id)}">

        <button
          class="photo-spot-gallery-button"
          type="button"
          data-open-spot="${escapeHtml(spot.id)}"
          aria-label="${escapeHtml(spot.name)}の写真と詳細を見る">

          <span class="photo-spot-list-visual">
            ${renderSpotImage(spot)}
          </span>

          <span class="photo-spot-list-copy">
            <span class="photo-spot-list-area">
              ${escapeHtml(spot.area || '浜中町')}
            </span>
            <strong>${escapeHtml(spot.name)}</strong>
            <span class="photo-spot-gallery-action">詳しく見る →</span>
          </span>

        </button>

      </article>`;
  };

  const renderSpotModal = (
    spot,
    currentIndex,
    subjectMap
  ) => {
    const images = spotImages(spot);
    const imageIndex = images.length
      ? Math.min(
          images.length - 1,
          Math.max(0, Number(currentIndex) || 0)
        )
      : 0;
    const currentImage = images[imageIndex] || null;
    const detailUrl = safeUrl(spot.detailUrl);
    const subjects = renderSubjectBadges(spot, subjectMap);

    return `
      <div class="photo-spot-modal-layout">
        <div class="photo-spot-modal-gallery">
          <figure class="photo-spot-modal-figure" aria-live="polite">
            ${
              currentImage
                ? `<img
                    src="${escapeHtml(currentImage.src)}"
                    alt="${escapeHtml(currentImage.alt || spot.name || '')}"
                    decoding="async">`
                : placeholderVisual(spot.name)
            }
            ${
              currentImage?.caption
                ? `<figcaption>${escapeHtml(currentImage.caption)}</figcaption>`
                : ''
            }
          </figure>

          ${
            images.length > 1
              ? `<div class="photo-spot-modal-controls">
                  <button
                    type="button"
                    data-gallery-step="-1"
                    aria-label="前の写真を見る">←</button>
                  <div class="photo-spot-modal-thumbnails" aria-label="写真一覧">
                    ${images.map((image, index) => `
                      <button
                        class="${index === imageIndex ? 'is-active' : ''}"
                        type="button"
                        data-gallery-index="${index}"
                        aria-label="写真${index + 1}を表示"
                        aria-pressed="${index === imageIndex}">
                        <img
                          src="${escapeHtml(image.src)}"
                          alt=""
                          loading="lazy"
                          decoding="async">
                      </button>`).join('')}
                  </div>
                  <button
                    type="button"
                    data-gallery-step="1"
                    aria-label="次の写真を見る">→</button>
                </div>`
              : ''
          }
        </div>

        <div class="photo-spot-modal-copy">
          <p class="photo-spot-modal-area">
            ${escapeHtml(spot.area || '浜中町')}
          </p>
          <h2 id="photo-spot-dialog-title">
            ${escapeHtml(spot.name || '')}
          </h2>

          ${
            spot.description
              ? `<p class="photo-spot-modal-description">${escapeHtml(spot.description)}</p>`
              : ''
          }

          ${
            subjects
              ? `<section class="photo-spot-modal-section">
                  <h3>撮れるもの</h3>
                  ${subjects}
                </section>`
              : ''
          }

          <div class="photo-spot-meta photo-spot-modal-meta">
            ${renderMeta('おすすめ時期', spot.bestSeason)}
            ${renderMeta('駐車場', spot.parking)}
            ${renderMeta('トイレ', spot.toilet)}
          </div>

          ${renderCautions(spot)}

          ${
            detailUrl
              ? `<a
                  class="photo-spot-modal-map-link"
                  href="${escapeHtml(detailUrl)}"
                  target="_blank"
                  rel="noopener noreferrer">
                  Google Mapで開く →
                </a>`
              : ''
          }
        </div>
      </div>`;
  };

  const renderSpotDialog = () => `
    <dialog
      class="photo-spot-dialog"
      data-spot-dialog
      aria-modal="true"
      aria-labelledby="photo-spot-dialog-title">
      <div class="photo-spot-dialog-panel">
        <button
          class="photo-spot-dialog-close"
          type="button"
          data-close-spot-dialog
          aria-label="詳細を閉じる">×</button>
        <div data-spot-modal-content></div>
      </div>
    </dialog>`;

  const renderCourseStop = (spot, index) => {
    const detailUrl =
      safeUrl(spot.detailUrl);

    const primaryImage =
      getPrimarySpotImage(spot);

    const orderLabel =
      `SPOT ${String(index + 1).padStart(2, '0')}`;

    return `
      <li class="photo-map-course-stop">

        <div class="photo-map-course-order">
          ${escapeHtml(orderLabel)}
        </div>

        <div class="photo-map-course-stop-body">

          ${
            primaryImage
              ? `<div class="photo-map-course-stop-image">
                  <img
                    src="${escapeHtml(primaryImage.src)}"
                    alt="${escapeHtml(primaryImage.alt || spot.name || '')}"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low">
                </div>`
              : ''
          }

          <div class="photo-map-course-stop-copy">

            ${
              spot.area
                ? `<p class="photo-map-course-stop-area">
                    ${escapeHtml(spot.area)}
                  </p>`
                : ''
            }

            <h4>
              ${escapeHtml(spot.name || '')}
            </h4>

            ${
              spot.description
                ? `<p>
                    ${escapeHtml(spot.description)
                      .replace(/\r?\n/g, '<br>')}
                  </p>`
                : ''
            }

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

        </div>

      </li>`;
  };

  const resolveCourseSpots = (
    course,
    spotMap
  ) => {
    const spotIds =
      Array.isArray(course.spotIds)
        ? course.spotIds
        : [];

    return spotIds
      .map(id => {
        const key = String(id);
        const spot = spotMap.get(key);

        if (!spot) {
          console.warn(
            `Unknown photo spot id: ${key}`
          );
        }

        return spot;
      })
      .filter(Boolean);
  };

  const renderCourse = (
    course,
    spotMap
  ) => {
    const courseSpots =
      resolveCourseSpots(course, spotMap);

    const courseImage =
      courseSpots
        .map(getPrimarySpotImage)
        .find(Boolean);

    return `
      <details class="photo-map-course">

        <summary class="photo-map-course-summary">

          <div class="photo-map-course-image">
            ${
              courseImage
                ? `<img
                    src="${escapeHtml(courseImage.src)}"
                    alt="${escapeHtml(courseImage.alt || course.title || '')}"
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
            <p>COURSE ROUTE</p>
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
            courseSpots.length
              ? `<ol class="photo-map-course-timeline">
                  ${courseSpots.map(renderCourseStop).join('')}
                </ol>`
              : `<p class="photo-map-course-no-stops">
                  登録されたスポットがありません。
                </p>`
          }

        </div>

      </details>`;
  };

  const renderFieldNav = activeId => {
    const links = [
      ['photo-map', 'スポット', '撮影スポット'],
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

    const types =
      Object.entries(MARKERS)
        .filter(([id]) =>
          spots.some(spot =>
            markerTypes(spot).includes(id)
          )
        )
        .map(([id, marker]) => ({
          id,
          label: marker.label,
          icon: '●'
        }));

    const usedFeatures =
      new Set(spots.flatMap(featureIds));

    const features =
      FEATURE_FILTERS.filter(feature =>
        usedFeatures.has(feature.id)
      );

    return {
      subjects,
      areas,
      types,
      features
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
              data-map-view="list">
              撮影スポット
            </button>

            <button
              type="button"
              role="tab"
              aria-selected="false"
              data-map-view="map">
              MAPから探す
            </button>

          </div>

          <div
            class="photo-map-map-panel"
            data-map-panel="map"
            hidden>

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

                  <button
                    type="button"
                    data-search-mode="type">
                    種類で探す
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
            data-map-panel="list">

            <div class="photo-map-list-head">

              <div>
                <p class="photo-map-control-label">
                  写真から探す
                </p>
                <h2>
                  撮影スポット一覧
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

          <div class="photo-map-legend" data-map-only hidden>

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

    const spotMap = new Map(
      spots.map(spot => [
        String(spot.id),
        spot
      ])
    );

    const heroImage =
      String(hero.image || '').trim();

    document.title =
      `${hero.title || '撮影スポットを探す'}｜HAMANAKA PHOTO GUIDE`;

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
              '撮影スポットを探す'
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

      ${renderSpotDialog()}

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
                    スポットの順番と各地点の情報を確認できます。
                  </span>

                </div>

                <div class="photo-map-course-grid">
                  ${courses
                    .map(course =>
                      renderCourse(course, spotMap)
                    )
                    .join('')}
                </div>

                <p class="photo-map-courses-note">
                  ${escapeHtml(
                    settings.coursesNote ||
                    '天候や霧、季節、野生動物の状況によって、撮影できる景色は変わります。順番や滞在時間は、その日の様子に合わせて調整してください。'
                  )}
                </p>

              </div>

            </section>`
          : ''
      }

      ${settings.manner ? `      <section class="photo-map-manner-cta">

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

      </section>` : ''}`;
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

    const spotDialog =
      root.querySelector(
        '[data-spot-dialog]'
      );

    const modalContent =
      root.querySelector(
        '[data-spot-modal-content]'
      );

    let modalSpot = null;
    let modalImageIndex = 0;
    let modalTrigger = null;

    const findSpot =
      id =>
        spots.find(
          spot =>
            String(spot.id) ===
            String(id)
        ) || null;

    const updateSpotModal = nextIndex => {
      if (!modalSpot || !modalContent) {
        return;
      }

      const images = spotImages(modalSpot);

      if (images.length) {
        modalImageIndex =
          (
            Number(nextIndex) % images.length +
            images.length
          ) % images.length;
      } else {
        modalImageIndex = 0;
      }

      modalContent.innerHTML =
        renderSpotModal(
          modalSpot,
          modalImageIndex,
          subjectMap
        );
    };

    const openSpotModal = (
      spotId,
      trigger
    ) => {
      const spot = findSpot(spotId);

      if (!spot || !spotDialog) {
        return;
      }

      modalSpot = spot;
      modalImageIndex = 0;
      modalTrigger = trigger || null;
      updateSpotModal(0);
      document.body.classList.add(
        'photo-map-modal-open'
      );

      if (typeof spotDialog.showModal === 'function') {
        spotDialog.showModal();
      } else {
        spotDialog.setAttribute('open', '');
      }

      spotDialog
        .querySelector('[data-close-spot-dialog]')
        ?.focus();
    };

    const closeSpotModal = () => {
      if (!spotDialog) {
        return;
      }

      if (typeof spotDialog.close === 'function') {
        spotDialog.close();
      } else {
        spotDialog.removeAttribute('open');
        document.body.classList.remove(
          'photo-map-modal-open'
        );
        modalTrigger?.focus();
      }
    };

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

        if (mapMode === 'type') {
          return String(
            element.dataset.mapTypes ||
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

        if (mapMode === 'type') {
          return markerTypes(spot)
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
          mapFilterData.features;
      } else if (mapMode === 'type') {
        filters =
          mapFilterData.types;
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
        ['subject', 'area', 'feature', 'type']
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
                        renderListCard(spot)
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
                      renderListCard(spot)
                    )
                    .join('')}

                </div>

              </section>`
            )
            .join('');

        return;
      }

      const featuredSpots =
        FEATURED_SPOT_IDS
          .map(id => findSpot(id))
          .filter(Boolean);

      const featuredIds =
        new Set(
          featuredSpots.map(spot => String(spot.id))
        );

      const regularSpots =
        spots.filter(
          spot => !featuredIds.has(String(spot.id))
        );

      listResults.innerHTML = `
        ${
          featuredSpots.length
            ? `<section class="photo-map-list-group photo-map-featured-group">
                <div class="photo-map-list-group-heading">
                  <p>FEATURED SPOTS</p>
                  <h3>まず見てほしい撮影スポット</h3>
                </div>
                <div class="photo-map-featured-grid">
                  ${featuredSpots
                    .map(spot => renderListCard(spot, { featured: true }))
                    .join('')}
                </div>
              </section>`
            : ''
        }

        <section class="photo-map-list-group">
          <div class="photo-map-list-group-heading">
            <p>MORE SPOTS</p>
            <h3>その他の撮影スポット</h3>
            <span>${regularSpots.length} SPOTS</span>
          </div>
          <div class="photo-map-list-grid">
            ${regularSpots
              .map(spot => renderListCard(spot))
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

      root
        .querySelectorAll('[data-map-only]')
        .forEach(element => {
          element.hidden = nextView !== 'map';
        });

      if (nextView === 'list') {
        renderList();
      }
    };

    renderMapFilterButtons();
    renderList();

    setView('list');

    if (selectedSpotId) {
      selectSpot(selectedSpotId);
    }

    spotDialog?.addEventListener(
      'close',
      () => {
        document.body.classList.remove(
          'photo-map-modal-open'
        );
        modalTrigger?.focus();
        modalSpot = null;
      }
    );

    spotDialog?.addEventListener(
      'click',
      event => {
        if (event.target === spotDialog) {
          closeSpotModal();
        }
      }
    );

    spotDialog?.addEventListener(
      'keydown',
      event => {
        if (!modalSpot || spotImages(modalSpot).length < 2) {
          return;
        }

        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          updateSpotModal(modalImageIndex - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          updateSpotModal(modalImageIndex + 1);
        } else {
          return;
        }

        spotDialog
          .querySelector(
            `[data-gallery-index="${modalImageIndex}"]`
          )
          ?.focus();
      }
    );

    root.addEventListener(
      'click',
      event => {
        const closeButton =
          event.target.closest(
            '[data-close-spot-dialog]'
          );

        if (closeButton) {
          closeSpotModal();
          return;
        }

        const galleryIndexButton =
          event.target.closest(
            '[data-gallery-index]'
          );

        if (galleryIndexButton) {
          updateSpotModal(
            Number(galleryIndexButton.dataset.galleryIndex)
          );
          spotDialog
            ?.querySelector(
              `[data-gallery-index="${modalImageIndex}"]`
            )
            ?.focus();
          return;
        }

        const galleryStepButton =
          event.target.closest(
            '[data-gallery-step]'
          );

        if (galleryStepButton) {
          const step =
            Number(galleryStepButton.dataset.galleryStep || 0);

          updateSpotModal(
            modalImageIndex + step
          );
          spotDialog
            ?.querySelector(
              `[data-gallery-step="${step}"]`
            )
            ?.focus();
          return;
        }

        const openSpotButton =
          event.target.closest(
            '[data-open-spot]'
          );

        if (openSpotButton) {
          openSpotModal(
            openSpotButton.dataset.openSpot,
            openSpotButton
          );
          return;
        }

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
