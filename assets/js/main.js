(() => {
  let selectionsRequest;
  window.HAMANAKA_SELECTION_RELEASE = {
    load() {
      selectionsRequest ||= fetch('data/selections.json', { cache: 'no-store' })
        .then(response => {
          if (!response.ok) throw new Error('フォトセレクションを読み込めませんでした。');
          return response.json();
        });
      return selectionsRequest;
    },
    isPublished(selection, now = Date.now()) {
      if (!selection?.publishAt) return true;
      const releaseAt = Date.parse(selection.publishAt);
      return Number.isFinite(releaseAt) && now >= releaseAt;
    },
    formatDate(selection) {
      const releaseAt = new Date(selection.publishAt);
      if (Number.isNaN(releaseAt.getTime())) return '準備が整い次第';
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat('ja-JP', {
          timeZone: 'Asia/Tokyo',
          year: 'numeric', month: 'numeric', day: 'numeric',
          hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        }).formatToParts(releaseAt).map(part => [part.type, part.value])
      );
      return `${parts.year}年${parts.month}月${parts.day}日${parts.hour}:${parts.minute}`;
    },
    onRelease(selection, callback) {
      const releaseAt = Date.parse(selection?.publishAt);
      if (!Number.isFinite(releaseAt) || releaseAt <= Date.now()) return;
      const wait = () => {
        const remaining = releaseAt - Date.now();
        if (remaining <= 0) callback();
        else window.setTimeout(wait, Math.min(remaining, 2147483647));
      };
      wait();
    }
  };

  const menuButton = document.querySelector('.menu-button');
  const nav = document.querySelector('.site-nav');

  const guideItems = [
    {
      number: '01',
      label: '撮影スポット',
      sub: 'スポット',
      url: 'guide-article.html?article=photo-map'
    },
    {
      number: '02',
      label: '準備',
      sub: 'PREPARATION',
      url: 'guide-article.html?article=trip'
    },
    {
      number: '03',
      label: '機材',
      sub: 'GEAR',
      url: 'guide-article.html?article=gear'
    },
    {
      number: '04',
      label: 'テクニック',
      sub: 'TECHNIQUE',
      url: 'guide-article.html?article=technique'
    },
    {
      number: '05',
      label: 'ルール',
      sub: 'RULES',
      url: 'guide-article.html?article=manner'
    },
    {
      number: '06',
      label: 'ガイドブック',
      sub: 'GUIDEBOOK',
      url: 'https://photo.hamanaka-life.com/guide.html#:~:text=ガイドブックを持っていく'
    }
  ];

  const ensureGuideDropdown = () => {
    if (!nav || nav.querySelector('[data-guide-jump-menu]')) return;

    const guideLink = [...nav.querySelectorAll(':scope > a')]
      .find(link => {
        const href = link.getAttribute('href') || '';
        return href === 'guide.html' || link.textContent.trim() === '撮りに行く';
      });

    if (!guideLink) return;

    const wrap = document.createElement('div');
    wrap.className = 'site-nav-guide-wrap';
    wrap.dataset.guideJumpMenu = '';

    guideLink.parentNode.insertBefore(wrap, guideLink);
    wrap.appendChild(guideLink);
    guideLink.classList.add('site-nav-guide-trigger');
    guideLink.setAttribute('aria-haspopup', 'true');

    const dropdown = document.createElement('div');
    dropdown.className = 'site-nav-guide-dropdown';
    dropdown.setAttribute('aria-label', '撮りに行くメニュー');

    dropdown.innerHTML = guideItems.map(item => `
      <a href="${item.url}">
        <span>${item.number}</span>
        <div>
          <small>${item.sub}</small>
          <b>${item.label}</b>
        </div>
      </a>
    `).join('');

    wrap.appendChild(dropdown);

    if (!document.getElementById('site-guide-jump-style')) {
      const style = document.createElement('style');
      style.id = 'site-guide-jump-style';
      style.textContent = `
        .site-nav-guide-wrap {
          position: relative;
          align-self: stretch;
          display: flex;
          align-items: center;
        }

        .site-nav-guide-trigger {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .site-nav-guide-trigger::after {
          content: "⌄";
          margin-left: 6px;
          font-size: 12px;
          opacity: .72;
        }

        .site-nav-guide-dropdown {
          position: absolute;
          top: calc(100% - 3px);
          left: 50%;
          z-index: 100;
          display: grid;
          grid-template-columns: 1fr 1fr;
          width: 390px;
          padding: 10px;
          border: 1px solid rgba(255,255,255,.12);
          border-radius: 11px;
          background: rgba(13, 42, 61, .98);
          box-shadow: 0 18px 45px rgba(5, 25, 38, .25);
          opacity: 0;
          visibility: hidden;
          transform: translate(-50%, 8px);
          transition:
            opacity .18s ease,
            visibility .18s ease,
            transform .18s ease;
        }

        .site-nav-guide-wrap:hover .site-nav-guide-dropdown,
        .site-nav-guide-wrap:focus-within .site-nav-guide-dropdown {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0);
        }

        .site-nav-guide-dropdown > a {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 9px;
          align-items: center;
          min-height: 60px;
          padding: 9px 10px;
          border-radius: 7px;
          color: #fff;
          opacity: 1;
        }

        .site-nav-guide-dropdown > a:hover,
        .site-nav-guide-dropdown > a:focus-visible {
          background: rgba(255,255,255,.10);
        }

        .site-nav-guide-dropdown > a > span {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border: 1px solid rgba(255,255,255,.24);
          border-radius: 50%;
          color: #b8ded5;
          font-size: 12px;
          font-weight: 900;
        }

        .site-nav-guide-dropdown small {
          display: block;
          color: #9ebbc4;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: .08em;
        }

        .site-nav-guide-dropdown b {
          display: block;
          margin-top: 2px;
          font-size: 14px;
        }

        @media (max-width: 820px) {
          .site-nav-guide-wrap {
            display: block;
            width: 100%;
          }

          .site-nav-guide-trigger {
            height: auto;
          }

          .site-nav-guide-dropdown {
            position: static;
            grid-template-columns: 1fr 1fr;
            width: 100%;
            margin-top: 8px;
            padding: 7px;
            border-color: rgba(255,255,255,.08);
            box-shadow: none;
            opacity: 1;
            visibility: visible;
            transform: none;
            background: rgba(255,255,255,.06);
          }

          .site-nav-guide-dropdown > a {
            min-height: 52px;
          }
        }
      `;
      document.head.appendChild(style);
    }
  };

  ensureGuideDropdown();

  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menuButton.setAttribute('aria-expanded', 'false');
      });
    });
  }
})();
