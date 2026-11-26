/* Reality Agent Engine v1
   Local school-character simulation. No external AI calls or API keys required.
   The data model is designed for a later conversational AI layer. */
(() => {
  'use strict';
  const KEY = {
    agents: 'realitySchoolAgents',
    posts: 'realitySocialPosts',
    state: 'realitySocialState',
    player: 'realityPlayer',
    school: 'realitySchoolState'
  };
  const read = (key, fallback) => {
    try { const value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const player = read(KEY.player, {}) || {};
  const school = read(KEY.school, {}) || {};
  const age = Number(player.age ?? school.age ?? 6);
  const year = Number(school.year || 1);
  const day = String(school.dayKey || school.currentDay || school.dateLabel || `year-${year}-age-${age}`);

  const seed = [
    {id:'amara',name:'Amara',initial:'A',role:'Classmate',traits:['outgoing','kind','curious'],values:['friendship','creativity'],goal:'make new friends',fear:'being left out',interest:'art and music',energy:72,mood:'hopeful',relationships:{},memory:[]},
    {id:'daniel',name:'Daniel',initial:'D',role:'Classmate',traits:['competitive','loyal','confident'],values:['achievement','teamwork'],goal:'earn a place on the school team',fear:'letting his team down',interest:'football and science',energy:80,mood:'determined',relationships:{},memory:[]},
    {id:'joan',name:'Joan',initial:'J',role:'Classmate',traits:['creative','curious','independent'],values:['expression','freedom'],goal:'start a creative club',fear:'not being taken seriously',interest:'drawing and drama',energy:68,mood:'inspired',relationships:{},memory:[]},
    {id:'mika',name:'Mika',initial:'M',role:'Classmate',traits:['ambitious','thoughtful','shy'],values:['learning','security'],goal:'win a scholarship',fear:'disappointing family',interest:'reading and mathematics',energy:61,mood:'focused',relationships:{},memory:[]}
  ];
  let agents = read(KEY.agents, null);
  if (!Array.isArray(agents) || !agents.length) agents = seed;
  agents = agents.map((agent, index) => ({
    ...seed[index % seed.length], ...agent,
    relationships: agent.relationships || {},
    memory: Array.isArray(agent.memory) ? agent.memory : []
  }));
  let posts = read(KEY.posts, []);
  if (!Array.isArray(posts)) posts = [];
  let state = read(KEY.state, {}) || {};
  state.agentDayLog = Array.isArray(state.agentDayLog) ? state.agentDayLog : [];
  state.gossip = Array.isArray(state.gossip) ? state.gossip : [];

  const remember = (agent, type, detail, target = null) => {
    agent.memory.push({day, type, detail, target, createdAt:Date.now()});
    agent.memory = agent.memory.slice(-30);
  };
  const addPost = (agent, text, tag) => {
    const id = `agent-${day}-${agent.id}`;
    if (posts.some(post => post.id === id)) return;
    posts.unshift({id, agent:agent.id, text, tag, time:'Today', likes:Math.floor(2 + agent.energy / 8), comments:0, day});
    posts = posts.slice(0, 60);
    remember(agent, 'public_action', text);
  };
  const addGossip = (text, source) => {
    if (state.gossip.some(item => item.day === day && item.source === source)) return;
    state.gossip.unshift({day, text, source});
    state.gossip = state.gossip.slice(0, 12);
  };
  function chooseAction(agent) {
    if (agent.goal.includes('team')) return {text:'Training after class again. I really want that team place. ⚽',tag:'SchoolLife'};
    if (agent.goal.includes('club')) return {text:'I might finally start that creative club. Who would join?',tag:'TalentShow'};
    if (agent.goal.includes('scholarship')) return {text:'Keeping my head down and working towards my goals. 📚',tag:'StudyGoals'};
    return {text:'Trying to make this term a good one. Anyone want to hang out at lunch?',tag:'BestFriends'};
  }
  function simulateDay() {
    if (state.lastAgentSimulationDay === day) return;
    state.lastAgentSimulationDay = day;
    // A character is selected by the in-game day, not by page refresh.
    const actorIndex = Math.abs(year * 7 + age * 3 + day.length) % agents.length;
    const actor = agents[actorIndex];
    const action = chooseAction(actor);
    addPost(actor, action.text, action.tag);
    actor.energy = Math.max(15, Number(actor.energy || 60) - 3);
    actor.mood = actor.traits.includes('ambitious') ? 'focused' : actor.traits.includes('outgoing') ? 'social' : 'thoughtful';

    if (actor.goal.includes('scholarship')) addGossip('Someone has been asking teachers about scholarship applications… 👀', actor.id);
    else if (actor.goal.includes('club')) addGossip('There may be a new student club starting soon. Who is organising it?', actor.id);
    else if (actor.goal.includes('team')) addGossip('School team try-outs are getting competitive this term. ⚽', actor.id);
    else addGossip('A few students are planning something for after class…', actor.id);

    state.agentDayLog.push({day, actor:actor.id, action:action.tag});
    state.agentDayLog = state.agentDayLog.slice(-60);
    write(KEY.agents, agents);
    write(KEY.posts, posts);
    write(KEY.state, state);
  }
  function recordPlayerPost(text, playerName) {
    agents.forEach(agent => {
      if (agent.traits.includes('curious') || agent.traits.includes('outgoing')) {
        remember(agent, 'noticed_player_post', `${playerName || 'The player'} posted: ${text}`, 'player');
      }
    });
    write(KEY.agents, agents);
  }
  function interact(agentId, kind, detail = '') {
    const agent = agents.find(item => item.id === agentId);
    if (!agent) return null;
    const change = kind === 'kind' ? 8 : kind === 'shared_interest' ? 6 : kind === 'conflict' ? -10 : 2;
    agent.relationships.player = Math.max(-100, Math.min(100, Number(agent.relationships.player || 0) + change));
    remember(agent, kind, detail || kind, 'player');
    write(KEY.agents, agents);
    return {score:agent.relationships.player, mood:agent.mood};
  }
  window.RealityAgents = {
    version:1,
    getAgents:() => JSON.parse(JSON.stringify(agents)),
    getAgent:id => JSON.parse(JSON.stringify(agents.find(agent => agent.id === id) || null)),
    getMemory:id => JSON.parse(JSON.stringify(agents.find(agent => agent.id === id)?.memory || [])),
    recordPlayerPost,
    interact,
    simulateDay
  };
  simulateDay();
})();