const app = document.getElementById('app');

/* ============ ONBOARDING ============ */
let ob = {name:'',avatar:'🙂',teach:[],learn:[],level:'Beginner'};
function renderOnboarding(){
  app.innerHTML = `
  <div class="onboard-wrap">
    <div class="onboard-hero">
      <div class="blob teal"></div><div class="blob amber"></div>
      <div class="hero-mark"><span class="logomark">${ICONS.logomark}</span>SkillSphere</div>
      <div class="hero-copy">
        <h1>Trade what you know<br>for what you want<br>to learn.</h1>
        <div class="sub">No course fees, no gatekeeping — just people teaching each other. AI matches you with the right partner in seconds.</div>
        <div class="sample-ticket">
          <div class="ticket" style="max-width:300px;">
            <div class="stub"><div class="score mono">98%</div><div class="score-l">match</div></div>
            <div class="body">
              <div class="name" style="font-size:15px;">🐍 Alice ↔ Bob</div>
              <div class="exchange-line" style="margin-top:8px;">
                <div class="exchange-col teach"><div class="tag">Teaches</div><div class="val">Python</div></div>
                <div class="exchange-col learn"><div class="tag">Learns</div><div class="val">Photoshop</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div></div>
    </div>
    <div class="onboard-form-side">
      <div class="onboard">
        <div class="eyebrow">Get started</div>
        <h2>Create your profile</h2>

        <div class="field"><label>Your name</label><input id="ob-name" placeholder="e.g. Alice Sharma" value="${ob.name}"></div>
        <div class="field"><label>Pick an avatar</label>
          <select id="ob-avatar">${['🙂','🎨','🐍','📱','🎸','🗣️','📈','📸','💪','🈶'].map(e=>`<option ${ob.avatar===e?'selected':''}>${e}</option>`).join('')}</select>
        </div>
        <div class="field"><label>Skills I can teach</label>
          <div class="chip-input" id="teach-wrap">
            ${ob.teach.map((s,i)=>`<span class="chip teach">${s}<button onclick="obRemove('teach',${i})">×</button></span>`).join('')}
            <input id="ob-teach-input" placeholder="Type a skill, press Enter">
          </div>
        </div>
        <div class="field"><label>Skills I want to learn</label>
          <div class="chip-input" id="learn-wrap">
            ${ob.learn.map((s,i)=>`<span class="chip learn">${s}<button onclick="obRemove('learn',${i})">×</button></span>`).join('')}
            <input id="ob-learn-input" placeholder="Type a skill, press Enter">
          </div>
        </div>
        <div class="field"><label>Experience level</label>
          <div class="level-picker">${['Beginner','Intermediate','Advanced'].map(l=>`<button class="${ob.level===l?'active':''}" onclick="obSetLevel('${l}')">${l}</button>`).join('')}</div>
        </div>
        <button class="btn block" onclick="finishOnboarding()">Create profile</button>
      </div>
    </div>
  </div>`;
  document.getElementById('ob-name').oninput = e=>ob.name=e.target.value;
  document.getElementById('ob-avatar').onchange = e=>ob.avatar=e.target.value;
  document.getElementById('ob-teach-input').onkeydown = e=>{ if(e.key==='Enter' && e.target.value.trim()){ ob.teach.push(e.target.value.trim()); e.target.value=''; renderOnboarding(); } };
  document.getElementById('ob-learn-input').onkeydown = e=>{ if(e.key==='Enter' && e.target.value.trim()){ ob.learn.push(e.target.value.trim()); e.target.value=''; renderOnboarding(); } };
}
function obRemove(type,i){ ob[type].splice(i,1); renderOnboarding(); }
function obSetLevel(l){ ob.level=l; renderOnboarding(); }
function finishOnboarding(){
  if(!ob.name.trim() || ob.teach.length===0 || ob.learn.length===0){ alert('Please add your name, at least one skill to teach, and one to learn.'); return; }
  state.profile = {...ob};
  persist('profile');
  seedIfEmpty();
  renderApp();
}

