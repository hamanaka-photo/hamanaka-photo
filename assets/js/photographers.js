(() => {
  const grid = document.querySelector('[data-photographers-grid]');

  if (!grid) return;

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));

  const profileHtml = (value = '') =>
    escapeHtml(value).replace(/\r?\n/g, '<br>');

  const card = (item) => `
    <article class="author-card">

      <div class="author-fixed">

        <img
          class="author-photo"
          src="${escapeHtml(item.photo)}"
          alt="${escapeHtml(item.name)}"
          loading="lazy">

        <div class="author-info">

          <p class="eyebrow">
            PHOTOGRAPHER
          </p>

          <h3>
            ${escapeHtml(item.name)}

            ${
              item.nameEn
                ? `<span class="author-en">（${escapeHtml(item.nameEn)}）</span>`
                : ''
            }
          </h3>

          <p class="took-photos">
            Took photos : ${escapeHtml(item.works)}
          </p>

        </div>

      </div>


      <details class="author-details">

        <summary>
          プロフィールを見る
        </summary>

        <div class="author-profile">

          <p>
            ${profileHtml(item.profile)}
          </p>

        </div>

      </details>

    </article>
  `;


  async function loadPhotographers() {

    try {

      const response = await fetch(
        'data/photographers.json',
        {
          cache: 'no-store'
        }
      );


      if (!response.ok) {

        throw new Error(
          `photographers.json の読み込みに失敗しました (${response.status})`
        );

      }


      const data = await response.json();


      if (!Array.isArray(data)) {

        throw new Error(
          'photographers.json の形式が正しくありません。'
        );

      }


      grid.innerHTML =
        data
          .map(card)
          .join('');


    } catch (error) {

      console.error(error);


      grid.innerHTML =
        '<p class="section-lead">' +
        '撮影者情報を読み込めませんでした。' +
        'しばらくしてから再度お試しください。' +
        '</p>';

    }

  }


  loadPhotographers();

})();
