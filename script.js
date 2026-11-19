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
    {fileId:'01.jpg', src:'./arts/01.jpg', thumb:'./arts/thumbs/01.jpg', point:[7,20], title:'Portrait', detail:'Selected work · 01', category:'characters', featured:true, alt:'Portrait illustration by Nanher Hew, with a deep blue background'},
    {fileId:'02.jpg', src:'./arts/02.jpg', thumb:'./arts/thumbs/02.jpg', point:[34,15], title:'Furry character', detail:'Selected work · 02', category:'commissions', featured:true, alt:'Furry character illustration by Nanher Hew'},
    {fileId:'03.jpg', src:'./arts/03.jpg', thumb:'./arts/thumbs/03.jpg', point:[65,20], title:'Bara character', detail:'Selected work · 03', category:'bara', featured:true, alt:'Bara character illustration by Nanher Hew'},
    {fileId:'04.jpg', src:'./arts/04.jpg', thumb:'./arts/thumbs/04.jpg', point:[91,20], title:'Character study', detail:'Selected work · 04', category:'characters', featured:true, alt:'Character illustration by Nanher Hew'},
    {fileId:'05.jpg', src:'./arts/05.jpg', thumb:'./arts/thumbs/05.jpg', point:[16,53], title:'Archive drawing', detail:'Artwork · 05', category:'characters', alt:'Character artwork from Nanher Hew’s archive, piece 05'},
    {fileId:'06.jpg', src:'./arts/06.jpg', thumb:'./arts/thumbs/06.jpg', point:[42,60], title:'Archive drawing', detail:'Artwork · 06', category:'characters', alt:'Character artwork from Nanher Hew’s archive, piece 06'},
    {fileId:'07.jpg', src:'./arts/07.jpg', thumb:'./arts/thumbs/07.jpg', point:[72,52], title:'Archive drawing', detail:'Artwork · 07', category:'bara', alt:'Bara artwork from Nanher Hew’s archive, piece 07'},
    {fileId:'08.jpg', src:'./arts/08.jpg', thumb:'./arts/thumbs/08.jpg', point:[93,68], title:'Archive drawing', detail:'Artwork · 08', category:'bara', alt:'Bara artwork from Nanher Hew’s archive, piece 08'},
    {fileId:'02.jpg', src:'./arts/02.jpg', thumb:'./arts/thumbs/02.jpg', point:[26,85], title:'Commission for @bjoern90', detail:'Client commission · 01', category:'commissions', alt:'Commission artwork by Nanher Hew for @bjoern90'},
    {fileId:'03.jpg', src:'./arts/03.jpg', thumb:'./arts/thumbs/03.jpg', point:[62,85], title:'Commission for @outdoowpumpkin9', detail:'Client commission · 02', category:'commissions', alt:'Commission artwork by Nanher Hew for @outdoowpumpkin9'},
    {fileId:'wip01.jpg', src:'./arts/wip01.jpg', thumb:'./arts/thumbs/wip01.jpg', point:[49,35], title:'Work in progress', detail:'In progress · 01', category:'wips', alt:'Work in progress from Nanher Hew’s archive, piece 01'},
    {fileId:'wip02.jpg', src:'./arts/wip02.jpg', thumb:'./arts/thumbs/wip02.jpg', point:[83,87], title:'Work in progress', detail:'In progress · 02', category:'wips', alt:'Work in progress from Nanher Hew’s archive, piece 02'}
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
    searchQuery: '',
    visibleWorks: [],
    view: 'gallery',
    lightboxIndex: 0,
    lightboxItems: [],
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
    directoryOpen: false,
    mobileDirectory: false,
    ageGateOrigin: null,
    interferenceHandler: null,
    cursorFrame: 0,
    cursorPoint: null,
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
    renderProcesses();
    setFilterButtons();
    setupCookieChoices();
    setupAgeGate();
    setupAccessSequence();
    setupLightbox();
    setWorkView('gallery');
    setupArchiveSearch();
    setupDirectory();
    setupSectionTracking();
    setupCommissionEstimate();
    setupMonitor();
    setupAudio();
    setupMotion();
    setupCursorReticle();
    updateSessionTime();
    window.setInterval(updateSessionTime, 1000);

    if (state.consent) {
      $('cookieNotice').hidden = true;
    }
    setTrace('CORE PRESENT · ACCESS OPEN');
    document.addEventListener('keydown', handleGlobalKeys);
  }

  function setupAgeGate() {
    const dialog = $('ageGate');
    dialog.hidden = true;
    state.ageAccepted = storage.get('nh-age-declared-v1', 'session') === 'yes';
    if (state.ageAccepted) {
      document.body.classList.remove('state-locked');
      if (location.hash === '#cookie-settings') openCookieSettings();
      else showCookieNotice();
    }
    dialog.addEventListener('cancel', (event) => {
      if (!state.ageAccepted) {
        event.preventDefault();
        announce('Access remains restricted until the age notice is accepted or declined.');
      }
    });
    $('ageEnter').addEventListener('click', () => {
      storage.set('nh-age-declared-v1', 'yes', 'session');
      state.ageAccepted = true;
      document.body.classList.remove('state-locked');
      $('accessSequence').hidden = true;
      dialog.close();
      dialog.hidden = true;
      const focusTarget = state.ageGateOrigin === $('beginAccess')
        ? document.querySelector('.intro__links a')
        : state.ageGateOrigin;
      state.ageGateOrigin = null;
      window.requestAnimationFrame(() => focusTarget && focusTarget.focus({preventScroll:true}));
      if (location.hash === '#cookie-settings') openCookieSettings();
      else showCookieNotice();
      announce('Age declaration recorded for this browser session. Your age was not verified.');
      setTrace('ACCESS CONTROL / SESSION AUTHORIZED');
      triggerInterference('fracture');
    });
    $('reviewAccessNotice').addEventListener('click', () => {
      if (!dialog.open) openAgeGate($('reviewAccessNotice'));
    });
    $('revokeAccess').addEventListener('click', revokeSessionAccess);
  }

  function setupAccessSequence() {
    const sequence = $('accessSequence');
    sequence.hidden = state.ageAccepted;
    $('beginAccess').addEventListener('click', () => {
      if (sequence.classList.contains('is-transitioning')) return;
      sequence.classList.add('is-transitioning');
      $('beginAccess').setAttribute('aria-busy', 'true');
      setTrace('ACCESS CONTROL / CONNECTION REVIEW');
      announce('Connection review started. The adult access notice will open next.');
      triggerInterference('cut', () => {
        sequence.hidden = true;
        openAgeGate($('beginAccess'));
      });
    });
  }

  function revokeSessionAccess() {
    storage.remove('nh-age-declared-v1', 'session');
    state.ageAccepted = false;
    if (state.audioPlaying) stopAudio();
    if ($('lightbox').open) $('lightbox').close();
    if (state.motionHandler) {
      window.removeEventListener('deviceorientation', state.motionHandler);
      state.motionHandler = null;
      $('heroPortrait').style.transform = '';
      $('motionToggle').setAttribute('aria-pressed', 'false');
    }
    state.directoryOpen = false;
    $('systemDirectory').hidden = true;
    $('directoryToggle').setAttribute('aria-expanded', 'false');
    $('directoryToggle').setAttribute('aria-label', 'Open access nodes');
    $('directoryToggle').querySelector('span').textContent = '+';
    state.monitorOpen = false;
    $('studioMonitor').hidden = true;
    $('monitorToggle').setAttribute('aria-expanded', 'false');
    $('monitorToggle').setAttribute('aria-label', 'Open mind monitor');
    $('monitorToggle').querySelector('span').textContent = '+';
    $('accessSequence').hidden = true;
    document.body.classList.add('state-locked');
    openAgeGate($('revokeAccess'));
    announce('Session access revoked. The restricted access notice is open.');
  }

  function openAgeGate(origin) {
    state.ageGateOrigin = origin || null;
    $('ageGate').hidden = false;
    $('ageGate').showModal();
    $('ageEnter').focus({preventScroll:true});
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
    $('openCookieSettingsFooter').addEventListener('click', openCookieSettings);
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
    const query = normalizeText(state.searchQuery).trim().split(/\s+/).filter(Boolean);
    state.visibleWorks = work.filter((item) => {
      if (state.filter !== 'all' && item.category !== state.filter) return false;
      const record = normalizeText([item.fileId, item.title, item.detail, item.category, item.alt].join(' '));
      return query.every((term) => record.includes(term));
    });
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
      meta.textContent = item.fileId + ' · ' + item.detail;
      caption.append(title, meta);
      button.append(image, caption);
      button.addEventListener('click', () => { setTrace('MEMORY BANK / OPEN ' + item.fileId.toUpperCase()); openLightbox(index, button); });
      grid.append(button);
    });
    if (!state.visibleWorks.length) {
      const empty = document.createElement('p');
      empty.className = 'archive-empty';
      empty.textContent = state.searchQuery ? 'No records match this search in the selected category.' : 'No records are filed under this category.';
      grid.append(empty);
    }
    renderMemoryMap();
    $('workCount').textContent = state.visibleWorks.length + (state.visibleWorks.length === 1 ? ' piece' : ' pieces');
    $('directoryWorkCount').textContent = String(work.length).padStart(2, '0');
    if (state.searchQuery) setTrace('MEMORY BANK / SEARCH · ' + state.visibleWorks.length + ' MATCHES');
  }

  function normalizeText(value) {
    return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function setupArchiveSearch() {
    const input = $('archiveSearch');
    input.addEventListener('input', () => {
      state.searchQuery = input.value;
      renderGallery();
      announce(state.visibleWorks.length + (state.visibleWorks.length === 1 ? ' matching record.' : ' matching records.'));
    });
    $('clearArchiveSearch').addEventListener('click', () => {
      input.value = '';
      state.searchQuery = '';
      renderGallery();
      input.focus();
      setTrace('MEMORY BANK / SEARCH CLEARED');
      announce('Record search cleared.');
    });
  }

  function renderProcesses() {
    const container = $('processRecords');
    if (!container) return;
    const processWorks = work.filter((item) => item.category === 'wips');
    $('directoryProcessCount').textContent = String(processWorks.length).padStart(2, '0');
    container.replaceChildren();
    processWorks.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'process-record';
      button.setAttribute('aria-label', 'Open ' + item.fileId + ', work in progress archive record');
      const image = document.createElement('img');
      image.src = item.thumb || item.src;
      image.alt = '';
      image.loading = 'lazy';
      image.decoding = 'async';
      const details = document.createElement('span');
      details.className = 'process-record__details';
      const filename = document.createElement('strong');
      filename.textContent = item.fileId;
      const stateLabel = document.createElement('small');
      stateLabel.textContent = 'ARCHIVE LABEL / WORK IN PROGRESS';
      details.append(filename, stateLabel);
      const arrow = document.createElement('span');
      arrow.className = 'process-record__open';
      arrow.textContent = 'OPEN ↗';
      button.append(image, details, arrow);
      button.addEventListener('click', () => {
        setTrace('ACTIVE PROCESSES / OPEN ' + item.fileId.toUpperCase());
        openLightbox(index, button, processWorks);
      });
      container.append(button);
    });
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
      button.addEventListener('click', () => { setTrace('ASSOCIATION INDEX / OPEN ' + item.fileId.toUpperCase()); openLightbox(index, button); });
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
    if (showMap) {
      setTrace('ASSOCIATION INDEX / CATEGORY THREADS');
      triggerInterference('tracking');
    }
    else setTrace('MEMORY BANK / VISUAL RECORDS');
    setActiveRoute(showMap ? 'association-index' : 'memory-bank');
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
      setTrace('MEMORY BANK / ' + button.textContent.trim().toUpperCase() + ' · ' + state.visibleWorks.length + ' RECORDS');
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

  function openLightbox(index, origin, items) {
    const records = items || state.visibleWorks;
    if (!records.length) return;
    state.lightboxItems = records;
    state.lightboxIndex = index;
    state.lightboxOrigin = origin;
    updateLightbox();
    $('lightbox').showModal();
    $('lightboxClose').focus({preventScroll:true});
    triggerInterference('minor');
  }

  function updateLightbox() {
    const item = state.lightboxItems[state.lightboxIndex];
    if (!item) return;
    const image = $('lightboxImage');
    image.src = item.src;
    image.alt = item.alt;
    $('lightboxTitle').textContent = item.title;
    $('lightboxMeta').textContent = item.fileId + ' · ' + item.detail;
    $('lightboxCounter').textContent = String(state.lightboxIndex + 1).padStart(2,'0') + ' / ' + String(state.lightboxItems.length).padStart(2,'0');
    $('lightboxAnnouncement').textContent = item.title + ', ' + item.detail;
    $('lightboxThread').textContent = 'Follow the ' + categoryLabels[item.category] + ' thread';
  }

  function followThread() {
    const item = state.lightboxItems[state.lightboxIndex];
    if (!item) return;
    state.lightboxOrigin = null;
    $('lightbox').close();
    state.filter = item.category;
    state.searchQuery = '';
    $('archiveSearch').value = '';
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
    setTrace('ASSOCIATION INDEX / FOLLOWED ' + categoryLabels[item.category].toUpperCase() + ' THREAD');
    triggerInterference('fracture');
  }

  function stepLightbox(direction) {
    if (!state.lightboxItems.length) return;
    state.lightboxIndex = (state.lightboxIndex + direction + state.lightboxItems.length) % state.lightboxItems.length;
    updateLightbox();
  }

  function handleGlobalKeys(event) {
    if ($('lightbox').open && event.key === 'ArrowLeft') {
      event.preventDefault();
      stepLightbox(-1);
    } else if ($('lightbox').open && event.key === 'ArrowRight') {
      event.preventDefault();
      stepLightbox(1);
    } else if (event.key === 'Escape' && !$('lightbox').open && !$('ageGate').open && !$('cookieDialog').open) {
      if (state.mobileDirectory && state.directoryOpen) setDirectory(false);
      if (state.monitorOpen) setMonitor(false);
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

  function setupDirectory() {
    const directory = $('systemDirectory');
    const toggle = $('directoryToggle');
    const media = window.matchMedia('(max-width: 720px)');
    const syncMode = () => {
      state.mobileDirectory = media.matches;
      state.directoryOpen = false;
      directory.hidden = !state.directoryOpen;
      toggle.setAttribute('aria-expanded', String(state.directoryOpen));
      toggle.setAttribute('aria-label', state.directoryOpen ? 'Close access nodes' : 'Open access nodes');
      toggle.querySelector('span').textContent = state.directoryOpen ? '−' : '+';
    };
    syncMode();
    media.addEventListener('change', syncMode);
    toggle.addEventListener('click', () => setDirectory(!state.directoryOpen));
    $('directoryClose').addEventListener('click', () => setDirectory(false));
    queryAll('.system-directory__nav a').forEach((link) => link.addEventListener('click', () => {
      const route = link.dataset.route;
      if (route === 'association-index') setWorkView('map');
      else if (route === 'memory-bank') setWorkView('gallery');
      setActiveRoute(route);
      setTrace('DIRECTORY / ' + route.toUpperCase());
      if (state.mobileDirectory) setDirectory(false);
    }));
    document.addEventListener('pointerdown', (event) => {
      if (state.mobileDirectory && state.directoryOpen && !directory.contains(event.target) && !toggle.contains(event.target)) setDirectory(false);
    });
  }

  function setDirectory(open) {
    state.directoryOpen = Boolean(open);
    $('systemDirectory').hidden = !state.directoryOpen;
    $('directoryToggle').setAttribute('aria-expanded', String(state.directoryOpen));
    $('directoryToggle').setAttribute('aria-label', state.directoryOpen ? 'Close access nodes' : 'Open access nodes');
    $('directoryToggle').querySelector('span').textContent = state.directoryOpen ? '−' : '+';
    if (state.directoryOpen) $('directoryClose').focus({preventScroll:true});
    else $('directoryToggle').focus({preventScroll:true});
  }

  function setActiveRoute(route) {
    queryAll('.system-directory__nav a').forEach((link) => {
      const active = link.dataset.route === route;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }

  function setTrace(message) {
    const trace = $('systemTrace');
    if (trace) trace.textContent = message;
  }

  function triggerInterference(level, after) {
    const layer = $('signalInterference');
    if (state.interferenceHandler) {
      layer.removeEventListener('animationend', state.interferenceHandler);
      state.interferenceHandler = null;
    }
    if (reduceMotion) {
      if (after) after();
      return;
    }
    layer.dataset.level = level;
    layer.classList.remove('is-active');
    void layer.offsetWidth;
    const finish = (event) => {
      if (event.target !== layer) return;
      layer.classList.remove('is-active');
      state.interferenceHandler = null;
      if (after) after();
    };
    state.interferenceHandler = finish;
    layer.addEventListener('animationend', finish);
    layer.classList.add('is-active');
  }

  function setupCursorReticle() {
    const reticle = $('cursorReticle');
    if (reduceMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.body.classList.add('cursor-ready');
    window.addEventListener('pointermove', (event) => {
      state.cursorPoint = {x:event.clientX, y:event.clientY};
      if (state.cursorFrame) return;
      state.cursorFrame = window.requestAnimationFrame(() => {
        reticle.style.transform = 'translate3d(' + state.cursorPoint.x + 'px,' + state.cursorPoint.y + 'px,0) translate(-50%,-50%)';
        state.cursorFrame = 0;
      });
    }, {passive:true});
    document.addEventListener('pointerleave', () => reticle.classList.add('is-outside'));
    document.addEventListener('pointerenter', () => reticle.classList.remove('is-outside'));
  }

  function setupSectionTracking() {
    const sections = queryAll('[data-section]');
    if (!('IntersectionObserver' in window)) return;
    const routeNames = {
      top:'CORE / IDENTITY RECORD',
      'memory-bank':'MEMORY BANK',
      'identity-record':'CORE / IDENTITY RECORD',
      'thought-archive':'THOUGHT ARCHIVE / EMPTY',
      'active-processes':'ACTIVE PROCESSES / ARCHIVED WIP',
      'commission-protocol':'COMMISSION PROTOCOL',
      'external-connections':'EXTERNAL CONNECTIONS',
      'system-documents':'SYSTEM DOCUMENTS'
    };
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      let route = visible.target.dataset.section;
      if (route === 'identity-record') route = 'top';
      if (route === 'memory-bank' && state.view === 'map') route = 'association-index';
      setActiveRoute(route);
      setTrace(routeNames[visible.target.dataset.section] || 'CORE PRESENT · ACCESS OPEN');
    }, {rootMargin:'-22% 0px -58% 0px', threshold:[0,.1,.25,.5]});
    sections.forEach((section) => observer.observe(section));
  }

  function setMonitor(open) {
    state.monitorOpen = open;
    $('studioMonitor').hidden = !open;
    $('monitorToggle').setAttribute('aria-expanded', String(open));
    $('monitorToggle').querySelector('span').textContent = open ? '−' : '+';
    $('monitorToggle').setAttribute('aria-label', open ? 'Close mind monitor' : 'Open mind monitor');
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
