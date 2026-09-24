import { World, G, WW, WH, COL } from '../src/world.js';
const w = new World({stable:true,paddock:true,flowerGarden:true,festival:true});
const ch = {0:'.',1:',',2:'=',3:':',4:'~',5:'-',6:'"',7:'#',8:'+',9:'^',10:'M',11:'H',12:'D',13:' ',14:';',15:'*'};
const step = +process.argv[2]||1;
let out='';
for (let y=0;y<WH;y+=step){let l='';for(let x=0;x<WW;x+=step){const c=w.coll[y*WW+x];let s=ch[w.g(x,y)];if(c===COL.SOLID&&w.g(x,y)!==G.CLIFF)s='T';if(c===COL.LOW)s='f';l+=s;}out+=l+'\n';}
console.log(out);
console.log('objects',w.objects.length,'pickups',w.pickups.length);
