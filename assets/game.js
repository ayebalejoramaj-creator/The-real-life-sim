
const STORE_KEY = 'realityPlayer';

function getPlayer() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
  } catch {
    return null;
  }
}

function requirePlayer() {
  const player = getPlayer();
  if (!player) location.href = 'character.html';
  return player;
}

function money(amount) {
  return 'UGX ' + Number(amount || 0).toLocaleString('en-US');
}

function nav() {
  return `
    <header class="game-header">
      <a class="game-brand" href="home.html">
        <span class="brand-mark">R</span>
        <span>REALITY</span>
      </a>
      <div class="header-player">
        <span class="header-dot"></span>
        <span data-player-name>Player</span>
        <span>·</span>
        <span data-player-age>18</span> yrs
      </div>
    </header>

    <nav class="game-nav" aria-label="Main navigation">
      <a href="home.html"><span class="nav-icon">⌂</span><span>Life</span></a>
      <a href="school.html"><span class="nav-icon">▤</span><span>Activities</span></a>
      <a href="relationships.html"><span class="nav-icon">♧</span><span>People</span></a>
      <a href="news.html"><span class="nav-icon">◉</span><span>World</span></a>
      <a href="achievements.html"><span class="nav-icon">◇</span><span>Progress</span></a>
    </nav>
  `;
}

function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';

  document.querySelectorAll('.game-nav a').forEach(link => {
    if (link.getAttribute('href') === page) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });
}

function renderPlayerSummary() {
  const player = getPlayer();

  document.querySelectorAll('[data-player-name]').forEach(el => {
    el.textContent = player?.name || 'New player';
  });

  document.querySelectorAll('[data-player-age]').forEach(el => {
    el.textContent = String(player?.age || 18);
  });

  document.querySelectorAll('[data-player-location]').forEach(el => {
    el.textContent = player?.location || 'Not set';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('[data-game-nav]');

  if (container) container.innerHTML = nav();

  setActiveNav();
  renderPlayerSummary();
});
