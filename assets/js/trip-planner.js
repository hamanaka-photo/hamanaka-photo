(() => {
  const articleId = new URLSearchParams(window.location.search).get('article');
  if (articleId !== 'trip') return;

  const STORAGE_KEY = 'hamanaka-trip-plan-v1';
  let booting = false;

  const escapeHtml = (value = '') =>
    String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));

  const safeUrl = (value = '') => {
    const raw = String(value || '').trim();
    if (!raw || /^(javascript|data|vbscript):/i.test(raw)) return '';
    return raw;
  };

  const parseDate = value => {
    const matched = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!matched) return null;
    return { year: Number(matched[1]), month: Number(matched[2]), day: Number(matched[3]) };
  };

  const formatDate = value => {
    const date = parseDate(value);
    return date ? `${date.year}年${date.month}月${date.day}日` : '未設定';
  };

  const formatSavedAt = value => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  const getDuration = (startValue, endValue) => {
    const start = parseDate(startValue);
    const end = parseDate(endValue || startValue);
    if (!start || !end) return null;

    const startUtc = Date.UTC(start.year, start.month - 1, start.day);
    const endUtc = Date.UTC(end.year, end.month - 1, end.day);
    if (endUtc < startUtc) return null;

    const days = Math.floor((endUtc - startUtc) / 86400000) + 1;
    return { days, nights: Math.max(0, days - 1) };
  };

  const getSeason = (startValue, data) => {
    const date = parseDate(startValue);
    if (!date) {
      return {
        name: '未設定',
        note: '旅行日を入力すると、季節に合わせた準備項目を表示します。',
        items: []
      };
    }

    const month = date.month;
    let name = '春';
    if ([6, 7, 8].includes(month)) name = '夏';
    if ([9, 10, 11].includes(month)) name = '秋';
    if ([12, 1, 2, 3].includes(month)) name = '冬';

    const seasons = Array.isArray(data?.clothing?.seasons) ? data.clothing.seasons : [];
    const source = name === '冬'
      ? seasons.find(item => String(item.label || '').includes('冬'))
      : seasons.find(item => !String(item.label || '').includes('冬'));

    return {
      name,
      note: source?.note || '',
      items: Array.isArray(source?.items) ? source.items : []
    };
  };

  const getChecklistGroups = (data, season) => {
    const groups = (Array.isArray(data?.checklist?.categories) ? data.checklist.categories : [])
      .map((category, categoryIndex) => ({
        id: `base-${categoryIndex}`,
        title: category.title || `準備 ${categoryIndex + 1}`,
        items: (Array.isArray(category.items) ? category.items : []).map((item, itemIndex) => ({
          id: `base-${categoryIndex}-${itemIndex}`,
          label: item
        }))
      }));

    if (season.items.length) {
      groups.unshift({
        id: `season-${season.name}`,
        title: `${season.name}の服装・季節準備`,
        items: season.items.map((item, itemIndex) => ({
          id: `season-${season.name}-${itemIndex}`,
          label: item
        }))
      });
    }

    return groups;
  };

  const renderPlanner = data => {
    const stayUrl = safeUrl(data?.stay?.url);
    const weatherUrl = safeUrl(data?.weather?.url);
    const noCarUrl = safeUrl(data?.noCar?.url);

    return `
      <section class="trip-planner-section" id="trip-plan" data-trip-planner>
        <div class="container">
          <div class="trip-planner-heading">
            <div>
              <p>MY TRIP PLAN</p>
              <h2>浜中町への撮影旅行をつくる</h2>
            </div>
            <span>旅行日を決めると、季節に合わせた準備リストを自動でまとめます。</span>
          </div>

          <div class="trip-planner-grid">
            <form class="trip-plan-form" data-trip-plan-form>
              <div class="trip-plan-card-heading">
                <span>01</span>
                <div><p>PLAN</p><h3>旅行の予定を入力</h3></div>
              </div>

              <div class="trip-plan-field">
                <label>いつ行く？</label>
                <div class="trip-plan-date-grid">
                  <label><span>出発日</span><input type="date" data-plan-start></label>
                  <label><span>帰着日</span><input type="date" data-plan-end></label>
                </div>
              </div>

              <fieldset class="trip-plan-field">
                <legend>どうやって行く？</legend>
                <div class="trip-transport-grid">
                  <label><input type="radio" name="trip-transport" value="飛行機＋レンタカー" data-plan-transport><span>飛行機＋レンタカー</span></label>
                  <label><input type="radio" name="trip-transport" value="自家用車" data-plan-transport><span>自家用車</span></label>
                  <label><input type="radio" name="trip-transport" value="飛行機＋公共交通" data-plan-transport><span>飛行機＋公共交通</span></label>
                  <label><input type="radio" name="trip-transport" value="JR・バス・タクシー等" data-plan-transport><span>JR・バス・タクシー等</span></label>
                  <label><input type="radio" name="trip-transport" value="その他" data-plan-transport><span>その他</span></label>
                </div>
                <input class="trip-plan-text-input trip-transport-other" type="text" placeholder="移動手段を入力" data-plan-transport-other hidden>
              </fieldset>

              <div class="trip-plan-field">
                <label for="trip-plan-stay">宿泊先</label>
                <input id="trip-plan-stay" class="trip-plan-text-input" type="text" placeholder="宿泊施設名を入力" data-plan-stay>
                ${stayUrl ? `<a class="trip-plan-sub-link" href="${escapeHtml(stayUrl)}" target="_blank" rel="noopener noreferrer">浜中町の宿泊施設を見る <span aria-hidden="true">↗</span></a>` : ''}
              </div>

              <p class="trip-plan-save-note">入力した内容は、保存ボタンを押したときだけこの端末のブラウザに保存します。</p>
            </form>

            <aside class="trip-plan-summary" aria-live="polite">
              <div class="trip-plan-card-heading trip-plan-card-heading-light">
                <span>02</span>
                <div><p>SUMMARY</p><h3>今回の旅行プラン</h3></div>
              </div>

              <dl class="trip-plan-summary-list">
                <div><dt>期間</dt><dd data-plan-summary-period>未設定</dd></div>
                <div><dt>移動手段</dt><dd data-plan-summary-transport>未設定</dd></div>
                <div><dt>宿泊先</dt><dd data-plan-summary-stay>未設定</dd></div>
                <div><dt>季節</dt><dd><strong data-plan-summary-season>未設定</strong></dd></div>
              </dl>

              <div class="trip-plan-season-note">
                <span>SEASON NOTE</span>
                <p data-plan-summary-note>旅行日を入力すると、季節に合わせた準備項目を表示します。</p>
              </div>

              <div class="trip-plan-reference-links">
                ${weatherUrl ? `<a href="${escapeHtml(weatherUrl)}" target="_blank" rel="noopener noreferrer">現在の天気 <span aria-hidden="true">↗</span></a>` : ''}
                ${noCarUrl ? `<a href="${escapeHtml(noCarUrl)}" target="_blank" rel="noopener noreferrer">公共交通 <span aria-hidden="true">↗</span></a>` : ''}
              </div>
            </aside>
          </div>

          <div class="trip-plan-checklist">
            <div class="trip-plan-checklist-heading">
              <div><p>03 / CHECK LIST</p><h3>この旅行の準備リスト</h3></div>
              <div class="trip-plan-progress"><strong data-plan-progress>0 / 0</strong><span>準備済み</span></div>
            </div>
            <div class="trip-plan-check-grid" data-plan-check-grid></div>
          </div>

          <div class="trip-plan-actions">
            <div><p>保存・共有</p><span>共有する内容にページURLは含めません。</span></div>
            <div class="trip-plan-action-buttons">
              <button type="button" class="trip-plan-action trip-plan-action-primary" data-plan-save>この端末に保存</button>
              <button type="button" class="trip-plan-action" data-plan-share>シェア</button>
              <button type="button" class="trip-plan-action" data-plan-copy>コピー</button>
              <button type="button" class="trip-plan-action" data-plan-download>TXT保存</button>
              <button type="button" class="trip-plan-action trip-plan-action-muted" data-plan-clear>保存内容を削除</button>
            </div>
            <p class="trip-plan-status" data-plan-status aria-live="polite"></p>
          </div>
        </div>
      </section>`;
  };

  const initPlanner = (root, data) => {
    const startInput = root.querySelector('[data-plan-start]');
    const endInput = root.querySelector('[data-plan-end]');
    const transportInputs = [...root.querySelectorAll('[data-plan-transport]')];
    const transportOther = root.querySelector('[data-plan-transport-other]');
    const stayInput = root.querySelector('[data-plan-stay]');
    const checkGrid = root.querySelector('[data-plan-check-grid]');
    const status = root.querySelector('[data-plan-status]');

    const state = {
      startDate: '', endDate: '', transport: '', transportOther: '', stay: '', checks: {}, savedAt: ''
    };

    const setStatus = message => { if (status) status.textContent = message || ''; };

    const loadLocal = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return;
        state.startDate = saved.startDate || '';
        state.endDate = saved.endDate || '';
        state.transport = saved.transport || '';
        state.transportOther = saved.transportOther || '';
        state.stay = saved.stay || '';
        state.checks = saved.checks && typeof saved.checks === 'object' ? saved.checks : {};
        state.savedAt = saved.savedAt || '';
      } catch (error) {
        console.warn('旅行プランの保存内容を読み込めませんでした。', error);
      }
    };

    const syncInputsFromState = () => {
      startInput.value = state.startDate;
      endInput.value = state.endDate;
      endInput.min = state.startDate || '';
      transportInputs.forEach(input => { input.checked = input.value === state.transport; });
      transportOther.hidden = state.transport !== 'その他';
      transportOther.value = state.transportOther;
      stayInput.value = state.stay;
      if (state.savedAt) setStatus(`この端末に保存済み：${formatSavedAt(state.savedAt)}`);
    };

    const currentTransportLabel = () => {
      if (!state.transport) return '未設定';
      if (state.transport === 'その他') return state.transportOther.trim() || 'その他';
      return state.transport;
    };

    const currentPeriodLabel = () => {
      if (!state.startDate) return '未設定';
      const duration = getDuration(state.startDate, state.endDate);
      const end = state.endDate || state.startDate;
      if (!duration) return formatDate(state.startDate);
      if (state.startDate === end) return `${formatDate(state.startDate)} / 日帰り`;
      return `${formatDate(state.startDate)} 〜 ${formatDate(end)} / ${duration.nights}泊${duration.days}日`;
    };

    const setDirty = () => {
      setStatus(state.savedAt
        ? '保存後に変更があります。必要に応じてもう一度保存してください。'
        : 'まだこの端末には保存されていません。');
    };

    const updateProgress = () => {
      const inputs = [...checkGrid.querySelectorAll('[data-plan-check]')];
      const checked = inputs.filter(input => input.checked).length;
      const progress = root.querySelector('[data-plan-progress]');
      if (progress) progress.textContent = `${checked} / ${inputs.length}`;
    };

    const renderChecklist = () => {
      const season = getSeason(state.startDate, data);
      const groups = getChecklistGroups(data, season);
      checkGrid.innerHTML = groups.map(group => `
        <article class="trip-plan-check-card">
          <h4>${escapeHtml(group.title)}</h4>
          <div class="trip-plan-check-items">
            ${group.items.map(item => `
              <label class="trip-plan-check-item">
                <input type="checkbox" data-plan-check="${escapeHtml(item.id)}" ${state.checks[item.id] ? 'checked' : ''}>
                <span class="trip-plan-check-box" aria-hidden="true"></span>
                <span>${escapeHtml(item.label)}</span>
              </label>`).join('')}
          </div>
        </article>`).join('');
      updateProgress();
    };

    const updateSummary = () => {
      const season = getSeason(state.startDate, data);
      root.querySelector('[data-plan-summary-period]').textContent = currentPeriodLabel();
      root.querySelector('[data-plan-summary-transport]').textContent = currentTransportLabel();
      root.querySelector('[data-plan-summary-stay]').textContent = state.stay.trim() || '未設定';
      root.querySelector('[data-plan-summary-season]').textContent = season.name;
      root.querySelector('[data-plan-summary-note]').textContent = season.note || '季節に合わせて無理のない準備をしてください。';
    };

    const captureState = () => {
      state.startDate = startInput.value;
      state.endDate = endInput.value;
      state.transport = transportInputs.find(input => input.checked)?.value || '';
      state.transportOther = transportOther.value;
      state.stay = stayInput.value;
      checkGrid.querySelectorAll('[data-plan-check]').forEach(input => {
        state.checks[input.dataset.planCheck] = input.checked;
      });
    };

    const normalizeDates = () => {
      if (!startInput.value) { endInput.min = ''; return; }
      endInput.min = startInput.value;
      if (endInput.value && endInput.value < startInput.value) endInput.value = startInput.value;
    };

    const rerenderForInputs = ({ rebuildChecklist = false } = {}) => {
      captureState();
      normalizeDates();
      captureState();
      transportOther.hidden = state.transport !== 'その他';
      if (rebuildChecklist) renderChecklist();
      updateSummary();
      setDirty();
    };

    const getCurrentChecklist = () => {
      const season = getSeason(state.startDate, data);
      return getChecklistGroups(data, season).map(group => ({
        title: group.title,
        items: group.items.map(item => ({ label: item.label, checked: Boolean(state.checks[item.id]) }))
      }));
    };

    const buildShareText = () => {
      captureState();
      const season = getSeason(state.startDate, data);
      const checklist = getCurrentChecklist();
      const readyItems = [];
      const todoItems = [];

      checklist.forEach(group => {
        group.items.forEach(item => {
          const line = `${group.title}：${item.label}`;
          if (item.checked) readyItems.push(line);
          else todoItems.push(line);
        });
      });

      return [
        '浜中町 撮影旅行プラン',
        '',
        `期間：${currentPeriodLabel()}`,
        `移動手段：${currentTransportLabel()}`,
        `宿泊先：${state.stay.trim() || '未設定'}`,
        `季節：${season.name}`,
        season.note ? `季節の準備：${season.note}` : '',
        '',
        '準備済み',
        ...(readyItems.length ? readyItems.map(item => `✓ ${item}`) : ['まだありません']),
        '',
        'これから準備',
        ...(todoItems.length ? todoItems.map(item => `□ ${item}`) : ['すべて準備済みです']),
        '',
        'HAMANAKA PHOTO / PREPARATION'
      ].filter((line, index, array) => line !== '' || index === 0 || array[index - 1] !== '').join('\n').trim();
    };

    const copyText = async text => {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
      }
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    };

    startInput.addEventListener('change', () => rerenderForInputs({ rebuildChecklist: true }));
    endInput.addEventListener('change', () => rerenderForInputs());
    stayInput.addEventListener('input', () => rerenderForInputs());

    transportInputs.forEach(input => {
      input.addEventListener('change', () => {
        rerenderForInputs();
        if (input.value === 'その他') transportOther.focus();
      });
    });

    transportOther.addEventListener('input', () => rerenderForInputs());

    checkGrid.addEventListener('change', event => {
      const input = event.target.closest('[data-plan-check]');
      if (!input) return;
      state.checks[input.dataset.planCheck] = input.checked;
      updateProgress();
      setDirty();
    });

    root.querySelector('[data-plan-save]').addEventListener('click', () => {
      captureState();
      state.savedAt = new Date().toISOString();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        setStatus(`この端末に保存しました：${formatSavedAt(state.savedAt)}`);
      } catch (error) {
        console.error(error);
        setStatus('保存できませんでした。ブラウザの保存設定をご確認ください。');
      }
    });

    root.querySelector('[data-plan-share]').addEventListener('click', async () => {
      const text = buildShareText();
      if (navigator.share) {
        try {
          await navigator.share({ title: '浜中町 撮影旅行プラン', text });
          setStatus('旅行プランを共有しました。');
          return;
        } catch (error) {
          if (error?.name === 'AbortError') return;
        }
      }
      try {
        await copyText(text);
        setStatus('この端末では共有画面を開けないため、旅行プランをコピーしました。');
      } catch (error) {
        console.error(error);
        setStatus('共有またはコピーに失敗しました。');
      }
    });

    root.querySelector('[data-plan-copy]').addEventListener('click', async () => {
      try {
        await copyText(buildShareText());
        setStatus('旅行プランをクリップボードへコピーしました。');
      } catch (error) {
        console.error(error);
        setStatus('コピーできませんでした。');
      }
    });

    root.querySelector('[data-plan-download]').addEventListener('click', () => {
      const text = buildShareText();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      const datePart = state.startDate ? state.startDate.replace(/-/g, '') : 'plan';
      anchor.href = url;
      anchor.download = `hamanaka-trip-${datePart}.txt`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setStatus('旅行プランをTXTファイルとして保存しました。');
    });

    root.querySelector('[data-plan-clear]').addEventListener('click', () => {
      if (!window.confirm('この端末に保存した旅行プランを削除しますか？')) return;
      try { localStorage.removeItem(STORAGE_KEY); } catch (error) { console.warn(error); }

      state.startDate = '';
      state.endDate = '';
      state.transport = '';
      state.transportOther = '';
      state.stay = '';
      state.checks = {};
      state.savedAt = '';
      syncInputsFromState();
      renderChecklist();
      updateSummary();
      setStatus('この端末に保存した旅行プランを削除しました。');
    });

    loadLocal();
    syncInputsFromState();
    renderChecklist();
    updateSummary();
  };

  const updateStepLink = () => {
    const oldLink = document.querySelector('.trip-step-card[href="#checklist"]');
    if (!oldLink) return;
    oldLink.setAttribute('href', '#trip-plan');
    const title = oldLink.querySelector('.trip-step-copy strong');
    if (title) title.textContent = '旅行プランを作る';
  };

  const boot = async () => {
    if (booting || document.querySelector('[data-trip-planner]')) return;
    const ready = document.querySelector('.trip-ready');
    if (!ready) return;
    booting = true;

    try {
      const response = await fetch('data/trip.json', { cache: 'no-cache' });
      if (!response.ok) throw new Error('旅行プラン用データを読み込めませんでした。');
      const data = await response.json();
      ready.insertAdjacentHTML('beforebegin', renderPlanner(data));
      updateStepLink();
      const planner = document.querySelector('[data-trip-planner]');
      if (planner) initPlanner(planner, data);
    } catch (error) {
      console.error(error);
    } finally {
      booting = false;
    }
  };

  const observer = new MutationObserver(() => {
    if (document.querySelector('.trip-ready')) boot();
  });

  const start = () => {
    observer.observe(document.body, { childList: true, subtree: true });
    boot();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
