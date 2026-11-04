/* NANHER HEW 文 — V6 / static, dependency-free interface */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchDevice = matchMedia('(pointer: coarse)').matches;
  const storage = {
    get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
    set(key, val) { try { sessionStorage.setItem(key, val); } catch { /* privacy mode */ } }
  };
  const els = {
    boot: $('bootScreen'), bootPercent: $('bootPercent'), bootBar: $('bootBar'),
    bootMessage: $('bootMessage'), bootSubstatus: $('bootSubstatus'), bootTrack: $('bootTrack'),
    age: $('ageGate'), ageEnter: $('ageEnter'), ageLeave: $('ageLeave'),
    app: $('appShell'), content: $('mainContent'),
    uiToggle: $('uiToggle'), tools: $('systemTools'), hideUiButton: $('hideUiButton'),
    nodes: $('accessNodes'), feed: $('monitorFeed'), navToggle: $('navToggle'),
    feedToggle: $('feedToggle'), detailsToggle: $('detailsToggle'), details: $('heroDetails'),
    module: Array.from(document.querySelectorAll('section.module')),
    navItems: Array.from(document.querySelectorAll('[data-module-target]')),
    moduleJumps: Array.from(document.querySelectorAll('[data-module-jump]')),
    recent: $('recentWorks'), archive: $('archiveGrid'), archiveSummary: $('archiveSummary'),
    archiveTabs: Array.from(document.querySelectorAll('.archive-tab')),
    telemetry: $('telemetryModule'), telemetryAudio: $('telemetryAudio'), currentPath: $('currentPath'),
    portrait: $('heroPortrait'), cursor: $('cursorReticle'), announcer: $('announcer'),
    lightbox: $('lightbox'), lightboxArt: $('lightboxArt'),
    lightboxClose: $('lightboxClose'), lightboxPrev: $('lightboxPrev'), lightboxNext: $('lightboxNext'),
    lightboxTitle: $('lightboxTitle'), lightboxDetail: $('lightboxDetail'), lightboxCounter: $('lightboxCounter'),
    sound: $('soundToggle'), motion: $('motionToggle'), music: $('ambientMusic'),
  };
  const sections = {overview:'01 / OVERVIEW', works:'02 / RECENT WORKS', archive:'03 / ARCHIVE',identity:'04 / IDENTITY',commissions:'05 / COMMISSIONS',contact:'06 / CONTACT'};
  const art = {
    recent: [
      ['arts/01.jpg','CHARACTER','RECENT WORK / 01','characters'],
      ['arts/02.jpg','FURRY','RECENT WORK / 02','commissions'],
      ['arts/03.jpg','BARA','RECENT WORK / 03','bara'],
      ['arts/04.jpg','ILLUSTRATION','RECENT WORK / 04','characters']
    ],
    archive: [
      ['arts/05.jpg','ARCHIVE / 05','ARTWORK','characters'],
      ['arts/06.jpg','ARCHIVE / 06','ARTWORK','characters'],
      ['arts/07.jpg','ARCHIVE / 07','ARTWORK','bara'],
      ['arts/08.jpg','ARCHIVE / 08','ARTWORK','bara'],
      ['arts/02.jpg','COMMISSION / 01','FOR @BJOERN90','commissions'],
      ['arts/03.jpg','COMMISSION / 02','FOR @OUTDOOWPUMPKIN9','commissions'],
      ['arts/wip01.jpg','WIP / 01','WORK IN PROGRESS','wips'],
      ['arts/wip02.jpg','WIP / 02','WORK IN PROGRESS','wips'],
    ]
  };
  const state = {
    verified: storage.get('nhAgeVerifiedV6') === 'true',
    unlocked: false, module: 'overview', filter: 'all', ui: false, nodes: false, feed: false, details: false,
    list: [], index: 0, focusBeforeLightbox: null, playing: false, audioSource:'off', audioToken:0,
    orientation: false, lastHover:0,
  };
  const synth = createSynth();

  function init() {
    if (touchDevice) document.body.classList.add('touch-device');
    else setupCursor();
    // An absent asset must not expose the browser's broken-image alt text.
    // The actual original art is retained in the user's existing arts/ folder.
    els.portrait.addEventListener('error', () => { els.portrait.hidden = true; });
    renderRecent(); renderArchive();
    bindControls();
    setupLightbox();
    setupParallax();
    configureAudio();
    // Always show a brief system access animation first; the warning follows.
    bootSequence();
  }

  function bootSequence() {
    const steps = reducedMotion ? [[0,8,'INITIALIZING'],[90,70,'ALMOST DONE'],[210,100,'ACCESS READY']]
      : [[70,7,'CONNECTING'],[260,19,'DECRYPTING PROFILE'],[490,37,'LOCATING MEMORY'],
         [730,54,'READING NEURAL FILE'],[970,70,'ALMOST DONE'],[1280,87,'SYNCHRONIZING'],[1560,100,'ACCESS READY']];
    steps.forEach(([delay, percentage, message]) => {
      setTimeout(() => {
        els.bootBar.style.width = percentage + '%';
        els.bootPercent.textContent = String(percentage).padStart(2,'0') + '%';
        els.bootTrack.setAttribute('aria-valuenow',String(percentage));
        els.bootMessage.textContent = message;
        els.bootSubstatus.textContent = percentage === 70 ? '70% / ALMOST DONE..' : percentage === 100 ? 'SYSTEM ONLINE' : 'CHECKING MEMORY BLOCKS';
      }, delay);
    });
    setTimeout(() => {
      els.boot.hidden = true;
      if (state.verified) unlock();
      else showWarning();
    }, reducedMotion ? 380 : 1880);
  }

  function showWarning() {
    els.age.hidden = false;
    els.ageEnter.focus({preventScroll:true});
  }
  function unlock() {
    state.unlocked = true;
    els.age.hidden = true;
    els.app.setAttribute('aria-hidden','false');
    document.body.classList.remove('state-locked');
    showModule('overview', false);
  }
  function bindControls() {
    els.ageEnter.addEventListener('click', () => {
      storage.set('nhAgeVerifiedV6','true');
      state.verified = true;
      unlock();
      startAudio(); // user gesture only; will fall back when MP3 unavailable
      playUi('enter');
    });
    els.ageLeave.addEventListener('click', () => { window.location.href = 'https://www.google.com'; });
    els.uiToggle.addEventListener('click', () => setUi(!state.ui));
    els.hideUiButton.addEventListener('click', () => setUi(false));
    els.navToggle.addEventListener('click', () => setWindow('nodes', !state.nodes));
    els.feedToggle.addEventListener('click', () => setWindow('feed', !state.feed));
    els.detailsToggle.addEventListener('click', () => {
      state.details = !state.details;
      els.details.hidden = !state.details;
      els.detailsToggle.textContent = state.details ? '03 / DETAILS −' : '03 / DETAILS +';
      els.detailsToggle.setAttribute('aria-pressed',String(state.details));
      playUi('tab');
    });
    document.querySelectorAll('[data-close-window]').forEach(button => {
      button.addEventListener('click', () => setWindow(button.dataset.closeWindow, false));
    });
    els.navItems.forEach(btn => btn.addEventListener('click',()=>showModule(btn.dataset.moduleTarget)));
    els.moduleJumps.forEach(btn => btn.addEventListener('click',()=>showModule(btn.dataset.moduleJump)));
    els.archiveTabs.forEach(tab => tab.addEventListener('click',()=>{
      state.filter=tab.dataset.filter||'all';
      els.archiveTabs.forEach(t=>{const active=t===tab;t.classList.toggle('is-active',active);t.setAttribute('aria-selected',String(active));});
      renderArchive(); playUi('tab');
    }));
    els.sound.addEventListener('click',()=>state.playing ? stopAudio() : startAudio());
    els.motion.addEventListener('click', enableMotion);
    document.addEventListener('pointerdown', event => {
      if (!state.ui) return;
      if (state.nodes && !els.nodes.contains(event.target) && event.target!==els.navToggle) setWindow('nodes',false);
      if (state.feed && !els.feed.contains(event.target) && event.target!==els.feedToggle) setWindow('feed',false);
    });
    document.addEventListener('keydown', event => {
      const typing = event.target.closest?.('input,textarea,select,[contenteditable]');
      if (typing) return;
      if (event.key === 'Escape') {
        if (!els.lightbox.hidden) closeLightbox();
        else if (state.nodes||state.feed) {setWindow('nodes',false);setWindow('feed',false);}
        else if (state.ui) setUi(false);
        return;
      }
      if (!els.lightbox.hidden) {
        if (event.key==='ArrowLeft')stepLightbox(-1);
        if (event.key==='ArrowRight')stepLightbox(1);
        return;
      }
      if (!state.unlocked) return;
      if (event.key.toLowerCase()==='h' && !event.repeat) setUi(!state.ui);
      const ids=['overview','works','archive','identity','commissions','contact'];
      const index = Number(event.key)-1;
      if (index>=0 && index<6) showModule(ids[index]);
    });
    document.querySelectorAll('[data-external-sfx]').forEach(a=>a.addEventListener('click',()=>playUi('confirm')));
  }

  function setUi(open) {
    state.ui=open;
    els.tools.hidden=!open;
    els.uiToggle.setAttribute('aria-expanded',String(open));
    els.uiToggle.textContent=open ? '[ − ] INTERFACE' : '[ + ] INTERFACE';
    if (!open) {
      setWindow('nodes',false);setWindow('feed',false);
      state.details=false;els.details.hidden=true;
      els.detailsToggle.textContent='03 / DETAILS +';
      els.detailsToggle.setAttribute('aria-pressed','false');
    }
  }
  function setWindow(which,open) {
    if (open && !state.ui) setUi(true);
    const isNodes=which==='nodes';
    const target=isNodes?els.nodes:els.feed;
    const toggle=isNodes?els.navToggle:els.feedToggle;
    state[isNodes?'nodes':'feed']=open;
    target.hidden=!open;
    toggle.setAttribute('aria-expanded',String(open));
    toggle.textContent=isNodes?(open?'01 / NODES −':'01 / NODES +'):(open?'02 / FEED −':'02 / FEED +');
    if (open) playUi('open');
  }
  function showModule(id,sound=true) {
    if (!(id in sections)) return;
    state.module=id;
    els.module.forEach(s=>{const active=s.dataset.module===id;s.hidden=!active;s.classList.toggle('is-active',active);});
    els.navItems.forEach(b=>b.classList.toggle('is-active',b.dataset.moduleTarget===id));
    if (els.telemetry) els.telemetry.textContent=sections[id];
    if (els.currentPath) els.currentPath.textContent='/'+id.toUpperCase();
    if (sound){setWindow('nodes',false);setWindow('feed',false);setUi(false);window.scrollTo({top:0,behavior:'instant'});playUi('select');}
    announce('Accessed '+sections[id]);
  }
  function renderRecent(){renderTiles(els.recent,art.recent);}
  function renderArchive(){
    const list=state.filter==='all'?art.archive:art.archive.filter(x=>x[3]===state.filter);
    renderTiles(els.archive,list);
    els.archiveSummary.textContent=state.filter.toUpperCase()+' / '+String(list.length).padStart(2,'0')+' RECORDS';
  }
  function renderTiles(container,list){
    if(!container)return;
    container.replaceChildren(...list.map((item,index)=>{
      const button=document.createElement('button');button.type='button';button.className='art-tile';
      const visual=document.createElement('span');visual.className='art-tile__visual';visual.style.backgroundImage='url("'+item[0]+'")';
      const meta=document.createElement('span');meta.className='art-tile__meta';
      const label=document.createElement('span');label.textContent=item[1];const descriptor=document.createElement('span');descriptor.textContent=item[2]+' ↗';
      meta.append(label,descriptor);button.append(visual,meta);
      button.addEventListener('click',()=>openLightbox(list,index,button));return button;
    }));
  }
  function setupLightbox(){
    els.lightboxClose.addEventListener('click',closeLightbox);
    els.lightboxPrev.addEventListener('click',()=>stepLightbox(-1));
    els.lightboxNext.addEventListener('click',()=>stepLightbox(1));
    els.lightbox.addEventListener('click',ev=>{if(ev.target===els.lightbox)closeLightbox();});
  }
  function openLightbox(list,index,button){
    state.list=list;state.index=index;state.focusBeforeLightbox=button;
    updateLightbox();els.lightbox.hidden=false;document.body.classList.add('lightbox-open');
    els.lightboxClose.focus({preventScroll:true});playUi('open');
  }
  function closeLightbox(){
    if(els.lightbox.hidden)return;
    els.lightbox.hidden=true;document.body.classList.remove('lightbox-open');
    state.focusBeforeLightbox?.focus({preventScroll:true});playUi('close');
  }
  function stepLightbox(dir){
    if(!state.list.length)return;
    state.index=(state.index+dir+state.list.length)%state.list.length;
    updateLightbox();playUi('tab');
  }
  function updateLightbox(){
    const item=state.list[state.index];if(!item)return;
    const img=new Image();img.src=item[0];img.alt=item[1];
    els.lightboxArt.replaceChildren(img);
    els.lightboxTitle.textContent=item[1];els.lightboxDetail.textContent=item[2];
    els.lightboxCounter.textContent=String(state.index+1).padStart(2,'0')+' / '+String(state.list.length).padStart(2,'0');
  }

  function setupCursor(){
    let pointerX=0,pointerY=0,scheduled=false;
    document.addEventListener('pointermove',e=>{
      pointerX=e.clientX;pointerY=e.clientY;
      if(scheduled)return;scheduled=true;
      requestAnimationFrame(()=>{
        scheduled=false;document.body.classList.add('cursor-ready');
        els.cursor.style.left=pointerX+'px';els.cursor.style.top=pointerY+'px';
      });
    },{passive:true});
    document.addEventListener('pointerover',e=>document.body.classList.toggle('cursor-hover',Boolean(e.target.closest?.('button,a'))),{passive:true});
    document.addEventListener('pointerleave',()=>document.body.classList.remove('cursor-ready'));
  }
  function setupParallax(){
    if(touchDevice||reducedMotion||!els.portrait)return;
    let scheduled=false,x=0,y=0;
    document.addEventListener('pointermove',e=>{
      if(state.module!=='overview'||!state.unlocked)return;
      x=(e.clientX/window.innerWidth-.5)*8;y=(e.clientY/window.innerHeight-.5)*6;
      if(scheduled)return;scheduled=true;
      requestAnimationFrame(()=>{scheduled=false;els.portrait.style.setProperty('--hero-x',x.toFixed(2)+'px');els.portrait.style.setProperty('--hero-y',y.toFixed(2)+'px');});
    },{passive:true});
  }
  async function enableMotion(){
    if(!touchDevice||!('DeviceOrientationEvent' in window)||state.orientation){
      els.motion.textContent=state.orientation?'MOTION ON':'UNAVAILABLE';return;
    }
    try {
      if(typeof DeviceOrientationEvent.requestPermission==='function'){
        const granted=await DeviceOrientationEvent.requestPermission();if(granted!=='granted')throw Error('Permission denied');
      }
      state.orientation=true;
      window.addEventListener('deviceorientation',e=>{
        if(!state.unlocked||state.module!=='overview'||reducedMotion)return;
        const x=Math.max(-8,Math.min(8,(e.gamma||0)*.36));
        const y=Math.max(-7,Math.min(7,(e.beta||0)*.2));
        els.portrait.style.setProperty('--hero-x',x.toFixed(1)+'px');
        els.portrait.style.setProperty('--hero-y',y.toFixed(1)+'px');
      },{passive:true});
      els.motion.textContent='MOTION ON';playUi('confirm');
    } catch {els.motion.textContent='MOTION BLOCKED';}
  }

  function configureAudio(){
    els.music.loop=true;els.music.preload='none';els.music.volume=.18;
    els.music.addEventListener('error',()=>{
      if(state.playing&&state.audioSource==='loading')void fallback(state.audioToken);
    });
  }
  function startAudio(){
    if(state.playing)return;
    state.playing=true;state.audioSource='loading';const token=++state.audioToken;syncAudio();
    // Calling .play() directly from the click event preserves browser activation.
    void synth.init();
    const promise=els.music.play();
    Promise.resolve(promise).then(()=>{
      if(!state.playing||token!==state.audioToken){els.music.pause();return;}
      synth.stopAmbient();state.audioSource='file';syncAudio();
    }).catch(()=>{void fallback(token);});
  }
  async function fallback(token){
    await synth.init();
    if(!state.playing||token!==state.audioToken)return;
    els.music.pause();synth.startAmbient();state.audioSource='procedural';syncAudio();
  }
  function stopAudio(){
    state.playing=false;state.audioSource='off';state.audioToken++;
    els.music.pause();synth.stopAmbient();syncAudio();
  }
  function syncAudio(){
    els.sound.textContent=!state.playing?'AUDIO OFF':state.audioSource==='file'?'MUSIC ON':'AMBIENT ON';
    els.sound.setAttribute('aria-pressed',String(state.playing));
    els.telemetryAudio.textContent=!state.playing?'MUTED':state.audioSource==='file'?'CUSTOM TRACK':'PROCEDURAL';
  }
  function playUi(kind){
    if(!state.playing||!synth.ctx)return;
    const now=performance.now();if(kind==='hover'&&now-state.lastHover<140)return;state.lastHover=now;
    synth.ui(kind);
  }
  function announce(text){els.announcer.textContent=text;}

  /* A compact, quiet ambient synth. No constant animation loop, noise buffer or heavy effects. */
  function createSynth(){
    let ctx=null,master=null,drones=[],shimmerTimer=null;
    function pulse(freq,duration=.12,vol=.028){
      if(!ctx||!master)return;
      const start=ctx.currentTime;
      const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,start);
      gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(vol,start+.015);
      gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
      osc.connect(gain).connect(master);osc.start(start);osc.stop(start+duration+.03);
    }
    return {
      get ctx(){return ctx;},
      async init(){
        try{
          if(!ctx){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)return;ctx=new AudioCtx();master=ctx.createGain();master.gain.value=.16;master.connect(ctx.destination);}
          if(ctx.state==='suspended')await ctx.resume();
        }catch{/* Audio optional; fail quietly */}
      },
      ui(kind){const tones={enter:220,select:310,tab:360,open:260,close:190,confirm:460,error:145};pulse(tones[kind]||280,kind==='enter'?.33:.11,kind==='enter'?.065:.025);},
      startAmbient(){
        if(!ctx||drones.length)return;
        const freqs=[73.42,110,164.81];
        drones=freqs.map((freq,i)=>{
          const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=i===1?'sine':'triangle';osc.frequency.value=freq;
          gain.gain.value=.009;osc.connect(gain).connect(master);osc.start();return {osc,gain};
        });
        shimmerTimer=setInterval(()=>{
          if(!drones.length)return;
          pulse([293.66,349.23,392,440,523.25][Math.floor(Math.random()*5)],1.5,.006);
        },5700);
      },
      stopAmbient(){
        if(shimmerTimer){clearInterval(shimmerTimer);shimmerTimer=null;}
        drones.forEach(({osc,gain})=>{try{osc.stop();osc.disconnect();gain.disconnect();}catch{}});drones=[];
      }
    };
  }
  init();
})();