/* ============ APP SHELL ============ */
const NAV = [
  ['home','home','Home'],['matches','matches','Matches'],['marketplace','marketplace','Marketplace'],
  ['requests','requests','Requests'],['sessions','sessions','Sessions'],['chat','chat','Chat'],
  ['progress','progress','Progress'],['community','community','Community'],['ai','ai','AI Assistant'],
];
function renderApp(){
  app.innerHTML = `
    <div class="sidebar">
      <div class="brand"><span class="logomark">${ICONS.logomark}</span>SkillSphere</div>
      ${NAV.map(([id,icon,label])=>`<button class="navitem ${state.view===id?'active':''}" onclick="setView('${id}')"><span class="icn">${ICONS[icon]}</span>${label}</button>`).join('')}
    </div>
    <main id="main"></main>
  `;
  renderView();
}
function setView(v){ state.view=v; renderView(); }
function renderView(){
  const main = document.getElementById('main');
  const titles = {home:'Home',matches:'AI Matches',marketplace:'Skill Marketplace',requests:'Requests',sessions:'Sessions',chat:'Chat',progress:'Your Progress',community:'Community Groups',ai:'AI Learning Assistant'};
  main.innerHTML = `<div class="topbar"><h2>${titles[state.view]}</h2><div class="avatar">${state.profile.avatar}</div></div><div id="viewbody"></div>`;
  const body = document.getElementById('viewbody');
  const renderers = {home:renderHome,matches:renderMatches,marketplace:renderMarketplace,requests:renderRequests,sessions:renderSessions,chat:renderChat,progress:renderProgress,community:renderCommunity,ai:renderAI};
  renderers[state.view](body);
  requestAnimationFrame(()=>{ document.querySelectorAll('.barfill[data-w]').forEach(el=>{ el.style.width = el.dataset.w+'%'; }); });
}

/* ---------- HOME ---------- */
function renderHome(el){
  const top = rankedMatches()[0];
  const upcoming = state.sessions.filter(s=>s.status==='upcoming').sort((a,b)=>a.date.localeCompare(b.date))[0];
  el.innerHTML = `
    <div class="stats-row">
      <div class="stat"><div class="n">${totalHours(state.sessions)}</div><div class="l">Hours Learned</div></div>
      <div class="stat"><div class="n">${state.sessions.filter(s=>s.status==='completed').length}</div><div class="l">Sessions Completed</div></div>
      <div class="stat"><div class="n">${uniqueLearnSkills(state).size}</div><div class="l">Skills Mastered</div></div>
      <div class="stat"><div class="n">${state.connections.length}</div><div class="l">Connections</div></div>
    </div>
    <h3 style="margin-bottom:12px;">Top match for you</h3>
    ${top ? ticketHTML(top) : ''}
    <h3 style="margin:24px 0 12px;">Upcoming session</h3>
    ${upcoming ? `<div class="card"><b>${MOCK_USERS.find(u=>u.id===upcoming.partnerId)?.name}</b> — ${upcoming.date} at ${upcoming.time} <span class="pill on">${upcoming.duration}h</span></div>` : `<div class="empty"><div class="icn">${ICONS.sessions}</div>No upcoming sessions. Book one from Requests once accepted.</div>`}
  `;
}

/* ---------- TICKET (signature component) ---------- */
function ticketHTML(u){
  const teachForMe = u.teach.filter(s=>state.profile.learn.includes(s));
  const learnForMe = u.learn.filter(s=>state.profile.teach.includes(s));
  const alreadyReq = state.requests.outgoing.some(r=>r.userId===u.id);
  const connected = state.connections.includes(u.id);
  return `
  <div class="ticket">
    <div class="stub"><div class="score mono">${u.score}%</div><div class="score-l">match</div></div>
    <div class="body">
      <div class="row1">
        <div><div class="name">${u.avatar} ${u.name}</div><div class="meta">${u.level} · ★ ${u.rating} · ${u.category}</div></div>
      </div>
      <div class="exchange-line">
        <div class="exchange-col teach"><div class="tag">They teach you</div><div class="val">${teachForMe.join(', ')||u.teach.join(', ')}</div></div>
        <div class="exchange-col learn"><div class="tag">You teach them</div><div class="val">${learnForMe.join(', ')||'—'}</div></div>
      </div>
      <div class="actions">
        ${connected ? `<button class="btn small secondary" onclick="setView('chat');openChat('${u.id}')">Open chat</button>`
        : alreadyReq ? `<button class="btn small secondary" disabled>Request sent</button>`
        : `<button class="btn small" onclick="sendRequest('${u.id}')">Send request</button>`}
      </div>
    </div>
  </div>`;
}

/* ---------- MATCHES ---------- */
function renderMatches(el){ el.innerHTML = rankedMatches().map(u=>ticketHTML(u)).join(''); }

