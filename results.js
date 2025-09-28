(() => {
  'use strict';
  const data = (()=>{ try { return JSON.parse(sessionStorage.getItem('lastResult')||'null'); } catch(e){ return null; }})();
  const els = id => document.getElementById(id);
  if(!data){
    els('rWpm').textContent='—';
    els('rAccuracy').textContent='No recent test';
    els('emptyChartState').style.display='block';
    return;
  }
  // Primary + secondary
  els('rWpm').textContent = data.wpm;
  els('rAccuracy').textContent = `Accuracy ${data.accuracy}%`;
  els('rRawWpm').textContent = data.rawWpm;
  els('rConsistency').textContent = data.consistency + '%';
  els('rErrorsPerSec').textContent = data.errorsPerSec.toFixed(2);
  els('rDuration').textContent = data.duration + 's';
  
  // World Record Comparison
  const worldRecord = 216; // Barbara Blackburn's world record
  const userWpm = data.wpm;
  const percentage = Math.min(100, (userWpm / worldRecord * 100));
  const gap = Math.max(0, worldRecord - userWpm);
  
  els('userWpm').textContent = userWpm + ' WPM';
  els('wrPercentage').textContent = percentage.toFixed(1) + '%';
  els('wrGap').textContent = gap + ' WPM';
  els('wrProgressFill').style.width = percentage + '%';
  els('wrProgressMarker').style.left = percentage + '%';
  
  // Dynamic motivation message based on performance
  const motivationEl = els('wrMotivation');
  if (userWpm >= 200) {
    motivationEl.textContent = '🏆 Incredible! You\'re approaching legendary typing speeds!';
    motivationEl.style.background = 'linear-gradient(135deg,rgba(255,215,0,.15),rgba(34,197,94,.15))';
  } else if (userWpm >= 150) {
    motivationEl.textContent = '🚀 Exceptional! You\'re in the top tier of typists!';
    motivationEl.style.background = 'linear-gradient(135deg,rgba(34,197,94,.12),rgba(59,130,246,.12))';
  } else if (userWpm >= 100) {
    motivationEl.textContent = '⭐ Great job! You\'re typing faster than most professionals!';
    motivationEl.style.background = 'linear-gradient(135deg,rgba(59,130,246,.1),rgba(147,51,234,.1))';
  } else if (userWpm >= 70) {
    motivationEl.textContent = '💪 Good progress! You\'re above average speed!';
    motivationEl.style.background = 'linear-gradient(135deg,rgba(147,51,234,.1),rgba(236,72,153,.1))';
  } else if (userWpm >= 40) {
    motivationEl.textContent = '📈 Keep practicing! You\'re on your way to professional speeds!';
  } else {
    motivationEl.textContent = '🌱 Great start! Every expert was once a beginner!';
  }
  
  // Breakdown
  els('rCorrect').textContent = data.correct;
  els('rIncorrect').textContent = data.incorrect;
  els('rMissed').textContent = data.missed;
  els('rExtra').textContent = data.extra;
  // Info list
  const info = els('rInfoList');
  const addInfo = (label,val)=>{ const li=document.createElement('li'); li.innerHTML=`<span>${label}</span><span>${val}</span>`; info.appendChild(li); };
  addInfo('Test Type', data.testMode === 'time' ? `Time (${data.duration}s)` : `Words (${data.wordTarget})`);
  addInfo('Difficulty', data.difficulty);
  addInfo('Language', data.language || 'english');
  addInfo('Completed', new Date(data.completedAt).toLocaleString());
  // Chart
  const samples = data.samples || [];
  if(!samples.length){
    els('emptyChartState').style.display='block';
  } else {
    drawChart(samples);
  }

  function drawChart(samples){
    const canvas = els('wpmChart');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const padding = 40;
    const w = canvas.width - padding*2;
    const h = canvas.height - padding*2;
    const maxWpm = Math.max(60, ...samples.map(s=>s.wpm));
    const maxErr = Math.max(1, ...samples.map(s=>s.errors));
    // axes
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding+h);
    ctx.lineTo(padding+w, padding+h);
    ctx.stroke();
    // grid horizontal
    ctx.font='12px Inter';
    ctx.fillStyle='rgba(255,255,255,0.35)';
    ctx.textBaseline='middle';
    const steps = 5;
    for(let i=0;i<=steps;i++){
      const y = padding + h - (h/steps)*i;
      ctx.strokeStyle='rgba(255,255,255,0.05)';
      ctx.beginPath();ctx.moveTo(padding,y);ctx.lineTo(padding+w,y);ctx.stroke();
      const label = Math.round((maxWpm/steps)*i);
      ctx.fillText(String(label), 8, y);
    }
    // map functions
    const xFor = i => padding + (w*(i/(samples.length-1||1)));
    const yForWpm = v => padding + h - (v/maxWpm)*h;
    const yForErr = v => padding + h - (v/maxErr)*h;
    // WPM line
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.forEach((s,i)=>{ const x=xFor(i), y=yForWpm(s.wpm); i? ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.stroke();
    // Avg line (dotted)
    const avg = samples.reduce((a,b)=>a+b.wpm,0)/samples.length;
    ctx.setLineDash([6,6]);
    ctx.strokeStyle='rgba(124,58,237,.5)';
    ctx.beginPath();
    ctx.moveTo(padding, yForWpm(avg));
    ctx.lineTo(padding+w, yForWpm(avg));
    ctx.stroke();
    ctx.setLineDash([]);
    // Errors line (secondary scale overlay)
    ctx.strokeStyle='#ef4444';
    ctx.lineWidth=1.5;
    ctx.beginPath();
    samples.forEach((s,i)=>{ const x=xFor(i), y=yForErr(s.errors); i? ctx.lineTo(x,y):ctx.moveTo(x,y); });
    ctx.stroke();
    // Points
    samples.forEach((s,i)=>{
      const x=xFor(i), y=yForWpm(s.wpm);
      ctx.fillStyle='#7c3aed';
      ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
      const ye = yForErr(s.errors);
      ctx.fillStyle='#ef4444';
      ctx.beginPath(); ctx.arc(x,ye,3,0,Math.PI*2); ctx.fill();
    });
  }

  // Actions
  document.getElementById('retryBtn')?.addEventListener('click', ()=>{ sessionStorage.setItem('prefillMode', data.testMode); location.href='index.html'; });
  document.getElementById('shareBtn')?.addEventListener('click', ()=>{
    const summary = `Typing Result: ${data.wpm} WPM (${data.accuracy}% acc) over ${data.duration}s - Consistency ${data.consistency}%`;
    if(navigator.share){ navigator.share({ text: summary, title:'My Typing Result', url: location.href }).catch(()=>{}); }
    else { navigator.clipboard.writeText(summary).then(()=>{ alert('Copied to clipboard'); }); }
  });
})();
