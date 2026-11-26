const STORE_KEY='realityPlayer';
function getPlayer(){try{return JSON.parse(localStorage.getItem(STORE_KEY)||'null')}catch(e){return null}}
function requirePlayer(){const p=getPlayer();if(!p){location.href='character.html';return null}return p}
function money(n){return 'UGX '+Number(n||0).toLocaleString('en-US')}
function setActiveNav(){const here=location.pathname.split('/').pop()||'index.html';document.querySelectorAll('.nav a').forEach(a=>{if(a.getAttribute('href')===here)a.classList.add('active')})}
function renderPlayerSummary(){const p=getPlayer();document.querySelectorAll('[data-player-name]').forEach(x=>x.textContent=p?.name||'New player');document.querySelectorAll('[data-player-location]').forEach(x=>x.textContent=p?.location||'Not set');}
function nav(){return `<header class="top"><div class="brand">REALITY / WORLD SIMULATOR</div><nav class="nav"><a href="home.html">Home</a><a href="school.html">School & Jobs</a><a href="relationships.html">Relationships</a><a href="news.html">News</a><a href="achievements.html">Achievements</a><a href="character.html">Character</a></nav></header>`}
document.addEventListener('DOMContentLoaded',()=>{const n=document.querySelector('[data-game-nav]');if(n)n.innerHTML=nav();setActiveNav();renderPlayerSummary()});