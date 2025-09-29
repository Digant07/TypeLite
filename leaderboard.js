(() => {
  'use strict';
  // Elements
  const tbody = document.getElementById('lbBody');
  const status = document.getElementById('lbStatus');
  const filtersWrap = document.getElementById('lbFilters');
  const titleEl = document.getElementById('lbTitle');
  const subEl = document.getElementById('lbSub');
  const refreshBtn = document.getElementById('refreshLeaderboard');
  const nextUpdateEl = document.getElementById('nextUpdate');
  const prevPageBtn = document.getElementById('prevPage');
  const nextPageBtn = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const personalToggle = document.getElementById('togglePersonal');
  const sortIndicator = document.getElementById('sortIndicator');

  // State
  let allRows = [];
  let viewRows = [];
  function getUrlDuration(){
    const params = new URLSearchParams(location.search);
    const d = params.get('duration');
    if(d==='30' || d==='60' || d==='120') return d;
    return null;
  }
  const urlDur = getUrlDuration();
  let currentFilter = localStorage.getItem('lbFilter') || 'alltime-eng-time30';
  if(urlDur){
    currentFilter = 'alltime-eng-time'+urlDur;
  }
  let page = 1;
  const pageSize = 25;
  let sortKey = 'rank';
  let sortDir = 'asc';
  let currentUser = null;
  let countdownTimer = null;

  // Derived title map
  const filterMeta = {
    'alltime-eng-time30': { title: 'All-time English Time 30 Leaderboard', scope:'global' },
    'alltime-eng-time60': { title: 'All-time English Time 60 Leaderboard', scope:'global' },
    'alltime-eng-time120': { title: 'All-time English Time 120 Leaderboard', scope:'global' },
    'weekly-xp': { title: 'Weekly XP Leaderboard', scope:'global' },
    'daily': { title: 'Daily Leaderboard', scope:'global' },
    'personal-time30': { title: 'My Time 30 Results', scope:'personal' },
    'personal-time60': { title: 'My Time 60 Results', scope:'personal' },
    'personal-time120': { title: 'My Time 120 Results', scope:'personal' }
  };

  function setStatus(msg){ if(status) status.textContent = msg || ''; }

  function fetchUser(){
    fetch('api/auth/me.php',{credentials:'include'})
      .then(r=> r.ok ? r.json() : null)
      .then(data => { if(data && data.user){ currentUser = data.user; }})
      .catch(()=>{});
  }

  function mapFilterToDuration(filter){
    if(filter.includes('time30')) return 30;
    if(filter.includes('time60')) return 60;
    if(filter.includes('time120')) return 120;
    return null;
  }
  
  function mapFilterToWordCount(filter){
    if(filter.includes('word10')) return 10;
    if(filter.includes('word25')) return 25;
    if(filter.includes('word50')) return 50;
    if(filter.includes('word100')) return 100;
    return null;
  }

  function isPersonalFilter(f){ return f.startsWith('personal-'); }
  
  function getTestType(filter) {
    if (filter.includes('time')) return 'time';
    if (filter.includes('word')) return 'word';
    return 'time'; // default to time-based tests
  }

  let autoRefreshTimer = null;
  function fetchData(){
    setStatus('Loading...');
    const type = getTestType(currentFilter);
    const params = new URLSearchParams();
    
    // Set test type
    if (type) {
      params.set('type', type);
      
      // Set duration or word count based on type
      if (type === 'time') {
        const dur = mapFilterToDuration(currentFilter);
        if (dur) {
          params.set('duration', String(dur));
        }
      } else if (type === 'word') {
        const wordCount = mapFilterToWordCount(currentFilter);
        if (wordCount) {
          params.set('word_count', String(wordCount));
        }
      }
    }
    
    // Add personal filter if needed
    if(isPersonalFilter(currentFilter)) {
      params.set('personal', '1');
    }
    
    const url = 'php/leaderboard.php' + (params.toString()? ('?'+params.toString()):'');
    return fetch(url)
      .then(r=>{
        if(!r.ok) throw new Error('HTTP '+r.status);
        return r.json();
      })
      .then(rows => {
      if(!Array.isArray(rows)) { setStatus('Unexpected response'); return; }
      // Normalize expected structure
      allRows = rows.map((r,i) => ({
        rank: i+1,
        username: r.username || r.user || 'Guest',
        wpm: parseFloat(r.wpm)||0,
        accuracy: parseFloat(r.accuracy)||0,
        raw: parseFloat(r.raw_wpm||r.raw||r.wpm)||0,
        consistency: parseFloat(r.consistency||r.consistency_pct||0),
        date: r.created_at || r.date || null,
        user_id: r.user_id || r.id || null,
        is_premium: r.is_premium || false
      }));
      applyFilter();
      setStatus(allRows.length? '' : 'No scores yet');
    }).catch(err=>{ 
      setStatus('Failed to load data'); 
      console.warn('[Leaderboard] fetch error:', err); 
    });
  }

  function startAutoRefresh(){
    if(autoRefreshTimer) clearInterval(autoRefreshTimer);
    autoRefreshTimer = setInterval(fetchData, 30000); // 30 seconds
  }

  function applyFilter(){
    const meta = filterMeta[currentFilter];
    titleEl.textContent = meta? meta.title : 'Leaderboard';
    if(meta?.scope==='personal' && !currentUser){
      subEl.textContent = 'Log in to view personal results.';
    } else {
      subEl.textContent = 'Your account must have 2 hours typed to be placed on the leaderboard.';
    }
    // For now: personal filters show only current user rows if backend returns them, else empty
    if(meta?.scope==='personal'){
      // Backend already filtered by user; just copy rows
      viewRows = [...allRows];
    } else {
      viewRows = [...allRows];
    }
    sortData();
    page = 1;
    render();
  }

  function sortData(){
    viewRows.sort((a,b)=>{
      let av=a[sortKey], bv=b[sortKey];
      if(sortKey==='date'){
        av = av? Date.parse(av) : 0; bv = bv? Date.parse(bv) : 0;
      }
      if(av < bv) return sortDir==='asc'? -1 : 1;
      if(av > bv) return sortDir==='asc'? 1 : -1;
      return 0;
    });
    // Rank recompute after sort
    viewRows.forEach((r,i)=> r._rankDisplay = i+1);
  }

  function formatDate(iso){
    if(!iso) return '—';
    const d = new Date(iso);
    if(isNaN(d.getTime())) return '—';
    return d.toLocaleDateString(undefined,{day:'2-digit',month:'short',year:'numeric'}) + ' - ' + d.toLocaleTimeString(undefined,{hour:'2-digit',minute:'2-digit'});
  }

  function render(){
    if(!tbody) return;
    tbody.innerHTML='';
    const start = (page-1)*pageSize;
    const slice = viewRows.slice(start,start+pageSize);
    if(!slice.length){
      const tr=document.createElement('tr');
      tr.className='empty-row';
      const meta = filterMeta[currentFilter];
        tr.innerHTML=`<td colspan="6">${meta?.scope==='personal'? 'No personal results for this duration yet.' : 'No results to display'}</td>`;
      tbody.appendChild(tr);
    } else {
      slice.forEach((row,i)=>{
        const tr=document.createElement('tr');
        const globalRank = row._rankDisplay || row.rank;
        let crown = globalRank===1? '<span class="crown" title="Top score">👑</span>' : '';
        let premiumBadge = row.is_premium ? '<span class="premium-badge" title="Premium User">⭐</span>' : '';
        tr.innerHTML = `
          <td class="rank-cell">${globalRank}</td>
          <td class="player-cell">${crown}<span class="player-name">${row.username}</span>${premiumBadge}</td>
          <td>${row.wpm.toFixed(2)}</td>
          <td>${row.accuracy.toFixed(2)}%</td>
          <td>${row.raw.toFixed(2)}</td>
          <td>${formatDate(row.date)}</td>`;
        if(globalRank===1) tr.classList.add('rank-1');
        else if(globalRank===2) tr.classList.add('rank-2');
        else if(globalRank===3) tr.classList.add('rank-3');
        if(currentUser && row.user_id === currentUser.id) tr.classList.add('personal-row');
        tbody.appendChild(tr);
      });
    }
    const totalPages = Math.max(1, Math.ceil(viewRows.length / pageSize));
    pageInfo.textContent = `Page ${page} / ${totalPages}`;
    prevPageBtn.disabled = page<=1;
    nextPageBtn.disabled = page>=totalPages;
    sortIndicator.textContent = `Sorted by ${sortKey} (${sortDir})`;
  }

  function handleSort(th){
    const key = th.getAttribute('data-sort');
    if(!key) return;
    if(sortKey===key){ sortDir = sortDir==='asc'? 'desc':'asc'; }
    else { sortKey = key; sortDir='asc'; }
    document.querySelectorAll('.sortable').forEach(el=> el.classList.remove('sorted-asc','sorted-desc'));
    th.classList.add(sortDir==='asc'? 'sorted-asc':'sorted-desc');
    sortData();
    render();
  }

  function startCountdown(){
    if(countdownTimer) clearInterval(countdownTimer);
    let remaining = 5 * 60; // 5 minutes placeholder
    function tick(){
      const m = Math.floor(remaining/60).toString().padStart(2,'0');
      const s = (remaining%60).toString().padStart(2,'0');
      if(nextUpdateEl) nextUpdateEl.textContent = `${m}:${s}`;
      if(remaining<=0){ clearInterval(countdownTimer); fetchData(); startCountdown(); }
      remaining--;
    }
    tick();
    countdownTimer = setInterval(tick,1000);
  }

  // Events
  filtersWrap?.addEventListener('click', e => {
    const btn = e.target.closest('.lb-filter');
    if(!btn) return;
    if(btn.classList.contains('active')) return;
    document.querySelectorAll('.lb-filter').forEach(b=> b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    localStorage.setItem('lbFilter', currentFilter);
    fetchData();
  });
  refreshBtn?.addEventListener('click', () => fetchData());
  prevPageBtn?.addEventListener('click', () => { if(page>1){ page--; render(); }});
  nextPageBtn?.addEventListener('click', () => { const totalPages = Math.max(1, Math.ceil(viewRows.length/pageSize)); if(page<totalPages){ page++; render(); }});
  personalToggle?.addEventListener('click', () => {
    const pressed = personalToggle.getAttribute('aria-pressed')==='true';
    personalToggle.setAttribute('aria-pressed', String(!pressed));
  // Toggle between corresponding global/personal duration (30/60/120)
    if(!pressed){
      if(currentFilter.includes('time60')) currentFilter='personal-time60';
      else if(currentFilter.includes('time120')) currentFilter='personal-time120';
      else currentFilter='personal-time30';
    } else {
      if(currentFilter.includes('time60')) currentFilter='alltime-eng-time60';
      else if(currentFilter.includes('time120')) currentFilter='alltime-eng-time120';
      else currentFilter='alltime-eng-time30';
    }
    localStorage.setItem('lbFilter', currentFilter);
    document.querySelectorAll('.lb-filter').forEach(b=> b.classList.remove('active'));
    const match = document.querySelector(`.lb-filter[data-filter="${currentFilter}"]`);
    match?.classList.add('active');
    fetchData();
  });
  document.addEventListener('click', e => {
    const th = e.target.closest('th.sortable');
    if(th) handleSort(th);
  });

  // Init
  window.addEventListener('load', () => {
    // Mark active filter button on initial load
    const btn = document.querySelector(`.lb-filter[data-filter="${currentFilter}"]`);
    if(btn){ document.querySelectorAll('.lb-filter').forEach(b=> b.classList.remove('active')); btn.classList.add('active'); }
    fetchUser();
    fetchData();
    startAutoRefresh();
    startCountdown();
  });
})();
