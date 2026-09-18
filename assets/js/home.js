(() => {
  const titleElements = document.querySelectorAll(
    '[data-home-selection-title]'
  );

  const linkElements = document.querySelectorAll(
    '[data-home-selection-link]'
  );

  const release = window.HAMANAKA_SELECTION_RELEASE;
  const releaseNote = document.querySelector('[data-exhibition-before]');
  const exhibitionLink = document.querySelector('[data-exhibition-after]');
  const exhibitionNews = document.querySelector('[data-exhibition-news]');
  const selectionStatus = document.querySelector('[data-home-selection-status]');

  function renderSelection(current) {
    const published = release.isPublished(current);
    const displayTitle = published
      ? current.shortTitle || current.title || '現在のフォトセレクション'
      : `${release.formatDate(current)}公開予定`;
    const selectionUrl = published
      ? `gallery.html?selection=${encodeURIComponent(current.id)}`
      : 'gallery.html';

    titleElements.forEach(element => { element.textContent = displayTitle; });
    linkElements.forEach(element => { element.href = selectionUrl; });
    if (selectionStatus) {
      selectionStatus.textContent = published ? 'CURRENT SELECTION' : 'COMING SOON';
    }
    if (releaseNote) {
      releaseNote.textContent = `${release.formatDate(current)}公開予定`;
      releaseNote.hidden = published;
    }
    if (exhibitionLink) exhibitionLink.hidden = !published;
    if (exhibitionNews) exhibitionNews.hidden = !published;
  }

  async function loadCurrentSelection() {
    try {
      const selections = await release.load();

      if (!Array.isArray(selections) || selections.length === 0) {
        throw new Error('selections.json の形式が正しくありません。');
      }

      const current =
        selections.find(
          item => String(item.status).toLowerCase() === 'current'
        ) || selections[0];

      renderSelection(current);
      release.onRelease(current, () => renderSelection(current));

    } catch (error) {
      console.error(error);
    }
  }

  loadCurrentSelection();
})();
