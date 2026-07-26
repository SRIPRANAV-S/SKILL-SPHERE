/* ============ STATE ============ */
let state = {
  profile:null, connections:[], requests:{incoming:[],outgoing:[]},
  sessions:[], chats:{}, community:{}, view:'home', activeChatPartner:null,
};

/* ============ STORAGE (localStorage) ============ */
const STORAGE_PREFIX = 'skillsphere:';

function loadAll(){
  try{ const v = localStorage.getItem(STORAGE_PREFIX+'profile'); state.profile = v? JSON.parse(v): null; }catch(e){ state.profile=null; }
  try{ const v = localStorage.getItem(STORAGE_PREFIX+'connections'); state.connections = v? JSON.parse(v): []; }catch(e){}
  try{ const v = localStorage.getItem(STORAGE_PREFIX+'requests'); state.requests = v? JSON.parse(v): {incoming:[],outgoing:[]}; }catch(e){}
  try{ const v = localStorage.getItem(STORAGE_PREFIX+'sessions'); state.sessions = v? JSON.parse(v): []; }catch(e){}
  try{ const v = localStorage.getItem(STORAGE_PREFIX+'chats'); state.chats = v? JSON.parse(v): {}; }catch(e){}
  try{ const v = localStorage.getItem(STORAGE_PREFIX+'community'); state.community = v? JSON.parse(v): {}; }catch(e){}
}
function persist(key){
  const map = {profile:state.profile,connections:state.connections,requests:state.requests,sessions:state.sessions,chats:state.chats,community:state.community};
  try{ localStorage.setItem(STORAGE_PREFIX+key, JSON.stringify(map[key])); }catch(e){ console.error('storage failed',e); }
}
function seedIfEmpty(){
  if(state.requests.incoming.length===0 && state.requests.outgoing.length===0 && state.connections.length===0){
    state.requests.incoming = [{id:'r1',userId:'u2',message:'Hi, I can teach Python. Can you teach me UI Design?',status:'pending'}];
    persist('requests');
  }
}

/* ============ AI (Claude via server proxy) ============ */
async function callClaude(prompt){
  const res = await fetch('/api/ai', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ prompt }),
  });
  const data = await res.json();
  if(data.error) throw new Error(data.error);
  return data.text || '';
}

/* ============ MATCHING ALGORITHM ============ */
function matchScore(profile,other){
  let score = 0;
  const teachOverlap = other.teach.filter(s=>profile.learn.includes(s)).length;
  const learnOverlap = other.learn.filter(s=>profile.teach.includes(s)).length;
  score += teachOverlap*30; score += learnOverlap*30;
  if(other.level===profile.level) score += 10;
  score += Math.min(other.rating*4,20);
  score += (parseInt(other.id.slice(1))%7);
  return Math.min(99, Math.max(38, Math.round(score)));
}
function rankedMatches(){
  return MOCK_USERS.map(u=>({...u, score:matchScore(state.profile,u)})).sort((a,b)=>b.score-a.score);
}
