import { World, SPOTS, FARM, TRACKS, WW, HORSESHOES } from '../src/world.js';
const w = new World({});
const walk = w.reachable(FARM.spawn.x, FARM.spawn.y, {});
const ride = w.reachable(FARM.spawn.x, FARM.spawn.y, {riding:true});
const ok=(set,x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(set[(Math.floor(y)+dy)*WW+Math.floor(x)+dx])return true;}return false;};
for (const [k,p] of Object.entries(SPOTS.npc)) console.log('npc',k,ok(walk,p.x,p.y));
for (const [k,p] of Object.entries(SPOTS.wildHorses)) console.log('wild',k,ok(walk,p.x,p.y), ok(ride,p.x,p.y));
console.log('kitten',ok(walk,SPOTS.kitten.x,SPOTS.kitten.y),'picnic walk',ok(walk,SPOTS.picnic.x,SPOTS.picnic.y),'ride',ok(ride,SPOTS.picnic.x,SPOTS.picnic.y),'telescope',ok(walk,SPOTS.telescope.x,SPOTS.telescope.y));
let bad=[];for(const p of w.pickups){ if(!ok(ride,p.x,p.y)) bad.push(p.id+'@'+p.x+','+p.y);} console.log('unreachable pickups',bad);
for (const [k,t] of Object.entries(TRACKS)) { const bads=[]; for(let i=0;i<t.length-1;i++){const [ax,ay]=t[i],[bx,by]=t[i+1];const n=Math.ceil(Math.hypot(bx-ax,by-ay)*3);for(let s=0;s<=n;s++){const x=ax+(bx-ax)*s/n+0.5,y=ay+(by-ay)*s/n+0.5;if(!w.passable(Math.floor(x),Math.floor(y),{riding:true,jumping:true}))bads.push(`${i}:${x.toFixed(1)},${y.toFixed(1)}`);}} console.log('track',k,bads.slice(0,12));}
