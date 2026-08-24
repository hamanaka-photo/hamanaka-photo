(() => {
  const grid = document.querySelector('[data-gallery-grid]');
  const preview = document.querySelector('[data-gallery-preview]');
  const modal = document.querySelector('[data-modal]');

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

  const card = (item, compact = false) => `
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
          <h3>${escapeHtml(item.title)}</h3>
          <p>${
            compact
              ? '東京カメラ部2026写真展 展示作品'
              : `${escapeHtml(item.location)} / ${escapeHtml(item.author)}`
          }</p>
        </div>
      </button>
    </article>`;

  function setText(selector, value) {
    if (!modal) return;

    const element = modal.querySelector(selector);

    if (element) {
      element.textContent = value ?? '';
    }
  }

  function fillModal(item) {
    if (!modal) return;

    const image = modal.querySelector('[data-modal-image]');

    if (image) {
      image.src = item.image ?? '';
      image.alt = item.title ?? '';
    }

    setText('[data-modal-title]', item.title);
    setText('[data-modal-location]', item.location);
    setText('[data-modal-season]', item.season);
    setText('[data-modal-camera]', item.camera);
    setText('[data-modal-lens]', item.lens);
    setText('[data-modal-settings]', item.settings);
    setText('[data-modal-author]', item.author);
    setText('[data-modal-comment]', item.comment);
  }

  function openById(id) {
    const index = data.findIndex(
      item => Number(item.id) === Number(id)
    );

    if (index < 0 || !modal) return;

    currentIndex = index;

    fillModal(data[currentIndex]);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');

    requestAnimationFrame(() => {
      document.body.style.overflow = 'hidden';
      modal.querySelector('.modal-close')?.focus();
    });
  }

  function closeModal() {
    if (!modal) return;

    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');

    document.body.style.overflow = '';
  }

  function move(step) {
    if (!data.length) return;

    currentIndex =
      (currentIndex + step + data.length) % data.length;

    fillModal(data[currentIndex]);
  }

  function render() {
    if (grid) {
      grid.innerHTML =
        data.map(item => card(item)).join('');
    }

    if (preview) {
      preview.innerHTML =
        data
          .slice(0, 3)
          .map(item => card(item, true))
          .join('');
    }
  }

  async function loadGallery() {
    try {

      const response = await fetch('data/gallery.json', {
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(
          `gallery.json の読み込みに失敗しました (${response.status})`
        );
      }

      const json = await response.json();

      if (!Array.isArray(json)) {
        throw new Error(
          'gallery.json の形式が正しくありません。'
        );
      }

      data = json;

      render();

    } catch (error) {

      console.error(error);

      const message =
        '<p class="section-lead">' +
        '展示作品を読み込めませんでした。' +
        'しばらくしてから再度お試しください。' +
        '</p>';

      if (grid) {
        grid.innerHTML = message;
      }

      if (preview) {
        preview.innerHTML = message;
      }
    }
  }

  document.addEventListener('click', event => {

    const opener =
      event.target.closest('[data-open-photo]');

    if (opener) {
      openById(opener.dataset.openPhoto);
      return;
    }

    if (event.target.closest('[data-modal-close]')) {
      closeModal();
      return;
    }

    if (event.target.closest('[data-modal-prev]')) {
      move(-1);
      return;
    }

    if (event.target.closest('[data-modal-next]')) {
      move(1);
      return;
    }

    if (event.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', event => {

    if (!modal?.classList.contains('open')) {
      return;
    }

    if (event.key === 'Escape') {
      closeModal();
    }

    if (event.key === 'ArrowLeft') {
      move(-1);
    }

    if (event.key === 'ArrowRight') {
      move(1);
    }
  });

  loadGallery();

})();
