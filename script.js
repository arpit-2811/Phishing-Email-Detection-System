/* Shared script for PhishGuard static site */
/* Theme toggle and nav active highlight */
(function(){
  // theme toggle button(s)
  function initTheme(){
    const saved = localStorage.getItem('pg_theme');
    if(saved === 'dark') document.documentElement.classList.add('dark');
    document.querySelectorAll('#theme-toggle').forEach(btn=>{
      btn.textContent = document.documentElement.classList.contains('dark') ? '☀️' : '🌙';
      btn.addEventListener('click', ()=>{
        document.documentElement.classList.toggle('dark');
        const now = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('pg_theme', now);
        document.querySelectorAll('#theme-toggle').forEach(b=> b.textContent = now === 'dark' ? '☀️' : '🌙');
      });
    });
  }

  // mark nav active based on path
  function markNav(){
    const links = document.querySelectorAll('.navlink');
    links.forEach(a=>{
      a.classList.remove('text-indigo-600','font-semibold');
      const href = a.getAttribute('href');
      if(href && href === location.pathname.split('/').pop() || (href==='index.html' && (location.pathname.split('/').pop()===''||location.pathname.split('/').pop()==='index.html'))){
        a.classList.add('text-indigo-600','font-semibold');
      }
    });
  }

  // simple heuristic analyzer used on Analyze page
  function heuristicScore(txt){
    if(!txt) return 0.05;
    const lowered = txt.toLowerCase();
    let score = 0.05;
    const keywords = ['verify','urgent','login','password','account','click','update','bank','reset','credentials','ssn','social'];
    keywords.forEach(k => { if(lowered.includes(k)) score += 0.12; });
    const links = lowered.match(/https?:\/\/[^\s]+/g) || [];
    score += Math.min(links.length * 0.15, 0.45);
    if(lowered.match(/\d/)) score += 0.05;
    return Math.min(0.99, score);
  }

  // Analyze page bindings
  function initAnalyze(){
    const emailText = document.getElementById('emailText');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultPanel = document.getElementById('resultPanel');
    const recentList = document.getElementById('recentList');

    const tabPaste = document.getElementById('tabPaste');
    const tabUpload = document.getElementById('tabUpload');
    const tabUrl = document.getElementById('tabUrl');
    const panelPaste = document.getElementById('panelPaste');
    const panelUpload = document.getElementById('panelUpload');
    const panelUrl = document.getElementById('panelUrl');

    function showPanel(which){
      panelPaste.classList.add('hidden'); panelUpload.classList.add('hidden'); panelUrl.classList.add('hidden');
      tabPaste.classList.remove('bg-indigo-50','text-indigo-700'); tabUpload.classList.remove('bg-indigo-50','text-indigo-700'); tabUrl.classList.remove('bg-indigo-50','text-indigo-700');
      if(which==='paste'){ panelPaste.classList.remove('hidden'); tabPaste.classList.add('bg-indigo-50','text-indigo-700'); }
      if(which==='upload'){ panelUpload.classList.remove('hidden'); tabUpload.classList.add('bg-indigo-50','text-indigo-700'); }
      if(which==='url'){ panelUrl.classList.remove('hidden'); tabUrl.classList.add('bg-indigo-50','text-indigo-700'); }
    }
    showPanel('paste');

    if(tabPaste) tabPaste.addEventListener('click', ()=> showPanel('paste'));
    if(tabUpload) tabUpload.addEventListener('click', ()=> showPanel('upload'));
    if(tabUrl) tabUrl.addEventListener('click', ()=> showPanel('url'));

    if(analyzeBtn){
      analyzeBtn.addEventListener('click', ()=>{
        const txt = emailText.value || '';
        if(!txt.trim()){ alert('Please paste email content to analyze'); return; }
        const s = heuristicScore(txt);
        const pct = Math.round(s*100);
        document.getElementById('resultScore').innerText = pct + '%';
        document.getElementById('resultHeadline').innerText = s>0.75? 'High-risk Email' : (s>0.4? 'Suspicious Email' : 'Low Risk');
        document.getElementById('resultLabel').innerText = s>0.75? 'Scam Alert' : (s>0.4? 'Suspicious' : 'Looks Safe');
        document.getElementById('rb1').innerText = s>0.6? 'High' : (s>0.35? 'Moderate' : 'Low');
        document.getElementById('rb2').innerText = txt.toLowerCase().includes('urgent')? 'High' : (txt.toLowerCase().includes('soon')? 'Moderate' : 'Low');
        document.getElementById('rb3').innerText = (txt.match(/https?:\/\/[^\s]+/g)||[]).length>1? 'High' : ((txt.match(/https?:\/\/[^\s]+/g)||[]).length===1? 'Moderate':'Low');
        document.getElementById('rb4').innerText = txt.includes('@')? 'Low' : 'Unknown';
        if(resultPanel) resultPanel.classList.remove('hidden');

        // save scan
        const arr = JSON.parse(localStorage.getItem('pg_scans')||'[]');
        arr.unshift({date:new Date().toISOString(), subject: (txt.split('\n')[0]||'(no subject)').slice(0,80), score: pct, raw: txt});
        localStorage.setItem('pg_scans', JSON.stringify(arr.slice(0,200)));
        renderRecent();
      });
    }
    if(clearBtn) clearBtn.addEventListener('click', ()=> { if(emailText) emailText.value=''; if(resultPanel) resultPanel.classList.add('hidden'); });

    function renderRecent(){
      const arr = JSON.parse(localStorage.getItem('pg_scans')||'[]');
      if(!recentList) return;
      recentList.innerHTML = '';
      arr.slice(0,5).forEach(s=>{
        const li = document.createElement('li');
        li.innerHTML = `<div class="text-sm">${s.subject} <span class="font-semibold ml-2">${s.score}%</span></div>`;
        recentList.appendChild(li);
      });
    }
    renderRecent();

    // Ask AI small demo
    const askBtn = document.getElementById('askBtn');
    const aiQuestion = document.getElementById('aiQuestion');
    const aiChat = document.getElementById('aiChat');
    if(askBtn){
      askBtn.addEventListener('click', ()=>{
        const q = aiQuestion.value.trim();
        if(!q) return alert('Type a question');
        const lower = q.toLowerCase();
        let resp = 'I do not know. Please rephrase.';
        if(lower.includes('link')||lower.includes('url')) resp = 'The link appears suspicious. Hover to see destination; do not enter credentials.';
        else if(lower.includes('bank')||lower.includes('verify')) resp = 'This email uses urgent language and fake login buttons—likely phishing.';
        else resp = 'Score indicates risk. If unexpected, contact the organization by official channels.';
        aiChat.innerHTML = `<div class="text-sm text-slate-600"><strong>PhishGuardAI:</strong> ${resp}</div>`;
        aiQuestion.value = '';
      });
    }
  }

  // Feed page: render posts & create
  function initFeed(){
    const grid = document.getElementById('feedGrid');
    const sample = JSON.parse(localStorage.getItem('pg_feed') || 'null') || [
      {id:1, title:'Scam Alert — Fake Bank Login', score:92, excerpt:'Email asks to verify account and has suspicious link.'},
      {id:2, title:'Crypto Phish', score:85, excerpt:'Fake exchange asking for private key.'}
    ];
    localStorage.setItem('pg_feed', JSON.stringify(sample));
    function render(){
      const posts = JSON.parse(localStorage.getItem('pg_feed')||'[]');
      if(!grid) return;
      grid.innerHTML = '';
      posts.forEach(p=>{
        const card = document.createElement('div');
        card.className = 'p-4 bg-white dark:bg-slate-800 rounded-2xl shadow border';
        card.innerHTML = `<div class="flex items-start justify-between"><div><div class="font-semibold">${p.title}</div><div class="text-xs text-slate-500 dark:text-slate-300 mt-1">${p.excerpt}</div></div><div class="font-bold ${p.score>60?'text-red-500':(p.score>30?'text-amber-500':'text-green-500')}">${p.score}%</div></div>
        <div class="mt-3"><button class="px-3 py-2 rounded-lg border" onclick="alert('Open report demo')">View Report</button> <button class="ml-2 px-3 py-2 rounded-lg bg-indigo-600 text-white" onclick="alert('Share demo')">Share</button></div>`;
        grid.appendChild(card);
      });
    }
    render();
  }

  // Reports page render
  function initReports(){
    const tb = document.querySelector('#reportsTable');
    const arr = JSON.parse(localStorage.getItem('pg_scans')||'[]');
    if(!tb) return;
    tb.innerHTML = '';
    arr.forEach((r,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="py-2">${new Date(r.date).toLocaleString()}</td><td class="py-2">${r.subject}</td><td class="py-2">${r.score}%</td>`;
      tb.appendChild(tr);
    });
  }

  // Login/Signup demo binding
  function initAuth(){
    // simple: clicking Continue (login) writes pg_user
    const loginBtn = document.querySelector('.auth .btn');
    if(loginBtn){
      loginBtn.addEventListener('click', ()=>{
        localStorage.setItem('pg_user', 'DemoUser');
        alert('Logged in (demo).');
        location.href = 'index.html';
      });
    }
    const googleBtns = document.querySelectorAll('.google-btn');
    googleBtns.forEach(b=> b.addEventListener('click', ()=> alert('Demo: Continue with Google')));
  }

  // public create feed post prompt
  window.createFeedPost = function(){
    const txt = prompt('Share a phishing example summary (demo):');
    if(!txt) return;
    const posts = JSON.parse(localStorage.getItem('pg_feed')||'[]');
    posts.unshift({id:Date.now(), title:txt.split('\n')[0].slice(0,60), score:Math.floor(Math.random()*50)+30, excerpt:txt.slice(0,120)});
    localStorage.setItem('pg_feed', JSON.stringify(posts));
    if(document.getElementById('feedGrid')) initFeed();
    alert('Post added to feed (demo).');
  };

  // init when DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    initTheme();
    markNav();
    if(document.getElementById('emailText')) initAnalyze();
    if(document.getElementById('feedGrid')) initFeed();
    if(document.getElementById('reportsTable')) initReports();
    if(document.querySelector('.auth')) initAuth();
  });

})();
