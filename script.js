/* NANHER HEW 文 — V7. Single-page portfolio; no Supabase, forms, build tools, or backend. */
(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchDevice = window.matchMedia('(pointer: coarse)').matches;
  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { sessionStorage.setItem(key, String(value)); } catch { /* Private session. */ } }
  };
  const els = {
    boot: $('bootScreen'), bootBar: $('bootBar'), bootPercent: $('bootPercent'),
    bootMessage: $('bootMessage'), bootTrack: $('bootTrack'), bootSubstatus: $('bootSubstatus'),
    age: $('ageGate'), ageEnter: $('ageEnter'), ageLeave: $('ageLeave'),
    navToggle: $('navToggle'), feedToggle: $('feedToggle'), navClose: $('navClose'), feedClose: $('feedClose'),
    nodes: $('accessNodes'), feed: $('monitorFeed'), navLinks: [...document.querySelectorAll('[data-nav]')],
    recent: $('recentWorks'), archive: $('archiveGrid'), archiveSummary: $('archiveSummary'),
    archiveTabs: [...document.querySelectorAll('.archive-tab')],
    heroPortrait: $('heroPortrait'), optionalImages: [...document.querySelectorAll('.optional-image')],
    monitorTime: $('sessionTime'), pulseBpm: $('pulseBpm'), motion: $('motionToggle'),
    lightbox: $('lightbox'), lightboxArt: $('lightboxArt'), lightboxTitle: $('lightboxTitle'),
    lightboxDetail: $('lightboxDetail'), lightboxCounter: $('lightboxCounter'),
    lightboxClose: $('lightboxClose'), lightboxPrev: $('lightboxPrev'), lightboxNext: $('lightboxNext'),
    sound: $('soundToggle'), music: $('ambientMusic'), cursor: $('cursorReticle'), announcer: $('announcer')
  };

  // Original portfolio filenames, titles, category groupings, and client attributions.
  const artwork = {
    recent: [
      ['arts/01.jpg', 'CHARACTER', 'RECENT WORK / 01', 'characters'],
      ['arts/02.jpg', 'FURRY', 'RECENT WORK / 02', 'commissions'],
      ['arts/03.jpg', 'BARA', 'RECENT WORK / 03', 'bara'],
      ['arts/04.jpg', 'ILLUSTRATION', 'RECENT WORK / 04', 'characters']
    ],
    archive: [
      ['arts/05.jpg', 'ARCHIVE / 05', 'ARTWORK', 'characters'],
      ['arts/06.jpg', 'ARCHIVE / 06', 'ARTWORK', 'characters'],
      ['arts/07.jpg', 'ARCHIVE / 07', 'ARTWORK', 'bara'],
      ['arts/08.jpg', 'ARCHIVE / 08', 'ARTWORK', 'bara'],
      ['arts/02.jpg', 'COMMISSION / 01', 'FOR @BJOERN90', 'commissions'],
      ['arts/03.jpg', 'COMMISSION / 02', 'FOR @OUTDOOWPUMPKIN9', 'commissions'],
      ['arts/wip01.jpg', 'WIP / 01', 'WORK IN PROGRESS', 'wips'],
      ['arts/wip02.jpg', 'WIP / 02', 'WORK IN PROGRESS', 'wips']
    ]
  };

  const state = {
    verified: storage.get('nhAgeVerifiedV7') === 'true',
    unlocked: false, navOpen: false, feedOpen: false, filter: 'all',
    activeSection: 'overview', list: [], lightboxIndex: 0, lightboxOrigin: null,
    playing: false, audioSource: 'off', audioToken: 0, orientation: false,
    sessionStart: Number(storage.get('nhSessionStart')) || 0
  };
  const synth = createSynth();

  function init() {
    if (touchDevice) document.body.classList.add('touch-device');
    else setupCursor();
    if (!state.sessionStart || !Number.isFinite(state.sessionStart) || state.sessionStart > Date.now()) {
      state.sessionStart = Date.now();
      storage.set('nhSessionStart', state.sessionStart);
    }
    setInterval(updateSessionClock, 1000);
    updateSessionClock();
    if (els.heroPortrait) {
      const onHeroReady = () => {
        if (els.heroPortrait.naturalWidth > 0) document.getElementById('overview').classList.add('has-portrait');
      };
      els.heroPortrait.addEventListener('load', onHeroReady);
      els.heroPortrait.addEventListener('error', () => { els.heroPortrait.hidden = true; });
      if (els.heroPortrait.complete && els.heroPortrait.naturalWidth > 0) onHeroReady();
    }
    prepareOptionalImages();
    renderTiles(els.recent, artwork.recent);
    renderArchive();
    setupControls();
    setupLightbox();
    setupIntersectionTracking();
    setupParallax();
    setupAudio();
    bootSequence();
  }

  function bootSequence() {
    const steps = reducedMotion
      ? [[0, 70, 'ALMOST DONE'], [190, 100, 'ACCESS READY']]
      : [[70, 7, 'CONNECTING'], [250, 19, 'LOCATING MEMORY'], [450, 38, 'DECRYPTING VISUALS'],
        [660, 54, 'SCANNING IDENTITY'], [870, 70, 'ALMOST DONE'], [1150, 87, 'SYNCING'], [1400, 100, 'ACCESS READY']];
    steps.forEach(([delay, value, message]) => {
      setTimeout(() => {
        els.bootBar.style.width = `${value}%`;
        els.bootPercent.textContent = `${String(value).padStart(2, '0')}%`;
        els.bootTrack.setAttribute('aria-valuenow', String(value));
        els.bootMessage.textContent = message;
        els.bootSubstatus.textContent = value === 70 ? '70% / ALMOST DONE..' : value === 100 ? 'NEURAL ARCHIVE READY' : 'CHECKING MEMORY FRAGMENTS...';
      }, delay);
    });
    setTimeout(() => {
      els.boot.hidden = true;
      if (state.verified) unlock();
      else showGate();
    }, reducedMotion ? 360 : 1720);
  }

  function showGate() {
    els.age.hidden = false;
    els.ageEnter.focus({preventScroll: true});
  }
  function unlock() {
    state.unlocked = true;
    els.age.hidden = true;
    document.body.classList.remove('state-locked');
    const target = decodeURIComponent(location.hash.slice(1));
    if (target && document.getElementById(target)) {
      requestAnimationFrame(() => document.getElementById(target).scrollIntoView({behavior:'instant'}));
    }
  }

  function setupControls() {
    els.ageEnter.addEventListener('click', () => {
      storage.set('nhAgeVerifiedV7', 'true');
      state.verified = true;
      unlock();
      startAudio(); // only after a direct user action
      playUi('enter');
    });
    els.ageLeave.addEventListener('click', () => { window.location.href = 'https://www.google.com'; });

    els.navToggle.addEventListener('click', () => setWindow('nodes', !state.navOpen));
    els.feedToggle.addEventListener('click', () => setWindow('feed', !state.feedOpen));
    els.navClose.addEventListener('click', () => setWindow('nodes', false));
    els.feedClose.addEventListener('click', () => setWindow('feed', false));
    // Deliberately no outside-click listener. A node selection NEVER closes the floating menu.
    els.navLinks.forEach((link) => link.addEventListener('click', () => {
      playUi('select');
      setActiveSection(link.dataset.nav);
    }));
    document.querySelectorAll('[data-quicklink]').forEach((link) => link.addEventListener('click', () => {
      setWindow('nodes', true); // expose the node list after a hero quick action
      playUi('select');
    }));
    els.archiveTabs.forEach((tab) => tab.addEventListener('click', () => {
      state.filter = tab.dataset.filter || 'all';
      els.archiveTabs.forEach((item) => {
        const active = item === tab;
        item.classList.toggle('is-active', active);
        item.setAttribute('aria-selected', String(active));
      });
      renderArchive();
      playUi('tab');
    }));
    els.sound.addEventListener('click', () => state.playing ? stopAudio() : startAudio());
    els.motion.addEventListener('click', enableMotion);
    document.addEventListener('keydown', (event) => {
      if (event.target.closest?.('input,textarea,select,[contenteditable]')) return;
      if (event.key === 'Escape') {
        if (!els.lightbox.hidden) closeLightbox();
        else if (state.feedOpen) setWindow('feed', false);
        else if (state.navOpen) setWindow('nodes', false);
        return;
      }
      if (!els.lightbox.hidden) {
        if (event.key === 'ArrowLeft') stepLightbox(-1);
        if (event.key === 'ArrowRight') stepLightbox(1);
        return;
      }
      if (!state.unlocked) return;
      if (event.key.toLowerCase() === 'n') setWindow('nodes', !state.navOpen);
      const ids = ['overview', 'works', 'archive', 'identity', 'commissions', 'contact'];
      const index = Number(event.key) - 1;
      if (index >= 0 && index < 6 && ids[index]) {
        document.getElementById(ids[index]).scrollIntoView({behavior: reducedMotion ? 'instant':'smooth'});
        setActiveSection(ids[index]);
      }
    });
    document.querySelectorAll('[data-external-sfx]').forEach((link) => link.addEventListener('click', () => playUi('confirm')));
  }

  function setWindow(which, open) {
    const nav = which === 'nodes';
    const target = nav ? els.nodes : els.feed;
    const toggle = nav ? els.navToggle : els.feedToggle;
    if (nav) state.navOpen = open;
    else state.feedOpen = open;
    target.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = nav ? `[ ${open ? '−' : '+'} ] ACCESS NODES` : `[ ${open ? '−' : '+'} ] MIND MONITOR`;
    if (open) playUi('open');
  }
  function setActiveSection(id) {
    if (!id || !document.getElementById(id)) return;
    state.activeSection = id;
    els.navLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.nav === id));
    announce(`Viewing ${id}`);
  }
  function setupIntersectionTracking() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);
      if (visible[0]) setActiveSection(visible[0].target.id);
    }, {rootMargin:'-15% 0px -55% 0px', threshold:[0,0.15,0.35,0.6]});
    document.querySelectorAll('[data-section]').forEach((element) => observer.observe(element));
  }

  function updateSessionClock() {
    if (!els.monitorTime) return;
    const seconds = Math.max(0, Math.floor((Date.now() - state.sessionStart) / 1000));
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    els.monitorTime.textContent = `${hh}:${mm}:${ss}`;
  }

  function prepareOptionalImages() {
    els.optionalImages.forEach((frame) => {
      const img = frame.querySelector('.optional-image__asset');
      if (!img) return;
      const success = () => { if (img.naturalWidth > 0) frame.classList.add('has-image'); };
      const failure = () => { frame.classList.remove('has-image'); img.hidden = true; };
      img.addEventListener('load', success);
      img.addEventListener('error', failure);
      if (img.complete) { if (img.naturalWidth) success(); else failure(); }
    });
  }

  function renderTiles(container, data) {
    if (!container) return;
    container.replaceChildren(...data.map((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'art-tile';
      button.setAttribute('aria-label', `Open ${item[1]}, ${item[2]}`);
      const visual = document.createElement('span');
      visual.className = 'art-tile__visual';
      visual.style.backgroundImage = `url("${item[0]}")`;
      const meta = document.createElement('span');
      meta.className = 'art-tile__meta';
      const label = document.createElement('span');
      label.textContent = item[1];
      const detail = document.createElement('span');
      detail.textContent = `${item[2]} ↗`;
      meta.append(label, detail);
      button.append(visual, meta);
      button.addEventListener('click', () => openLightbox(data, index, button));
      return button;
    }));
  }
  function renderArchive() {
    const list = state.filter === 'all' ? artwork.archive : artwork.archive.filter((item) => item[3] === state.filter);
    renderTiles(els.archive, list);
    els.archiveSummary.textContent = `${state.filter.toUpperCase()} / ${String(list.length).padStart(2, '0')} RECORDS`;
  }
  function setupLightbox() {
    els.lightboxClose.addEventListener('click', closeLightbox);
    els.lightboxPrev.addEventListener('click', () => stepLightbox(-1));
    els.lightboxNext.addEventListener('click', () => stepLightbox(1));
    els.lightbox.addEventListener('click', (event) => { if (event.target === els.lightbox) closeLightbox(); });
  }
  function openLightbox(list, index, button) {
    state.list = list;
    state.lightboxIndex = index;
    state.lightboxOrigin = button;
    updateLightbox();
    els.lightbox.hidden = false;
    document.body.classList.add('lightbox-open');
    els.lightboxClose.focus({preventScroll: true});
    playUi('open');
  }
  function closeLightbox() {
    if (els.lightbox.hidden) return;
    els.lightbox.hidden = true;
    document.body.classList.remove('lightbox-open');
    state.lightboxOrigin?.focus({preventScroll: true});
    playUi('close');
  }
  function stepLightbox(direction) {
    if (!state.list.length) return;
    state.lightboxIndex = (state.lightboxIndex + direction + state.list.length) % state.list.length;
    updateLightbox();
    playUi('tab');
  }
  function updateLightbox() {
    const item = state.list[state.lightboxIndex];
    if (!item) return;
    const image = new Image();
    image.src = item[0];
    image.alt = item[1];
    els.lightboxArt.replaceChildren(image);
    els.lightboxTitle.textContent = item[1];
    els.lightboxDetail.textContent = item[2];
    els.lightboxCounter.textContent = `${String(state.lightboxIndex + 1).padStart(2,'0')} / ${String(state.list.length).padStart(2,'0')}`;
  }

  function setupCursor() {
    let scheduled = false, x = 0, y = 0;
    document.addEventListener('pointermove', (event) => {
      x = event.clientX; y = event.clientY;
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        document.body.classList.add('cursor-ready');
        els.cursor.style.left = `${x}px`;
        els.cursor.style.top = `${y}px`;
      });
    }, {passive: true});
    document.addEventListener('pointerleave', () => document.body.classList.remove('cursor-ready'));
  }
  function setupParallax() {
    // Only the lightweight background glyph shifts; the full-size artwork never re-renders on pointer movement.
    if (touchDevice || reducedMotion) return;
    const glyph = document.querySelector('.hero-section__symbol');
    if (!glyph) return;
    let queued = false, x = 0, y = 0;
    document.addEventListener('pointermove', (event) => {
      if (window.scrollY > window.innerHeight) return;
      x = (event.clientX / window.innerWidth - .5) * 6;
      y = (event.clientY / window.innerHeight - .5) * 5;
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        glyph.style.transform = `translate(${x.toFixed(2)}px,calc(-50% + ${y.toFixed(2)}px))`;
      });
    }, {passive: true});
  }
  async function enableMotion() {
    if (!touchDevice || !('DeviceOrientationEvent' in window)) {els.motion.textContent = 'MOTION UNAVAILABLE';return;}
    if (state.orientation) return;
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted') throw new Error('Permission denied');
      }
      state.orientation = true;
      els.motion.textContent = 'MOTION INPUT ACTIVE';
      const glyph = document.querySelector('.hero-section__symbol');
      window.addEventListener('deviceorientation', (event) => {
        if (reducedMotion || !glyph || window.scrollY > window.innerHeight) return;
        const x = Math.max(-7, Math.min(7, (event.gamma || 0) * .24));
        const y = Math.max(-7, Math.min(7, (event.beta || 0) * .16));
        glyph.style.transform = `translate(${x}px,calc(-50% + ${y}px))`;
      }, {passive: true});
      playUi('confirm');
    } catch { els.motion.textContent = 'MOTION INPUT BLOCKED'; }
  }

  function setupAudio() {
    els.music.loop = true;
    els.music.preload = 'none';
    els.music.volume = .18;
    els.music.addEventListener('error', () => {
      if (state.playing && state.audioSource === 'loading') void fallback(state.audioToken);
    });
  }
  function startAudio() {
    if (state.playing) return;
    state.playing = true;
    state.audioSource = 'loading';
    const token = ++state.audioToken;
    syncAudio();
    // play() called in user gesture; browser policies forbid pre-interaction playback.
    void synth.init();
    const playRequest = els.music.play();
    Promise.resolve(playRequest).then(() => {
      if (!state.playing || token !== state.audioToken) { els.music.pause(); return; }
      synth.stopAmbient();
      state.audioSource = 'file';
      syncAudio();
    }).catch(() => void fallback(token));
  }
  async function fallback(token) {
    await synth.init();
    if (!state.playing || token !== state.audioToken) return;
    els.music.pause();
    synth.startAmbient();
    state.audioSource = 'procedural';
    syncAudio();
  }
  function stopAudio() {
    state.playing = false;
    state.audioSource = 'off';
    state.audioToken++;
    els.music.pause();
    synth.stopAmbient();
    syncAudio();
  }
  function syncAudio() {
    els.sound.textContent = !state.playing ? 'AUDIO OFF' : state.audioSource === 'file' ? 'MUSIC ON' : 'AMBIENT ON';
    els.sound.setAttribute('aria-pressed', String(state.playing));
  }
  function playUi(kind) { if (state.playing && synth.ctx) synth.ui(kind); }
  function announce(text) { els.announcer.textContent = text; }

  function createSynth() {
    let ctx = null, master = null, drones = [], shimmerTimer = null;
    function pulse(frequency, duration = .12, volume = .028) {
      if (!ctx || !master) return;
      const start = ctx.currentTime, osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + .015);
      gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
      osc.connect(gain).connect(master);
      osc.start(start); osc.stop(start + duration + .03);
    }
    return {
      get ctx() { return ctx; },
      async init() {
        try {
          if (!ctx) {
            const Ctor = window.AudioContext || window.webkitAudioContext;
            if (!Ctor) return;
            ctx = new Ctor();
            master = ctx.createGain();
            master.gain.value = .16;
            master.connect(ctx.destination);
          }
          if (ctx.state === 'suspended') await ctx.resume();
        } catch { /* Optional sound. */ }
      },
      ui(kind) {
        const tones = {enter:220, select:310, tab:360, open:260, close:190, confirm:460};
        pulse(tones[kind] || 280, kind === 'enter' ? .3 : .11, kind === 'enter' ? .06 : .023);
      },
      startAmbient() {
        if (!ctx || drones.length) return;
        drones = [73.42,110,164.81].map((frequency,index) => {
          const osc = ctx.createOscillator(), gain = ctx.createGain();
          osc.type = index === 1 ? 'sine' : 'triangle';
          osc.frequency.value = frequency;
          gain.gain.value = .009;
          osc.connect(gain).connect(master);
          osc.start(); return {osc,gain};
        });
        shimmerTimer = setInterval(() => {
          if (drones.length) pulse([293.66,349.23,392,440,523.25][Math.floor(Math.random()*5)], 1.5, .006);
        },5700);
      },
      stopAmbient() {
        if (shimmerTimer) {clearInterval(shimmerTimer); shimmerTimer = null;}
        drones.forEach(({osc,gain}) => {try {osc.stop();osc.disconnect();gain.disconnect();}catch{}});
        drones=[];
      }
    };
  }
  init();
})();
