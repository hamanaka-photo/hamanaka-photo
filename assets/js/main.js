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
      label: '撮影スポットを探す',
      sub: 'PHOTO MAP',
      url: 'guide-article.html?article=photo-map'
    },
    {
      number: '02',
      label: '撮影旅行の準備',
      sub: 'PREPARATION',
      url: 'guide-article.html?article=trip'
    },
    {
      number: '03',
      label: 'ラッコ撮影のヒント',
      sub: 'OTTER GUIDE',
      children: [
        { label: '撮影機材を選ぶ', url: 'guide-article.html?article=gear' },
        { label: '撮り方・設定', url: 'guide-article.html?article=technique' }
      ]
    },
    {
      number: '04',
      label: '撮影時のルール・マナー',
      sub: 'MANNER',
      url: 'guide-article.html?article=manner'
    },
    {
      number: 'PDF',
      label: 'ガイドブック',
      sub: 'PHOTO GUIDE BOOK',
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

    dropdown.innerHTML = guideItems.map(item => item.children ? `
      <div class="site-nav-guide-group" aria-label="${item.label}">
        <div class="site-nav-guide-group-heading">
          <span>${item.number}</span>
          <div><small>${item.sub}</small><b>${item.label}</b></div>
        </div>
        <div class="site-nav-guide-children">
          ${item.children.map(child => `<a href="${child.url}">${child.label} →</a>`).join('')}
        </div>
      </div>
    ` : `
      <a href="${item.url}"${item.number === 'PDF' ? ' class="site-nav-guide-book"' : ''}>
        <span>${item.number}</span>
        <div><small>${item.sub}</small><b>${item.label}</b></div>
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
          grid-template-columns: 1fr;
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

        .site-nav-guide-group {
          padding: 8px 10px 11px;
          border-top: 1px solid rgba(255,255,255,.12);
          border-bottom: 1px solid rgba(255,255,255,.12);
        }

        .site-nav-guide-group-heading {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 9px;
          align-items: center;
          color: #fff;
        }

        .site-nav-guide-children {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          margin: 9px 0 0 43px;
        }

        .site-nav-guide-children a {
          display: flex;
          align-items: center;
          min-height: 42px;
          padding: 8px 10px;
          border-radius: 6px;
          color: #fff;
          background: rgba(255,255,255,.08);
          font-size: 13px;
          font-weight: 700;
        }

        .site-nav-guide-children a:hover,
        .site-nav-guide-children a:focus-visible {
          background: rgba(255,255,255,.16);
        }

        .site-nav-guide-book {
          border-top: 1px solid rgba(255,255,255,.12);
        }

        .site-nav-guide-dropdown > a:hover,
        .site-nav-guide-dropdown > a:focus-visible {
          background: rgba(255,255,255,.10);
        }

        .site-nav-guide-dropdown > a > span,
        .site-nav-guide-group-heading > span {
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

        @media (max-width: 900px) {
          .site-nav-guide-wrap {
            display: block;
            width: 100%;
            align-self: auto;
          }

          .site-nav-guide-trigger {
            height: auto;
          }

          .site-nav-guide-dropdown {
            position: static;
            top: auto;
            left: auto;
            grid-template-columns: 1fr;
            width: 100%;
            margin-top: 8px;
            padding: 7px;
            border-color: rgba(255,255,255,.08);
            box-shadow: none;
            opacity: 1;
            visibility: visible;
            transform: none;
            transition: none;
            background: rgba(255,255,255,.06);
          }

          .site-nav-guide-wrap:hover .site-nav-guide-dropdown,
          .site-nav-guide-wrap:focus-within .site-nav-guide-dropdown {
            transform: none;
          }

          .site-nav-guide-dropdown > a {
            min-height: 52px;
          }
        }

        @media (max-width: 480px) {
          .site-nav-guide-children a {
            padding-inline: 8px;
            font-size: 12px;
            white-space: nowrap;
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
