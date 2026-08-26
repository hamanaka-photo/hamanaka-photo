(() => {

  const grid =
    document.querySelector(
      '[data-photographers-grid]'
    );

  if (!grid) {
    return;
  }


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
      .replace(
        /\r?\n/g,
        '<br>'
      );

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
        .filter(item => {

          return (
            item &&
            item.image &&
            safeUrl(item.url)
          );

        })
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
            platformLabel(
              item.platform
            );

          const account =
            String(
              item.account || ''
            ).trim();


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


  const photographerCard = item => {

    const name =
      item.name || '';

    const nameEn =
      item.nameEn || '';

    const photo =
      item.photo || '';

    const works =
      item.works || '';

    const profile =
      item.profile || '';

    const socialLinks =
      socialLinksHtml(
        item.socialLinks
      );


    const hasDetails =
      Boolean(
        String(profile).trim() ||
        socialLinks
      );


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
              works
                ? `
                  <p class="took-photos">
                    Took photos :
                    ${escapeHtml(works)}
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


    const works =
      Array.isArray(selection.works)
        ? selection.works
        : [];


    const selectedAuthors =
      new Set(
        works
          .map(work => {

            return normalizeName(
              work.author
            );

          })
          .filter(Boolean)
      );


    const visiblePhotographers =
      photographers.filter(
        photographer => {

          return selectedAuthors.has(
            normalizeName(
              photographer.name
            )
          );

        }
      );


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
        .map(photographerCard)
        .join('');

  };


  const loadPhotographers = async () => {

    try {

      const response =
        await fetch(
          'data/photographers.json'
        );


      if (!response.ok) {

        throw new Error(
          `photographers.json の読み込みに失敗しました。HTTP ${response.status}`
        );

      }


      const data =
        await response.json();


      if (!Array.isArray(data)) {

        throw new Error(
          'photographers.json の形式が正しくありません。'
        );

      }


      photographers =
        data;


      if (
        !activeSelection &&
        window.HAMANAKA_ACTIVE_SELECTION
      ) {

        activeSelection =
          window.HAMANAKA_ACTIVE_SELECTION;

      }


      if (activeSelection) {

        render(
          activeSelection
        );

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

        render(
          activeSelection
        );

      }

    }
  );


  const scheduleLoad = callback => {

    if (
      'requestIdleCallback' in window
    ) {

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


  scheduleLoad(
    loadPhotographers
  );

})();