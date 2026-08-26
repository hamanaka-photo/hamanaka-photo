(() => {
  const titleElements = document.querySelectorAll(
    '[data-home-selection-title]'
  );

  const linkElements = document.querySelectorAll(
    '[data-home-selection-link]'
  );

  const card = document.querySelector(
    '[data-home-selection-card]'
  );

  async function loadCurrentSelection() {
    try {
      const response = await fetch('data/selections.json');

      if (!response.ok) {
        throw new Error(
          `selections.json の読み込みに失敗しました (${response.status})`
        );
      }

      const selections = await response.json();

      if (!Array.isArray(selections) || selections.length === 0) {
        throw new Error('selections.json の形式が正しくありません。');
      }

      const current =
        selections.find(
          item => String(item.status).toLowerCase() === 'current'
        ) || selections[0];

      const displayTitle =
        current.shortTitle ||
        current.title ||
        '現在のフォトセレクション';

      const selectionUrl =
        `gallery.html?selection=${encodeURIComponent(current.id)}`;

      titleElements.forEach(element => {
        element.textContent = displayTitle;
      });

      linkElements.forEach(element => {
        element.href = selectionUrl;
      });

      if (card && current.cover) {
        card.style.backgroundImage = `url("${current.cover}")`;
      }

    } catch (error) {
      console.error(error);
    }
  }

  loadCurrentSelection();
})();
