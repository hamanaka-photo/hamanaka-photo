(() => {
  const currentYear = new Date().getFullYear();

  const footerMarkup = `
    <div class="container footer-grid footer-sitemap">
      <div class="footer-brand">
        <a href="index.html" class="footer-brand-link">HAMANAKA PHOTO</a>
        <small>写真で出会う、浜中町。</small>
        <p class="footer-brand-copy">
          写真を入口に、浜中町を知り、訪れ、撮り、つながるためのフォトポータル。
        </p>
      </div>

      <div class="footer-col">
        <h2><a href="introduction.html">INTRODUCTION</a></h2>
        <a href="introduction.html">浜中町を知る</a>
      </div>

      <div class="footer-col">
        <h2><a href="gallery.html">GALLERY</a></h2>
        <a href="gallery.html">フォトギャラリー</a>
        <a href="gallery.html?selection=tokyo-camera-club-2026">東京カメラ部2026写真展</a>
        <a href="gallery.html#author">撮影者紹介</a>
      </div>

      <div class="footer-col">
        <h2><a href="guide.html">PHOTO GUIDE</a></h2>
        <a href="guide-article.html?article=photo-map">撮影スポット</a>
        <a href="guide-article.html?article=trip">撮影旅行の準備</a>
        <a href="guide-article.html?article=gear">カメラ・レンズ</a>
        <a href="guide-article.html?article=technique">撮影テクニック</a>
        <a href="guide-article.html?article=manner">撮影ルール・マナー</a>
      </div>

      <div class="footer-col">
        <h2><a href="project.html">PROJECT</a></h2>
        <a href="project.html">写真の取り組み</a>
        <a href="project.html#contest">フォトコンテスト</a>
      </div>

      <div class="footer-col">
        <h2><a href="about.html">ABOUT</a></h2>
        <a href="about.html">このサイトについて</a>
        <a href="https://www.townhamanaka.jp/" target="_blank" rel="noopener">浜中町公式サイト ↗</a>
        <a href="https://www.instagram.com/hamanaka.town.official/" target="_blank" rel="noopener">浜中町公式Instagram ↗</a>
        <a href="https://www.facebook.com/hamanaka.town.official/" target="_blank" rel="noopener">浜中町公式Facebook ↗</a>
        <a href="https://www.hamanaka-life.com/" target="_blank" rel="noopener">HAMANAKA LIFE ↗</a>
      </div>
    </div>

    <div class="container copyright">
      © <span data-year>${currentYear}</span> Hamanaka Town. All rights reserved.
    </div>
  `;

  const footerStyle = `
    .site-footer .footer-sitemap {
      grid-template-columns: minmax(210px, 1.4fr) repeat(5, minmax(120px, 1fr));
      gap: 28px;
      align-items: start;
    }

    .site-footer .footer-brand {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 7px;
    }

    .site-footer .footer-brand-link {
      color: var(--navy);
      font-weight: 800;
      letter-spacing: .1em;
    }

    .site-footer .footer-brand small {
      display: block;
      font-size: 12px;
      letter-spacing: .04em;
    }

    .site-footer .footer-brand-copy {
      max-width: 230px;
      margin: 10px 0 0;
      color: #728593;
      font-size: 12px;
      line-height: 1.8;
      letter-spacing: 0;
      font-weight: 400;
    }

    .site-footer .footer-col h2 a {
      color: var(--navy);
      font-size: 14px;
      font-weight: 800;
      letter-spacing: .04em;
    }

    .site-footer .footer-col > a {
      color: #5e7484;
      line-height: 1.55;
    }

    .site-footer .footer-col > a:hover,
    .site-footer .footer-col h2 a:hover,
    .site-footer .footer-brand-link:hover {
      color: var(--blue);
    }

    @media (max-width: 1100px) {
      .site-footer .footer-sitemap {
        grid-template-columns: 1.4fr repeat(3, 1fr);
      }

      .site-footer .footer-brand {
        grid-row: span 2;
      }
    }

    @media (max-width: 760px) {
      .site-footer .footer-sitemap {
        grid-template-columns: 1fr 1fr;
        gap: 28px 22px;
      }

      .site-footer .footer-brand {
        grid-column: 1 / -1;
        grid-row: auto;
      }

      .site-footer .footer-brand-copy {
        max-width: 420px;
      }
    }

    @media (max-width: 480px) {
      .site-footer .footer-sitemap {
        grid-template-columns: 1fr;
      }

      .site-footer .footer-brand {
        grid-column: auto;
      }

      .site-footer .footer-col {
        padding-top: 2px;
        border-top: 1px solid rgba(21, 58, 91, .10);
      }

      .site-footer .footer-col h2 {
        margin-top: 14px;
      }
    }
  `;

  document.querySelectorAll('.site-footer').forEach(footer => {
    footer.innerHTML = footerMarkup;
  });

  if (!document.getElementById('footer-sitemap-style')) {
    const style = document.createElement('style');
    style.id = 'footer-sitemap-style';
    style.textContent = footerStyle;
    document.head.appendChild(style);
  }

  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = currentYear;
  });
})();
