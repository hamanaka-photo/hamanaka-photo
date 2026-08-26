(() => {
  const grid =
    document.querySelector(
      '[data-photographers-grid]'
    );

  if (!grid) {
    return;
  }

  const photographerFiles = [
    'data/photographers/ohstubo.json',
    'data/photographers/sonehara.json',
    'data/photographers/hamanaka.json',
    'data/photographers/kataoka.json',
    'data/photographers/moriyama.json',
    'data/photographers/raccobayashi.json'
  ];

  let photographers = [];

  let activeSelection =
    window.HAMANAKA_ACTIVE_SELECTION || null;

  const escapeHtml = (value = '') => {
    return String(value).replace(
      /[&<>"']/g,
      character => {
        const entities = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };

        return entities[character];
      }
    );
  };

  const normalizeName = (value = '') => {
    return String(value)
      .replace(/\s+/g, '')
      .trim();
  };

  const profileHtml = (value = '') => {
    return escapeHtml(value)
      .replace(/\r?\n/g, '<br>');
  };

  const safeUrl = (value = '') => {
    const valueString =
      String(value || '').trim();

    if (!valueString) {
      return '';
    }

    try {
      const url =
        new URL(
          valueString,
          window.location.href
        );

      if (
        url.protocol !== 'http:' &&
        url.protocol !== 'https:'
      ) {
        return '';
      }

      return valueString;
    } catch {
      return '';
    }
  };

  const platformLabel = (platform = '') => {
    const labels = {
      instagram: 'Instagram',
      x: 'X',
      facebook: 'Facebook',
      website: 'Webサイト',
      other: '関連リンク'
    };

    return labels[platform] || '関連リンク';
  };

  const socialLinksHtml = (links = []) => {
    if (!Array.isArray(links)) {
      return '';
    }

    const validLinks =
      links
        .filter(item => (
          item &&
          item.image &&
          safeUrl(item.url)
        ))
        .slice(0, 3);

    if (!validLinks.length) {
      return '';
    }

    const items =
      validLinks
        .map(item => {
          const url =
            safeUrl(item.url);

          const platform =
            platformLabel(item.platform);

          const account =
            String(item.account || '').trim();

          const ariaLabel =
            account
              ? `${platform} ${account} を開く`
              : `${platform} を開く`;

          const imageAlt =
            account
              ? `${platform} ${account} のQRコード・リンク画像`
              : `${platform}のQRコード・リンク画像`;

          return `
            <a
              class="author-social-link"
              href="${escapeHtml(url)}"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="${escapeHtml(ariaLabel)}"
            >
              <div class="author-social-image">
                <img
                  src="${escapeHtml(item.image)}"
                  alt="${escapeHtml(imageAlt)}"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                >
              </div>

              <div class="author-social-copy">
                <span class="author-social-platform">
                  ${escapeHtml(platform)}
                </span>

                ${
                  account
                    ? `
                      <strong class="author-social-account">
                        ${escapeHtml(account)}
                      </strong>
                    `
                    : ''
                }

                <span class="author-social-open">
                  リンクを開く ↗
                </span>
              </div>
            </a>
          `;
        })
        .join('');

    return `
      <div class="author-socials">
        <p class="author-social-title">
          SNS・関連リンク
        </p>

        <div class="author-social-grid">
          ${items}
        </div>
      </div>
    `;
  };

  const circledNumber = value => {
    const number = Number(value);

    const circled = [
      '',
      '①', '②', '③', '④', '⑤',
      '⑥', '⑦', '⑧', '⑨', '⑩',
      '⑪', '⑫', '⑬', '⑭', '⑮',
      '⑯', '⑰', '⑱', '⑲', '⑳'
    ];

    if (
      Number.isInteger(number) &&
      number >= 1 &&
      number <= 20
    ) {
      return circled[number];
    }

    return number
      ? `#${number}`
      : '';
  };

  const workLabel = work => {
    const title =
      String(work?.title || '').trim();

    const titleNumber =
      title.match(/^([①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳])/u);

    if (titleNumber) {
      return titleNumber[1];
    }

    return circledNumber(work?.id);
  };

  const workLabelsFor = (selection, photographerName) => {
    const works =
      Array.isArray(selection?.works)
        ? selection.works
        : [];

    const targetName =
      normalizeName(photographerName);

    return works
      .filter(work => (
        normalizeName(work.author) === targetName
      ))
      .map(workLabel)
      .filter(Boolean);
  };

  const photographerCard = (item, workLabels) => {
    const name =
      item.name || '';

    const nameEn =
      item.nameEn || '';

    const photo =
      item.photo || '';

    const profile =
      item.profile || '';

    const socialLinks =
      socialLinksHtml(item.socialLinks);

    const hasDetails =
      Boolean(
        String(profile).trim() ||
        socialLinks
      );

    const tookPhotos =
      workLabels.length
        ? workLabels.join(',')
        : '';

    return `
      <article class="author-card">
        <div class="author-fixed">
          ${
            photo
              ? `
                <img
                  class="author-photo"
                  src="${escapeHtml(photo)}"
                  alt="${escapeHtml(name)}"
                  loading="lazy"
                  decoding="async"
                  fetchpriority="low"
                >
              `
              : ''
          }

          <div class="author-info">
            <p class="eyebrow">
              PHOTOGRAPHER
            </p>

            <h3>
              ${escapeHtml(name)}

              ${
                nameEn
                  ? `
                    <span class="author-en">
                      （${escapeHtml(nameEn)}）
                    </span>
                  `
                  : ''
              }
            </h3>

            ${
              tookPhotos
                ? `
                  <p class="took-photos">
                    Took photos : ${escapeHtml(tookPhotos)}
                  </p>
                `
                : ''
            }
          </div>
        </div>

        ${
          hasDetails
            ? `
              <details class="author-details">
                <summary>
                  プロフィールを見る
                </summary>

                <div class="author-profile">
                  ${
                    String(profile).trim()
                      ? `
                        <p>
                          ${profileHtml(profile)}
                        </p>
                      `
                      : ''
                  }

                  ${socialLinks}
                </div>
              </details>
            `
            : ''
        }
      </article>
    `;
  };

  const render = selection => {
    if (!selection) {
      return;
    }

    const visiblePhotographers =
      photographers
        .map(photographer => ({
          photographer,
          workLabels: workLabelsFor(
            selection,
            photographer.name
          )
        }))
        .filter(item => item.workLabels.length);

    if (!visiblePhotographers.length) {
      grid.innerHTML = `
        <p class="section-lead">
          撮影者情報はありません。
        </p>
      `;

      return;
    }

    grid.innerHTML =
      visiblePhotographers
        .map(({ photographer, workLabels }) =>
          photographerCard(
            photographer,
            workLabels
          )
        )
        .join('');
  };

  const loadPhotographers = async () => {
    try {
      const results =
        await Promise.all(
          photographerFiles.map(async path => {
            const response =
              await fetch(path);

            if (!response.ok) {
              throw new Error(
                `${path} の読み込みに失敗しました。HTTP ${response.status}`
              );
            }

            return response.json();
          })
        );

      photographers =
        results.filter(Boolean);

      if (
        !activeSelection &&
        window.HAMANAKA_ACTIVE_SELECTION
      ) {
        activeSelection =
          window.HAMANAKA_ACTIVE_SELECTION;
      }

      if (activeSelection) {
        render(activeSelection);
      }
    } catch (error) {
      console.error(
        '撮影者情報の読み込みエラー:',
        error
      );

      grid.innerHTML = `
        <p class="section-lead">
          撮影者情報を読み込めませんでした。
        </p>
      `;
    }
  };

  document.addEventListener(
    'hamanaka:selection-loaded',
    event => {
      if (!event.detail) {
        return;
      }

      activeSelection =
        event.detail;

      window.HAMANAKA_ACTIVE_SELECTION =
        activeSelection;

      if (photographers.length) {
        render(activeSelection);
      }
    }
  );

  const scheduleLoad = callback => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(
        callback,
        {
          timeout: 1200
        }
      );

      return;
    }

    window.setTimeout(
      callback,
      250
    );
  };

  scheduleLoad(loadPhotographers);
})();
