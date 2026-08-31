
(() => {
  const params = new URLSearchParams(location.search);
  if (params.get('article') !== 'trip') return;

  const STORAGE_KEY = 'hamanaka-trip-v3';
  const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';
  const WEATHER_ICON_BASE = 'assets/images/03_guide/trip';
  const WEATHER_ICON_CODES = new Set([
    0, 1, 2, 3, 45, 48,
    51, 53, 55, 56, 57,
    61, 63, 65, 66, 67,
    71, 73, 75, 77,
    80, 81, 82,
    85, 86,
    95
  ]);

  const esc = (v = '') => String(v).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));

  const safe = (v = '') => {
    const x = String(v || '').trim();
    return !x || /^(javascript|data|vbscript):/i.test(x) ? '' : x;
  };

  const seasonForMonth = month => {
    if ([12, 1, 2, 3].includes(month)) return '冬';
    if ([4, 5].includes(month)) return '春';
    if ([6, 7, 8].includes(month)) return '夏';
    return '秋';
  };

  const parseDate = value => {
    const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? { year: +m[1], month: +m[2], day: +m[3] } : null;
  };

  const formatDate = value => {
    const d = parseDate(value);
    return d ? `${d.year}年${d.month}月${d.day}日` : '未設定';
  };

  const periodLabel = (start, end) => {
    const s = parseDate(start);
    const e = parseDate(end || start);
    if (!s) return '未設定';
    if (!e) return formatDate(start);

    const a = Date.UTC(s.year, s.month - 1, s.day);
    const b = Date.UTC(e.year, e.month - 1, e.day);
    if (b < a) return formatDate(start);
    const days = Math.floor((b - a) / 86400000) + 1;
    const nights = Math.max(0, days - 1);
    if (days === 1) return `${formatDate(start)} / 日帰り`;
    return `${formatDate(start)}〜${formatDate(end)} / ${nights}泊${days}日`;
  };

  const weatherText = code => {
    const c = Number(code);
    if (c === 0) return '快晴';
    if ([1,2].includes(c)) return '晴れ';
    if (c === 3) return 'くもり';
    if ([45,48].includes(c)) return '霧';
    if ([51,53,55,56,57].includes(c)) return '霧雨';
    if ([61,63,65,66,67,80,81,82].includes(c)) return '雨';
    if ([71,73,75,77,85,86].includes(c)) return '雪';
    if ([95,96,99].includes(c)) return '雷雨';
    return '天気変化';
  };

  const weatherIconPath = code => {
    const c = Number(code);
    const iconCode = WEATHER_ICON_CODES.has(c)
      ? c
      : ([96, 99].includes(c) ? 95 : 3);

    return `${WEATHER_ICON_BASE}/${iconCode}.webp`;
  };

  const storageAvailable = () => {
    try {
      const key = '__hamanaka_trip_test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  };

  const renderNav = cfg => `
    <section class="trip-v3-nav">
      <div class="container trip-v3-nav-grid">
        ${(cfg.navigation || []).map(item => `
          <a class="trip-v3-nav-card" href="#${esc(item.anchor)}">
            <small>SECTION ${esc(item.number)}</small>
            <strong>${esc(item.label)}</strong>
          </a>`).join('')}
      </div>
    </section>`;

  const renderAccess = (base, cfg) => {
    const rental = base.access?.rental || {};
    const companies = Array.isArray(rental.companies) ? rental.companies : [];
    const tips = Array.isArray(base.access?.driveTips) ? base.access.driveTips : [];
    const noCar = base.noCar || {};
    return `
      <section class="trip-v3-section" id="trip-v3-access">
        <div class="container">
          <div class="trip-v3-heading">
            <div><p>01 / ACCESS</p><h2>浜中町への行き方</h2></div>
            <span>まずは浜中町までの移動方法を整理。航空便、レンタカー、公共交通機関の順に確認できます。</span>
          </div>

          <div class="trip-v3-route">
            <div class="trip-v3-route-stop">${esc(cfg.access.route[0])}</div>
            <div class="trip-v3-route-arrow">→</div>
            <div class="trip-v3-route-stop">${esc(cfg.access.route[1])}</div>
            <div class="trip-v3-route-arrow">→</div>
            <div class="trip-v3-route-stop">${esc(cfg.access.route[2])}</div>
          </div>
          <p class="trip-v3-airport-note">${esc(cfg.access.airportNote)}　${esc(cfg.access.flightUpdatedLabel)}</p>

          <div class="trip-v3-access-row">
            <div class="trip-v3-access-label"><p>BY AIR</p><h3>飛行機で行く</h3></div>
            <div class="trip-v3-flight-grid">
              ${(cfg.access.flights || []).map(f => `
                <article class="trip-v3-flight">
                  <span class="trip-v3-flight-code">${esc(f.code)}</span>
                  <h4>${esc(f.title)}</h4>
                  <div class="trip-v3-flight-facts">
                    <div><span>便数</span><b>${esc(f.flights)}</b></div>
                    <div><span>航空会社</span><b>${esc(f.airlines)}</b></div>
                    <div><span>フライト時間</span><b>${esc(f.duration)}</b></div>
                  </div>
                  <p class="trip-v3-flight-note">${esc(f.note)}</p>
                  <a class="trip-v3-button" href="${esc(safe(f.searchUrl))}" target="_blank" rel="noopener noreferrer">${esc(f.searchLabel)} ↗</a>
                </article>`).join('')}
            </div>
          </div>

          <div class="trip-v3-access-row">
            <div class="trip-v3-access-label"><p>RENT A CAR</p><h3>レンタカーで行く</h3></div>
            <div class="trip-v3-rental-wrap">
              <div class="trip-v3-rental-main">
                <p>${esc(rental.text || '複数の撮影地点を巡るなら、レンタカーが便利です。')}</p>
                <div class="trip-v3-rental-links-wrap">
                  <span class="trip-v3-rental-links-title">${esc(rental.companiesTitle || '釧路空港周辺のレンタカー営業所')}</span>
                  <div class="trip-v3-rental-links">
                    ${companies.map(c => safe(c.url) ? `
                      <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer"><span>${esc(c.name)}</span><b>↗</b></a>` : '').join('')}
                  </div>
                </div>
              </div>
              <aside class="trip-v3-point">
                <span class="trip-v3-point-badge">POINT / 要チェック</span>
                <h4>${esc(base.access?.driveTipsTitle || '車で撮影する人へ')}</h4>
                <div class="trip-v3-point-list">
                  ${tips.map(t => `<div><b>${esc(t.title)}</b><span>${esc(t.text)}</span></div>`).join('')}
                </div>
              </aside>
            </div>
          </div>

          <div class="trip-v3-access-row">
            <div class="trip-v3-access-label"><p>PUBLIC TRANSPORT</p><h3>公共交通機関で行く</h3></div>
            <div class="trip-v3-transit">
              <p>${esc(noCar.text || '鉄道・バス・ハイヤーなどを組み合わせて移動します。運行日や予約条件を事前に確認してください。')}</p>
              ${safe(cfg.access.publicTransportUrl || noCar.url) ? `<a class="trip-v3-button trip-v3-button-primary" href="${esc(cfg.access.publicTransportUrl || noCar.url)}" target="_blank" rel="noopener noreferrer">${esc(cfg.access.publicTransportLabel || noCar.buttonLabel || '公共交通情報を見る')} ↗</a>` : ''}
            </div>
          </div>
        </div>
      </section>`;
  };

  const renderStay = base => {
    const stay = base.stay || {};
    return `
      <section class="trip-v3-section" id="trip-v3-stay">
        <div class="container">
          <div class="trip-v3-heading">
            <div><p>02 / STAY</p><h2>宿泊先を決める</h2></div>
            <span>朝夕の撮影時間を活かすなら、移動距離と撮りたい場所を考えながら宿を選びます。</span>
          </div>
          <article class="trip-v3-stay-card">
            <div class="trip-v3-stay-visual">
              ${stay.image ? `<img src="${esc(stay.image)}" alt="${esc(stay.title || '浜中町の宿泊')}" loading="lazy" decoding="async">` : ''}
            </div>
            <div class="trip-v3-stay-copy">
              <span class="trip-v3-kicker">HAMANAKA STAY</span>
              <h3>${esc(stay.title || '浜中町に泊まろう')}</h3>
              <p>${esc(stay.text || '')}</p>
              ${safe(stay.url) ? `<a class="trip-v3-button trip-v3-button-primary" href="${esc(stay.url)}" target="_blank" rel="noopener noreferrer">${esc(stay.buttonLabel || '宿泊施設を見る')} ↗</a>` : ''}
            </div>
          </article>
        </div>
      </section>`;
  };

  const renderChart = climate => {
    const W = 760, H = 310, L = 48, R = 48, T = 28, B = 38;
    const innerW = W - L - R, innerH = H - T - B;
    const tempMin = -15, tempMax = 25, precipMax = 180;
    const x = i => L + innerW * (i / 11);
    const yTemp = v => T + innerH * (1 - (v - tempMin) / (tempMax - tempMin));
    const yPrecip = v => T + innerH * (1 - v / precipMax);
    const poly = values => values.map((v, i) => `${x(i)},${yTemp(v)}`).join(' ');
    const hit = (cx, cy, label, cls) =>
      `<circle class="trip-v3-chart-hit ${cls}" cx="${cx}" cy="${cy}" r="8" tabindex="0" data-chart-tooltip="${esc(label)}"/>`;

    const bars = climate.precipitation.map((v, i) => {
      const bw = 26, px = x(i) - bw / 2, py = yPrecip(v);
      const label = `${climate.months[i]} / 降水量 ${v}mm`;
      return `
        <rect x="${px}" y="${py}" width="${bw}" height="${T + innerH - py}" rx="3" fill="rgba(70,123,132,.20)"/>
        <rect class="trip-v3-chart-hit trip-v3-chart-hit-bar" x="${px}" y="${py}" width="${bw}" height="${T + innerH - py}" rx="3" tabindex="0" data-chart-tooltip="${esc(label)}"/>`;
    }).join('');

    const grids = [-10,0,10,20].map(v => `
      <line x1="${L}" x2="${W-R}" y1="${yTemp(v)}" y2="${yTemp(v)}" stroke="#dce6e8" stroke-width="1"/>
      <text x="${L-8}" y="${yTemp(v)+4}" text-anchor="end" font-size="9" fill="#7a8c95">${v}°</text>`).join('');

    const labels = climate.months.map((m, i) =>
      `<text x="${x(i)}" y="${H-13}" text-anchor="middle" font-size="9" fill="#6f8189">${esc(m)}</text>`
    ).join('');

    const highHits = climate.high.map((v, i) =>
      hit(x(i), yTemp(v), `${climate.months[i]} / 日最高気温 ${v}℃`, 'trip-v3-chart-hit-high')
    ).join('');

    const avgHits = climate.average.map((v, i) =>
      hit(x(i), yTemp(v), `${climate.months[i]} / 平均気温 ${v}℃`, 'trip-v3-chart-hit-average')
    ).join('');

    const lowHits = climate.low.map((v, i) =>
      hit(x(i), yTemp(v), `${climate.months[i]} / 日最低気温 ${v}℃`, 'trip-v3-chart-hit-low')
    ).join('');

    return `
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="榊町の月別平均気温、最高気温、最低気温、降水量">
        ${grids}
        ${bars}
        <polyline points="${poly(climate.high)}" fill="none" stroke="#c87350" stroke-width="2.5"/>
        <polyline points="${poly(climate.average)}" fill="none" stroke="#397b70" stroke-width="2.5"/>
        <polyline points="${poly(climate.low)}" fill="none" stroke="#507c9a" stroke-width="2.5"/>
        ${climate.high.map((v,i)=>`<circle cx="${x(i)}" cy="${yTemp(v)}" r="2.8" fill="#c87350"/>`).join('')}
        ${climate.average.map((v,i)=>`<circle cx="${x(i)}" cy="${yTemp(v)}" r="2.8" fill="#397b70"/>`).join('')}
        ${climate.low.map((v,i)=>`<circle cx="${x(i)}" cy="${yTemp(v)}" r="2.8" fill="#507c9a"/>`).join('')}
        ${highHits}
        ${avgHits}
        ${lowHits}
        ${labels}
        <text x="${W-R+7}" y="${T+4}" font-size="9" fill="#7a8c95">降水量</text>
        <text x="${W-R+7}" y="${T+18}" font-size="9" fill="#7a8c95">0〜180mm</text>
      </svg>
      <div class="trip-v3-chart-tooltip" data-v3-chart-tooltip hidden></div>`;
  };

  const renderClimate = cfg => `
    <section class="trip-v3-section" id="trip-v3-climate">
      <div class="container">
        <div class="trip-v3-heading">
          <div><p>03 / CLIMATE</p><h2>浜中町の気候を知る</h2></div>
          <span>年間の気温差と降水量を把握して、撮影時期と装備を考えます。直近1週間は最新予報を表示します。</span>
        </div>
        <div class="trip-v3-climate-grid">
          <article class="trip-v3-climate-card">
            <div class="trip-v3-card-heading">
              <h3>月ごとの気温と降水量</h3>
              <span>${esc(cfg.climate.station)}<br>${esc(cfg.climate.period)}</span>
            </div>
            <div class="trip-v3-climate-chart">${renderChart(cfg.climate)}</div>
            <div class="trip-v3-chart-legend">
              <span style="color:#c87350"><i></i>日最高気温</span>
              <span style="color:#397b70"><i></i>平均気温</span>
              <span style="color:#507c9a"><i></i>日最低気温</span>
              <span class="precip" style="color:#467b84"><i></i>降水量</span>
            </div>
            <a class="trip-v3-source-link" href="${esc(cfg.climate.sourceUrl)}" target="_blank" rel="noopener noreferrer">気象庁の平年値を見る ↗</a>
          </article>
          <article class="trip-v3-forecast-card">
            <div class="trip-v3-card-heading"><h3>これから1週間</h3><span>浜中町周辺</span></div>
            <div class="trip-v3-forecast-grid" data-v3-forecast>
              <p class="trip-v3-forecast-status">最新予報を読み込んでいます。</p>
            </div>
            <p class="trip-v3-forecast-status" data-v3-forecast-status>予報はページを開いた時点で取得します。</p>
          </article>
        </div>
      </div>
    </section>`;

  const renderWear = cfg => {
    const card = (obj, label) => `
      <article class="trip-v3-wear-card">
        <span class="trip-v3-kicker">${label}</span>
        <h3>${esc(obj.title)}</h3>
        <p>${esc(obj.lead)}</p>
        <ul class="trip-v3-wear-list">${obj.items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      </article>`;
    return `
      <section class="trip-v3-section" id="trip-v3-wear">
        <div class="container">
          <div class="trip-v3-heading">
            <div><p>04 / WEAR & ESSENTIALS</p><h2>服装と必需品を準備する</h2></div>
            <span>晴天だけでなく、海霧や風を想定した装備を。撮影機材の保護用品も忘れずに。</span>
          </div>
          <div class="trip-v3-wear-grid">
            ${card(cfg.wear.sunny, 'SUNNY DAY')}
            ${card(cfg.wear.foggy, 'CLOUDY / FOGGY')}
          </div>
          <div class="trip-v3-essentials">
            <h3>その他の必需品</h3>
            <div class="trip-v3-essential-grid">${cfg.wear.essentials.map(x => `<span>${esc(x)}</span>`).join('')}</div>
          </div>
        </div>
      </section>`;
  };

  const renderPlan = (base, cfg) => {
    const options = (cfg.lodgings || []).map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('');
    return `
      <section class="trip-v3-section" id="trip-v3-plan" data-v3-planner>
        <div class="container">
          <div class="trip-v3-heading">
            <div><p>05 / MY TRIP PLAN</p><h2>撮影旅行のプランをつくる</h2></div>
            <span>期間、移動手段、宿泊先を入力すると、季節に合わせた準備リストまで1つにまとめます。</span>
          </div>

          <div class="trip-v3-plan-layout">
            <form class="trip-v3-plan-form" onsubmit="return false">
              <h3>旅行条件を入力</h3>

              <div class="trip-v3-field">
                <label>いつ行く？</label>
                <div class="trip-v3-date-grid">
                  <label><span>出発日</span><input class="trip-v3-input" type="date" data-v3-start></label>
                  <label><span>帰着日</span><input class="trip-v3-input" type="date" data-v3-end></label>
                </div>
              </div>

              <fieldset class="trip-v3-field">
                <legend>どうやって行く？</legend>
                <div class="trip-v3-transport">
                  <label><input type="radio" name="v3-transport" value="飛行機＋レンタカー"><span>飛行機＋レンタカー</span></label>
                  <label><input type="radio" name="v3-transport" value="自家用車"><span>自家用車</span></label>
                  <label><input type="radio" name="v3-transport" value="飛行機＋公共交通"><span>飛行機＋公共交通</span></label>
                  <label><input type="radio" name="v3-transport" value="JR・バス・ハイヤー等"><span>JR・バス・ハイヤー等</span></label>
                  <label><input type="radio" name="v3-transport" value="その他"><span>その他</span></label>
                </div>
                <input class="trip-v3-input" type="text" placeholder="その他の移動手段" data-v3-transport-other hidden>
              </fieldset>

              <div class="trip-v3-field">
                <label>宿泊先</label>
                <select class="trip-v3-select" data-v3-stay>
                  <option value="">選択してください</option>
                  ${options}
                </select>
                <input class="trip-v3-input" type="text" placeholder="その他の宿泊先を入力" data-v3-stay-other hidden>
              </div>
            </form>

            <aside class="trip-v3-summary">
              <h3>SUMMARY</h3>
              <div class="trip-v3-summary-main">
                <div><span>期間</span><strong data-v3-summary-period>未設定</strong></div>
                <div><span>移動手段</span><strong data-v3-summary-transport>未設定</strong></div>
                <div><span>宿泊先</span><strong data-v3-summary-stay>未設定</strong></div>
                <div><span>季節</span><strong data-v3-summary-season>未設定</strong></div>
              </div>
              <div class="trip-v3-summary-check">
                <div class="trip-v3-summary-check-heading">
                  <h4>この旅行のチェックリスト</h4>
                  <span data-v3-progress>0 / 0</span>
                </div>
                <div class="trip-v3-check-groups" data-v3-checks></div>
              </div>
            </aside>
          </div>

          <div class="trip-v3-actions">
            <div class="trip-v3-action-heading">
              <strong>この旅行プランを保存・共有</strong>
              <span>共有内容にURLは含みません。保存データはこのブラウザ内だけに保存します。</span>
            </div>
            <div class="trip-v3-action-buttons">
              <button type="button" class="primary" data-v3-save>この端末に保存</button>
              <button type="button" data-v3-share>シェア</button>
              <button type="button" data-v3-copy>コピー</button>
              <button type="button" data-v3-download>TXT保存</button>
              <button type="button" data-v3-clear>保存内容を削除</button>
            </div>
            <p class="trip-v3-save-status" data-v3-status aria-live="polite"></p>
          </div>
        </div>
      </section>`;
  };


  const initChartTooltips = root => {
    const tooltip = root.querySelector('[data-v3-chart-tooltip]');
    if (!tooltip) return;

    const show = (target, event) => {
      const text = target?.dataset?.chartTooltip;
      if (!text) return;
      tooltip.textContent = text;
      tooltip.hidden = false;

      if (event && typeof event.clientX === 'number') {
        tooltip.style.left = `${event.clientX + 12}px`;
        tooltip.style.top = `${event.clientY + 12}px`;
      } else {
        const rect = target.getBoundingClientRect();
        tooltip.style.left = `${rect.left + rect.width / 2 + 10}px`;
        tooltip.style.top = `${rect.top - 8}px`;
      }
    };

    const hide = () => {
      tooltip.hidden = true;
    };

    root.querySelectorAll('[data-chart-tooltip]').forEach(target => {
      target.addEventListener('pointerenter', event => show(target, event));
      target.addEventListener('pointermove', event => show(target, event));
      target.addEventListener('pointerleave', hide);
      target.addEventListener('focus', () => show(target));
      target.addEventListener('blur', hide);
    });
  };

  const loadForecast = async (root, cfg) => {
    const box = root.querySelector('[data-v3-forecast]');
    const status = root.querySelector('[data-v3-forecast-status]');
    if (!box) return;
    const q = new URLSearchParams({
      latitude: cfg.forecast.latitude,
      longitude: cfg.forecast.longitude,
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'Asia/Tokyo',
      forecast_days: '7'
    });
    try {
      const res = await fetch(`${WEATHER_API}?${q.toString()}`);
      if (!res.ok) throw new Error('forecast');
      const data = await res.json();
      const d = data.daily || {};
      box.innerHTML = (d.time || []).map((date, i) => {
        const day = new Date(`${date}T00:00:00+09:00`);
        const label = new Intl.DateTimeFormat('ja-JP', { month:'numeric', day:'numeric', weekday:'short' }).format(day);
        const weatherCode = Number(d.weather_code?.[i]);
        const weather = weatherText(weatherCode);
        const iconPath = weatherIconPath(weatherCode);

        return `
          <div class="trip-v3-forecast-day">
            <img
              class="trip-v3-forecast-bg-icon"
              src="${esc(iconPath)}"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async">
            <div class="trip-v3-forecast-date">${esc(label)}</div>
            <div class="trip-v3-forecast-weather">${esc(weather)}</div>
            <div class="trip-v3-forecast-temp">
              <span class="high">${Math.round(d.temperature_2m_max?.[i])}℃</span>
              <span class="low">${Math.round(d.temperature_2m_min?.[i])}℃</span>
            </div>
          </div>`;
      }).join('');
      if (status) status.textContent = 'Open-Meteoの予報データをページ表示時に取得しています。撮影前には最新情報を再確認してください。';
    } catch (error) {
      box.innerHTML = `<p class="trip-v3-forecast-status">予報を取得できませんでした。</p>`;
      if (status) status.innerHTML = `<a href="${esc(cfg.forecast.fallbackUrl)}" target="_blank" rel="noopener noreferrer">現在の天気・予報を確認する ↗</a>`;
    }
  };

  const initPlanner = (root, base, cfg) => {
    const start = root.querySelector('[data-v3-start]');
    const end = root.querySelector('[data-v3-end]');
    const stay = root.querySelector('[data-v3-stay]');
    const stayOther = root.querySelector('[data-v3-stay-other]');
    const transportOther = root.querySelector('[data-v3-transport-other]');
    const radios = [...root.querySelectorAll('input[name="v3-transport"]')];
    const checks = root.querySelector('[data-v3-checks]');
    const status = root.querySelector('[data-v3-status]');
    const canStore = storageAvailable();

    let state = {
      start: '', end: '', transport: '', transportOther: '',
      stay: '', stayOther: '', checks: {}, savedAt: ''
    };

    const transportLabel = () => {
      if (!state.transport) return '未設定';
      return state.transport === 'その他'
        ? (state.transportOther.trim() || 'その他')
        : state.transport;
    };

    const stayLabel = () => {
      if (!state.stay) return '未設定';
      return state.stay === 'その他'
        ? (state.stayOther.trim() || 'その他')
        : state.stay;
    };

    const season = () => {
      const d = parseDate(state.start);
      return d ? seasonForMonth(d.month) : '未設定';
    };

    const baseGroups = () => {
      const cats = Array.isArray(base.checklist?.categories) ? base.checklist.categories : [];
      const groups = cats.map((c, ci) => ({
        id: `base-${ci}`,
        title: c.title || `準備 ${ci+1}`,
        items: (c.items || []).map((label, ii) => ({ id:`base-${ci}-${ii}`, label }))
      }));
      const s = season();
      if (s !== '未設定') {
        groups.unshift({
          id: `season-${s}`,
          title: `${s}の追加準備`,
          items: (cfg.seasonChecklist?.[s] || []).map((label, ii) => ({ id:`season-${s}-${ii}`, label }))
        });
      }
      return groups;
    };

    const capture = () => {
      state.start = start.value;
      state.end = end.value;
      state.transport = radios.find(x => x.checked)?.value || '';
      state.transportOther = transportOther.value;
      state.stay = stay.value;
      state.stayOther = stayOther.value;
      checks.querySelectorAll('[data-v3-check]').forEach(input => {
        state.checks[input.dataset.v3Check] = input.checked;
      });
    };

    const updateSummary = () => {
      root.querySelector('[data-v3-summary-period]').textContent = periodLabel(state.start, state.end);
      root.querySelector('[data-v3-summary-transport]').textContent = transportLabel();
      root.querySelector('[data-v3-summary-stay]').textContent = stayLabel();
      root.querySelector('[data-v3-summary-season]').textContent = season();
    };

    const updateProgress = () => {
      const all = [...checks.querySelectorAll('[data-v3-check]')];
      const done = all.filter(x => x.checked).length;
      root.querySelector('[data-v3-progress]').textContent = `${done} / ${all.length}`;
    };

    const renderChecks = () => {
      checks.innerHTML = baseGroups().map(group => `
        <div class="trip-v3-check-group">
          <h5>${esc(group.title)}</h5>
          <div class="trip-v3-check-items">
            ${group.items.map(item => `
              <label class="trip-v3-check-item">
                <input type="checkbox" data-v3-check="${esc(item.id)}" ${state.checks[item.id] ? 'checked' : ''}>
                <span class="trip-v3-check-box" aria-hidden="true"></span>
                <span>${esc(item.label)}</span>
              </label>`).join('')}
          </div>
        </div>`).join('');
      updateProgress();
    };

    const syncVisibility = () => {
      transportOther.hidden = state.transport !== 'その他';
      stayOther.hidden = state.stay !== 'その他';
    };

    const markChanged = () => {
      status.textContent = state.savedAt
        ? '保存後に変更があります。必要ならもう一度「この端末に保存」を押してください。'
        : (canStore ? 'まだこの端末には保存していません。' : 'このブラウザではローカル保存を利用できません。');
    };

    const apply = (rebuild = false) => {
      capture();
      if (state.start) {
        end.min = state.start;
        if (state.end && state.end < state.start) {
          end.value = state.start;
          state.end = state.start;
        }
      } else {
        end.min = '';
      }
      syncVisibility();
      if (rebuild) renderChecks();
      updateSummary();
      markChanged();
    };

    const shareText = () => {
      capture();
      const prepared = [];
      const todo = [];
      baseGroups().forEach(group => group.items.forEach(item => {
        const line = `${group.title}：${item.label}`;
        (state.checks[item.id] ? prepared : todo).push(line);
      }));
      return [
        '浜中町 撮影旅行プラン',
        '',
        `期間：${periodLabel(state.start, state.end)}`,
        `移動手段：${transportLabel()}`,
        `宿泊先：${stayLabel()}`,
        `季節：${season()}`,
        '',
        '準備済み',
        ...(prepared.length ? prepared.map(x => `✓ ${x}`) : ['まだありません']),
        '',
        'これから準備',
        ...(todo.length ? todo.map(x => `□ ${x}`) : ['すべて準備済みです']),
        '',
        'HAMANAKA PHOTO / PREPARATION'
      ].join('\n');
    };

    const copyText = async text => {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    };

    const restore = () => {
      if (!canStore) {
        status.textContent = 'このブラウザではローカル保存を利用できません。シェア・コピー・TXT保存は利用できます。';
        return;
      }
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          status.textContent = 'まだこの端末には保存していません。';
          return;
        }
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return;
        state = {
          start: saved.start || '',
          end: saved.end || '',
          transport: saved.transport || '',
          transportOther: saved.transportOther || '',
          stay: saved.stay || '',
          stayOther: saved.stayOther || '',
          checks: saved.checks || {},
          savedAt: saved.savedAt || ''
        };
        start.value = state.start;
        end.value = state.end;
        radios.forEach(x => x.checked = x.value === state.transport);
        transportOther.value = state.transportOther;
        stay.value = state.stay;
        stayOther.value = state.stayOther;
        syncVisibility();
        renderChecks();
        updateSummary();
        const t = state.savedAt ? new Date(state.savedAt) : null;
        status.textContent = t && !Number.isNaN(t.getTime())
          ? `この端末の保存内容を復元しました：${t.toLocaleString('ja-JP')}`
          : 'この端末の保存内容を復元しました。';
      } catch (error) {
        console.error(error);
        status.textContent = '保存内容を読み込めませんでした。';
      }
    };

    start.addEventListener('change', () => apply(true));
    end.addEventListener('change', () => apply(false));
    stay.addEventListener('change', () => { state.stay = stay.value; syncVisibility(); apply(false); if (!stayOther.hidden) stayOther.focus(); });
    stayOther.addEventListener('input', () => apply(false));
    radios.forEach(r => r.addEventListener('change', () => { state.transport = r.value; syncVisibility(); apply(false); if (!transportOther.hidden) transportOther.focus(); }));
    transportOther.addEventListener('input', () => apply(false));

    checks.addEventListener('change', event => {
      const input = event.target.closest('[data-v3-check]');
      if (!input) return;
      state.checks[input.dataset.v3Check] = input.checked;
      updateProgress();
      markChanged();
    });

    root.querySelector('[data-v3-save]').addEventListener('click', () => {
      capture();
      if (!canStore) {
        status.textContent = 'このブラウザではローカル保存が無効です。プライベートモードやサイトデータの設定をご確認ください。';
        return;
      }
      try {
        state.savedAt = new Date().toISOString();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        const verify = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        if (verify.savedAt !== state.savedAt) throw new Error('verify');
        status.textContent = `この端末に保存しました：${new Date(state.savedAt).toLocaleString('ja-JP')}`;
      } catch (error) {
        console.error(error);
        status.textContent = '保存できませんでした。ブラウザのサイトデータ保存設定をご確認ください。';
      }
    });

    root.querySelector('[data-v3-share]').addEventListener('click', async () => {
      const text = shareText();
      if (navigator.share) {
        try {
          await navigator.share({ title: '浜中町 撮影旅行プラン', text });
          status.textContent = '旅行プランを共有しました。';
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }
      try {
        await copyText(text);
        status.textContent = '共有機能を利用できないため、旅行プランをコピーしました。';
      } catch (error) {
        status.textContent = '共有・コピーに失敗しました。';
      }
    });

    root.querySelector('[data-v3-copy]').addEventListener('click', async () => {
      try {
        await copyText(shareText());
        status.textContent = '旅行プランをコピーしました。';
      } catch (error) {
        status.textContent = 'コピーできませんでした。';
      }
    });

    root.querySelector('[data-v3-download]').addEventListener('click', () => {
      const blob = new Blob([shareText()], { type:'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hamanaka-trip-${state.start ? state.start.replace(/-/g,'') : 'plan'}.txt`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      status.textContent = '旅行プランをTXTファイルとして保存しました。';
    });

    root.querySelector('[data-v3-clear]').addEventListener('click', () => {
      if (!confirm('この端末に保存した旅行プランを削除しますか？')) return;
      if (canStore) localStorage.removeItem(STORAGE_KEY);
      state = { start:'', end:'', transport:'', transportOther:'', stay:'', stayOther:'', checks:{}, savedAt:'' };
      start.value = '';
      end.value = '';
      radios.forEach(x => x.checked = false);
      transportOther.value = '';
      stay.value = '';
      stayOther.value = '';
      syncVisibility();
      renderChecks();
      updateSummary();
      status.textContent = '保存内容を削除しました。';
    });

    renderChecks();
    updateSummary();
    restore();
  };

  const build = async () => {
    const ready = document.querySelector('.trip-ready');
    if (!ready || document.querySelector('.trip-v3')) return false;

    try {
      const [baseRes, cfgRes] = await Promise.all([
        fetch('data/trip.json', { cache:'no-cache' }),
        fetch('data/trip-v3.json', { cache:'no-cache' })
      ]);
      if (!baseRes.ok || !cfgRes.ok) throw new Error('data');
      const base = await baseRes.json();
      const cfg = await cfgRes.json();

      const shell = document.createElement('div');
      shell.className = 'trip-v3';
      shell.innerHTML = [
        renderNav(cfg),
        renderAccess(base, cfg),
        renderStay(base),
        renderClimate(cfg),
        renderWear(cfg),
        renderPlan(base, cfg)
      ].join('');

      ready.before(shell);
      document.body.classList.add('trip-v3-ready');
      initChartTooltips(shell);
      loadForecast(shell, cfg);
      initPlanner(shell.querySelector('[data-v3-planner]'), base, cfg);
      return true;
    } catch (error) {
      console.error('PHOTO TRIP v3:', error);
      return false;
    }
  };

  const start = async () => {
    if (await build()) return;

    const observer = new MutationObserver(async () => {
      if (await build()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    window.setTimeout(() => {
      if (!document.querySelector('.trip-v3')) {
        observer.disconnect();
        console.warn(
          'PHOTO TRIP v3.1: v3の描画を確認できなかったため、旧準備編を表示したままにします。'
        );
      }
    }, 15000);
  };

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => { start(); },
      { once: true }
    );
  } else {
    start();
  }
})();