/* ---------- MARKETPLACE ---------- */
let mpCategory='All';
function renderMarketplace(el){
  const list = MOCK_USERS.filter(u=>mpCategory==='All'||u.category===mpCategory).map(u=>({...u,score:matchScore(state.profile,u)}));
  el.innerHTML = `
    <div class="category-row">${CATEGORIES.map(c=>`<button class="cat-btn ${mpCategory===c?'active':''}" onclick="setMpCat('${c}')">${c}</button>`).join('')}</div>
    ${list.map(u=>ticketHTML(u)).join('') || `<div class="empty">No profiles in this category yet.</div>`}
  `;
}
function setMpCat(c){ mpCategory=c; renderView(); }

/* ---------- REQUESTS ---------- */
function sendRequest(userId){
  const u = MOCK_USERS.find(x=>x.id===userId);
  state.requests.outgoing.push({id:'o'+Date.now(),userId,message:`Hi, I can teach ${state.profile.teach[0]}. Can you teach me ${u.teach[0]}?`,status:'pending'});
  persist('requests'); renderView();
}
let reqTab='incoming';
function renderRequests(el){
  el.innerHTML = `
    <div class="tabbar">
      <button class="${reqTab==='incoming'?'active':''}" onclick="setReqTab('incoming')">Incoming (${state.requests.incoming.length})</button>
      <button class="${reqTab==='outgoing'?'active':''}" onclick="setReqTab('outgoing')">Outgoing (${state.requests.outgoing.length})</button>
    </div>
    <div id="req-list"></div>`;
  const list = document.getElementById('req-list');
  if(reqTab==='incoming'){
    list.innerHTML = state.requests.incoming.map(r=>{
      const u = MOCK_USERS.find(x=>x.id===r.userId);
      return `<div class="card">
        <div class="name" style="font-family:'Fraunces',serif;font-size:16px;">${u?.avatar} ${u?.name}</div>
        <div class="meta" style="color:var(--muted);font-size:13px;margin:7px 0 12px;">${r.message}</div>
        ${r.status==='pending' ? `<div class="actions" style="display:flex;gap:8px;">
          <button class="btn small" onclick="respondRequest('${r.id}','accept')">Accept</button>
          <button class="btn small secondary" onclick="respondRequest('${r.id}','reschedule')">Reschedule</button>
          <button class="btn small coral" onclick="respondRequest('${r.id}','reject')">Reject</button>
        </div>` : `<span class="pill ${r.status==='rejected'?'warn':'on'}">${r.status}</span>`}
      </div>`;
    }).join('') || `<div class="empty"><div class="icn">${ICONS.inbox}</div>No incoming requests right now.</div>`;
  } else {
    list.innerHTML = state.requests.outgoing.map(r=>{
      const u = MOCK_USERS.find(x=>x.id===r.userId);
      return `<div class="card"><div class="name" style="font-family:'Fraunces',serif;font-size:16px;">${u?.avatar} ${u?.name}</div>
      <div class="meta" style="color:var(--muted);font-size:13px;margin:7px 0;">${r.message}</div>
      <span class="pill ${r.status==='accepted'?'on':''}">${r.status}</span></div>`;
    }).join('') || `<div class="empty">You haven't sent any requests yet — check AI Matches.</div>`;
  }
}
function setReqTab(t){ reqTab=t; renderView(); }
function respondRequest(id,action){
  const r = state.requests.incoming.find(x=>x.id===id);
  if(!r) return;
  if(action==='accept'){ r.status='accepted'; if(!state.connections.includes(r.userId)){ state.connections.push(r.userId); persist('connections'); } }
  else if(action==='reject'){ r.status='rejected'; }
  else { r.status='reschedule requested'; }
  persist('requests'); renderView();
}

