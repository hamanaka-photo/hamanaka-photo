(() => {
  const grid = document.querySelector('[data-gallery-grid]');
  const preview = document.querySelector('[data-gallery-preview]');
  const modal = document.querySelector('[data-modal]');

  const selectionTitle =
    document.querySelector('[data-selection-title]');

  const selectionDescription =
    document.querySelector('[data-selection-description]');

  const selectionStatus =
    document.querySelector('[data-selection-status]');

  const pastGrid =
    document.querySelector('[data-past-selections]');

  const currentLink =
    document.querySelector('[data-current-link]');

  let selections = [];
  let activeSelection = null;
  let data = [];
  let currentIndex = 0;


  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[char]));


  const photoCard = (item, compact = false) => `
    <article class="photo-card">

      <button
        type="button"
        data-open-photo="${Number(item.id)}"
        aria-label="${escapeHtml(item.title)}を開く">

        <img
          class="photo-thumb"
          src="${escapeHtml(item.image)}"
          alt="${escapeHtml(item.title)}"
          loading="lazy">

        <div class="photo-meta">

          <h3>
            ${escapeHtml(item.title)}
          </h3>

          <p>
            ${
              compact
                ? escapeHtml(activeSelection?.shortTitle || '')
                : `${escapeHtml(item.location)} / ${escapeHtml(item.author)}`
            }
          </p>

        </div>

      </button>

    </article>
  `;


  const selectionCard = item => `

    <article class="selection-card">

      <a
        href="gallery.html?selection=${encodeURIComponent(item.id)}">

        <div class="selection-card-image">

          <img
            src="${escapeHtml(item.cover)}"
            alt="${escapeHtml(item.title)}"
            loading="lazy">

        </div>

        <div class="selection-card-copy">

          <p class="selection-year">
            ${escapeHtml(item.year)}
          </p>

          <h3>
            ${escapeHtml(item.shortTitle || item.title)}
          </h3>

          <p>
            ${escapeHtml(item.description || '')}
          </p>

          <span class="selection-link">
            このセレクションを見る →
          </span>

        </div>

      </a>

    </article>
  `;


  function setText(selector, value) {

    if (!modal) return;

    const element =
      modal.querySelector(selector);

    if (element) {
      element.textContent = value ?? '';
    }

  }


  function fillModal(item) {

    if (!modal) return;

    const image =
      modal.querySelector('[data-modal-image]');

    if (image) {

      image.src =
        item.image ?? '';

      image.alt =
        item.title ?? '';

    }


    setText(
      '[data-modal-title]',
      item.title
    );

    setText(
      '[data-modal-location]',
      item.location
    );

    setText(
      '[data-modal-season]',
      item.season
    );

    setText(
      '[data-modal-camera]',
      item.camera
    );

    setText(
      '[data-modal-lens]',
      item.lens
    );

    setText(
      '[data-modal-settings]',
      item.settings
    );

    setText(
      '[data-modal-author]',
      item.author
    );

    setText(
      '[data-modal-comment]',
      item.comment
    );

  }


  function openById(id) {

    const index =
      data.findIndex(
        item =>
          Number(item.id) === Number(id)
      );

    if (
      index < 0 ||
      !modal
    ) return;


    currentIndex = index;

    fillModal(
      data[currentIndex]
    );


    modal.classList.add('open');

    modal.setAttribute(
      'aria-hidden',
      'false'
    );


    document.body.style.overflow =
      'hidden';


    modal
      .querySelector('.modal-close')
      ?.focus();

  }


  function closeModal() {

    if (!modal) return;

    modal.classList.remove('open');

    modal.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.style.overflow = '';

  }


  function move(step) {

    if (!data.length) return;

    currentIndex =
      (
        currentIndex +
        step +
        data.length
      ) % data.length;


    fillModal(
      data[currentIndex]
    );

  }


  function renderSelection() {

    if (!activeSelection) return;


    data =
      Array.isArray(activeSelection.works)
        ? activeSelection.works
        : [];


    if (selectionTitle) {

      selectionTitle.textContent =
        activeSelection.title;

    }


    if (selectionDescription) {

      selectionDescription.textContent =
        activeSelection.description || '';

    }


    if (selectionStatus) {

      selectionStatus.textContent =
        activeSelection.status === 'current'
          ? 'CURRENT SELECTION'
          : 'PAST SELECTION';

    }


    if (grid) {

      grid.innerHTML =
        data
          .map(item =>
            photoCard(item)
          )
          .join('');

    }


    if (preview) {

      preview.innerHTML =
        data
          .slice(0, 3)
          .map(item =>
            photoCard(item, true)
          )
          .join('');

    }


    /*
      撮影者表示用に
      現在のセレクションを共有
    */

    window.HAMANAKA_ACTIVE_SELECTION =
      activeSelection;


    document.dispatchEvent(
      new CustomEvent(
        'hamanaka:selection-loaded',
        {
          detail: activeSelection
        }
      )
    );

  }


  function renderPastSelections() {

    if (!pastGrid) return;


    const pastSelections =
      selections
        .filter(
          item =>
            item.status === 'past' &&
            item.id !== activeSelection?.id
        )
        .sort(
          (a, b) =>
            String(b.year)
              .localeCompare(
                String(a.year)
              )
        );


    if (!pastSelections.length) {

      pastGrid.innerHTML = `
        <p class="section-lead">
          過去のセレクションは、
          今後こちらに蓄積していきます。
        </p>
      `;

      return;

    }


    pastGrid.innerHTML =
      pastSelections
        .map(selectionCard)
        .join('');

  }


  function setCurrentLink() {

    if (!currentLink) return;


    const current =
      selections.find(
        item =>
          item.status === 'current'
      );


    if (
      !current ||
      current.id === activeSelection?.id
    ) {

      currentLink.hidden = true;

      return;

    }


    currentLink.hidden = false;

    currentLink.href =
      `gallery.html?selection=${encodeURIComponent(current.id)}`;

  }


  async function loadSelections() {

    try {

      const response =
        await fetch(
          'data/selections.json',
          {
            cache: 'no-store'
          }
        );


      if (!response.ok) {

        throw new Error(
          `selections.json の読み込みに失敗しました (${response.status})`
        );

      }


      const json =
        await response.json();


      if (!Array.isArray(json)) {

        throw new Error(
          'selections.json の形式が正しくありません。'
        );

      }


      selections = json;


      const params =
        new URLSearchParams(
          window.location.search
        );


      const requestedId =
        params.get('selection');


      if (requestedId) {

        activeSelection =
          selections.find(
            item =>
              item.id === requestedId
          );

      }


      if (!activeSelection) {

        activeSelection =
          selections.find(
            item =>
              item.status === 'current'
          );

      }


      if (!activeSelection) {

        activeSelection =
          selections[0];

      }


      if (!activeSelection) {

        throw new Error(
          '表示できるセレクションがありません。'
        );

      }


      renderSelection();

      renderPastSelections();

      setCurrentLink();


    } catch (error) {

      console.error(error);


      const message = `
        <p class="section-lead">
          フォトギャラリーを読み込めませんでした。
          しばらくしてから再度お試しください。
        </p>
      `;


      if (grid) {
        grid.innerHTML = message;
      }

      if (preview) {
        preview.innerHTML = message;
      }

    }

  }


  document.addEventListener(
    'click',
    event => {

      const opener =
        event.target.closest(
          '[data-open-photo]'
        );


      if (opener) {

        openById(
          opener.dataset.openPhoto
        );

        return;

      }


      if (
        event.target.closest(
          '[data-modal-close]'
        )
      ) {

        closeModal();

        return;

      }


      if (
        event.target.closest(
          '[data-modal-prev]'
        )
      ) {

        move(-1);

        return;

      }


      if (
        event.target.closest(
          '[data-modal-next]'
        )
      ) {

        move(1);

        return;

      }


      if (
        event.target === modal
      ) {

        closeModal();

      }

    }
  );


  document.addEventListener(
    'keydown',
    event => {

      if (
        !modal?.classList.contains(
          'open'
        )
      ) return;


      if (
        event.key === 'Escape'
      ) {

        closeModal();

      }


      if (
        event.key === 'ArrowLeft'
      ) {

        move(-1);

      }


      if (
        event.key === 'ArrowRight'
      ) {

        move(1);

      }

    }
  );


  loadSelections();

})();
