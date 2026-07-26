/* ============ MOCK DATA ============ */
const MOCK_USERS = [
  {id:'u1',name:'Priya Menon',avatar:'🎨',teach:['Photoshop','Illustrator'],learn:['Python','Data Analysis'],level:'Intermediate',rating:4.8,category:'Designing'},
  {id:'u2',name:'Dev Kulkarni',avatar:'🐍',teach:['Python','Machine Learning'],learn:['Flutter','UI Design'],level:'Advanced',rating:4.9,category:'Programming'},
  {id:'u3',name:'Sara Ahmed',avatar:'📱',teach:['Flutter','Dart'],learn:['Machine Learning','Statistics'],level:'Intermediate',rating:4.7,category:'Programming'},
  {id:'u4',name:'Leo Fernandes',avatar:'🎸',teach:['Guitar','Music Theory'],learn:['Public Speaking'],level:'Beginner',rating:4.5,category:'Music'},
  {id:'u5',name:'Nisha Rao',avatar:'🗣️',teach:['Public Speaking','English'],learn:['Guitar','Photography'],level:'Advanced',rating:4.9,category:'Languages'},
  {id:'u6',name:'Arjun Iyer',avatar:'📈',teach:['Finance','Excel'],learn:['Python','Marketing'],level:'Intermediate',rating:4.6,category:'Finance'},
  {id:'u7',name:'Meera Joshi',avatar:'📸',teach:['Photography','Lightroom'],learn:['Marketing','Public Speaking'],level:'Intermediate',rating:4.8,category:'Photography'},
  {id:'u8',name:'Karan Shah',avatar:'💪',teach:['Fitness Coaching','Nutrition'],learn:['Cooking'],level:'Advanced',rating:4.7,category:'Fitness'},
  {id:'u9',name:'Ana Costa',avatar:'🍳',teach:['Cooking','Baking'],learn:['Fitness Coaching','Spanish'],level:'Beginner',rating:4.4,category:'Fitness'},
  {id:'u10',name:'Rohit Verma',avatar:'📢',teach:['Marketing','SEO'],learn:['Excel','Finance'],level:'Intermediate',rating:4.6,category:'Marketing'},
  {id:'u11',name:'Ivy Chen',avatar:'🈶',teach:['Mandarin','Cooking'],learn:['Guitar','Photoshop'],level:'Intermediate',rating:4.8,category:'Languages'},
  {id:'u12',name:'Tom Becker',avatar:'💻',teach:['Machine Learning','Statistics'],learn:['Photoshop','Illustrator'],level:'Advanced',rating:5.0,category:'Programming'},
];

const CATEGORIES = ['All','Programming','Designing','Marketing','Finance','Music','Languages','Photography','Fitness'];

const GROUPS = ['Flutter Developers','AI Beginners','Web Developers','UI Designers'];

const BADGE_DEFS = [
  {id:'b1',t:'First Session',ic:'🌱',need:s=>s.sessions.length>=1},
  {id:'b10',t:'10 Sessions',ic:'🏅',need:s=>s.sessions.length>=10},
  {id:'b100',t:'100 Hours',ic:'⏱️',need:s=>totalHours(s.sessions)>=100},
  {id:'b5skill',t:'5 Skills Learned',ic:'🎓',need:s=>uniqueLearnSkills(s).size>=5},
];

function totalHours(sessions){
  return sessions.filter(s=>s.status==='completed').reduce((a,s)=>a+Number(s.duration||1),0);
}
function uniqueLearnSkills(s){
  const set = new Set();
  s.sessions.filter(x=>x.status==='completed').forEach(x=>{
    const p = MOCK_USERS.find(u=>u.id===x.partnerId);
    if(p) p.teach.forEach(sk=>set.add(sk));
  });
  return set;
}
