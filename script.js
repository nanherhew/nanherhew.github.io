(() => {
  'use strict';

  const state = {
    activeModule: 'overview',
    currentFilter: 'all',
    lightboxItems: [],
    lightboxIndex: 0,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    touchDevice: matchMedia('(pointer: coarse)').matches,
    audioReady: false,
    audioEnabled: false,
    motionEnabled: false,
    motionMode: 'pointer',
    parallax: { currentX: 0, currentY: 0, targetX: 0, targetY: 0 },
  };

  const artworkData = {
    recent: [
      { path: 'arts/01.jpg', title: 'CHARACTER', detail: 'RECENT WORK / 01', category: 'characters' },
      { path: 'arts/02.jpg', title: 'FURRY', detail: 'RECENT WORK / 02', category: 'commissions' },
      { path: 'arts/03.jpg', title: 'BARA', detail: 'RECENT WORK / 03', category: 'bara' },
      { path: 'arts/04.jpg', title: 'ILLUSTRATION', detail: 'RECENT WORK / 04', category: 'characters' },
    ],
    archive: [
      { path: 'arts/01.jpg', title: 'CHARACTER / 01', detail: 'ARCHIVE RECORD', category: 'characters' },
      { path: 'arts/02.jpg', title: 'COMMISSION / 01', detail: 'ARCHIVE RECORD', category: 'commissions' },
      { path: 'arts/03.jpg', title: 'BARA / 01', detail: 'ARCHIVE RECORD', category: 'bara' },
      { path: 'arts/04.jpg', title: 'CHARACTER / 02', detail: 'ARCHIVE RECORD', category: 'characters' },
      { path: 'arts/05.jpg', title: 'CHARACTER / 03', detail: 'ARCHIVE RECORD', category: 'characters' },
      { path: 'arts/06.jpg', title: 'CHARACTER / 04', detail: 'ARCHIVE RECORD', category: 'characters' },
      { path: 'arts/07.jpg', title: 'BARA / 02', detail: 'ARCHIVE RECORD', category: 'bara' },
      { path: 'arts/08.jpg', title: 'BARA / 03', detail: 'ARCHIVE RECORD', category: 'bara' },
      { path: 'arts/wip01.jpg', title: 'WIP / 01', detail: 'WORK IN PROGRESS', category: 'wips' },
      { path: 'arts/wip02.jpg', title: 'WIP / 02', detail: 'WORK IN PROGRESS', category: 'wips' },
    ],
  };

  const modulesMeta = {
    overview: '01 / OVERVIEW',
    works: '02 / RECENT WORKS',
    archive: '03 / ARCHIVE',
    identity: '04 / IDENTITY',
    commissions: '05 / COMMISSIONS',
    contact: '06 / CONTACT',
  };

  const els = {
    body: document.body,
    ageGate: document.getElementById('ageGate'),
    ageEnter: document.getElementById('ageEnter'),
    ageLeave: document.getElementById('ageLeave'),
    introScreen: document.getElementById('introScreen'),
    enterConsciousness: document.getElementById('enterConsciousness'),
    skipIntro: document.getElementById('skipIntro'),
    bootBar: document.getElementById('bootBar'),
    bootStatus: document.getElementById('bootStatus'),
    introModeLabel: document.getElementById('introModeLabel'),
    appShell: document.getElementById('appShell'),
    moduleNavItems: [...document.querySelectorAll('[data-module-target]')],
    modules: [...document.querySelectorAll('.module')],
    telemetryModule: document.getElementById('telemetryModule'),
    telemetryAudio: document.getElementById('telemetryAudio'),
    currentPath: document.getElementById('currentPath'),
    archiveTabs: [...document.querySelectorAll('.archive-tab')],
    archiveGrid: document.getElementById('archiveGrid'),
    archiveSummary: document.getElementById('archiveSummary'),
    recentWorks: document.getElementById('recentWorks'),
    lightbox: document.getElementById('lightbox'),
    lightboxArt: document.getElementById('lightboxArt'),
    lightboxTitle: document.getElementById('lightboxTitle'),
    lightboxDetail: document.getElementById('lightboxDetail'),
    lightboxCounter: document.getElementById('lightboxCounter'),
    lightboxClose: document.getElementById('lightboxClose'),
    lightboxPrev: document.getElementById('lightboxPrev'),
    lightboxNext: document.getElementById('lightboxNext'),
    cursor: document.getElementById('cursorReticle'),
    announcer: document.getElementById('announcer'),
    heroParallax: document.getElementById('heroParallax'),
    heroBack: document.querySelector('.hero-parallax__back'),
    heroFront: document.querySelector('.hero-parallax__front'),
    moduleJumpButtons: [...document.querySelectorAll('[data-module-jump]')],
    soundToggle: document.getElementById('soundToggle'),
    motionToggle: document.getElementById('motionToggle'),
    externalLinks: [...document.querySelectorAll('[data-external-sfx]')],
  };

  const audio = createAudioEngine();
  let bootTimer = null;
  let ambientStartRequested = false;

  init();

  function init() {
    if (state.touchDevice) {
      els.body.classList.add('touch-device');
    } else {
      setupCursor();
    }

    renderRecentWorks();
    renderArchive();
    setupAgeGate();
    setupIntro();
    setupNavigation();
    setupArchiveTabs();
    setupLightbox();
    setupGlobalKeys();
    setupModuleJumps();
    setupInteractiveSfx();
    setupParallax();
    setupMotionToggle();
    setupSoundToggle();
    updateTelemetry();
  }

  function setupAgeGate() {
    const verified = sessionStorage.getItem('nhAgeVerified') === 'true';
    const introSeen = sessionStorage.getItem('nhIntroSeen') === 'true';

    if (verified) {
      els.ageGate.classList.add('hidden');
      els.body.classList.remove('state-locked');
      if (introSeen) {
        showApp();
      } else {
        showIntro();
      }
    } else {
      els.body.classList.add('state-locked');
    }

    els.ageEnter?.addEventListener('click', () => {
      sessionStorage.setItem('nhAgeVerified', 'true');
      els.ageGate.classList.add('hidden');
      playUi('confirm');
      showIntro();
    });

    els.ageLeave?.addEventListener('click', () => {
      playUi('error');
      window.location.href = 'https://www.google.com';
    });
  }

  function setupIntro() {
    els.enterConsciousness?.addEventListener('click', () => {
      runIntroSequence(true);
    });
    els.skipIntro?.addEventListener('click', () => {
      runIntroSequence(false);
    });
  }

  function showIntro() {
    els.body.classList.add('state-locked');
    els.introScreen.hidden = false;
    if (els.introModeLabel) els.introModeLabel.textContent = 'READY';
    startBootIdle();
  }

  function runIntroSequence(withSequence) {
    if (bootTimer) {
      clearInterval(bootTimer);
      bootTimer = null;
    }
    if (withSequence) {
      if (els.introModeLabel) els.introModeLabel.textContent = 'INITIALIZING';
      if (els.bootStatus) els.bootStatus.textContent = 'SYNCHRONIZING';
      if (els.bootBar) els.bootBar.style.width = '100%';
      playUi('enter');
      startAmbientAudio();
      setTimeout(finishIntro, state.reducedMotion ? 160 : 1200);
    } else {
      if (els.bootStatus) els.bootStatus.textContent = 'SKIPPED / ACCESSING';
      if (els.bootBar) els.bootBar.style.width = '100%';
      playUi('confirm');
      startAmbientAudio();
      setTimeout(finishIntro, 180);
    }
  }

  function finishIntro() {
    sessionStorage.setItem('nhIntroSeen', 'true');
    els.introScreen.hidden = true;
    showApp();
  }

  function showApp() {
    els.appShell.setAttribute('aria-hidden', 'false');
    els.body.classList.remove('state-locked');
    showModule(state.activeModule, false);
  }

  function startBootIdle() {
    if (!els.bootBar) return;
    let width = 22;
    let direction = 1;
    els.bootBar.style.width = `${width}%`;
    if (bootTimer) clearInterval(bootTimer);
    bootTimer = setInterval(() => {
      width += direction * 10;
      if (width >= 76 || width <= 22) direction *= -1;
      els.bootBar.style.width = `${width}%`;
    }, 900);
  }

  function setupNavigation() {
    els.moduleNavItems.forEach((button) => {
      button.addEventListener('click', () => {
        showModule(button.dataset.moduleTarget, true);
      });
    });
  }

  function showModule(moduleName, playSound = true) {
    if (!moduleName || !modulesMeta[moduleName]) return;

    state.activeModule = moduleName;
    els.modules.forEach((section) => {
      const active = section.dataset.module === moduleName;
      section.classList.toggle('is-active', active);
      section.hidden = !active;
    });

    els.moduleNavItems.forEach((button) => {
      button.classList.toggle('is-active', button.dataset.moduleTarget === moduleName);
    });

    updateTelemetry();
    announce(`Opened ${modulesMeta[moduleName]}`);

    if (playSound) playUi('select');
  }

  function updateTelemetry() {
    const label = modulesMeta[state.activeModule] || '01 / OVERVIEW';
    if (els.telemetryModule) els.telemetryModule.textContent = label;
    if (els.currentPath) els.currentPath.textContent = `/${state.activeModule.toUpperCase()}`;
    if (els.telemetryAudio) els.telemetryAudio.textContent = state.audioEnabled ? 'AMBIENT ON' : 'MUTED';
  }

  function setupArchiveTabs() {
    els.archiveTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter || 'all';
        state.currentFilter = filter;
        els.archiveTabs.forEach((item) => {
          const active = item === tab;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', String(active));
        });
        renderArchive();
        playUi('tab');
      });
    });
  }

  function renderRecentWorks() {
    if (!els.recentWorks) return;
    els.recentWorks.innerHTML = artworkData.recent.map(createArtTile).join('');
    bindArtButtons(els.recentWorks, artworkData.recent);
  }

  function renderArchive() {
    if (!els.archiveGrid) return;
    const items = state.currentFilter === 'all'
      ? artworkData.archive
      : artworkData.archive.filter((item) => item.category === state.currentFilter);

    els.archiveGrid.innerHTML = items.map(createArtTile).join('');
    bindArtButtons(els.archiveGrid, items);
    if (els.archiveSummary) {
      els.archiveSummary.textContent = `${state.currentFilter.toUpperCase()} / ${String(items.length).padStart(2, '0')} RECORDS`;
    }
  }

  function createArtTile(item, index) {
    return `
      <button type="button" class="art-tile" data-open-lightbox="${index}" data-path="${item.path}">
        <span class="art-tile__visual" style="background-image:url('${item.path}')"></span>
        <span class="art-tile__meta"><span>${item.title}</span><span>${item.detail} ↗</span></span>
      </button>
    `;
  }

  function bindArtButtons(container, items) {
    const buttons = [...container.querySelectorAll('[data-open-lightbox]')];
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => {
        openLightbox(items, index);
      });
    });
  }

  function setupLightbox() {
    els.lightboxClose?.addEventListener('click', closeLightbox);
    els.lightboxPrev?.addEventListener('click', () => stepLightbox(-1));
    els.lightboxNext?.addEventListener('click', () => stepLightbox(1));
    els.lightbox?.addEventListener('click', (event) => {
      if (event.target === els.lightbox) {
        closeLightbox();
      }
    });
  }

  function openLightbox(items, index) {
    state.lightboxItems = items;
    state.lightboxIndex = index;
    updateLightbox();
    els.lightbox.hidden = false;
    els.body.classList.add('lightbox-open');
    playUi('open');
  }

  function closeLightbox() {
    if (els.lightbox.hidden) return;
    els.lightbox.hidden = true;
    els.body.classList.remove('lightbox-open');
    playUi('close');
  }

  function stepLightbox(direction) {
    if (!state.lightboxItems.length) return;
    state.lightboxIndex = (state.lightboxIndex + direction + state.lightboxItems.length) % state.lightboxItems.length;
    updateLightbox();
    playUi('tab');
  }

  function updateLightbox() {
    const item = state.lightboxItems[state.lightboxIndex];
    if (!item || !els.lightboxArt) return;
    els.lightboxArt.innerHTML = `<img src="${item.path}" alt="${escapeHtml(item.title)}">`;
    if (els.lightboxTitle) els.lightboxTitle.textContent = item.title;
    if (els.lightboxDetail) els.lightboxDetail.textContent = item.detail;
    if (els.lightboxCounter) els.lightboxCounter.textContent = `${String(state.lightboxIndex + 1).padStart(2, '0')} / ${String(state.lightboxItems.length).padStart(2, '0')}`;
  }

  function setupGlobalKeys() {
    document.addEventListener('keydown', (event) => {
      if (!els.lightbox.hidden) {
        if (event.key === 'Escape') closeLightbox();
        if (event.key === 'ArrowRight') stepLightbox(1);
        if (event.key === 'ArrowLeft') stepLightbox(-1);
      }

      if (!els.introScreen.hidden && event.key === 'Escape') {
        runIntroSequence(false);
      }

      const digitMap = { '1': 'overview', '2': 'works', '3': 'archive', '4': 'identity', '5': 'commissions', '6': 'contact' };
      if (digitMap[event.key] && els.appShell.getAttribute('aria-hidden') === 'false') {
        showModule(digitMap[event.key], true);
      }
    });
  }

  function setupModuleJumps() {
    els.moduleJumpButtons.forEach((button) => {
      button.addEventListener('click', () => {
        showModule(button.dataset.moduleJump, true);
      });
    });
  }

  function setupInteractiveSfx() {
    const hoverables = [...document.querySelectorAll('button, a')];
    hoverables.forEach((element) => {
      element.addEventListener('mouseenter', () => {
        if (!state.touchDevice) playUi('hover');
      });
    });
    els.externalLinks.forEach((link) => {
      link.addEventListener('click', () => playUi('confirm'));
    });
  }

  function setupSoundToggle() {
    els.soundToggle?.addEventListener('click', async () => {
      if (!state.audioReady) await initAudio();
      state.audioEnabled = !state.audioEnabled;
      if (state.audioEnabled) {
        audio.startAmbient();
        playUi('confirm');
      } else {
        audio.stopAmbient();
      }
      syncAudioUi();
    });
    syncAudioUi();
  }

  function startAmbientAudio() {
    ambientStartRequested = true;
    if (!state.audioReady) {
      initAudio().then(() => {
        state.audioEnabled = true;
        audio.startAmbient();
        syncAudioUi();
      });
      return;
    }
    state.audioEnabled = true;
    audio.startAmbient();
    syncAudioUi();
  }

  async function initAudio() {
    try {
      if (!state.audioReady) {
        await audio.init();
        state.audioReady = true;
      }
      if (audio.context?.state === 'suspended') {
        await audio.context.resume();
      }
      if (ambientStartRequested && state.audioEnabled) {
        audio.startAmbient();
      }
    } catch (error) {
      console.error('Audio initialization failed', error);
    }
  }

  function syncAudioUi() {
    if (!els.soundToggle) return;
    els.soundToggle.classList.toggle('is-active', state.audioEnabled);
    els.soundToggle.setAttribute('aria-pressed', String(state.audioEnabled));
    els.soundToggle.textContent = state.audioEnabled ? 'AMBIENT ON' : 'AMBIENT OFF';
    updateTelemetry();
  }

  function playUi(type) {
    if (!state.audioReady || !state.audioEnabled) return;
    audio.play(type);
  }

  function setupCursor() {
    const cursor = els.cursor;
    if (!cursor) return;
    document.addEventListener('mousemove', (event) => {
      els.body.classList.add('cursor-ready');
      cursor.style.left = `${event.clientX}px`;
      cursor.style.top = `${event.clientY}px`;
    });

    document.addEventListener('mouseover', (event) => {
      const interactive = event.target.closest('button, a, .art-tile');
      els.body.classList.toggle('cursor-hover', Boolean(interactive));
    });
  }

  function setupParallax() {
    if (!els.heroParallax || state.reducedMotion) return;

    if (!state.touchDevice) {
      document.addEventListener('mousemove', (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        state.parallax.targetX = x * 18;
        state.parallax.targetY = y * 18;
      });
    }

    const animate = () => {
      state.parallax.currentX += (state.parallax.targetX - state.parallax.currentX) * 0.08;
      state.parallax.currentY += (state.parallax.targetY - state.parallax.currentY) * 0.08;
      if (els.heroBack) {
        els.heroBack.style.transform = `translate(${state.parallax.currentX * 0.35}px, ${state.parallax.currentY * 0.35}px) scale(1.03)`;
      }
      if (els.heroFront) {
        els.heroFront.style.transform = `translate(${state.parallax.currentX * 0.75}px, ${state.parallax.currentY * 0.75}px) scale(1.06)`;
      }
      requestAnimationFrame(animate);
    };
    animate();
  }

  function setupMotionToggle() {
    els.motionToggle?.addEventListener('click', async () => {
      if (!('DeviceOrientationEvent' in window) || !state.touchDevice) {
        state.motionEnabled = false;
        playUi('error');
        announce('Motion input is unavailable on this device.');
        els.motionToggle.textContent = 'MOTION UNAVAILABLE';
        return;
      }

      try {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          const result = await DeviceOrientationEvent.requestPermission();
          if (result !== 'granted') throw new Error('Permission denied');
        }
        enableMotionSensor();
      } catch (error) {
        console.error(error);
        playUi('error');
        els.motionToggle.textContent = 'MOTION BLOCKED';
      }
    });
  }

  function enableMotionSensor() {
    if (state.motionEnabled) return;
    state.motionEnabled = true;
    state.motionMode = 'sensor';
    els.motionToggle.classList.add('is-active');
    els.motionToggle.textContent = 'MOTION ACTIVE';
    window.addEventListener('deviceorientation', handleDeviceOrientation, { passive: true });
    playUi('confirm');
    announce('Motion input enabled');
  }

  function handleDeviceOrientation(event) {
    const gamma = clamp(event.gamma || 0, -18, 18);
    const beta = clamp(event.beta || 0, -18, 18);
    state.parallax.targetX = gamma * 0.7;
    state.parallax.targetY = beta * 0.45;
  }

  function announce(message) {
    if (els.announcer) els.announcer.textContent = message;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function createAudioEngine() {
    const engine = {
      context: null,
      master: null,
      ambientNodes: [],
      ambientNoise: null,
      ambientInterval: null,
      async init() {
        if (this.context) return;
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.context = new AudioCtx();
        this.master = this.context.createGain();
        this.master.gain.value = 0.11;
        this.master.connect(this.context.destination);
      },
      play(type) {
        if (!this.context || !this.master) return;
        const ctx = this.context;
        const now = ctx.currentTime;
        switch (type) {
          case 'hover':
            this.pulse(now, 580, 0.02, 'triangle', 0.03);
            break;
          case 'select':
            this.pulse(now, 220, 0.05, 'sine', 0.06);
            this.pulse(now + 0.05, 330, 0.06, 'triangle', 0.04);
            break;
          case 'tab':
            this.pulse(now, 310, 0.04, 'sine', 0.04);
            break;
          case 'open':
            this.pulse(now, 240, 0.08, 'triangle', 0.05);
            this.pulse(now + 0.04, 430, 0.1, 'sine', 0.04);
            break;
          case 'close':
            this.pulse(now, 400, 0.07, 'triangle', 0.04, true);
            break;
          case 'confirm':
            this.pulse(now, 260, 0.08, 'sine', 0.05);
            this.pulse(now + 0.07, 480, 0.1, 'triangle', 0.05);
            break;
          case 'error':
            this.pulse(now, 140, 0.12, 'sawtooth', 0.04, true);
            break;
          case 'enter':
            this.pulse(now, 110, 0.22, 'sine', 0.08);
            this.pulse(now + 0.16, 170, 0.24, 'triangle', 0.06);
            this.pulse(now + 0.28, 260, 0.28, 'triangle', 0.05);
            this.pulse(now + 0.42, 420, 0.22, 'sine', 0.05);
            break;
          default:
            break;
        }
      },
      pulse(start, frequency, duration, type = 'sine', volume = 0.04, descending = false) {
        const ctx = this.context;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1800;
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, start);
        if (descending) {
          osc.frequency.exponentialRampToValueAtTime(Math.max(30, frequency * 0.65), start + duration);
        } else {
          osc.frequency.exponentialRampToValueAtTime(frequency * 1.08, start + duration);
        }
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.master);
        osc.start(start);
        osc.stop(start + duration + 0.05);
      },
      startAmbient() {
        if (!this.context || this.ambientNodes.length) return;
        const ctx = this.context;
        const ambientGain = ctx.createGain();
        ambientGain.gain.value = 0.035;
        ambientGain.connect(this.master);

        const makeOsc = (freq, type, detune = 0) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          osc.type = type;
          osc.frequency.value = freq;
          osc.detune.value = detune;
          gain.gain.value = 0.16;
          lfo.type = 'sine';
          lfo.frequency.value = 0.08 + Math.random() * 0.06;
          lfoGain.gain.value = 4 + Math.random() * 6;
          lfo.connect(lfoGain);
          lfoGain.connect(osc.detune);
          osc.connect(gain);
          gain.connect(ambientGain);
          osc.start();
          lfo.start();
          return { osc, gain, lfo, lfoGain };
        };

        const oscA = makeOsc(73.42, 'triangle', -6);
        const oscB = makeOsc(110, 'sine', 4);
        const oscC = makeOsc(164.81, 'triangle', 9);

        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i += 1) {
          data[i] = (Math.random() * 2 - 1) * 0.18;
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 680;
        noiseFilter.Q.value = 0.8;
        const noiseGain = ctx.createGain();
        noiseGain.gain.value = 0.007;
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ambientGain);
        noiseSource.start();

        this.ambientNodes = [ambientGain, oscA, oscB, oscC, noiseSource, noiseGain, noiseFilter];
        this.ambientNoise = { source: noiseSource, gain: noiseGain, filter: noiseFilter };

        const shimmer = () => {
          if (!this.context || !this.ambientNodes.length) return;
          const notes = [293.66, 349.23, 392.0, 440.0, 523.25];
          const note = notes[Math.floor(Math.random() * notes.length)];
          this.pulse(this.context.currentTime, note, 0.9, 'sine', 0.012);
          this.pulse(this.context.currentTime + 0.12, note * 0.5, 1.4, 'triangle', 0.008);
        };
        shimmer();
        this.ambientInterval = window.setInterval(shimmer, 4200);
      },
      stopAmbient() {
        if (this.ambientInterval) {
          clearInterval(this.ambientInterval);
          this.ambientInterval = null;
        }
        if (!this.context || !this.ambientNodes.length) return;
        const stopNow = this.context.currentTime;
        const [ambientGain, ...nodes] = this.ambientNodes;
        try {
          ambientGain.gain.cancelScheduledValues(stopNow);
          ambientGain.gain.setTargetAtTime(0.0001, stopNow, 0.25);
        } catch (error) {
          console.warn(error);
        }
        nodes.forEach((node) => {
          try {
            if (node.osc) node.osc.stop(stopNow + 0.45);
            if (node.lfo) node.lfo.stop(stopNow + 0.45);
            if (typeof node.stop === 'function') node.stop(stopNow + 0.45);
          } catch (error) {
            // noop
          }
        });
        this.ambientNodes = [];
      },
    };
    return engine;
  }
})();
