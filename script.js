/* NANHER HEW // CONSCIOUSNESS OS
   Browser-only experience. Original artwork references remain intact.
   IMPORTANT: the three uploaded source files did not contain arts/ images.
   Set ORIGINAL_ART_FILES_PRESENT to true after supplying that folder.
*/
(() => {
  'use strict';

  const ORIGINAL_ART_FILES_PRESENT = false; // CHANGE TO true WHEN arts/ IS ADDED.
  const SESSION_AGE = 'nanherAgeVerified'; // preserved original sessionStorage key
  const SESSION_INTRO = 'nanherConsciousnessEntered';
  const SESSION_MUTED = 'nanherAudioMuted';
  const MODULES = ['overview', 'work', 'archive', 'identity', 'commissions', 'contact'];
  const MODULE_LABELS = ['OVERVIEW', 'RECENT WORKS', 'ARCHIVE', 'IDENTITY', 'COMMISSIONS', 'CONTACT'];

  const archive = {
    all: [
      { image: 'arts/05.jpg', title: 'ARCHIVE / 05', detail: 'ARCHIVE / 05' },
      { image: 'arts/06.jpg', title: 'ARCHIVE / 06', detail: 'ARCHIVE / 06' },
      { image: 'arts/07.jpg', title: 'ARCHIVE / 07', detail: 'ARCHIVE / 07' },
      { image: 'arts/08.jpg', title: 'ARCHIVE / 08', detail: 'ARCHIVE / 08' }
    ],
    characters: [
      { image: 'arts/05.jpg', title: 'CHARACTER / 01', detail: 'CHARACTER / 01' },
      { image: 'arts/06.jpg', title: 'CHARACTER / 02', detail: 'CHARACTER / 02' }
    ],
    bara: [
      { image: 'arts/07.jpg', title: 'BARA / 01', detail: 'BARA / 01' },
      { image: 'arts/08.jpg', title: 'BARA / 02', detail: 'BARA / 02' }
    ],
    commissions: [
      { image: 'arts/02.jpg', title: 'COMMISSION / 01', detail: 'Original archive credit: @BJOERN90' },
      { image: 'arts/03.jpg', title: 'COMMISSION / 02', detail: 'Original archive credit: @OUTDOOWPUMPKIN9' }
    ],
    wips: [
      { image: 'arts/wip01.jpg', title: 'WIP / 01', detail: 'WORK IN PROGRESS / 01' },
      { image: 'arts/wip02.jpg', title: 'WIP / 02', detail: 'WORK IN PROGRESS / 02' }
    ]
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const el = {
    body: document.body,
    ageGate: $('#ageGate'), ageEnter: $('#ageEnter'), ageLeave: $('#ageLeave'),
    intro: $('#introScreen'), enter: $('#enterConsciousness'), skip: $('#skipIntro'),
    introStatus: $('#introStatus'), bootInterface: $('#bootInterface'), bootMemory: $('#bootMemory'),
    shell: $('#appShell'), viewport: $('#mainContent'), nav: $('#moduleNavigation'),
    soundToggle: $('#soundToggle'), soundLabel: $('#soundLabel'),
    currentPath: $('#currentPath'), telemetryModule: $('#telemetryModule'),
    archiveGrid: $('#archiveGrid'), archiveSummary: $('#archiveSummary'),
    hero: $('#heroMedia'), heroAssetStatus: $('#heroAssetStatus'),
    motionPermission: $('#motionPermission'),
    lightbox: $('#lightbox'), lightboxClose: $('#lightboxClose'),
    lightboxArt: $('#lightboxArt'), lightboxTitle: $('#lightboxTitle'),
    lightboxDetail: $('#lightboxDetail'), lightboxCounter: $('#lightboxCounter'),
    lightboxPrev: $('#lightboxPrev'), lightboxNext: $('#lightboxNext'),
    cursor: $('#cursorReticle'), announcer: $('#announcer')
  };

  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch { /* storage may be disabled */ } }
  };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const touchDevice = navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches;

  /* A restrained, original procedural sonification; unlock only after a user action. */
  class InterfaceAudio {
    constructor() { this.context = null; this.output = null; this.muted = storage.get(SESSION_MUTED) === 'true'; this.lastHover = 0; }
    unlock() {
      if (this.muted) return false;
      try {
        if (!this.context) {
          const AudioCtor = window.AudioContext || window.webkitAudioContext;
          if (!AudioCtor) return false;
          this.context = new AudioCtor();
          this.output = this.context.createGain();
          this.output.gain.value = .21; // overall attenuation
          this.output.connect(this.context.destination);
        }
        if (this.context.state === 'suspended') this.context.resume().catch(() => {});
        return true;
      } catch { return false; }
    }
    tone(frequency, delay, duration, type = 'sine', volume = .16, ending = null) {
      if (!this.context || !this.output || this.muted) return;
      try {
        const t = this.context.currentTime + delay;
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, t);
        if (ending && ending > 0) osc.frequency.exponentialRampToValueAtTime(ending, t + duration);
        gain.gain.setValueAtTime(.0001, t);
        gain.gain.exponentialRampToValueAtTime(Math.max(.001, volume), t + Math.min(.022, duration / 4));
        gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
        osc.connect(gain); gain.connect(this.output);
        osc.start(t); osc.stop(t + duration + .018);
        osc.onended = () => { osc.disconnect(); gain.disconnect(); };
      } catch { /* unsupported or interrupted audio: interface remains functional */ }
    }
    noise(delay, duration, amount = .055) {
      if (!this.context || this.muted) return;
      try {
        const count = Math.ceil(this.context.sampleRate * Math.max(.03, duration));
        const buffer = this.context.createBuffer(1, count, this.context.sampleRate);
        const samples = buffer.getChannelData(0);
        for (let i = 0; i < count; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / count);
        const source = this.context.createBufferSource(); source.buffer = buffer;
        const filter = this.context.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = 1100; filter.Q.value = .45;
        const gain = this.context.createGain(); gain.gain.value = amount;
        source.connect(filter); filter.connect(gain); gain.connect(this.output);
        source.start(this.context.currentTime + delay);
        source.onended = () => { source.disconnect(); filter.disconnect(); gain.disconnect(); };
      } catch { /* optional timbre */ }
    }
    play(name) {
      if (this.muted || !this.context) return;
      if (name === 'entry') {
        this.tone(67, 0, .33, 'sine', .34, 48);         // low electrical pulse
        this.tone(522, .19, .09, 'triangle', .12);
        this.tone(784, .30, .12, 'triangle', .10);     // two digital data pings
        this.noise(.39, .25, .08);
        this.tone(180, .44, .38, 'sawtooth', .08, 780); // ascending synchronization
        this.tone(96, .88, .3, 'sine', .40, 64);       // access confirmation
        this.tone(640, .91, .26, 'triangle', .07, 320);
      } else if (name === 'select') {
        this.tone(250, 0, .065, 'triangle', .09, 360);
        this.tone(640, .055, .08, 'sine', .07);
      } else if (name === 'hover') {
        if (performance.now() - this.lastHover < 180) return;
        this.lastHover = performance.now();
        this.tone(660, 0, .033, 'sine', .032);
      } else if (name === 'open') {
        this.tone(260, 0, .12, 'triangle', .08, 520);
        this.noise(0, .06, .03);
      } else if (name === 'close') {
        this.tone(480, 0, .12, 'triangle', .08, 210);
      } else if (name === 'tab') {
        this.tone(410, 0, .055, 'triangle', .06);
      } else if (name === 'confirm') {
        this.tone(420, 0, .09, 'sine', .08);
        this.tone(620, .075, .15, 'sine', .08);
      } else if (name === 'error') {
        this.tone(160, 0, .16, 'sawtooth', .08, 120);
      }
    }
    setMuted(muted) {
      this.muted = muted;
      storage.set(SESSION_MUTED, String(muted));
      if (!muted) { this.unlock(); this.play('confirm'); }
    }
  }
  const audio = new InterfaceAudio();
  function updateSoundControl() {
    el.soundToggle.setAttribute('aria-pressed', String(!audio.muted));
    el.soundToggle.setAttribute('aria-label', audio.muted ? 'Enable sound' : 'Mute sound');
    el.soundLabel.textContent = audio.muted ? 'SOUND OFF' : 'SOUND ON';
  }

  let booting = false;
  let openedModule = null;
  function showIntro() {
    if (storage.get(SESSION_INTRO) === 'true') { grantAccess(); return; }
    el.intro.hidden = false;
    el.shell.setAttribute('aria-hidden', 'true');
    el.body.classList.add('access-locked');
    el.enter.focus({ preventScroll: true });
  }
  function grantAccess() {
    el.intro.hidden = true;
    el.shell.setAttribute('aria-hidden', 'false');
    el.body.classList.remove('access-locked');
    storage.set(SESSION_INTRO, 'true');
    selectModule(hashModule(), false);
    el.nav.querySelector('.is-active')?.focus({ preventScroll: true });
    el.announcer.textContent = 'Access granted. Nanher Hew modules available.';
  }
  function exitIntro() {
    if (booting) return;
    booting = true;
    el.intro.classList.add('is-exiting');
    window.setTimeout(() => { el.intro.classList.remove('is-exiting'); grantAccess(); }, reduceMotion.matches ? 15 : 340);
  }
  function enterIntro() {
    if (booting) return;
    booting = true;
    audio.unlock(); // requires the actual click; never invoked from page load
    audio.play('entry');
    el.intro.classList.add('is-booting');
    el.introStatus.textContent = 'INITIALIZATION / SYNCHRONIZING';
    el.bootInterface.textContent = 'SYNCING';
    el.bootMemory.textContent = 'LOADING';
    el.enter.disabled = true;
    window.setTimeout(() => {
      el.introStatus.textContent = 'ACCESS GRANTED';
      el.bootInterface.textContent = 'ONLINE';
      el.bootMemory.textContent = 'MOUNTED';
      el.intro.classList.add('is-exiting');
      window.setTimeout(grantAccess, reduceMotion.matches ? 10 : 330);
    }, reduceMotion.matches ? 65 : 1050);
  }
  function initGate() {
    if (storage.get(SESSION_AGE) === 'true') { el.ageGate.hidden = true; showIntro(); }
    else { el.ageGate.hidden = false; el.intro.hidden = true; el.ageEnter.focus({ preventScroll: true }); }
    el.ageEnter.addEventListener('click', () => {
      storage.set(SESSION_AGE, 'true');
      el.ageGate.hidden = true;
      showIntro();
    });
    el.ageLeave.addEventListener('click', () => { window.location.assign('https://www.google.com'); });
    el.enter.addEventListener('click', enterIntro);
    el.skip.addEventListener('click', () => { exitIntro(); });
  }

  function hashModule() {
    const hash = decodeURIComponent(window.location.hash.replace('#', '')).toLowerCase();
    const aliases = { top: 'overview', about: 'identity', intro: 'overview' };
    return MODULES.includes(hash) ? hash : (aliases[hash] || 'overview');
  }
  function selectModule(id, push = true) {
    if (!MODULES.includes(id)) return;
    const changed = openedModule !== id;
    $$('.module[data-module]').forEach((section) => { section.hidden = section.dataset.module !== id; });
    $$('.module-nav__link').forEach((link) => {
      const current = link.dataset.navigate === id;
      link.classList.toggle('is-active', current);
      if (current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
    });
    const index = MODULES.indexOf(id);
    el.currentPath.textContent = '/' + id.toUpperCase();
    el.telemetryModule.textContent = `${String(index + 1).padStart(2, '0')} / ${MODULE_LABELS[index]}`;
    document.title = `${MODULE_LABELS[index]} / NANHER HEW 文`;
    if (changed) {
      openedModule = id;
      el.viewport.scrollTop = 0;
      audio.play('select');
      el.announcer.textContent = `${MODULE_LABELS[index]} module active`;
    }
    if (push && window.location.hash !== '#' + id) history.pushState(null, '', '#' + id);
  }

  /* All artwork filenames, category assignments and archive credits are sourced from original HTML. */
  let currentFilter = 'all';
  function setArtMedia(tile) {
    const path = tile.dataset.artPath;
    const visual = $('.art-tile__visual', tile);
    if (!path || !visual || !ORIGINAL_ART_FILES_PRESENT) return;
    const image = new Image();
    image.alt = `${tile.dataset.artTitle} — illustration by Nanher Hew`;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.onload = () => { visual.appendChild(image); tile.classList.add('has-art'); };
    image.onerror = () => { tile.dataset.assetState = 'missing'; };
    image.src = './' + path;
  }
  function createArchiveTile(art) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'art-tile';
    button.dataset.artPath = art.image;
    button.dataset.artTitle = art.title;
    button.dataset.artDetail = art.detail;
    const visual = document.createElement('span'); visual.className = 'art-tile__visual';
    const metadata = document.createElement('span'); metadata.className = 'art-tile__meta';
    const label = document.createElement('span'); label.textContent = art.title;
    const action = document.createElement('span'); action.textContent = 'VIEW MEMORY ↗';
    metadata.append(label, action);
    button.append(visual, metadata);
    setArtMedia(button);
    return button;
  }
  function showArchive(filter, play = true) {
    if (!(filter in archive)) return;
    currentFilter = filter;
    const buttons = $$('.archive-tab');
    buttons.forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    const activeTab = buttons.find(btn => btn.dataset.filter === filter);
    if (activeTab) el.archiveGrid.setAttribute('aria-labelledby', activeTab.id);
    el.archiveGrid.replaceChildren(...archive[filter].map(createArchiveTile));
    el.archiveSummary.textContent = `${filter.toUpperCase()} / ${String(archive[filter].length).padStart(2, '0')} RECORDS`;
    if (play) { audio.play('tab'); el.announcer.textContent = `${filter} archive displayed`; }
  }

  /* Lightbox is available even when the original image folder is missing. */
  let lightboxIndex = 0;
  let lightboxCollection = [];
  let returnFocus = null;
  function activeArtCollection() {
    const active = $('.module:not([hidden])');
    return $$('[data-art-path]', active || document);
  }
  function renderLightbox() {
    const tile = lightboxCollection[lightboxIndex];
    if (!tile) return;
    const path = tile.dataset.artPath;
    const img = $('.art-tile__visual img', tile);
    el.lightboxArt.replaceChildren();
    if (img && img.complete && img.naturalWidth > 0) {
      const full = new Image(); full.src = img.src; full.alt = img.alt;
      el.lightboxArt.appendChild(full);
    } else {
      const fallback = document.createElement('div'); fallback.className = 'lightbox__placeholder';
      const mark = document.createElement('b'); mark.textContent = '文';
      const notice = document.createElement('span'); notice.textContent = 'ORIGINAL ARTWORK NOT INCLUDED IN THE UPLOAD';
      const file = document.createElement('small'); file.textContent = 'EXPECTED ASSET // ' + path;
      fallback.append(mark, notice, file); el.lightboxArt.appendChild(fallback);
    }
    el.lightboxTitle.textContent = tile.dataset.artTitle || 'ARTWORK';
    el.lightboxDetail.textContent = tile.dataset.artDetail || 'MEMORY FRAGMENT';
    el.lightboxCounter.textContent = `${String(lightboxIndex + 1).padStart(2, '0')} / ${String(lightboxCollection.length).padStart(2, '0')}`;
    el.lightboxPrev.disabled = lightboxCollection.length < 2;
    el.lightboxNext.disabled = lightboxCollection.length < 2;
  }
  function openLightbox(tile) {
    lightboxCollection = activeArtCollection();
    lightboxIndex = lightboxCollection.indexOf(tile);
    if (lightboxIndex < 0) return;
    returnFocus = document.activeElement;
    renderLightbox(); el.lightbox.hidden = false;
    el.lightboxClose.focus({ preventScroll: true });
    audio.play('open');
  }
  function closeLightbox() {
    if (el.lightbox.hidden) return;
    el.lightbox.hidden = true;
    audio.play('close');
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
  }
  function stepLightbox(direction) {
    if (lightboxCollection.length < 2) return;
    lightboxIndex = (lightboxIndex + direction + lightboxCollection.length) % lightboxCollection.length;
    renderLightbox(); audio.play('tab');
  }

  /* Hero uses supplied layered image, mouse parallax and opt-in gyroscope only. */
  function initHero() {
    if (ORIGINAL_ART_FILES_PRESENT) {
      const ageBanner = new Image();
      ageBanner.onload = () => { $('#ageBanner').style.backgroundImage = `url("${ageBanner.src}")`; };
      ageBanner.src = './arts/age-banner.jpg';
      const source = new Image();
      source.onload = () => {
        $$('[data-hero-layer]').forEach(layer => layer.style.backgroundImage = `url("${source.src}")`);
        $('#heroFallback').hidden = true;
        el.heroAssetStatus.textContent = 'CONNECTED';
      };
      source.onerror = () => { el.heroAssetStatus.textContent = 'SOURCE OFFLINE'; };
      source.src = './arts/hero.PNG';
    }
    if (!reduceMotion.matches && finePointer.matches) {
      let raf = 0;
      el.hero.addEventListener('pointermove', (evt) => {
        const rect = el.hero.getBoundingClientRect();
        const x = ((evt.clientX - rect.left) / rect.width - .5) * 23;
        const y = ((evt.clientY - rect.top) / rect.height - .5) * 23;
        if (raf) return;
        raf = requestAnimationFrame(() => {
          el.hero.style.setProperty('--parallax-x', `${x.toFixed(1)}px`);
          el.hero.style.setProperty('--parallax-y', `${y.toFixed(1)}px`);
          raf = 0;
        });
      });
      el.hero.addEventListener('pointerleave', () => {
        el.hero.style.setProperty('--parallax-x', '0px');
        el.hero.style.setProperty('--parallax-y', '0px');
      });
    }
    if (!reduceMotion.matches && touchDevice && 'DeviceOrientationEvent' in window) {
      el.motionPermission.hidden = false;
      el.motionPermission.addEventListener('click', async () => {
        try {
          const D = window.DeviceOrientationEvent;
          if (typeof D.requestPermission === 'function') {
            const permission = await D.requestPermission();
            if (permission !== 'granted') { el.motionPermission.textContent = 'MOTION PERMISSION DENIED'; audio.play('error'); return; }
          }
          window.addEventListener('deviceorientation', event => {
            if (typeof event.gamma !== 'number' || typeof event.beta !== 'number') return;
            const x = Math.max(-16, Math.min(16, event.gamma * .35));
            const y = Math.max(-16, Math.min(16, event.beta * .22));
            el.hero.style.setProperty('--parallax-x', `${x.toFixed(1)}px`);
            el.hero.style.setProperty('--parallax-y', `${y.toFixed(1)}px`);
          }, { passive: true });
          el.motionPermission.textContent = 'DEVICE MOTION ENABLED';
          el.motionPermission.disabled = true;
          audio.play('confirm');
        } catch {
          el.motionPermission.textContent = 'DEVICE MOTION UNAVAILABLE';
          audio.play('error');
        }
      }, { once: true });
    }
  }

  /* Overlay focus management + keyboard accessibility. */
  function trapFocus(event, container) {
    const focusables = $$('button:not([disabled]):not([hidden]), a[href], input:not([disabled])', container).filter(node => node.getClientRects().length);
    if (!focusables.length) return;
    const first = focusables[0], last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
  function initEvents() {
    updateSoundControl();
    el.soundToggle.addEventListener('click', () => { audio.setMuted(!audio.muted); updateSoundControl(); });
    el.nav.addEventListener('click', event => {
      const link = event.target.closest('[data-navigate]');
      if (!link) return;
      event.preventDefault(); selectModule(link.dataset.navigate);
    });
    document.addEventListener('click', event => {
      const go = event.target.closest('[data-go]');
      if (go) selectModule(go.dataset.go);
      const tile = event.target.closest('[data-art-path]');
      if (tile && !el.lightbox.contains(tile)) openLightbox(tile);
      if (event.target.closest('[data-external-sfx]')) audio.play('confirm');
    });
    $$('.archive-tab').forEach(tab => tab.addEventListener('click', () => showArchive(tab.dataset.filter)));
    $('.archive-tabs').addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const tabs = $$('.archive-tab');
      let index = tabs.findIndex(tab => tab.dataset.filter === currentFilter);
      index = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[index].focus(); showArchive(tabs[index].dataset.filter);
    });
    el.lightboxClose.addEventListener('click', closeLightbox);
    el.lightboxPrev.addEventListener('click', () => stepLightbox(-1));
    el.lightboxNext.addEventListener('click', () => stepLightbox(1));
    el.lightbox.addEventListener('click', event => { if (event.target === el.lightbox || event.target === el.lightboxArt) closeLightbox(); });
    window.addEventListener('popstate', () => selectModule(hashModule(), false));
    window.addEventListener('hashchange', () => { if (!el.body.classList.contains('access-locked')) selectModule(hashModule(), false); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Tab') {
        if (!el.ageGate.hidden) trapFocus(event, el.ageGate);
        else if (!el.intro.hidden) trapFocus(event, el.intro);
        else if (!el.lightbox.hidden) trapFocus(event, el.lightbox);
        return;
      }
      if (event.key === 'Escape') {
        if (!el.lightbox.hidden) closeLightbox();
        else if (!el.intro.hidden && !booting) exitIntro();
        return;
      }
      if (!el.lightbox.hidden) {
        if (event.key === 'ArrowLeft') { event.preventDefault(); stepLightbox(-1); }
        if (event.key === 'ArrowRight') { event.preventDefault(); stepLightbox(1); }
        return;
      }
      if (!el.ageGate.hidden || !el.intro.hidden || event.altKey || event.ctrlKey || event.metaKey) return;
      const digit = Number(event.key);
      if (Number.isInteger(digit) && digit >= 1 && digit <= 6) selectModule(MODULES[digit - 1]);
    });
    if (finePointer.matches && !reduceMotion.matches) {
      document.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        el.cursor.style.left = `${event.clientX}px`;
        el.cursor.style.top = `${event.clientY}px`;
        el.cursor.style.opacity = '1';
        el.cursor.classList.toggle('is-active', Boolean(event.target.closest('a,button')));
      }, { passive: true });
      document.addEventListener('pointerout', event => { if (!event.relatedTarget) el.cursor.style.opacity = '0'; });
      document.addEventListener('pointerover', event => {
        if (event.target.closest('.module-nav__link, .archive-tab, .action') && finePointer.matches) audio.play('hover');
      }, { passive: true });
    }
  }

  /* Never generate requests to non-existent assets unless the artist supplies arts/. */
  $$('.art-tile[data-art-path]').forEach(setArtMedia);
  showArchive('all', false);
  initEvents();
  initHero();
  initGate();
  // Discord CTA is a standard external link; no form processing.
})();
