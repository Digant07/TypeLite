// Profile page interactivity: chart, edit buttons, filters
// Requires Chart.js for graph (add via CDN or local)
document.addEventListener('DOMContentLoaded', function(){
  // Edit username/avatar (placeholder)
  document.querySelector('.edit-username-btn')?.addEventListener('click', function(){
    alert('Edit username coming soon!');
  });
  document.querySelector('.edit-avatar-btn')?.addEventListener('click', function(){
    alert('Edit avatar coming soon!');
  });
  // History filter
  document.getElementById('history-range')?.addEventListener('change', function(){
    // TODO: fetch and filter history by range
    // For now, just reload dummy data
    loadHistory(this.value);
  });
  // Chart.js demo
  if(window.Chart){
    const ctx = document.getElementById('progressChart').getContext('2d');
    window.progressChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [
          { label: 'WPM', data: [72,75,78,80,85,90,88], borderColor:'#7fd1b9', backgroundColor:'rgba(127,209,185,0.1)', fill:true },
          { label: 'Accuracy', data: [97,98,99,98,99,99,98], borderColor:'#3e8e7e', backgroundColor:'rgba(62,142,126,0.1)', fill:true }
        ]
      },
      options: {
        responsive:true,
        plugins:{ legend:{labels:{color:'#e0e3e8'}} },
        scales:{ x:{ticks:{color:'#b0b3bb'}}, y:{ticks:{color:'#b0b3bb'}} }
      }
    });
  }
  // Dummy history loader
  function loadHistory(range){
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';
    // Replace with AJAX fetch for real data
    const dummy = [
      {date:'2025-09-25',wpm:85,acc:98,type:'60s'},
      {date:'2025-09-24',wpm:80,acc:97,type:'30s'},
      {date:'2025-09-23',wpm:78,acc:99,type:'25 words'},
      {date:'2025-09-22',wpm:90,acc:99,type:'120s'}
    ];
    dummy.forEach(row=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${row.date}</td><td>${row.wpm}</td><td>${row.acc}%</td><td>${row.type}</td>`;
      tbody.appendChild(tr);
    });
  }
  loadHistory('all');
});
