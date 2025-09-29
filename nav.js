(() => {
  'use strict';
  const themeToggle = document.getElementById('themeToggle');
  const authArea = document.getElementById('authArea');

  function applyTheme(theme){
    const root = document.documentElement;
    if(theme === 'light'){ root.classList.add('light'); } else { root.classList.remove('light'); }
    localStorage.setItem('theme', theme);
  }
  if(themeToggle){
    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('light');
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });
    const saved = localStorage.getItem('theme');
    if(saved) applyTheme(saved);
  }

  function updateAuthUI(info){
    if(!authArea) return;
    
    // Enhanced debug logging
    console.log('updateAuthUI called with:', info);
    
    if(info && info.authenticated){
      const initials = (info.username||'?').slice(0,2).toUpperCase();
      // Explicitly log premium status for debugging
      console.log('Premium status:', info.is_premium ? 'YES' : 'NO');
      
      const premiumClass = info.is_premium ? ' premium' : '';
      console.log('Adding CSS class to avatar:', premiumClass ? 'premium' : 'none');
      
      authArea.innerHTML = `<div class="profile-avatar${premiumClass}" id="avatarBtn">${initials}</div><div class="dropdown" id="profileMenu" role="menu">
      <div class="dropdown-header">
        <strong>${info.username || 'User'}</strong>
        ${info.is_premium ? '<span style="color: gold; margin-left: 5px;">✦ Premium</span>' : ''}
      </div>
      <div class="dropdown-divider"></div>
      <a href="profile.html" class="dropdown-link">View Profile</a>
      <button data-action="logout" id="logoutBtn" class="dropdown-button">Logout</button></div>`;
      document.getElementById('logoutBtn').addEventListener('click', ()=>{ fetch('php/logout.php').then(()=> location.reload()); });
      const avatarBtn = document.getElementById('avatarBtn');
      const menu = document.getElementById('profileMenu');
      avatarBtn.addEventListener('click',(e)=>{ e.stopPropagation(); menu.classList.toggle('open'); });
      document.addEventListener('click',(e)=>{ if(menu && !menu.contains(e.target) && !avatarBtn.contains(e.target)) menu.classList.remove('open'); });
    } else {
      authArea.innerHTML = '<a href="login.html" class="login-btn">login</a>';
    }
  }
  const navMap = { 'index.html':'navTest','leaderboard.html':'navLeaderboard' };
  const path = location.pathname;
  if(!path.endsWith('results.html')){ // don't highlight anything on results page
    const current = Object.keys(navMap).find(p=>path.endsWith(p)) || 'index.html';
    const activeId = navMap[current];
    document.querySelectorAll('.nav-link').forEach(l=>l.classList.remove('active'));
    document.getElementById(activeId)?.classList.add('active');
  }
  // Inject duration param into leaderboard link if we have a saved time test duration
  try {
    const dur = localStorage.getItem('lastDuration');
    if(dur && ['30','60','120'].includes(dur)){
      const lbLink = document.getElementById('navLeaderboard');
      if(lbLink){ lbLink.href = 'leaderboard.html?duration='+dur; }
    }
  } catch(e) {}
  
  fetch('php/user_stats.php').then(r=>r.json()).then(updateAuthUI).catch(()=>{});
})();
