(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const queryAll = (selector) => Array.from(document.querySelectorAll(selector));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const storage = {
    get(key, areaName) {
      try { const area = areaName === 'session' ? window.sessionStorage : window.localStorage; return area.getItem(key); } catch { return null; }
    },
    set(key, value, areaName) {
      try { const area = areaName === 'session' ? window.sessionStorage : window.localStorage; area.setItem(key, value); return true; } catch { return false; }
    },
    remove(key, areaName) {
      try { const area = areaName === 'session' ? window.sessionStorage : window.localStorage; area.removeItem(key); } catch { /* Storage can be disabled. */ }
    }
  };

  const work = [
    {src:'./arts/01.jpg', thumb:'./arts/thumbs/01.jpg', point:[7,20], title:'Portrait', detail:'Selected work · 01', category:'characters', featured:true, alt:'Portrait illustration by Nanher Hew, with a deep blue background'},
    {src:'./arts/02.jpg', thumb:'./arts/thumbs/02.jpg', point:[34,15], title:'Furry character', detail:'Selected work · 02', category:'commissions', featured:true, alt:'Furry character illustration by Nanher Hew'},
    {src:'./arts/03.jpg', thumb:'./arts/thumbs/03.jpg', point:[65,20], title:'Bara character', detail:'Selected work · 03', category:'bara', featured:true, alt:'Bara character illustration by Nanher Hew'},
    {src:'./arts/04.jpg', thumb:'./arts/thumbs/04.jpg', point:[91,20], title:'Character study', detail:'Selected work · 04', category:'characters', featured:true, alt:'Character illustration by Nanher Hew'},
    {src:'./arts/05.jpg', thumb:'./arts/thumbs/05.jpg', point:[16,53], title:'Archive drawing', detail:'Artwork · 05', category:'characters', alt:'Character artwork from Nanher Hew’s archive, piece 05'},
    {src:'./arts/06.jpg', thumb:'./arts/thumbs/06.jpg', point:[42,60], title:'Archive drawing', detail:'Artwork · 06', category:'characters', alt:'Character artwork from Nanher Hew’s archive, piece 06'},
    {src:'./arts/07.jpg', thumb:'./arts/thumbs/07.jpg', point:[72,52], title:'Archive drawing', detail:'Artwork · 07', category:'bara', alt:'Bara artwork from Nanher Hew’s archive, piece 07'},
    {src:'./arts/08.jpg', thumb:'./arts/thumbs/08.jpg', point:[93,68], title:'Archive drawing', detail:'Artwork · 08', category:'bara', alt:'Bara artwork from Nanher Hew’s archive, piece 08'},
    {src:'./arts/02.jpg', thumb:'./arts/thumbs/02.jpg', point:[26,85], title:'Commission for @bjoern90', detail:'Client commission · 01', category:'commissions', alt:'Commission artwork by Nanher Hew for @bjoern90'},
    {src:'./arts/03.jpg', thumb:'./arts/thumbs/03.jpg', point:[62,85], title:'Commission for @outdoowpumpkin9', detail:'Client commission · 02', category:'commissions', alt:'Commission artwork by Nanher Hew for @outdoowpumpkin9'},
    {src:'./arts/wip01.jpg', thumb:'./arts/thumbs/wip01.jpg', point:[49,35], title:'Work in progress', detail:'In progress · 01', category:'wips', alt:'Work in progress from Nanher Hew’s archive, piece 01'},
    {src:'./arts/wip02.jpg', thumb:'./arts/thumbs/wip02.jpg', point:[83,87], title:'Work in progress', detail:'In progress · 02', category:'wips', alt:'Work in progress from Nanher Hew’s archive, piece 02'}
  ];
  const categoryLabels = {
    characters:'character',
    bara:'bara',
    commissions:'commission',
    wips:'work-in-progress'
  };
  const categoryColors = {
    characters:'#e54b3c',
    bara:'#f29c58',
    commissions:'#cfb7a0',
    wips:'#91a4b9'
  };

  const state = {
    ageAccepted: false,
    consent: readConsent(),
    filter: 'all',
    visibleWorks: [],
    view: 'gallery',
    lightboxIndex: 0,
    lightboxOrigin: null,
    audioPlaying: false,
    audioToken: 0,
    audioContext: null,
    audioMaster: null,
    drones: [],
    shimmerTimer: null,
    audioVolume: 18,
    sessionStarted: Date.now(),
    monitorOpen: false,
    motionHandler: null
  };

  function readConsent() {
    const raw = storage.get('nh-cookie-choice-v1');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.version === 1 && typeof parsed.preferences === 'boolean') {
        return {
          essential: true,
          preferences: parsed.preferences,
          analytics: parsed.analytics === true,
          marketing: parsed.marketing === true,
          version: 1,
          savedAt: parsed.savedAt || ''
        };
      }
    } catch { /* Treat malformed data as no choice. */ }
    return null;
  }

  function hasPreferences() {
    return Boolean(state.consent && state.consent.preferences);
  }

  function init() {
    const savedFilter = hasPreferences() ? storage.get('nh-gallery-filter') : null;
    const validFilters = ['all','characters','bara','commissions','wips'];
    if (savedFilter && validFilters.includes(savedFilter)) state.filter = savedFilter;
    const savedVolume = hasPreferences() ? Number(storage.get('nh-audio-level')) : 18;
    state.audioVolume = Number.isFinite(savedVolume) ? Math.max(0, Math.min(100, savedVolume)) : 18;

    renderGallery();
    setFilterButtons();
    setupCookieChoices();
    setupAgeGate();
    setupLightbox();
    setWorkView('gallery');
    setupCommissionEstimate();
    setupMonitor();
    setupAudio();
    setupMotion();
    updateSessionTime();
    window.setInterval(updateSessionTime, 1000);

    if (state.consent) {
      $('cookieNotice').hidden = true;
    }
    document.addEventListener('keydown', handleGlobalKeys);
  }

  function setupAgeGate() {
    const dialog = $('ageGate');
    state.ageAccepted = storage.get('nh-age-declared-v1', 'session') === 'yes';
    if (state.ageAccepted) {
      document.body.classList.remove('state-locked');
      if (location.hash === '#cookie-settings') openCookieSettings();
      else showCookieNotice();
    } else {
      dialog.showModal();
    }
    $('ageEnter').addEventListener('click', () => {
      storage.set('nh-age-declared-v1', 'yes', 'session');
      state.ageAccepted = true;
      document.body.classList.remove('state-locked');
      dialog.close();
      if (location.hash === '#cookie-settings') openCookieSettings();
      else showCookieNotice();
      announce('Age declaration recorded for this browser session. Your age was not verified.');
    });
  }

  function showCookieNotice() {
    if (!state.consent) $('cookieNotice').hidden = false;
  }

  function setupCookieChoices() {
    $('cookieAccept').addEventListener('click', () => saveConsent({preferences:true, analytics:true, marketing:true}));
    $('cookieReject').addEventListener('click', () => saveConsent({preferences:false, analytics:false, marketing:false}));
    $('cookieRejectAll').addEventListener('click', () => saveConsent({preferences:false, analytics:false, marketing:false}));
    $('cookieConfigure').addEventListener('click', openCookieSettings);
    $('openCookieSettings').addEventListener('click', openCookieSettings);
    $('cookieClose').addEventListener('click', () => $('cookieDialog').close());
    $('cookieSave').addEventListener('click', () => {
      saveConsent({
        preferences:$('prefPreferences').checked,
        analytics:$('prefAnalytics').checked,
        marketing:$('prefMarketing').checked
      });
    });
    $('cookieDialog').addEventListener('close', () => {
      if (!state.consent) showCookieNotice();
    });
  }

  function openCookieSettings() {
    const dialog = $('cookieDialog');
    $('prefPreferences').checked = Boolean(state.consent && state.consent.preferences);
    $('prefAnalytics').checked = Boolean(state.consent && state.consent.analytics);
    $('prefMarketing').checked = Boolean(state.consent && state.consent.marketing);
    dialog.showModal();
  }

  function saveConsent(choice) {
    state.consent = {
      essential:true,
      preferences:Boolean(choice.preferences),
      analytics:Boolean(choice.analytics),
      marketing:Boolean(choice.marketing),
      version:1,
      savedAt:new Date().toISOString()
    };
    storage.set('nh-cookie-choice-v1', JSON.stringify(state.consent));
    $('cookieNotice').hidden = true;
    if (state.consent.preferences) {
      storage.set('nh-gallery-filter', state.filter);
      storage.set('nh-audio-level', String(state.audioVolume));
    } else {
      storage.remove('nh-gallery-filter');
      storage.remove('nh-audio-level');
    }
    if ($('cookieDialog').open) $('cookieDialog').close();
    announce('Privacy choices saved.');
  }

  function renderGallery() {
    const grid = $('artGrid');
    if (!grid) return;
    state.visibleWorks = state.filter === 'all' ? work.slice() : work.filter((item) => item.category === state.filter);
    grid.replaceChildren();
    state.visibleWorks.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'art-card' + (item.featured ? ' art-card--featured' : '');
      button.setAttribute('aria-label', 'Open ' + item.title + ', ' + item.detail);

      const image = document.createElement('img');
      image.src = item.thumb || item.src;
      image.alt = item.alt;
      image.loading = index < 3 ? 'eager' : 'lazy';
      image.decoding = 'async';

      const caption = document.createElement('span');
      caption.className = 'art-card__caption';
      const title = document.createElement('span');
      title.className = 'art-card__title';
      title.textContent = item.title;
      const meta = document.createElement('span');
      meta.className = 'art-card__meta';
      meta.textContent = item.detail;
      caption.append(title, meta);
      button.append(image, caption);
      button.addEventListener('click', () => openLightbox(index, button));
      grid.append(button);
    });
    renderMemoryMap();
    $('workCount').textContent = state.visibleWorks.length + (state.visibleWorks.length === 1 ? ' piece' : ' pieces');
  }

  function renderMemoryMap() {
    const svg = $('memoryMapLines');
    const nodes = $('memoryMapNodes');
    if (!svg || !nodes) return;
    svg.replaceChildren();
    nodes.replaceChildren();

    const groups = new Map();
    state.visibleWorks.forEach((item) => {
      if (!groups.has(item.category)) groups.set(item.category, []);
      groups.get(item.category).push(item);
    });
    const namespace = 'http://www.w3.org/2000/svg';
    groups.forEach((items, category) => {
      for (let index = 1; index < items.length; index += 1) {
        const line = document.createElementNS(namespace, 'line');
        line.setAttribute('x1', String(items[index - 1].point[0]));
        line.setAttribute('y1', String(items[index - 1].point[1]));
        line.setAttribute('x2', String(items[index].point[0]));
        line.setAttribute('y2', String(items[index].point[1]));
        line.classList.add('memory-map__line');
        line.dataset.category = category;
        line.style.setProperty('--thread-color', categoryColors[category]);
        svg.append(line);
      }
    });

    state.visibleWorks.forEach((item, index) => {
      const button = document.createElement('button');
      const recordNumber = String(work.indexOf(item) + 1).padStart(2, '0');
      button.type = 'button';
      button.className = 'memory-node';
      button.dataset.category = item.category;
      button.style.left = item.point[0] + '%';
      button.style.top = item.point[1] + '%';
      button.setAttribute('aria-label', 'Open ' + item.title + ' in the ' + categoryLabels[item.category] + ' thread');

      const image = document.createElement('img');
      image.src = item.thumb || item.src;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      const label = document.createElement('span');
      label.className = 'memory-node__label';
      const number = document.createElement('span');
      number.className = 'memory-node__index';
      number.textContent = recordNumber;
      label.append(number, document.createTextNode(' / ' + categoryLabels[item.category].toUpperCase()));
      button.append(image, label);
      button.addEventListener('click', () => openLightbox(index, button));
      button.addEventListener('mouseenter', () => highlightThread(item.category, true));
      button.addEventListener('mouseleave', () => highlightThread(item.category, false));
      button.addEventListener('focus', () => highlightThread(item.category, true));
      button.addEventListener('blur', () => highlightThread(item.category, false));
      nodes.append(button);
    });
  }

  function highlightThread(category, active) {
    document.querySelectorAll('.memory-node[data-category="' + category + '"], .memory-map__line[data-category="' + category + '"]').forEach((element) => {
      element.classList.toggle('is-thread-active', active);
    });
  }

  function setWorkView(view) {
    state.view = view === 'map' ? 'map' : 'gallery';
    const showMap = state.view === 'map';
    $('memoryMap').hidden = !showMap;
    $('artGrid').hidden = showMap;
    queryAll('[data-view]').forEach((button) => {
      const active = button.dataset.view === state.view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    $('viewDescription').textContent = showMap
      ? 'Choose a piece, then follow the category thread.'
      : 'Browse each piece at your own pace.';
  }

  function setFilterButtons() {
    queryAll('[data-filter]').forEach((button) => {
      const active = button.dataset.filter === state.filter;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function setupGalleryFilters() {
    queryAll('[data-filter]').forEach((button) => button.addEventListener('click', () => {
      state.filter = button.dataset.filter || 'all';
      renderGallery();
      setFilterButtons();
      if (hasPreferences()) storage.set('nh-gallery-filter', state.filter);
      announce('Showing ' + $('workCount').textContent + ' in ' + button.textContent.trim() + '.');
    }));
    $('surpriseButton').addEventListener('click', () => {
      if (!state.visibleWorks.length) return;
      const index = Math.floor(Math.random() * state.visibleWorks.length);
      openLightbox(index, $('surpriseButton'));
    });
    queryAll('[data-view]').forEach((button) => button.addEventListener('click', () => setWorkView(button.dataset.view)));
  }

  function setupLightbox() {
    const dialog = $('lightbox');
    $('lightboxClose').addEventListener('click', () => dialog.close());
    $('lightboxPrev').addEventListener('click', () => stepLightbox(-1));
    $('lightboxNext').addEventListener('click', () => stepLightbox(1));
    $('lightboxThread').addEventListener('click', followThread);
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener('close', () => {
      state.lightboxOrigin && state.lightboxOrigin.focus({preventScroll:true});
      state.lightboxOrigin = null;
    });
    setupGalleryFilters();
  }

  function openLightbox(index, origin) {
    if (!state.visibleWorks.length) return;
    state.lightboxIndex = index;
    state.lightboxOrigin = origin;
    updateLightbox();
    $('lightbox').showModal();
    $('lightboxClose').focus({preventScroll:true});
  }

  function updateLightbox() {
    const item = state.visibleWorks[state.lightboxIndex];
    if (!item) return;
    const image = $('lightboxImage');
    image.src = item.src;
    image.alt = item.alt;
    $('lightboxTitle').textContent = item.title;
    $('lightboxMeta').textContent = item.detail;
    $('lightboxCounter').textContent = String(state.lightboxIndex + 1).padStart(2,'0') + ' / ' + String(state.visibleWorks.length).padStart(2,'0');
    $('lightboxAnnouncement').textContent = item.title + ', ' + item.detail;
    $('lightboxThread').textContent = 'Follow the ' + categoryLabels[item.category] + ' thread';
  }

  function followThread() {
    const item = state.visibleWorks[state.lightboxIndex];
    if (!item) return;
    state.lightboxOrigin = null;
    $('lightbox').close();
    state.filter = item.category;
    renderGallery();
    setFilterButtons();
    setWorkView('gallery');
    if (hasPreferences()) storage.set('nh-gallery-filter', state.filter);
    window.requestAnimationFrame(() => {
      const firstWork = $('artGrid').querySelector('button');
      if (firstWork) firstWork.focus({preventScroll:true});
      document.querySelector('.work-view-controls').scrollIntoView({behavior:reduceMotion ? 'instant' : 'smooth', block:'center'});
    });
    announce('Following the ' + categoryLabels[item.category] + ' thread with ' + $('workCount').textContent + '.');
  }

  function stepLightbox(direction) {
    if (!state.visibleWorks.length) return;
    state.lightboxIndex = (state.lightboxIndex + direction + state.visibleWorks.length) % state.visibleWorks.length;
    updateLightbox();
  }

  function handleGlobalKeys(event) {
    if (!$('lightbox').open) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      stepLightbox(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      stepLightbox(1);
    }
  }

  function setupCommissionEstimate() {
    const type = $('commissionType');
    const extras = $('extraCharacters');
    const background = $('backgroundOption');
    const commercial = $('commercialOption');
    const render = () => {
      const base = Number(type.value) || 0;
      const count = Math.min(4, Math.max(0, Math.floor(Number(extras.value) || 0)));
      extras.value = String(count);
      const total = base + (count * 25) + (background.checked ? 15 : 0);
      $('estimateTotal').querySelector('strong').textContent = '$' + total;
      $('estimateNote').textContent = commercial.checked
        ? 'Starting subtotal excludes the commercial-use add-on (+50%). The artist has not specified its calculation basis. Currency is unconfirmed.'
        : 'Starting subtotal uses the listed figures only. Currency is unconfirmed; ask Nanher to confirm the final scope.';
    };
    [type,extras,background,commercial].forEach((control) => control.addEventListener('input', render));
    [background,commercial].forEach((control) => control.addEventListener('change', render));
    render();
  }

  function setupMonitor() {
    $('monitorToggle').addEventListener('click', () => setMonitor(!state.monitorOpen));
    $('monitorClose').addEventListener('click', () => setMonitor(false));
    document.addEventListener('pointerdown', (event) => {
      if (!state.monitorOpen) return;
      if (!$('studioMonitor').contains(event.target) && !$('monitorToggle').contains(event.target)) setMonitor(false);
    });
  }

  function setMonitor(open) {
    state.monitorOpen = open;
    $('studioMonitor').hidden = !open;
    $('monitorToggle').setAttribute('aria-expanded', String(open));
    $('monitorToggle').querySelector('span').textContent = open ? '−' : '+';
    if (open) $('monitorClose').focus({preventScroll:true});
    else $('monitorToggle').focus({preventScroll:true});
  }

  function updateSessionTime() {
    const elapsed = Math.max(0, Math.floor((Date.now() - state.sessionStarted) / 1000));
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    const format = (value) => String(value).padStart(2,'0');
    $('sessionTime').textContent = format(hours) + ':' + format(minutes) + ':' + format(seconds);
  }

  function setupAudio() {
    const music = $('ambientMusic');
    $('musicVolume').value = String(state.audioVolume);
    $('musicVolumeValue').textContent = state.audioVolume + '%';
    music.volume = state.audioVolume / 100;
    $('musicVolume').addEventListener('input', (event) => {
      applyAudioLevel(event.currentTarget.value);
      $('musicVolumeValue').textContent = state.audioVolume + '%';
    });
    $('soundToggle').addEventListener('click', () => {
      if (state.audioPlaying) stopAudio();
      else startAudio();
    });
    music.addEventListener('error', () => {
      if (state.audioPlaying && state.audioToken) startSynth(state.audioToken);
    });
  }

  function startAudio() {
    if (state.audioPlaying) return;
    const music = $('ambientMusic');
    state.audioPlaying = true;
    const token = ++state.audioToken;
    syncAudio();
    const request = music.play();
    Promise.resolve(request).then(() => {
      if (!state.audioPlaying || token !== state.audioToken) {
        music.pause();
        return;
      }
      stopSynth();
    }).catch(() => startSynth(token));
  }

  function stopAudio() {
    state.audioPlaying = false;
    state.audioToken += 1;
    $('ambientMusic').pause();
    stopSynth();
    syncAudio();
  }

  function syncAudio() {
    const button = $('soundToggle');
    button.setAttribute('aria-pressed', String(state.audioPlaying));
    button.setAttribute('aria-label', state.audioPlaying ? 'Turn ambient audio off' : 'Turn ambient audio on');
    button.querySelector('.sound-state').textContent = state.audioPlaying ? 'on' : 'off';
  }

  function applyAudioLevel(raw) {
    const value = Math.max(0, Math.min(100, Math.round(Number(raw) || 0)));
    state.audioVolume = value;
    $('ambientMusic').volume = value / 100;
    if (state.audioMaster && state.audioContext) {
      state.audioMaster.gain.setTargetAtTime(value / 100 * 0.08, state.audioContext.currentTime, 0.04);
    }
    if (hasPreferences()) storage.set('nh-audio-level', String(value));
  }

  function startSynth(token) {
    initAudioContext().then(() => {
      if (!state.audioPlaying || token !== state.audioToken || !state.audioContext || state.drones.length) return;
      state.drones = [73.42,110,164.81].map((frequency,index) => {
        const oscillator = state.audioContext.createOscillator();
        const gain = state.audioContext.createGain();
        oscillator.type = index === 1 ? 'sine' : 'triangle';
        oscillator.frequency.value = frequency;
        gain.gain.value = state.audioVolume / 100 * 0.008;
        oscillator.connect(gain).connect(state.audioMaster);
        oscillator.start();
        return {oscillator,gain};
      });
      state.shimmerTimer = window.setInterval(() => {
        if (state.audioPlaying && state.audioContext) playSoftTone([293.66,349.23,392,440,523.25][Math.floor(Math.random()*5)]);
      }, 5700);
    });
  }

  async function initAudioContext() {
    try {
      if (!state.audioContext) {
        const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextConstructor) return;
        state.audioContext = new AudioContextConstructor();
        state.audioMaster = state.audioContext.createGain();
        state.audioMaster.gain.value = state.audioVolume / 100 * 0.08;
        state.audioMaster.connect(state.audioContext.destination);
      }
      if (state.audioContext.state === 'suspended') await state.audioContext.resume();
    } catch { /* Audio is optional and begins only after an explicit click. */ }
  }

  function playSoftTone(frequency) {
    if (!state.audioContext || !state.audioMaster) return;
    const now = state.audioContext.currentTime;
    const oscillator = state.audioContext.createOscillator();
    const gain = state.audioContext.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.004, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);
    oscillator.connect(gain).connect(state.audioMaster);
    oscillator.start(now);
    oscillator.stop(now + 1.15);
  }

  function stopSynth() {
    if (state.shimmerTimer) {
      window.clearInterval(state.shimmerTimer);
      state.shimmerTimer = null;
    }
    state.drones.forEach(({oscillator,gain}) => {
      try { oscillator.stop(); oscillator.disconnect(); gain.disconnect(); } catch { /* Already stopped. */ }
    });
    state.drones = [];
  }

  function setupMotion() {
    $('motionToggle').addEventListener('click', async () => {
      if (state.motionHandler) {
        window.removeEventListener('deviceorientation', state.motionHandler);
        state.motionHandler = null;
        $('motionToggle').setAttribute('aria-pressed','false');
        $('motionToggle').textContent = 'Try a gentle tilt effect';
        $('heroPortrait').style.transform = '';
        return;
      }
      if (!('DeviceOrientationEvent' in window)) {
        $('motionToggle').textContent = 'Motion input is unavailable here';
        return;
      }
      try {
        if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
          const permission = await window.DeviceOrientationEvent.requestPermission();
          if (permission !== 'granted') throw new Error('Motion permission declined');
        }
        if (reduceMotion) {
          $('motionToggle').textContent = 'Motion is off because reduced motion is enabled';
          return;
        }
        state.motionHandler = (event) => {
          const x = Math.max(-5, Math.min(5, (event.gamma || 0) * 0.15));
          const y = Math.max(-4, Math.min(4, (event.beta || 0) * 0.12));
          $('heroPortrait').style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
        };
        window.addEventListener('deviceorientation', state.motionHandler, {passive:true});
        $('motionToggle').setAttribute('aria-pressed','true');
        $('motionToggle').textContent = 'Turn off the tilt effect';
      } catch {
        $('motionToggle').textContent = 'Motion permission was not granted';
      }
    });
  }

  function announce(message) {
    $('announcer').textContent = message;
  }

  init();
})();
