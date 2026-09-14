(() => {
  const root = document.querySelector('[data-about-page]');
  if (!root) return;
  const esc = (v='') => String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const nl2br = v => esc(v||'').replace(/\r?\n/g,'<br>');
  const safeUrl = v => { const s=String(v||'').trim(); return (!s||/^(javascript|data|vbscript):/i.test(s))?'':s; };
  const text=(sel,v)=>{const e=document.querySelector(sel);if(e&&v!==undefined&&v!==null)e.textContent=String(v)};
  const html=(sel,v)=>{const e=document.querySelector(sel);if(e&&v!==undefined&&v!==null)e.innerHTML=nl2br(v)};
  const cards=(sel,items=[])=>{const e=document.querySelector(sel);if(!e||!Array.isArray(items))return;e.innerHTML=items.map(i=>`<article class="about-policy-card"><h3>${esc(i.title||'')}</h3><p>${esc(i.text||'')}</p></article>`).join('')};
  const render=data=>{
    if(data.seo?.title) document.title=data.seo.title;
    const meta=document.querySelector('meta[name="description"]'); if(meta&&data.seo?.description)meta.content=data.seo.description;
    const h=data.hero||{};text('[data-about-hero-eyebrow]',h.eyebrow);html('[data-about-hero-title]',h.title);html('[data-about-hero-lead]',h.lead);const hi=document.querySelector('[data-about-hero-image]');if(hi&&h.image)hi.style.backgroundImage=`url("${String(h.image).replace(/"/g,'%22')}")`;
    const o=data.overview||{};text('[data-about-overview-eyebrow]',o.eyebrow);html('[data-about-overview-title]',o.title);const oc=document.querySelector('[data-about-overview-copy]');if(oc&&Array.isArray(o.paragraphs))oc.innerHTML=o.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('');
    const op=data.operator||{};text('[data-about-operator-eyebrow]',op.eyebrow);text('[data-about-operator-title]',op.title);text('[data-about-operator-lead]',op.lead);text('[data-about-operator-primary-title]',op.primaryTitle);text('[data-about-operator-primary-text]',op.primaryText);text('[data-about-operator-collab-title]',op.collaborationTitle);text('[data-about-operator-collab-text]',op.collaborationText);
    const r=data.rights||{};text('[data-about-rights-eyebrow]',r.eyebrow);text('[data-about-rights-title]',r.title);text('[data-about-rights-lead]',r.lead);text('[data-about-rights-notice-title]',r.noticeTitle);text('[data-about-rights-notice-text]',r.noticeText);cards('[data-about-rights-items]',r.items);
    const t=data.terms||{};text('[data-about-terms-eyebrow]',t.eyebrow);text('[data-about-terms-title]',t.title);cards('[data-about-terms-items]',t.items);
    const c=data.contact||{};text('[data-about-contact-eyebrow]',c.eyebrow);text('[data-about-contact-title]',c.title);text('[data-about-contact-lead]',c.lead);text('[data-about-contact-organization]',c.organization);text('[data-about-contact-section]',c.section);text('[data-about-contact-phone-note]',c.phoneNote?`（${c.phoneNote}）`:'');text('[data-about-contact-note]',c.note);
    const ph=document.querySelector('[data-about-contact-phone]');if(ph&&c.phone){ph.textContent=c.phone;ph.href=`tel:${String(c.phone).replace(/[^0-9+]/g,'')}`}
    const em=document.querySelector('[data-about-contact-email]');if(em&&c.email){em.textContent=c.email;em.href=`mailto:${c.email}`}
    const l=data.links||{};text('[data-about-links-eyebrow]',l.eyebrow);text('[data-about-links-title]',l.title);const lg=document.querySelector('[data-about-links-items]');if(lg&&Array.isArray(l.items))lg.innerHTML=l.items.map(i=>{const u=safeUrl(i.url);return u?`<a class="about-related-link" href="${esc(u)}" ${i.external?'target="_blank" rel="noopener"':''}><span>${esc(i.label||'リンク')}</span><span>${i.external?'↗':'→'}</span></a>`:''}).join('');
    root.classList.add('is-cms-loaded');
  };
  fetch('data/about.json',{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(`about.json: ${r.status}`);return r.json()}).then(render).catch(e=>console.error('ABOUT CMS data could not be loaded.',e));
})();