/* ---------- SESSIONS ---------- */
function renderSessions(el){
  const partners = state.connections.map(id=>MOCK_USERS.find(u=>u.id===id)).filter(Boolean);
  el.innerHTML = `
    <div class="card">
      <h3 style="margin-top:0;">Book a session</h3>
      ${partners.length===0 ? `<div class="empty">Accept a request first to unlock booking.</div>` : `
      <div class="field"><label>Partner</label><select id="s-partner">${partners.map(p=>`<option value="${p.id}">${p.avatar} ${p.name}</option>`).join('')}</select></div>
      <div style="display:flex;gap:12px;">
        <div class="field" style="flex:1;"><label>Date</label><input type="date" id="s-date"></div>
        <div class="field" style="flex:1;"><label>Time</label><input type="time" id="s-time"></div>
        <div class="field" style="width:110px;"><label>Hours</label><input type="number" min="1" max="4" value="1" id="s-duration"></div>
      </div>
      <button class="btn" onclick="bookSession()">Schedule session</button>`}
    </div>
    <h3>Upcoming</h3>${sessionListHTML('upcoming')}
    <h3>Completed</h3>${sessionListHTML('completed')}
  `;
}
function sessionListHTML(status){
  const list = state.sessions.filter(s=>s.status===status);
  if(list.length===0) return `<div class="empty">Nothing here yet.</div>`;
  return list.map(s=>{
    const u = MOCK_USERS.find(x=>x.id===s.partnerId);
    return `<div class="card"><b>${u?.avatar} ${u?.name}</b> — ${s.date} at ${s.time} <span class="pill on">${s.duration}h</span>
      ${status==='upcoming' ? `<div style="margin-top:11px;"><button class="btn small" onclick="completeSession('${s.id}')">Mark completed</button></div>` : ''}
      ${s.summary ? `<div class="ai-output">${s.summary}</div>` : ''}
    </div>`;
  }).join('');
}
function bookSession(){
  const partnerId = document.getElementById('s-partner').value;
  const date = document.getElementById('s-date').value;
  const time = document.getElementById('s-time').value;
  const duration = document.getElementById('s-duration').value;
  if(!date||!time){ alert('Pick a date and time.'); return; }
  state.sessions.push({id:'sess'+Date.now(),partnerId,date,time,duration,status:'upcoming',summary:null});
  persist('sessions'); renderView();
}
async function completeSession(id){
  const s = state.sessions.find(x=>x.id===id);
  s.status='completed'; persist('sessions'); renderView();
  const u = MOCK_USERS.find(x=>x.id===s.partnerId);
  try{
    const summary = await callClaude(`Write a short (4-5 sentence) friendly session summary for a peer-learning app called SkillSphere. The teacher ${u.name} taught ${u.teach[0]} to a learner. Include: topics covered, one homework task, and one next learning goal. Keep it concise, plain text, no markdown headers.`);
    s.summary = summary; persist('sessions'); renderView();
  }catch(e){ s.summary='Could not generate AI summary right now. ('+e.message+')'; renderView(); }
}

/* ---------- CHAT ---------- */
function openChat(partnerId){ state.activeChatPartner = partnerId; renderView(); }
function renderChat(el){
  const partners = state.connections.map(id=>MOCK_USERS.find(u=>u.id===id)).filter(Boolean);
  if(!state.activeChatPartner && partners[0]) state.activeChatPartner = partners[0].id;
  el.innerHTML = `<div class="chat-wrap">
    <div class="chat-list">${partners.map(p=>`<div class="chat-list-item ${state.activeChatPartner===p.id?'active':''}" onclick="openChat('${p.id}')">${p.avatar} ${p.name}</div>`).join('') || `<div class="empty">No connections yet.</div>`}</div>
    <div class="chat-panel">
      <div class="chat-msgs" id="chat-msgs">${(state.chats[state.activeChatPartner]||[]).map(m=>`<div class="msg ${m.from==='me'?'me':'them'}">${m.text}</div>`).join('')}</div>
      ${state.activeChatPartner ? `<div class="chat-input"><input id="chat-in" placeholder="Type a message..."><button class="btn small" onclick="sendChat()">Send</button></div>` : ''}
    </div>
  </div>`;
  const box = document.getElementById('chat-msgs'); if(box) box.scrollTop = box.scrollHeight;
  const input = document.getElementById('chat-in');
  if(input) input.onkeydown = e=>{ if(e.key==='Enter') sendChat(); };
}
function sendChat(){
  const input = document.getElementById('chat-in');
  const text = input.value.trim(); if(!text) return;
  const pid = state.activeChatPartner;
  state.chats[pid] = state.chats[pid]||[];
  state.chats[pid].push({from:'me',text}); input.value='';
  persist('chats'); renderView();
  setTimeout(()=>{
    const canned = ["Sounds good — let's plan the session!","Got it, I'll prep some material.","Works for me, see you then!","Great question, let's cover that."];
    state.chats[pid].push({from:'them',text:canned[Math.floor(Math.random()*canned.length)]});
    persist('chats'); if(state.view==='chat') renderView();
  }, 700);
}

