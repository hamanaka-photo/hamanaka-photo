(() => {
  const articleId = new URLSearchParams(location.search).get('article');

  const sequence = [
    {
      id: 'photo-map',
      number: '01',
      sub: 'SPOT',
      label: '撮影スポット',
      url: 'guide-article.html?article=photo-map'
    },
    {
      id: 'trip',
      number: '02',
      sub: 'PREPARATION',
      label: '準備',
      url: 'guide-article.html?article=trip'
    },
    {
      id: 'gear',
      number: '03',
      sub: 'GEAR',
      label: '機材',
      url: 'guide-article.html?article=gear'
    },
    {
      id: 'technique',
      number: '04',
      sub: 'TECHNIQUE',
      label: 'テクニック',
      url: 'guide-article.html?article=technique'
    },
    {
      id: 'manner',
      number: '05',
      sub: 'RULES',
      label: 'ルール',
      url: 'guide-article.html?article=manner'
    }
  ];

  if (!sequence.some(item => item.id === articleId)) return;

  const root = document.querySelector('[data-guide-article]');
  if (!root) return;

  document.body.classList.add('field-guide-unified-page');

  const selectors = {
    'photo-map': {
      hero: '.photo-map-hero',
      nav: '.field-guide-nav'
    },
    trip: {
      hero: '.trip-hero',
      nav: '.trip-field-guide-nav'
    },
    gear: {
      hero: '.gear-v2-hero',
      nav: '.gear-v2-field-nav'
    },
    technique: {
      hero: '.tech-v2-hero',
      nav: '.tech-v1-field-nav'
    },
    manner: {
      hero: '.manner-v2-hero',
      nav: '.manner-v1-field-nav'
    }
  };

  const spotButtonSelectors = [
    '.field-guide-spot-button',
    '.gear-v2-field-spot',
    '.tech-v1-field-spot',
    '.manner-v1-field-spot'
  ].join(',');

  const createSequenceNav = () => {
    if (root.querySelector('.field-guide-sequence')) return;

    const currentIndex = sequence.findIndex(item => item.id === articleId);
    if (currentIndex < 0) return;

    const previous = sequence[currentIndex - 1];
    const next = sequence[currentIndex + 1];

    const card = (item, direction) => {
      if (!item) return '';
      const arrow = direction === 'prev' ? '←' : '→';
      const label = direction === 'prev' ? 'PREVIOUS' : 'NEXT';

      return `
        <a class="field-guide-sequence-card is-${direction}" href="${item.url}">
          <span>${arrow} ${label}</span>
          <small>${item.number} / ${item.sub}</small>
          <b>${item.label}</b>
        </a>
      `;
    };

    const nav = document.createElement('nav');
    nav.className = [
      'field-guide-sequence',
      !previous ? 'is-next-only' : '',
      !next ? 'is-prev-only' : ''
    ].filter(Boolean).join(' ');
    nav.setAttribute('aria-label', 'フォトガイド前後の記事');

    nav.innerHTML = `
      <div class="container field-guide-sequence-inner">
        ${card(previous, 'prev')}
        ${card(next, 'next')}
      </div>
    `;

    root.appendChild(nav);
  };

  const enhance = () => {
    const setting = selectors[articleId] || {};
    const hero = root.querySelector(setting.hero);
    const nav = root.querySelector(setting.nav);

    if (!hero) return;

    hero.classList.add('field-guide-unified-hero');

    if (nav) {
      nav.classList.add('field-guide-unified-nav');

      nav.querySelectorAll(spotButtonSelectors).forEach(button => {
        button.remove();
      });

      if (!hero.contains(nav)) {
        hero.insertBefore(nav, hero.firstChild);
      }
    }

    createSequenceNav();
  };

  enhance();

  const observer = new MutationObserver(() => enhance());
  observer.observe(root, {
    childList: true,
    subtree: false
  });

  window.setTimeout(enhance, 250);
  window.setTimeout(enhance, 800);
})();
