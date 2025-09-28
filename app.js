(() => {
  'use strict';

  const wordsEl = document.getElementById('words');
  const cursorEl = document.getElementById('cursor');
  const testArea = document.getElementById('testArea');
  const hiddenInput = document.getElementById('hiddenInput');
  const wpmEl = document.getElementById('wpm');
  const accEl = document.getElementById('accuracy');
  const timeEl = document.getElementById('time');
  const restartBtn = document.getElementById('restartBtn');
  const themeToggle = document.getElementById('themeToggle');
  const modeButtons = Array.from(document.querySelectorAll('[data-mode]'));
  const timeOptions = document.getElementById('timeOptions');
  const wordOptions = document.getElementById('wordOptions');
  const timeBtns = Array.from(timeOptions.querySelectorAll('.seg-btn'));
  const wordBtns = Array.from(wordOptions.querySelectorAll('.seg-btn'));
  const difficultyTabs = document.getElementById('difficultyTabs');
  const difficultyButtons = difficultyTabs ? Array.from(difficultyTabs.querySelectorAll('[data-difficulty]')) : [];

  const authArea = document.getElementById('authArea');
  const loginLink = document.getElementById('loginLink');
  const helpDialog = document.getElementById('helpDialog');
  const helpClose = document.getElementById('helpClose');
  let profileDropdown = null;
  const samples = []; // each: { t: seconds, wpm, errors }
  let sampleInterval = null;

  const COMMON_WORDS = (
    "the of and to in is you that it he was for on are as with his they I at be this have from or one had by word but what some we can out other were all there when up use your how said an each she which do their time if will way about many then them would write like so these her long make thing see him two has look more day could go come did number sound no most people my over know water than call first who may down side been now find any new work part take get place made live where after back little only round man year came show every good me give our under name very through just form much great think say help low line differ turn cause mean before move right boy old too same tell does set three want air well also play small end put home read hand port large spell add even land here must big high such follow act why ask men change went light kind off need house picture try us again animal point mother world near build self earth father head stand own page should country found answer school grow study still learn plant cover food sun four between state keep eye never last let thought city tree cross farm hard start might story saw far sea draw left late run don't while press close night real life few north open seem together next white children begin got walk example ease paper group always music those both mark often letter until mile river car feet care second book carry took science eat room friend began idea fish mountain stop once base hear horse cut sure watch color face wood main enough plain girl usual young ready above ever red list though feel talk bird soon body dog family direct pose leave song measure door product black short numeral class wind question happen complete ship area half rock order fire south problem piece told knew pass since top whole king space heard best hour better true during hundred five remember step early hold west ground interest reach fast verb sing listen six table travel less morning ten simple several vowel toward war lay against pattern slow center love person money serve appear road map rain rule govern pull cold notice voice fall power town fine certain fly unit lead cry dark machine note wait plan figure star box noun field rest correct able pound done beauty drive stood contain front teach week final gave green oh quick develop ocean warm free minute strong special mind behind clear tail produce fact street inch lot nothing course stay wheel full force blue object decide surface deep moon island foot system busy test record boat common gold possible plane stead dry wonder laugh thousand ago ran check game shape yes hot miss brought heat snow tire bring distant fill east paint language among grand ball yet wave drop heart am present heavy dance engine position arm wide sail material size vary settle speak weight general ice matter circle pair include divide syllable felt perhaps pick sudden count square reason length represent art subject region energy hunt probable bed brother egg ride cell believe fraction forest sit race window store summer train sleep prove lone leg exercise wall catch mount wish sky board joy winter sat written wild instrument kept glass grass cow job edge sign visit past soft fun bright gas weather month million bear finish happy hope flower clothe strange gone jump baby eight village meet root buy raise solve metal whether push seven paragraph third shall held hair describe cook floor either result burn hill safe cat century consider type law bit coast copy phrase silent tall sand soil roll temperature finger industry value fight lie beat excite natural view sense ear else quite broke case middle kill son lake moment scale loud spring observe child straight consonant nation dictionary milk speed method organ pay age section dress cloud surprise quiet stone tiny climb cool design poor lot experiment bottom key iron single stick flat twenty skin smile crease hole trade melody trip office receive row mouth exact symbol die least trouble shout except wrote seed tone join suggest clean break lady yard rise bad blow oil blood touch grew cent mix team wire cost lost brown wear garden equal sent choose fell fit flow fair bank collect save control decimal gentle woman captain practice separate difficult doctor please protect noon whose locate ring character insect caught period indicate radio spoke atom human history effect electric expect crop modern element hit student corner party supply bone rail imagine provide agree thus capital won't chair danger fruit rich thick soldier process operate guess necessary sharp wing create neighbor wash bat rather crowd corn compare poem string bell depend meat rub tube famous dollar stream fear sight thin triangle planet hurry chief colony clock mine tie enter major fresh search send yellow gun allow print dead spot desert suit current lift rose continue block chart hat sell success company subtract event particular deal swim term opposite wife shoe shoulder spread arrange camp invent cotton born determine quart nine truck noise level chance gather shop stretch throw shine property column molecule select wrong gray repeat require broad prepare salt nose plural anger claim continent oxygen sugar death pretty skill women season solution magnet silver thank branch match suffix especially fig afraid huge sister steel discuss forward similar guide experience score apple bought led pitch coat mass card band rope slip win dream evening condition feed tool total basic smell valley nor double seat arrive master track parent shore division sheet substance favor connect post spend chord fat glad original share station dad bread charge proper bar offer segment slave duck instant market degree populate chick dear enemy reply drink occur support speech nature range steam motion path liquid log meant quotient teeth shell neck"
  ).split(/\s+/);

  let testMode = 'time';
  let testSeconds = 60;
  let testWordTarget = 25;
  let difficulty = 'beginner';

  let startedAt = null;
  let endedAt = null;
  let timerId = null;

  let words = [];
  let wordIndex = 0;
  let charIndex = 0;
  let totalKeystrokes = 0;
  let correctKeystrokes = 0;
  let correctChars = 0;

  const BEGINNER_SENTENCES = [
    'the sun rises in the east and sets in the west',
    'we walk to school in the early light',
    'a calm wind moves over the green field',
    'you can make your mind focus on each word',
    'time moves like a soft slow stream',
    'learn to type with ease and steady speed',
    'each day we grow our skill and will',
    'practice makes our hands flow over keys',
    'small steps build strong habits that last',
    'clear thoughts come with a calm pace'
  ];

  const INTERMEDIATE_SENTENCES = [
    'Typing fluency grows with mindful repetition, not random rushing.',
    'Focus on accuracy first; speed will, in time, emerge naturally.',
    '"Can you keep a steady rhythm?" the mentor asked quietly.',
    'Mistakes are feedbackâ€”review them, adjust, and continue.',
    'Balanced posture, relaxed wrists, and clear breathing improve endurance.',
    'Progress feels invisibleâ€”until suddenly, everything is faster.',
    'Pausing to reset your form often saves time overall.',
    'Consistent practice beats intense but rare marathon sessions.',
    'A gentle cadence reduces tension and increases precision.',
    'Train your focus; wandering thought is the silent speed thief.'
  ];

  const ADVANCED_BLOCKS = [
    'While latency < threshold: buffer.push(packet.id + ":" + hash(packet.data));',
    'function greet(name) { console.log("Hello, " + name + "!"); return true; }',
    'SELECT user_id, SUM(score) AS total FROM results GROUP BY user_id ORDER BY total DESC LIMIT 10;',
    'curl -X POST https://api.example.com/v1/score -H "Auth: Bearer token" -d "wpm=132&acc=97"',
    'for (let i = 0; i < arr.length; i++) { if (!map.has(arr[i])) map.set(arr[i], 1); }',
    'git add . && git commit -m "refactor: optimize rendering pipeline" && git push origin main',
    'const pattern = /^(?:[a-z0-9_]{3,16})$/i; if(!pattern.test(handle)) throw new Error("invalid");',
    '#include <stdio.h>\nint main(){ printf("speed test\\n"); return 0; }',
    'npm install --save-dev typescript @types/node && npx tsc --init --strict',
    'Memory usage: current=82MB peak=109MB threshold=200MB status=OK'
  ];

  function generateBeginnerPool(targetWords){
    const out = [];
    while(out.join(' ').split(/\s+/).length < targetWords * 2){
      out.push(BEGINNER_SENTENCES[Math.floor(Math.random()*BEGINNER_SENTENCES.length)]);
    }
    return out.join(' ').trim().split(/\s+/);
  }

  function generateIntermediatePool(targetWords){
    const out = [];
    while(out.join(' ').split(/\s+/).length < targetWords * 2){
      out.push(INTERMEDIATE_SENTENCES[Math.floor(Math.random()*INTERMEDIATE_SENTENCES.length)]);
    }
    return out.join(' ').trim().split(/\s+/);
  }

  function generateAdvancedPool(targetWords){
    const out = [];
    while(out.join(' ').split(/\s+/).length < targetWords * 2){
      out.push(ADVANCED_BLOCKS[Math.floor(Math.random()*ADVANCED_BLOCKS.length)]);
    }
    return out.join(' ').trim().split(/\s+/);
  }

  function pickWords(count){
    if(difficulty === 'beginner') return generateBeginnerPool(count).slice(0, count);
    if(difficulty === 'intermediate') return generateIntermediatePool(count).slice(0, count);
    if(difficulty === 'advanced') return generateAdvancedPool(count).slice(0, count);
    const arr = [];
    for(let i=0;i<count;i++) arr.push(COMMON_WORDS[Math.floor(Math.random()*COMMON_WORDS.length)]);
    return arr;
  }

  function renderWords(list){
    wordsEl.innerHTML = '';
    list.forEach((w, wi) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'word';
      for(let i=0;i<w.length;i++){
        const ch = document.createElement('span');
        ch.className = 'char';
        ch.textContent = w[i];
        if(wi===0 && i===0){ ch.classList.add('current'); }
        wordSpan.appendChild(ch);
      }
      const space = document.createElement('span');
      space.className = 'char';
      space.textContent = ' ';
      wordSpan.appendChild(space);
      wordsEl.appendChild(wordSpan);
    });
    positionCursor();
  }

  function getCurrentCharEl(){
    const wordEl = wordsEl.children[wordIndex];
    if(!wordEl) return null;
    return wordEl.querySelectorAll('.char')[charIndex] || null;
  }

  function positionCursor(){
    const el = getCurrentCharEl();
    if(!el){ cursorEl.style.display='none'; return; }
    const rect = el.getBoundingClientRect();
    const container = testArea.getBoundingClientRect();
    cursorEl.style.display='block';
    cursorEl.style.left = (rect.left - container.left) + 'px';
    cursorEl.style.top = (rect.top - container.top) + 'px';
    cursorEl.style.height = rect.height + 'px';
  }

  function reset(){
    startedAt = null; endedAt = null; if(timerId){ clearInterval(timerId); timerId=null; }
    if(sampleInterval){ clearInterval(sampleInterval); sampleInterval=null; }
    samples.length = 0;
    totalKeystrokes = 0; correctKeystrokes = 0; correctChars = 0;
    wordIndex = 0; charIndex = 0;
    const baseSize = testMode==='words' ? testWordTarget + 10 : 120;
    const poolSize = difficulty==='advanced' ? Math.ceil(baseSize*1.2) : baseSize;
    words = pickWords(poolSize);
    renderWords(words);
    updateStats(0);
  }

  function elapsedSeconds(){
    if(!startedAt) return 0;
    const end = endedAt || Date.now();
    return Math.max(0, Math.floor((end - startedAt)/1000));
  }

  function updateStats(elapsed){
    const minutes = (elapsed || elapsedSeconds())/60;
    const wpm = minutes>0 ? Math.round((correctChars/5)/minutes) : 0;
    const accuracy = totalKeystrokes>0 ? Math.max(0, Math.min(100, Math.round((correctKeystrokes/totalKeystrokes)*100))) : 100;
    wpmEl.textContent = String(wpm);
    accEl.textContent = accuracy + '%';
    timeEl.textContent = (elapsed || elapsedSeconds()) + 's';
  }

  function finish(){
    if(endedAt) return;
    endedAt = Date.now();
    if(timerId){ clearInterval(timerId); timerId=null; }
    if(sampleInterval){ clearInterval(sampleInterval); sampleInterval=null; }
    updateStats();
    saveResult();
    const duration = elapsedSeconds();
    const minutes = duration/60;
    const netWpm = minutes>0 ? Math.round((correctChars/5)/minutes) : 0;
    const rawWpm = minutes>0 ? Math.round((totalKeystrokes/5)/minutes) : 0;
    const accuracy = totalKeystrokes>0 ? Math.max(0, Math.min(100, Math.round((correctKeystrokes/totalKeystrokes)*100))) : 100;
    let consistency = 0;
    if(samples.length>1){
      const avg = samples.reduce((a,b)=>a+b.wpm,0)/samples.length;
      const variance = samples.reduce((a,b)=>a+Math.pow(b.wpm-avg,2),0)/samples.length;
      const std = Math.sqrt(variance);
      consistency = Math.max(0, Math.min(100, Math.round(100 - (std/avg)*100)));
    } else consistency = 100;
    const totalErrors = totalKeystrokes - correctKeystrokes;
    const errorsPerSec = duration>0 ? totalErrors / duration : 0;
    const result = {
      wpm: netWpm,
      rawWpm,
      accuracy,
      consistency,
      errorsPerSec,
      correct: correctChars,
      incorrect: totalErrors, // simplified (no detailed missed vs extra distinction yet)
      missed: 0,
      extra: 0,
      duration,
      testMode,
      wordTarget: testWordTarget,
      difficulty,
      language: 'english',
      samples: samples.map(s=>({ t:s.t, wpm:s.wpm, errors:s.errors })),
      completedAt: Date.now()
    };
    try { sessionStorage.setItem('lastResult', JSON.stringify(result)); } catch(e){}
    window.location.href = 'results.html';
  }

  function handleKey(ev){
    if(ev.key === 'Shift' || ev.key === 'Alt' || ev.key === 'Meta' || ev.key === 'Control') return;
    if(!startedAt){
      startedAt = Date.now();
      if(testMode==='time'){
        timerId = setInterval(() => {
          const e = elapsedSeconds();
          updateStats(e);
          if(e >= testSeconds){ finish(); }
        }, 100);
      }
      sampleInterval = setInterval(()=>{
        const t = elapsedSeconds();
        if(!startedAt || endedAt) return;
        const minutes = t/60;
        const wpm = minutes>0 ? Math.round((correctChars/5)/minutes) : 0;
        const errors = totalKeystrokes - correctKeystrokes;
        samples.push({ t, wpm, errors });
      },1000);
    }

    if(endedAt) return;

    const currentWord = words[wordIndex] || '';
    const expectedChar = (currentWord + ' ').charAt(charIndex);
    const isBackspace = ev.key === 'Backspace';
    const isPrintable = ev.key.length === 1;

    if(isBackspace){
      ev.preventDefault();
      if(charIndex>0){
        charIndex--;
        const el = getCurrentCharEl();
        if(el){ el.classList.remove('correct','incorrect'); el.classList.add('current'); }
        const next = wordsEl.children[wordIndex].querySelectorAll('.char')[charIndex+1];
        if(next){ next.classList.remove('current'); }
        positionCursor();
      } else if(wordIndex>0){
        wordIndex--;
        charIndex = words[wordIndex].length;
        const prevWordChars = wordsEl.children[wordIndex].querySelectorAll('.char');
        prevWordChars.forEach(c=>c.classList.remove('current'));
        prevWordChars[charIndex]?.classList.add('current');
        positionCursor();
      }
      return;
    }

    if(!isPrintable) return;

    totalKeystrokes++;
    const correct = ev.key === expectedChar;
    if(correct){
      correctKeystrokes++; if(expectedChar !== ' ') correctChars++;
    }

    const el = getCurrentCharEl();
    if(el){
      el.classList.remove('current');
      el.classList.add(correct? 'correct':'incorrect');
    }

    charIndex++;

    if(expectedChar === ' '){
      wordIndex++; charIndex = 0;
      if(!words[wordIndex]){
        words = words.concat(pickWords(20));
        renderWords(words);
      }
    }

    const nextEl = getCurrentCharEl();
    if(nextEl){ nextEl.classList.add('current'); }
    positionCursor();
    updateStats();

    if(testMode==='words' && wordIndex >= testWordTarget){
      finish();
    }
  }

  document.addEventListener('paste', e => e.preventDefault());

  function focusInput(){ hiddenInput.focus({ preventScroll:true }); }
  testArea.addEventListener('click', focusInput);
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Tab') return; // allow tab away
    if(document.activeElement !== hiddenInput) focusInput();
    handleKey(e);
  });

  function applyTheme(theme){
    const root = document.documentElement;
    if(theme === 'light'){ root.classList.add('light'); } else { root.classList.remove('light'); }
  }
  (function(){
    const saved = localStorage.getItem('theme');
    if(saved) applyTheme(saved);
  })();

  function activateButton(btns, btn){
    btns.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
  }
  modeButtons.forEach(btn=>btn.addEventListener('click', ()=>{
    activateButton(modeButtons, btn);
    const mode = btn.dataset.mode;
    if(mode==='time'){
      testMode = 'time';
      timeOptions.classList.remove('hidden');
      wordOptions.classList.add('hidden');
    } else {
      testMode = 'words';
      timeOptions.classList.add('hidden');
      wordOptions.classList.remove('hidden');
    }
    reset();
  }));
  timeBtns.forEach(b=>b.addEventListener('click', ()=>{
    activateButton(timeBtns, b);
    testSeconds = Number(b.dataset.seconds || '60');
    try { localStorage.setItem('lastDuration', String(testSeconds)); } catch(e){}
    reset();
  }));
  wordBtns.forEach(b=>b.addEventListener('click', ()=>{
    activateButton(wordBtns, b);
    testWordTarget = Number(b.dataset.words || '25');
    reset();
  }));
  restartBtn.addEventListener('click', reset);

  function activateDifficulty(btn){
    difficultyButtons.forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-selected','true');
  }
  difficultyButtons.forEach(btn=>btn.addEventListener('click', (e)=>{
    if (btn.dataset.difficulty === 'advanced' && !isPremiumUser()) {
      e.preventDefault();
      e.stopPropagation();
      const isAuthenticated = currentUser !== null;
      if (!isAuthenticated) {
        showLoginRequiredModal('Expert Difficulty');
      } else {
        showPremiumUpgradeModal('Expert Difficulty');
      }
      return false;
    }
    
    activateDifficulty(btn);
    difficulty = btn.dataset.difficulty || 'beginner';
    reset();
  }));

  function updateAuthUI(){/* noop */}


  if(helpClose && helpDialog){
    helpClose.addEventListener('click', ()=> helpDialog.close());
  }
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && helpDialog && helpDialog.open){ helpDialog.close(); }
  });


  function saveResult(){
    const durationActual = elapsedSeconds();
    const minutes = durationActual/60;
    const netWpm = minutes>0 ? Math.round((correctChars/5)/minutes) : 0;
    const rawWpm = minutes>0 ? Math.round((totalKeystrokes/5)/minutes) : 0;
    const accuracy = totalKeystrokes>0 ? Math.max(0, Math.min(100, Math.round((correctKeystrokes/totalKeystrokes)*100))) : 100;
    let consistency = 100;
    if(samples.length>1){
      const avg = samples.reduce((a,b)=>a+b.wpm,0)/samples.length;
      const variance = samples.reduce((a,b)=>a+Math.pow(b.wpm-avg,2),0)/samples.length;
      const std = Math.sqrt(variance);
      consistency = Math.max(0, Math.min(100, Math.round(100 - (std/avg)*100)));
    }
    const totalErrors = totalKeystrokes - correctKeystrokes;
    const errorsPerSec = durationActual>0 ? (totalErrors/durationActual) : 0;
    const payload = new URLSearchParams();
    payload.set('wpm', String(netWpm));
    payload.set('raw_wpm', String(rawWpm));
    payload.set('consistency', String(consistency));
    payload.set('errors_per_sec', String(errorsPerSec.toFixed(4)));
    payload.set('accuracy', String(accuracy));
    payload.set('duration', String(testMode==='time'? testSeconds : 0));
    let saved = false;
    const controller = new AbortController();
    const timeout = setTimeout(()=>controller.abort(), 1500);
    fetch('php/save_result.php', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body: payload, signal: controller.signal })
      .then(()=>{ saved=true; })
      .catch(()=>{})
      .finally(()=>{ clearTimeout(timeout); if(!saved){ try { navigator.sendBeacon && navigator.sendBeacon('php/save_result.php', payload); } catch(e){} } });
  }

  window.addEventListener('resize', positionCursor);
  window.addEventListener('load', () => {
    try {
      const savedDur = localStorage.getItem('lastDuration');
      if(savedDur){
        const btn = timeBtns.find(b=> b.dataset.seconds === savedDur);
        if(btn){ btn.click(); }
      }
    } catch(e){}
    reset();
  fetch('php/me.php').then(r=>r.json()).then(updateAuthUI).catch(()=>{});
  });

  const musicBtn = document.getElementById('musicBtn');
  const musicDropdown = document.getElementById('musicDropdown');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const volumeSlider = document.getElementById('volumeSlider');
  const currentTrackName = document.getElementById('currentTrackName');
  const customMusicFile = document.getElementById('customMusicFile');
  const trackRadios = document.querySelectorAll('input[name="musicTrack"]');
  
  let currentAudio = null;
  let isPlaying = false;
  let currentTrack = 'none';

  const defaultTracks = {
    'ambient-focus.mp3': 'assets/music/ambient-focus.mp3',
    'electronic-drive.mp3': 'assets/music/electronic-drive.mp3',
    'lofi-chill.mp3': 'assets/music/lofi-chill.mp3',
    'upbeat-energy.mp3': 'assets/music/upbeat-energy.mp3'
  };

  if (volumeSlider) {
    volumeSlider.addEventListener('input', (e) => {
      const volume = e.target.value;
      if (currentAudio) {
        currentAudio.volume = volume / 100;
      }
    });
  }

  trackRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      if (radio.checked) {
        selectTrack(radio.value);
      }
    });
  });

  if (customMusicFile) {
    customMusicFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        selectTrack('custom', url, file.name);
        const customRadio = document.querySelector('input[value="custom"]');
        if (customRadio) customRadio.checked = true;
      }
    });

    const customRadio = document.querySelector('input[value="custom"]');
    if (customRadio) {
      customRadio.addEventListener('change', () => {
        if (customRadio.checked) {
          customMusicFile.click();
        }
      });
    }
  }

  function selectTrack(trackValue, customUrl = null, customName = null) {
    stopMusic();
    currentTrack = trackValue;
    
    if (trackValue === 'none') {
      currentTrackName.textContent = 'No music';
      updatePlaybackControls(false);
    } else if (trackValue === 'custom' && customUrl) {
      loadAudio(customUrl);
      currentTrackName.textContent = customName || 'Custom track';
    } else if (defaultTracks[trackValue]) {
      loadAudio(defaultTracks[trackValue]);
      currentTrackName.textContent = getTrackDisplayName(trackValue);
    }
  }

  function getTrackDisplayName(trackValue) {
    const names = {
      'ambient-focus.mp3': 'Ambient',
      'electronic-drive.mp3': 'Electronic',
      'lofi-chill.mp3': 'Lo-Fi',
      'upbeat-energy.mp3': 'Upbeat'
    };
    return names[trackValue] || trackValue;
  }

  function loadAudio(url) {
    try {
      currentAudio = new Audio(url);
      currentAudio.volume = volumeSlider ? volumeSlider.value / 100 : 0.5;
      currentAudio.loop = true;
      
      currentAudio.addEventListener('loadeddata', () => {
        updatePlaybackControls(true);
      });
      
      currentAudio.addEventListener('error', () => {
        console.warn('Failed to load audio:', url);
        currentTrackName.textContent = 'Failed to load';
        updatePlaybackControls(false);
      });

    } catch (error) {
      console.warn('Audio loading error:', error);
      updatePlaybackControls(false);
    }
  }

  function updatePlaybackControls(enabled) {
    if (playBtn) playBtn.disabled = !enabled;
    if (pauseBtn) pauseBtn.disabled = !enabled;
    if (stopBtn) stopBtn.disabled = !enabled;
  }

  if (playBtn) {
    playBtn.addEventListener('click', playMusic);
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', pauseMusic);
  }

  if (stopBtn) {
    stopBtn.addEventListener('click', stopMusic);
  }

  function playMusic() {
    if (currentAudio && currentTrack !== 'none') {
      currentAudio.play().then(() => {
        isPlaying = true;
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'inline-flex';
      }).catch((error) => {
        console.warn('Audio play error:', error);
      });
    }
  }

  function pauseMusic() {
    if (currentAudio) {
      currentAudio.pause();
      isPlaying = false;
      playBtn.style.display = 'inline-flex';
      pauseBtn.style.display = 'none';
    }
  }

  function stopMusic() {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      isPlaying = false;
      playBtn.style.display = 'inline-flex';
      pauseBtn.style.display = 'none';
    }
  }

  let currentUser = null;
  let userPremiumStatus = false;

  async function checkUserAuth() {
    try {
      const response = await fetch('php/me.php');
      const data = await response.json();
      
      if (data.authenticated) {
        currentUser = data;
        userPremiumStatus = data.is_premium || false;
        return true;
      } else {
        currentUser = null;
        userPremiumStatus = false;
        return false;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      currentUser = null;
      userPremiumStatus = false;
      return false;
    }
  }

  function isPremiumUser() {
    return userPremiumStatus && currentUser;
  }

  function isLoggedIn() {
    return currentUser !== null;
  }

  async function initializePremiumFeatures() {
    const isAuthenticated = await checkUserAuth();
    
    const musicPremiumBadge = document.getElementById('musicPremiumBadge');
    const advancedPremiumBadge = document.getElementById('advancedPremiumBadge');
    const musicPremiumPrompt = document.getElementById('musicPremiumPrompt');
    const musicTracksContainer = document.getElementById('musicTracksContainer');
    const advancedBtn = document.getElementById('advancedBtn');

    if (isAuthenticated && isPremiumUser()) {
      showPremiumStatus();
      
      if (advancedBtn) {
        advancedBtn.classList.add('premium-unlocked');
        if (advancedPremiumBadge) advancedPremiumBadge.style.display = 'none';
      }

      if (musicPremiumBadge) musicPremiumBadge.style.display = 'none';
      if (musicPremiumPrompt) musicPremiumPrompt.style.display = 'none';
      if (musicTracksContainer) musicTracksContainer.style.display = 'block';
      
    } else {
      if (musicPremiumBadge) musicPremiumBadge.style.display = 'inline-block';
      if (advancedPremiumBadge) advancedPremiumBadge.style.display = 'inline-block';
      
      if (musicPremiumPrompt) {
        if (isAuthenticated) {
          musicPremiumPrompt.style.display = 'block';
        } else {
          musicPremiumPrompt.innerHTML = `
            <p>ðŸ” Login Required</p>
            <p>Please log in to access premium music features!</p>
            <button class="upgrade-btn" onclick="window.location.href='login.html'">Login</button>
          `;
          musicPremiumPrompt.style.display = 'block';
        }
      }
      if (musicTracksContainer) musicTracksContainer.style.display = 'none';
    }
  }

  function showPremiumStatus() {
    const existingStatus = document.getElementById('premiumStatus');
    if (!existingStatus && currentUser) {
      const premiumStatus = document.createElement('div');
      premiumStatus.id = 'premiumStatus';
      premiumStatus.className = 'premium-status';
      premiumStatus.textContent = 'Premium';
      premiumStatus.style.cursor = 'pointer';
      premiumStatus.title = 'Manage Premium Subscription';
      premiumStatus.addEventListener('click', () => {
        window.location.href = 'profile.html';
      });
      document.body.appendChild(premiumStatus);
    }
  }

  function showLoginRequiredModal(featureName) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--bg);
      padding: 2rem;
      border-radius: 12px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
    `;

    modalContent.innerHTML = `
      <h3 style="color: var(--accent); margin-bottom: 1rem;">ðŸ” Login Required</h3>
      <p style="margin-bottom: 1rem; color: var(--fg);">${featureName} requires you to be logged in.</p>
      <p style="margin-bottom: 1.5rem; color: var(--subtle); font-size: 0.9rem;">Please log in to access premium features!</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="loginNowBtn" style="background: var(--accent); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600;">
          Login
        </button>
        <button id="registerNowBtn" style="background: var(--muted); color: var(--fg); border: 1px solid var(--border); padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
          Register
        </button>
        <button id="closeModalBtn" style="background: var(--muted); color: var(--fg); border: 1px solid var(--border); padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
          Cancel
        </button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.getElementById('loginNowBtn').addEventListener('click', () => {
      window.location.href = 'login.html';
    });

    document.getElementById('registerNowBtn').addEventListener('click', () => {
      window.location.href = 'register.html';
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  function showPremiumUpgradeModal(featureName) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    `;

    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
      background: var(--bg);
      padding: 2rem;
      border-radius: 12px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border);
    `;

    modalContent.innerHTML = `
      <h3 style="color: var(--accent); margin-bottom: 1rem;">ðŸŒŸ Premium Feature</h3>
      <p style="margin-bottom: 1rem; color: var(--fg);">${featureName} is available only for Premium users.</p>
      <p style="margin-bottom: 1.5rem; color: var(--subtle); font-size: 0.9rem;">Upgrade now to unlock all expert features!</p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button id="upgradeNowBtn" style="background: var(--accent); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 600;">
          Upgrade Now
        </button>
        <button id="closeModalBtn" style="background: var(--muted); color: var(--fg); border: 1px solid var(--border); padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer;">
          Maybe Later
        </button>
      </div>
    `;

    modal.appendChild(modalContent);
    document.body.appendChild(modal);

    document.getElementById('upgradeNowBtn').addEventListener('click', () => {
      window.location.href = 'premium.html';
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      document.body.removeChild(modal);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  if (musicBtn) {
    musicBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!isPremiumUser()) {
        musicDropdown.style.display = musicDropdown.style.display === 'none' ? 'block' : 'none';
      } else {
        const isVisible = musicDropdown.style.display !== 'none';
        musicDropdown.style.display = isVisible ? 'none' : 'block';
      }
    });

    document.addEventListener('click', (e) => {
      if (!musicBtn.contains(e.target) && !musicDropdown.contains(e.target)) {
        musicDropdown.style.display = 'none';
      }
    });
  }

  initializePremiumFeatures();

})();