/* ---------- PROGRESS ---------- */
function renderProgress(el){
  const hours = totalHours(state.sessions);
  const completed = state.sessions.filter(s=>s.status==='completed').length;
  const skills = uniqueLearnSkills(state);
  el.innerHTML = `
    <div class="stats-row">
      <div class="stat"><div class="n">${hours}</div><div class="l">Hours Learned</div></div>
      <div class="stat"><div class="n">${completed}</div><div class="l">Sessions Completed</div></div>
      <div class="stat"><div class="n">${skills.size}</div><div class="l">Skills Mastered</div></div>
    </div>
    <h3>Badges</h3>
    <div class="badge-grid">${BADGE_DEFS.map(b=>`<div class="badge ${b.need(state)?'earned':''}"><div class="ic">${b.ic}</div><div class="t">${b.t}</div></div>`).join('')}</div>
    <h3 style="margin-top:26px;">Weekly report</h3>
    <div class="card">${['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>{
        const w = Math.floor(Math.random()*100);
        return `<div class="barrow"><div class="label">${d}</div><div class="barbg"><div class="barfill" data-w="${w}" style="width:0%"></div></div></div>`;
      }).join('')}</div>
  `;
}

/* ---------- COMMUNITY ---------- */
function renderCommunity(el){
  el.innerHTML = GROUPS.map(g=>`
    <div class="card" style="display:flex;justify-content:space-between;align-items:center;">
      <div><b>${g}</b><div class="meta" style="color:var(--muted);font-size:12px;">${100+Math.floor(Math.random()*900)} members</div></div>
      <button class="btn small ${state.community[g]?'secondary':''}" onclick="toggleGroup('${g}')">${state.community[g]?'Joined ✓':'Join'}</button>
    </div>`).join('');
}
function toggleGroup(g){ state.community[g]=!state.community[g]; persist('community'); renderView(); }

/* ---------- AI ASSISTANT ---------- */
function renderAI(el){
  el.innerHTML = `
    <div class="ai-box card">
      <h3 style="margin-top:0;">Skill gap analysis & roadmap</h3>
      <div class="field"><label>Your learning goal</label><input id="ai-goal" placeholder="e.g. Become a Machine Learning Engineer"></div>
      <button class="btn" onclick="generateRoadmap()">Generate roadmap</button>
      <div id="roadmap-out"></div>
    </div>
    <div class="ai-box card" style="margin-top:18px;">
      <h3 style="margin-top:0;">Ask the AI assistant</h3>
      <textarea id="ai-question" placeholder="Ask a programming doubt, learning question, or request study guidance..."></textarea>
      <button class="btn" style="margin-top:10px;" onclick="askAssistant()">Ask</button>
      <div id="assistant-out"></div>
    </div>`;
}
async function generateRoadmap(){
  const goal = document.getElementById('ai-goal').value.trim();
  const out = document.getElementById('roadmap-out');
  if(!goal){ alert('Enter a goal first.'); return; }
  out.innerHTML = `<div class="loading" style="margin-top:14px;">Analyzing skill gaps and building your roadmap<span class="dots"><span></span><span></span><span></span></span></div>`;
  try{
    const text = await callClaude(`A user on a peer skill-exchange app has this goal: "${goal}". Their current skills they can teach are: ${state.profile.teach.join(', ')}. Give: 1) a short "Missing Skills" list (3-5 items), 2) a 4-week personalized roadmap (Week 1-4, one line each). Keep total under 150 words, plain text, no markdown symbols like # or **.`);
    out.innerHTML = `<div class="ai-output">${text}</div>`;
  }catch(e){ out.innerHTML = `<div class="ai-output">Could not reach the AI service. ${e.message}</div>`; }
}
async function askAssistant(){
  const q = document.getElementById('ai-question').value.trim();
  const out = document.getElementById('assistant-out');
  if(!q){ return; }
  out.innerHTML = `<div class="loading" style="margin-top:14px;">Thinking<span class="dots"><span></span><span></span><span></span></span></div>`;
  try{
    const text = await callClaude(`You are the AI Learning Assistant inside a peer skill-exchange app called SkillSphere. Answer this learner's question helpfully and concisely (under 120 words), plain text, no markdown symbols: "${q}"`);
    out.innerHTML = `<div class="ai-output">${text}</div>`;
  }catch(e){ out.innerHTML = `<div class="ai-output">Could not reach the AI service. ${e.message}</div>`; }
}
