(() => {
  const root = document.querySelector('[data-guide-article]');
  if (!root) return;
  if (new URLSearchParams(location.search).get('article') !== 'manner') return;

  const esc = (value = '') => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const nl2br = value => esc(value || '').replace(/\r?\n/g, '<br>');
  const safeUrl = value => { const raw = String(value || '').trim(); return !raw || /^(javascript|data|vbscript):/i.test(raw) ? '' : raw; };
  const icon = name => {
    const common='viewBox="0 0 64 64" aria-hidden="true"';
    const map={
      boat:`<svg ${common}><path d="M10 35h44l-7 12H18L10 35Z"/><path d="M25 35V20h17v15M30 20v-6h8v6M8 50c6 4 12 4 18 0 6 4 12 4 18 0 4 2 8 3 12 2"/></svg>`,
      food:`<svg ${common}><path d="M10 34c10-11 24-14 39-8l7-7-2 14 2 14-7-7c-15 6-29 3-39-8Z"/><circle cx="23" cy="30" r="1.5"/><path d="M30 23v18"/></svg>`,
      sound:`<svg ${common}><path d="M20 39V23l14-8v32L20 39Z"/><path d="M40 24c5 4 5 12 0 16M47 18c9 8 9 20 0 28"/></svg>`,
      water:`<svg ${common}><path d="M8 36c7 5 13 5 20 0s13-5 20 0 8 4 10 3"/><path d="M12 26c7 5 13 5 20 0s13-5 20 0"/><path d="M13 48c7 4 13 4 20 0s13-4 20 0"/></svg>`,
      drone:`<svg ${common}><path d="M22 28h20v12H22zM16 34h32M32 28v-8"/><circle cx="12" cy="25" r="7"/><circle cx="52" cy="25" r="7"/><circle cx="12" cy="45" r="7"/><circle cx="52" cy="45" r="7"/></svg>`
    };
    return map[name] || map.sound;
  };

  const fieldNav = () => `
    <nav class="manner-v1-field-nav" aria-label="PHOTO FIELD GUIDE"><div class="container manner-v1-field-nav-inner">
      <a class="manner-v1-field-brand" href="guide.html">HAMANAKA<small>PHOTO FIELD GUIDE</small></a>
      <div class="manner-v1-field-links"><a href="guide-article.html?article=photo-map">SPOT</a><a href="guide-article.html?article=trip">準備</a><a href="guide-article.html?article=gear">機材</a><a href="guide-article.html?article=technique">テクニック</a><a href="guide-article.html?article=manner" aria-current="page">ルール</a></div>
      <a class="manner-v1-field-spot" href="guide-article.html?article=photo-map">フォトスポットを探す <span aria-hidden="true">●</span></a>
    </div></nav>`;

  const heading = section => `<header class="manner-v2-heading"><p>${esc(section.eyebrow || '')}</p><h2>${esc(section.title || '')}</h2>${section.lead ? `<span>${esc(section.lead)}</span>` : ''}</header>`;

  const renderHero = hero => `
    <section class="manner-v2-hero" ${hero.image ? `style="--manner-v2-hero:url('${esc(hero.image)}')"` : ''}>${fieldNav()}<div class="manner-v2-hero-shade"></div><div class="container manner-v2-hero-inner"><p>${esc(hero.eyebrow || 'RULES')}</p><h1>${nl2br(hero.title || '')}</h1><span>${nl2br(hero.lead || '')}</span></div></section>`;

  const renderOpening = section => `
    <section class="manner-v2-opening"><div class="container"><p>${esc(section.eyebrow || '')}</p><h2>${esc(section.title || '')}</h2><span>${esc(section.text || '')}</span></div></section>`;

  const renderOfficial = section => {
    const url = safeUrl(section.url);
    return `<section class="manner-v2-section" id="manner-official"><div class="container">${heading(section)}<div class="manner-v2-rule-list">${(section.rules || []).map(rule => `<article><span>${esc(rule.number || '')}</span><div class="manner-v2-rule-icon">${icon(rule.icon)}</div><div><h3>${esc(rule.title || '')}</h3><p>${esc(rule.text || '')}</p></div></article>`).join('')}</div>${url ? `<a class="manner-v2-official-link" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(section.buttonLabel || '詳しいルールを見る')} ↗</a>` : ''}</div></section>`;
  };

  const renderSafety = section => `
    <section class="manner-v2-section is-soft" id="manner-safety"><div class="container">${heading(section)}<div class="manner-v2-safety-grid">${(section.items || []).map((item,index) => `<article><span>0${index+1}</span><h3>${esc(item.title || '')}</h3><p>${esc(item.text || '')}</p></article>`).join('')}</div></div></section>`;

  const renderMessage = section => `
    <section class="manner-v2-message"><div class="container"><p>${esc(section.eyebrow || '')}</p><h2>${esc(section.title || '')}</h2><span>${esc(section.text || '')}</span></div></section>`;

  const renderNext = section => `
    <section class="manner-v2-next" ${section.image ? `style="--manner-v2-next:url('${esc(section.image)}')"` : ''}><div class="manner-v2-next-shade"></div><div class="container manner-v2-next-inner"><div><p>${esc(section.eyebrow || '')}</p><h2>${esc(section.title || '')}</h2><span>${esc(section.text || '')}</span></div><div class="manner-v2-next-links">${(section.links || []).map(item => { const url=safeUrl(item.url); return url ? `<a href="${esc(url)}"><small>${esc(item.sub || '')}</small><b>${esc(item.label || '')}</b><i>→</i></a>` : ''; }).join('')}</div></div></section>`;

  const renderPage = data => {
    document.body.classList.add('manner-page','manner-v2-page');
    document.title='撮影ルール・マナー｜HAMANAKA PHOTO GUIDE';
    root.innerHTML=`${renderHero(data.hero || {})}${renderOpening(data.opening || {})}${renderOfficial(data.officialRules || {})}${renderSafety(data.safety || {})}${renderMessage(data.message || {})}${renderNext(data.next || {})}`;
  };

  fetch('data/manner.json',{cache:'no-cache'}).then(response=>{if(!response.ok)throw new Error('manner load failed');return response.json();}).then(renderPage).catch(error=>{console.error(error);root.innerHTML='<section class="section"><div class="container"><h1>ルール編</h1><p>ページを読み込めませんでした。</p></div></section>';});
})();
