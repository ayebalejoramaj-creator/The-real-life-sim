/* Reality school-social foundation. Lightweight local simulation now; designed for later AI-agent integration. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const read = (key, fallback) => { try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? fallback : v; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const player = read('realityPlayer', {}) || {};
  const school = read('realitySchoolState', {}) || {};
  const name = player.name || 'You';
  const initial = (name.trim()[0] || 'Y').toUpperCase();
  const age = Number(player.age ?? school.age ?? 6);
  const year = Number(school.year || 1);
  const dayKey = String(school.dayKey || school.currentDay || `${year}-${age}`);
  const schoolType = String(school.type || school.schoolType || 'school');
  const traits = Array.isArray(player.personality) ? player.personality : (Array.isArray(school.personality) ? school.personality : []);
  const stats = read('realitySchoolStats', { happiness:72, confidence:55, popularity:38, stress:24 });
  const agents = read('realitySchoolAgents', null) || [
    {id:'amara',name:'Amara',initial:'A',role:'Classmate',traits:['outgoing','kind'],goal:'make friends',memory:[],relationship:0},
    {id:'daniel',name:'Daniel',initial:'D',role:'Classmate',traits:['competitive','loyal'],goal:'win the school team try-outs',memory:[],relationship:0},
    {id:'joan',name:'Joan',initial:'J',role:'Classmate',traits:['creative','curious'],goal:'start a school arts club',memory:[],relationship:0},
    {id:'mika',name:'Mika',initial:'M',role:'Classmate',traits:['ambitious','quiet'],goal:'earn a scholarship',memory:[],relationship:0}
  ];
  const defaults = [
    {id:'p1',agent:'amara',text:'First week back and the library is already my second home 📚',time:'2h ago',likes:18,tag:'StudyGoals'},
    {id:'p2',agent:'daniel',text:'Anyone joining the debate club try-outs on Friday?',time:'3h ago',likes:12,tag:'SchoolLife'},
    {id:'p3',agent:'joan',text:'Training paid off. Made the school team! ⚽',time:'4h ago',likes:31,tag:'TalentShow'}
  ];
  let posts = read('realitySocialPosts', []);
  if (!Array.isArray(posts)) posts = [];
  let likes = read('realitySocialLikes', {});
  let state = read('realitySocialState', {lastSimulatedDay:null, gossip:[], eventLog:[]});
  if (!state || typeof state !== 'object') state = {lastSimulatedDay:null,gossip:[],eventLog:[]};
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const persistAgent = () => write('realitySchoolAgents', agents);
  const remember = (agent, memory) => { agent.memory = (agent.memory || []).concat([{day:dayKey,memory}]).slice(-12); };
  const pushPost = post => { posts.unshift(post); posts = posts.slice(0,40); write('realitySocialPosts', posts); };

  // NPCs take one lightweight autonomous action per in-game day. This is a foundation, not an external LLM yet.
  function simulateAgents() {
    if (state.lastSimulatedDay === dayKey) return;
    state.lastSimulatedDay = dayKey;
    const choices = [
      a => ({agent:a.id,text:`${a.goal.charAt(0).toUpperCase()+a.goal.slice(1)} is my focus this term. Let's see how it goes! ✨`,tag:'SchoolLife'}),
      a => ({agent:a.id,text:`Anyone interested in teaming up for something after class?`,tag:'BestFriends'}),
      a => ({agent:a.id,text:`Small steps count. Trying to get better at what I love. 💫`,tag:'StudyGoals'})
    ];
    // Rotate deterministically by day and agent so a refresh never rerolls the same day.
    const agent = agents[(year + age + dayKey.length) % agents.length];
    const action = choices[(year + age + agent.id.length) % choices.length](agent);
    if (!posts.some(p => p.agent === action.agent && p.day === dayKey)) {
      pushPost({...action,id:`npc-${dayKey}-${agent.id}`,time:'Today',likes:3 + ((age + year) % 17),day:dayKey});
      remember(agent, `Posted: ${action.text}`);
      state.eventLog = (state.eventLog || []).concat([{day:dayKey,type:'social_post',agent:agent.id}]).slice(-40);
    }
    // Gossip responds to school context and the agents' ambitions.
    if (!Array.isArray(state.gossip) || !state.gossip.some(g => g.day === dayKey)) {
      const rumours = [
        {text:'Teachers may nominate students for a scholarship programme this term… 👀',tag:'scholarship'},
        {text:'A new club could be opening its doors to students soon.',tag:'club'},
        {text:'Someone has been quietly preparing for a big school competition…',tag:'competition'}
      ];
      const rumour = rumours[(age + year + dayKey.length) % rumours.length];
      state.gossip = [{...rumour,day:dayKey}, ...(state.gossip || [])].slice(0,5);
    }
    write('realitySocialState', state);
    persistAgent();
  }
  function renderProfile() {
    $('myName').textContent = name;
    $('myHandle').textContent = '@' + name.toLowerCase().replace(/[^a-z0-9]+/g,'').slice(0,18);
    $('myAvatar').innerHTML = `<div><b>DP</b>Profile photo<small>Character portrait coming soon</small></div>`;
    $('composerAvatar').textContent = 'DP';
    $('schoolYear').textContent = `Year ${year} · Age ${age}`;
    $('gameDate').textContent = school.dateLabel || 'Your school story';
    const relationship = read('realityRelationship', null);
    if (relationship && relationship.name) {
      $('relationshipStatus').innerHTML = '<i class="status-dot"></i> In a Relationship ♥';
      $('partnerArea').innerHTML = `<div class="small-dp">DP</div><div><strong>${escapeHtml(relationship.name)}</strong><small>${escapeHtml(relationship.duration || 'Together')}</small></div>`;
    }
    for (const key of ['happiness','confidence','popularity','stress']) {
      const el = $(key+'Meter'); if (el) el.style.width = `${Math.max(0,Math.min(100,Number(stats[key] ?? 0)))}%`;
    }
  }
  function renderFeed() {
    const combined = [...defaults, ...posts].sort((a,b) => (b.day ? 1 : 0) - (a.day ? 1 : 0));
    $('feed').innerHTML = combined.slice(0,12).map((p,i) => {
      const agent = agents.find(a => a.id === p.agent);
      const author = p.agent === 'player' ? name : (agent?.name || 'Student');
      const dp = p.agent === 'player' ? 'DP' : (agent?.initial || author[0]);
      const liked = !!likes[p.id];
      return `<article class="feed-post" data-post="${escapeHtml(p.id || 'default-'+i)}"><div class="post-head"><div class="post-dp">${escapeHtml(dp)}</div><div><strong>${escapeHtml(author)}</strong><small>${escapeHtml(p.time || 'Today')} · ${escapeHtml(p.tag || 'School')}</small></div></div><div class="post-copy">${escapeHtml(p.text)}</div><div class="post-actions"><button class="like ${liked?'liked':''}" type="button">${liked?'♥':'♡'} ${Number(p.likes||0)+(liked?1:0)}</button><span>◯ ${Number(p.comments||0)} comments</span><span>↗ Share</span></div></article>`;
    }).join('');
    $('feed').querySelectorAll('.like').forEach(button => button.addEventListener('click', () => {
      const id = button.closest('[data-post]').dataset.post;
      likes[id] = !likes[id]; write('realitySocialLikes', likes); renderFeed();
    }));
  }
  function renderGossip() {
    const items = (state.gossip || []).slice(0,3);
    if (items.length) $('gossipFeed').innerHTML = items.map(g => `<div class="gossip-item">${escapeHtml(g.text)}<small>School whisper · ${escapeHtml(g.day)}</small></div>`).join('');
  }
  function renderConnections() { /* Connections and relationships are shared with the People page when that system is integrated. */ }
  $('postForm').addEventListener('submit', event => {
    event.preventDefault(); const input = $('postInput'); const text = input.value.trim(); if (!text) return;
    pushPost({id:`player-${Date.now()}`,agent:'player',text,time:'Just now',likes:0,tag:'Your post',day:dayKey});
    input.value = ''; renderFeed();
    state.eventLog = (state.eventLog || []).concat([{day:dayKey,type:'player_post',text}]).slice(-40);
    write('realitySocialState', state);
    // NPCs remember the player's social action; future relationship/event systems can react to it.
    agents.forEach(a => { if (a.traits.includes('outgoing') || a.traits.includes('curious')) remember(a, `${name} posted: ${text}`); });
    persistAgent();
    if (window.RealityAgents) window.RealityAgents.recordPlayerPost(text, name);
  });
  simulateAgents(); renderProfile(); renderFeed(); renderGossip(); renderConnections();
})();
