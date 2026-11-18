(function () {
  const C = window.LWF_CONFIG;
  const D = window.LWF_DATA || { videos: [], shorts: [] };
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const watchUrl = id => `https://www.youtube.com/watch?v=${id}`;
  const shortUrl = id => `https://www.youtube.com/shorts/${id}`;
  const thumb = (id, q = 'hqdefault') => `https://i.ytimg.com/vi/${id}/${q}.jpg`;
  const fmtViews = n => n >= 1e6 ? (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K' : String(n);
  const secs = d => (d || '').split(':').reduce((a, x) => a * 60 + (+x || 0), 0);
  const fmtDate = iso => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

  // ---------- Stars (saved on this device only) ----------
  const store = {
    get() { try { return JSON.parse(localStorage.getItem('lwf_stars')) || { done: [], days: [] }; } catch { return { done: [], days: [] }; } },
    set(v) { try { localStorage.setItem('lwf_stars', JSON.stringify(v)); } catch {} },
  };
  const todayKey = () => new Date().toISOString().slice(0, 10);
  function streak(days) {
    let n = 0; const d = new Date();
    while (days.includes(d.toISOString().slice(0, 10))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function renderStars(pop) {
    const s = store.get();
    $('#starsCount').textContent = s.done.length;
    const st = streak(s.days);
    $('#streakText').textContent = s.done.length === 0 ? 'Watch a video to earn your first star!'
      : st > 1 ? `🔥 ${st}-day learning streak! Keep it going!` : 'Come back tomorrow to start a streak!';
    if (pop) { const b = $('#starsBox'); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
  }
  function earnStar(id) {
    const s = store.get();
    if (!s.days.includes(todayKey())) s.days.push(todayKey());
    if (s.done.includes(id)) { toast('⭐ Already earned! Great job practising again!'); store.set(s); return; }
    s.done.push(id); store.set(s); renderStars(true);
    const cheers = ['Super star! 🌟', 'Amazing learning! 🎉', 'You did it! 🏆', 'Brilliant! Keep going! 🚀', 'Wow, so clever! 🧠'];
    toast(cheers[s.done.length % cheers.length] + `  ${s.done.length} star${s.done.length === 1 ? '' : 's'} now!`);
    renderGrid();
  }
  let toastT;
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => t.hidden = true, 2600); }

  // ---------- Data ----------
  // Upload times are estimated from "x hours ago", so allow a day of slack across time zones.
  const start = new Date(new Date(C.startDate + 'T00:00:00Z') - 864e5);
  const longVideos = D.videos
    .filter(v => secs(v.duration) >= C.longVideoMinSeconds && new Date(v.published) >= start)
    .sort((a, b) => new Date(b.published) - new Date(a.published));
  const topShorts = D.shorts.filter(s => s.views >= C.topShortsMinViews).sort((a, b) => b.views - a.views).slice(0, C.topShortsMax);
  const popularVideos = D.videos.filter(v => v.views >= C.popularVideosMinViews).sort((a, b) => b.views - a.views).slice(0, C.popularVideosMax);

  const ALL_CATS = [...C.categories, C.otherTopic];
  const catById = id => ALL_CATS.find(c => c.id === id);
  const catOf = title => {
    const t = title.toLowerCase();
    const c = C.categories.find(c => c.words.some(w => t.includes(w)))
      || C.categories.find(c => (c.fallbackWords || []).some(w => t.includes(w)));
    return c ? c.id : C.otherTopic.id;
  };
  const cleanTitle = t => t.replace(/#\S+/g, '').replace(/\s{2,}/g, ' ').trim();

  // Whole channel for "Learn by Topic": videos then Shorts, each tagged with topic + group.
  const library = [
    ...D.videos.map((v, i) => ({ ...v, kind: 'video', order: i })),
    ...D.shorts.map((s, i) => ({ ...s, kind: 'short', order: D.videos.length + i })),
  ];
  library.forEach(v => { v.cat = catOf(v.title); v.group = catById(v.cat).group; });
  longVideos.forEach(v => v.cat = catOf(v.title));

  const prompts = {
    abc: 'Which letter did your child learn today? Tell us in the comments! 🔤',
    numbers: 'Up to which number can your child count now? Comment below! 🔢',
    tables: 'Which times table is your child practising? Comment below! ✖️',
    shapes: 'What is your child\'s favourite shape or colour? 🔷',
    nature: 'Which animal does your child love most? 🐘',
    days: 'Can your child say all the days of the week? 📅',
    world: 'What new word did your child learn today? 🌍',
    rhymes: 'Did your child sing along? Tell us! 🎵',
    stories: 'What was your child\'s favourite part of the story? 📖',
    more: 'What did your child learn today? Tell us in the comments! 💬',
  };

  // ---------- Today ----------
  function renderToday() {
    const v = longVideos[0];
    const box = $('#todayBox');
    if (!v) {
      box.innerHTML = `<div class="empty"><div class="big">🎬</div><h3>Today's video is coming soon!</h3>
        <p>Subscribe and ring the bell so you never miss a lesson.</p>
        <a class="btn btn-sub" href="${C.channelUrl}?sub_confirmation=1" target="_blank" rel="noopener">🔔 Subscribe</a></div>`;
      return;
    }
    const isNew = (Date.now() - new Date(v.published)) < 36 * 3600e3;
    $('#todayDate').textContent = `Uploaded ${fmtDate(v.published)} · a fresh lesson every day`;
    box.innerHTML = `
      <div class="player"><iframe src="https://www.youtube.com/embed/${v.id}?rel=0&modestbranding=1" title="${esc(v.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>
      <div class="today-info">
        <div>${isNew ? '<span class="badge new">NEW TODAY</span> ' : ''}<span class="badge">⏱ ${esc(v.duration)}</span></div>
        <h3>${esc(v.title)}</h3>
        <div class="ask">💬 ${prompts[v.cat]}</div>
        <div class="today-actions">
          <a class="btn" href="${watchUrl(v.id)}" target="_blank" rel="noopener">👍 Like &amp; comment on YouTube</a>
          <button class="btn btn-star" type="button" data-star="${v.id}">⭐ I learned it!</button>
        </div>
      </div>`;
    $('#likeLink').href = watchUrl(v.id);
    $('#commentLink').href = watchUrl(v.id);
    $('#commentPrompt').textContent = prompts[v.cat].replace(/ Tell us in the comments!| Comment below!/, '');
  }

  // ---------- Loved shorts ----------
  function renderPopularVideos() {
    const row = $('#popVideosRow');
    if (!popularVideos.length) { row.hidden = true; $('#popVideosHead').hidden = true; return; }
    row.innerHTML = popularVideos.map((v, i) => `
      <button class="card pop" type="button" data-play="${v.id}" data-title="${esc(v.title)}">
        <div class="thumb"><img src="${thumb(v.id)}" alt="" loading="lazy"><span class="rank">#${i + 1}</span><span class="dur">${esc(v.duration)}</span></div>
        <div class="body"><h3>${esc(v.title.replace(/#\w+/g, '').trim())}</h3>
        <div class="meta">👀 ${fmtViews(v.views)} views</div><div class="fav">❤️ Parents' favourite</div></div>
      </button>`).join('');
  }

  function renderShorts() {
    const row = $('#lovedRow');
    if (!topShorts.length) { row.hidden = true; $('#popShortsHead').hidden = true; return; }
    row.innerHTML = topShorts.map((s, i) => `
      <button class="short" type="button" data-play="${s.id}" data-short="1" data-title="${esc(s.title)}">
        <img src="${thumb(s.id)}" alt="" loading="lazy">
        <span class="rank">#${i + 1}</span>
        <span class="views">👀 ${fmtViews(s.views)}</span>
        <div class="cap">${esc(s.title.replace(/#\w+/g, '').trim())}<small>❤️ Parents' favourite</small></div>
      </button>`).join('');
  }

  // ---------- Learn by Topic ----------
  const view = { group: C.groups[0].id, topic: 'all', kind: 'all', shown: C.topicsPageSize };
  const inGroup = g => library.filter(v => v.group === g);
  const topicsOf = g => ALL_CATS.filter(c => c.group === g && inGroup(g).some(v => v.cat === c.id));
  const currentList = () => inGroup(view.group)
    .filter(v => view.topic === 'all' || v.cat === view.topic)
    .filter(v => view.kind === 'all' || v.kind === view.kind)
    .sort((a, b) => b.views - a.views || a.order - b.order);

  function renderTabs() {
    // Group switch
    $('#groups').innerHTML = C.groups.map(g => `
      <button class="group-btn" type="button" role="tab" data-group="${g.id}" aria-selected="${g.id === view.group}">
        <span class="g-icon">${g.icon}</span><span class="g-name">${esc(g.name)}</span><span class="g-n">${inGroup(g.id).length}</span>
      </button>`).join('');
    const g = C.groups.find(g => g.id === view.group);
    $('#groupBlurb').textContent = g.blurb;

    // Topic chips (only when the group has more than one topic)
    const topics = topicsOf(view.group);
    const base = inGroup(view.group).filter(v => view.kind === 'all' || v.kind === view.kind);
    $('#tabs').hidden = topics.length < 2;
    $('#tabs').innerHTML = topics.length < 2 ? '' : [{ id: 'all', name: 'All ' + g.name, icon: '🌈' }, ...topics].map(c => {
      const n = c.id === 'all' ? base.length : base.filter(v => v.cat === c.id).length;
      return `<button class="tab" role="tab" data-cat="${c.id}" aria-selected="${c.id === view.topic}">${c.icon} ${esc(c.name)}<span class="n">${n}</span></button>`;
    }).join('');

    // Videos / Shorts filter
    const scope = inGroup(view.group).filter(v => view.topic === 'all' || v.cat === view.topic);
    const kinds = [['all', 'All', scope.length], ['video', '🎬 Videos', scope.filter(v => v.kind === 'video').length], ['short', '⚡ Shorts', scope.filter(v => v.kind === 'short').length]];
    $('#kinds').innerHTML = kinds.map(([id, name, n]) =>
      `<button class="kind" type="button" data-kind="${id}" aria-pressed="${id === view.kind}" ${n ? '' : 'disabled'}>${name} <span class="n">${n}</span></button>`).join('');
  }

  function renderGrid() {
    const list = currentList();
    const done = store.get().done;
    if (!list.length) {
      const g = C.groups.find(g => g.id === view.group);
      $('#grid').innerHTML = `<div class="empty"><div class="big">${g.icon}</div><h3>More ${esc(g.name)} videos are on the way!</h3>
        <p>We upload a new lesson every day. Subscribe so your child is first to watch.</p>
        <a class="btn btn-sub" href="${C.channelUrl}?sub_confirmation=1" target="_blank" rel="noopener">🔔 Subscribe for new videos</a></div>`;
      $('#moreBox').hidden = true;
      return;
    }
    $('#grid').innerHTML = list.slice(0, view.shown).map(v => {
      const c = catById(v.cat);
      const isShort = v.kind === 'short';
      return `<button class="card${isShort ? ' is-short' : ''}" type="button" data-play="${v.id}" data-title="${esc(v.title)}"${isShort ? ' data-short="1"' : ''}>
        <div class="thumb"><img src="${thumb(v.id)}" alt="" loading="lazy">${isShort ? '<span class="dur">⚡ Short</span>' : v.duration ? `<span class="dur">${esc(v.duration)}</span>` : ''}${done.includes(v.id) ? '<span class="done">⭐ Learned</span>' : ''}</div>
        <div class="body"><span class="badge">${c.icon} ${esc(c.name)}</span><h3>${esc(cleanTitle(v.title))}</h3>
        <div class="meta">👀 ${fmtViews(v.views)} views</div></div>
      </button>`;
    }).join('');
    const left = list.length - view.shown;
    $('#moreBox').hidden = left <= 0;
    $('#moreBtn').textContent = `Show more (${left} left)`;
  }

  // ---------- Player modal ----------
  let playing = null;
  function openPlayer(id, title, isShort) {
    playing = id;
    $('#player').innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1" title="${esc(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    $('#modalTitle').textContent = title;
    $('#modalYt').href = isShort ? shortUrl(id) : watchUrl(id);
    $('.modal-card').classList.toggle('vertical', !!isShort);
    $('#modal').hidden = false;
    $('#modalClose').focus();
  }
  function closePlayer() { $('#modal').hidden = true; $('#player').innerHTML = ''; playing = null; }

  document.addEventListener('click', e => {
    const p = e.target.closest('[data-play]');
    if (p) return openPlayer(p.dataset.play, p.dataset.title, p.dataset.short);
    const s = e.target.closest('[data-star]');
    if (s) return earnStar(s.dataset.star);
    const g = e.target.closest('[data-group]');
    if (g) { Object.assign(view, { group: g.dataset.group, topic: 'all', kind: 'all', shown: C.topicsPageSize }); renderTabs(); renderGrid(); return; }
    const t = e.target.closest('[data-cat]');
    if (t) { Object.assign(view, { topic: t.dataset.cat, kind: 'all', shown: C.topicsPageSize }); renderTabs(); renderGrid(); return; }
    const k = e.target.closest('[data-kind]');
    if (k && !k.disabled) { Object.assign(view, { kind: k.dataset.kind, shown: C.topicsPageSize }); renderTabs(); renderGrid(); return; }
    if (e.target.closest('#moreBtn')) { view.shown += C.topicsPageSize; renderGrid(); }
  });
  $('#modalStar').addEventListener('click', () => playing && earnStar(playing));
  $('#modalClose').addEventListener('click', closePlayer);
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closePlayer(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) closePlayer(); });

  $('#shareBtn').addEventListener('click', async () => {
    const data = { title: 'Learning with Fun', text: 'My child loves these daily ABC & number videos! 🌈 Learning with Fun:', url: location.href.startsWith('http') ? location.href : C.channelUrl };
    try {
      if (navigator.share) { await navigator.share(data); return; }
      await navigator.clipboard.writeText(`${data.text} ${data.url}`);
      toast('🔗 Link copied! Paste it in your family group.');
    } catch { window.open(`https://wa.me/?text=${encodeURIComponent(data.text + ' ' + data.url)}`, '_blank', 'noopener'); }
  });

  if (D.updated) $('#updated').textContent = `Videos updated ${fmtDate(D.updated)}`;
  renderToday(); renderShorts(); renderPopularVideos();
  if (!topShorts.length && !popularVideos.length) { $('#loved').hidden = true; $('#lovedNav').hidden = true; }
  renderTabs(); renderGrid(); renderStars();
})();

// ---------- Phone menu ----------
(function () {
  const btn = document.getElementById('menuBtn');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;
  const setOpen = open => {
    nav.classList.toggle('open', open);
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  btn.addEventListener('click', () => setOpen(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('click', e => { if (!e.target.closest('.topbar')) setOpen(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setOpen(false); });
  addEventListener('resize', () => { if (innerWidth > 900) setOpen(false); });
})();
