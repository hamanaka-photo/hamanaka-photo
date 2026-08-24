(() => {
  const data = window.HAMANAKA_GALLERY || [];
  const grid = document.querySelector('[data-gallery-grid]');
  const preview = document.querySelector('[data-gallery-preview]');
  const modal = document.querySelector('[data-modal]');
  let currentIndex = 0;

  const card = (item, compact = false) => `
    <article class="photo-card">
      <button type="button" data-open-photo="${item.id}" aria-label="${item.title}を開く">
        <img class="photo-thumb" src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="photo-meta">
          <h3>${item.title}</h3>
          <p>${compact ? '東京カメラ部2026写真展 展示作品' : `${item.location} / ${item.author}`}</p>
        </div>
      </button>
    </article>`;

  if (grid) grid.innerHTML = data.map(item => card(item)).join('');
  if (preview) preview.innerHTML = data.slice(0, 3).map(item => card(item, true)).join('');

  function fillModal(item) {
    if (!modal) return;
    modal.querySelector('[data-modal-image]').src = item.image;
    modal.querySelector('[data-modal-image]').alt = item.title;
    modal.querySelector('[data-modal-title]').textContent = item.title;
    modal.querySelector('[data-modal-location]').textContent = item.location;
    modal.querySelector('[data-modal-season]').textContent = item.season;
    modal.querySelector('[data-modal-camera]').textContent = item.camera;
    //modal.querySelector('[data-modal-lens]').textContent = item.lens;
    modal.querySelector('[data-modal-settings]').textContent = item.settings;
    modal.querySelector('[data-modal-author]').textContent = item.author;
    modal.querySelector('[data-modal-comment]').textContent = item.comment;
  }

  function openById(id) {
    const index = data.findIndex(item => item.id === Number(id));
    if (index < 0 || !modal) return;
    currentIndex = index;
    fillModal(data[currentIndex]);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-close').focus();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function move(step) {
    currentIndex = (currentIndex + step + data.length) % data.length;
    fillModal(data[currentIndex]);
  }

  document.addEventListener('click', event => {
    const opener = event.target.closest('[data-open-photo]');
    if (opener) openById(opener.dataset.openPhoto);

    if (event.target.closest('[data-modal-close]')) closeModal();
    if (event.target.closest('[data-modal-prev]')) move(-1);
    if (event.target.closest('[data-modal-next]')) move(1);
    if (event.target === modal) closeModal();
  });

  document.addEventListener('keydown', event => {
    if (!modal?.classList.contains('open')) return;
    if (event.key === 'Escape') closeModal();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
})();
