(() => {
  const articleId = new URLSearchParams(location.search).get('article');

  const sequence = [
    { id: 'photo-map', number: '01', sub: 'スポット', label: '撮影スポット', url: 'guide-article.html?article=photo-map' },
    { id: 'trip', number: '02', sub: 'PREPARATION', label: '準備', url: 'guide-article.html?article=trip' },
    { id: 'gear', number: '03', sub: 'GEAR', label: '機材', url: 'guide-article.html?article=gear' },
    { id: 'technique', number: '04', sub: 'TECHNIQUE', label: 'テクニック', url: 'guide-article.html?article=technique' },
    { id: 'manner', number: '05', sub: 'RULES', label: 'ルール', url: 'guide-article.html?article=manner' }
  ];

  if (!sequence.some(item => item.id === articleId)) return;

  const root = document.querySelector('[data-guide-article]');
  if (!root) return;

  document.body.classList.add('field-guide-unified-page');

  const selectors = {
    'photo-map': { hero: '.photo-map-hero', nav: '.field-guide-nav' },
    trip: { hero: '.trip-hero', nav: '.trip-field-guide-nav' },
    gear: { hero: '.gear-v2-hero', nav: '.gear-v2-field-nav' },
    technique: { hero: '.tech-v2-hero', nav: '.tech-v1-field-nav' },
    manner: { hero: '.manner-v2-hero', nav: '.manner-v1-field-nav' }
  };

  const spotButtonSelectors = [
    '.field-guide-spot-button',
    '.gear-v2-field-spot',
    '.tech-v1-field-spot',
    '.manner-v1-field-spot'
  ].join(',');

  const guidebookUrl = 'https://photo.hamanaka-life.com/guide.html#:~:text=%E3%82%AC%E3%82%A4%E3%83%89%E3%83%96%E3%83%83%E3%82%AF%E3%82%92%E6%8C%81%E3%81%A3%E3%81%A6%E3%81%84%E3%81%8F';

  const updateStickyOffsets = nav => {
    const siteHeader = document.querySelector('.site-header');
    const headerHeight = Math.ceil(siteHeader?.getBoundingClientRect().height || 72);
    const navHeight = Math.ceil(nav?.getBoundingClientRect().height || 76);
    document.body.style.setProperty('--fgu-site-header-height', `${headerHeight}px`);
    document.body.style.setProperty('--fgu-article-nav-height', `${navHeight}px`);
  };

  const injectAdjustments = () => {
    if (document.getElementById('field-guide-requested-adjustments')) return;
    const style = document.createElement('style');
    style.id = 'field-guide-requested-adjustments';
    style.textContent = `
      .field-guide-guidebook-link { white-space: nowrap; }

      /* GEAR: lens list and selected visual use the same height */
      @media (min-width: 1051px) {
        .gear-v8-lens-layout { align-items: stretch !important; }
        .gear-v8-selected-preview {
          position: relative !important;
          top: auto !important;
          align-self: stretch !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column;
        }
        .gear-v8-selected-image {
          flex: 1 1 auto;
          min-height: 250px;
          height: auto !important;
        }
        .gear-v8-selected-copy { flex: 0 0 auto; }
      }

      /* TECHNIQUE: video is intentionally marked as coming soon */
      .tech-video-coming-soon {
        display: grid;
        place-items: center;
        min-height: 360px;
        padding: 42px 24px;
        border: 1px solid #dbe5e8;
        border-radius: 14px;
        color: #153a5b;
        text-align: center;
        background: linear-gradient(145deg,#f4f8f9,#eaf2f5);
      }
      .tech-video-coming-soon small {
        color: #397b70;
        font-weight: 900;
        letter-spacing: .12em;
      }
      .tech-video-coming-soon strong {
        display: block;
        margin-top: 12px;
        font-size: clamp(26px,3vw,38px);
      }
      .tech-video-coming-soon p {
        max-width: 620px;
        margin: 12px 0 0;
        color: #687b87;
        line-height: 1.9;
      }

      /* RULES: 3 cards on first row, 2 cards on second row */
      @media (min-width: 901px) {
        .manner-v2-rule-list {
          display: grid !important;
          grid-template-columns: repeat(6,minmax(0,1fr)) !important;
          gap: 16px !important;
        }
        .manner-v2-rule-list article {
          grid-column: span 2;
          display: grid !important;
          grid-template-columns: 1fr !important;
          grid-template-rows: auto auto 1fr;
          justify-items: center;
          align-content: start;
          min-height: 330px !important;
          padding: 26px 22px !important;
          text-align: center;
        }
        .manner-v2-rule-list article:nth-child(4),
        .manner-v2-rule-list article:nth-child(5) { grid-column: span 3; }
        .manner-v2-rule-list article > span { margin-bottom: 12px; }
        .manner-v2-rule-icon {
          width: 112px !important;
          height: 112px !important;
          margin-bottom: 14px;
        }
        .manner-v2-rule-icon img {
          width: 104px !important;
          height: 104px !important;
        }
        .manner-v2-rule-list h3 { font-size: 18px !important; }
        .manner-v2-rule-list p { max-width: 430px; margin-left:auto; margin-right:auto; }
      }
      @media (min-width: 621px) and (max-width: 900px) {
        .manner-v2-rule-list { grid-template-columns: repeat(2,minmax(0,1fr)) !important; }
        .manner-v2-rule-list article { display:block; text-align:center; }
      }
    `;
    document.head.appendChild(style);
  };

  const addGuidebookLink = nav => {
    if (!nav || nav.querySelector('.field-guide-guidebook-link')) return;

    const links = nav.querySelector(
      '.field-guide-links, .trip-field-guide-links, .gear-v2-field-links, .tech-v1-field-links, .manner-v1-field-links'
    );
    if (!links) return;

    const link = document.createElement('a');
    link.className = 'field-guide-guidebook-link';
    link.href = guidebookUrl;
    link.textContent = 'ガイドブック';
    links.appendChild(link);
  };

  const setGearDefaultTo300 = () => {
    if (articleId !== 'gear' || root.dataset.defaultFocalAdjusted === 'true') return;
    const buttons = [...root.querySelectorAll('[data-focal-button]')];
    const target = buttons.find(button => button.textContent.replace(/\s+/g, '').startsWith('300mm'));
    if (!target) return;
    root.dataset.defaultFocalAdjusted = 'true';
    target.click();
  };

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
        </a>`;
    };

    const nav = document.createElement('nav');
    nav.className = ['field-guide-sequence', !previous ? 'is-next-only' : '', !next ? 'is-prev-only' : ''].filter(Boolean).join(' ');
    nav.setAttribute('aria-label', 'フォトガイド前後の記事');
    nav.innerHTML = `<div class="container field-guide-sequence-inner">${card(previous, 'prev')}${card(next, 'next')}</div>`;
    root.appendChild(nav);
  };

  const enhance = () => {
    injectAdjustments();
    const setting = selectors[articleId] || {};
    const hero = root.querySelector(setting.hero);
    const nav = root.querySelector(setting.nav) || document.querySelector(`[data-field-guide-sticky="${articleId}"]`);
    if (!hero) return;

    hero.classList.add('field-guide-unified-hero');

    if (nav) {
      nav.classList.add('field-guide-unified-nav');
      nav.dataset.fieldGuideSticky = articleId;
      nav.querySelectorAll(spotButtonSelectors).forEach(button => button.remove());
      addGuidebookLink(nav);
      if (nav.previousElementSibling !== hero) hero.insertAdjacentElement('afterend', nav);
      updateStickyOffsets(nav);
    }

    setGearDefaultTo300();
    createSequenceNav();
  };

  enhance();
  const observer = new MutationObserver(() => enhance());
  observer.observe(root, { childList: true, subtree: true });
  window.setTimeout(enhance, 100);
  window.setTimeout(enhance, 350);
  window.setTimeout(enhance, 900);
  window.addEventListener('resize', () => {
    updateStickyOffsets(document.querySelector(`[data-field-guide-sticky="${articleId}"]`));
  }, { passive: true });
})();
