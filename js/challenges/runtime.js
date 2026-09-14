import{Challenge,el,place,rand}from'./base.js';
const LIMIT=10000,MIN=7000,sh=a=>[...a].sort(()=>Math.random()-.5),cl=(n,a,b)=>Math.max(a,Math.min(b,n));
const make=(m,run)=>{const f=ctx=>{const c=new Challenge({...m,...ctx});c.start=()=>run(c,m);return c};Object.assign(f,m);return f};
const btn=(c,t='',k='target')=>{const b=el('button',k,t);b.type='button';c.arena.append(b);return b};
const time=(c,msg='Time ran out.',ms=LIMIT)=>c.later(()=>c.finish(false,msg),Math.max(MIN,ms));
const pick=(c,items,answer,extra='')=>{const w=el('div',`choice-grid${extra?' '+extra:''}`);c.arena.append(w);items.forEach((x,i)=>{const b=el('button','arcade-choice',String(x));b.type='button';w.append(b);c.listen(b,'pointerdown',()=>c.finish(i===answer,i===answer?'':'Wrong choice.'))});return w};
const center=(c,b)=>{place(b,50,52);return b};
const colors={red:'#ff453a',blue:'#0a84ff',green:'#30d158',yellow:'#ffd60a',purple:'#bf5af2'};

function hold(c,m){let down=false,start=0,b=center(c,btn(c,'HOLD','hero-button'));c.listen(b,'pointerdown',e=>{down=true;start=performance.now();b.setPointerCapture?.(e.pointerId)});c.listen(b,'pointerup',()=>{if(!down)return;down=false;const d=performance.now()-start;c.finish(Math.abs(d-m.ms)<700,`Held ${(d/1000).toFixed(1)}s.`)});c.every(()=>{if(down&&performance.now()-start>m.ms+700)c.finish(false,'Held too long.')},50);time(c,'Hold incomplete.',11000)}
function odd(c,m){const total=m.total||12,i=Math.floor(rand(0,total)),g=el('div','tile-grid brain-grid');g.style.gridTemplateColumns=`repeat(${total>12?4:3},1fr)`;c.arena.append(g);for(let x=0;x<total;x++){const b=el('button','tile',x===i?m.b:m.a);b.type='button';g.append(b);c.listen(b,'pointerdown',()=>c.finish(x===i,x===i?'':'That one matched.'))}time(c)}
function math(c,m){let a=Math.floor(rand(5,25)),b=Math.floor(rand(3,14)),ans,q;if(m.op==='+'){ans=a+b;q=`${a} + ${b} = ?`}else if(m.op==='−'){a+=18;ans=a-b;q=`${a} − ${b} = ?`}else{a=Math.floor(rand(3,12));b=Math.floor(rand(3,11));ans=a*b;q=`${a} × ${b} = ?`}c.arena.append(el('div','math-question',q));let vals=sh([ans,ans+2,ans-2,ans+(Math.random()<.5?3:-3)]);pick(c,vals,vals.indexOf(ans));time(c)}
function memory(c,m){const g=el('div','tile-grid'),pads=[];c.arena.append(g);for(let i=0;i<9;i++){const b=el('button','tile','');b.type='button';g.append(b);pads.push(b)}const chosen=sh([...Array(9).keys()]).slice(0,m.n);chosen.forEach(i=>pads[i].classList.add('lit'));c.later(()=>{pads.forEach(p=>p.classList.remove('lit'));let left=new Set(chosen);pads.forEach((p,i)=>c.listen(p,'pointerdown',()=>{if(!left.has(i))c.finish(false,'Wrong tile.');else{left.delete(i);p.classList.add('picked');if(!left.size)c.finish(true)}}))},1300);time(c,'Memory expired.',11000)}
function reaction(c,m){let ready=false,b=center(c,btn(c,'WAIT','hero-button'));c.listen(b,'pointerdown',()=>c.finish(ready,ready?'':'Too early.'));c.later(()=>{ready=true;b.textContent=m.word;b.classList.add('ready')},rand(1800,3400));time(c,'Too slow.')}
function swipe(c,m){const dirs=['up','right','down','left'],ar=['↑','→','↓','←'],idx=dirs.indexOf(m.dir),b=center(c,btn(c,ar[idx],'swipe-card'));let sx=0,sy=0;c.listen(b,'pointerdown',e=>{sx=e.clientX;sy=e.clientY;b.setPointerCapture?.(e.pointerId)});c.listen(b,'pointerup',e=>{const dx=e.clientX-sx,dy=e.clientY-sy;if(Math.hypot(dx,dy)<55)return c.finish(false,'Swipe farther.');const d=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');c.finish(d===m.dir,`You swiped ${d}.`)});time(c)}
function order(c,m){const target=m.rev?[5,4,3,2,1]:[1,2,3,4,5],values=sh([1,2,3,4,5,0,6,7]),w=el('div','order-row hard-order');let k=0;c.arena.append(w);const buttons=values.map(v=>{const b=el('button','order-item',v);b.type='button';w.append(b);c.listen(b,'pointerdown',()=>{if(v!==target[k])return c.finish(false,'Wrong number.');b.disabled=true;b.classList.add('done');k++;if(k===5)return c.finish(true);sh([...w.children].filter(x=>!x.disabled)).forEach(x=>w.append(x))});return b});time(c)}
function color(c,m){const names=Object.keys(colors),target=m.color,spots=[];for(let r=0;r<3;r++)for(let x=0;x<4;x++)spots.push([17+x*22,24+r*28]);const others=Array.from({length:9},()=>names.filter(n=>n!==target)[Math.floor(rand(0,names.length-1))]),palette=sh([target,target,target,...others]);let hits=0;palette.forEach((name,i)=>{const b=btn(c,'','color-orb');b.style.background=colors[name];place(b,...spots[i]);c.listen(b,'pointerdown',()=>{if(name!==target)c.finish(false,'Wrong color.');else{b.remove();if(++hits===3)c.finish(true)}})});time(c)}
function count(c,m){const n=Math.floor(rand(5,11)),f=el('div','count-field');c.arena.append(f);const spots=sh([[10,12],[32,12],[54,12],[76,12],[90,30],[18,42],[42,42],[66,42],[86,58],[12,72],[38,72],[64,72],[88,84]]);for(let i=0;i<n;i++){const s=el('span','count-symbol',m.shape);s.style.left=spots[i][0]+'%';s.style.top=spots[i][1]+'%';s.style.transform=`translate(-50%,-50%) rotate(${Math.floor(rand(-14,15))}deg)`;f.append(s)}const vals=sh([n,n+1,n-1,n+2]);pick(c,vals,vals.indexOf(n),'count-choices');time(c)}
function drag(c,m){const a=btn(c,m.a,'drag-piece'),z=el('div','drop-zone',m.b);place(a,20,70);place(z,80,28);c.arena.append(z);let on=false;c.listen(a,'pointerdown',e=>{on=true;a.setPointerCapture?.(e.pointerId)});c.listen(a,'pointermove',e=>{if(!on)return;const r=c.arena.getBoundingClientRect();place(a,cl((e.clientX-r.left)/r.width*100,6,94),cl((e.clientY-r.top)/r.height*100,8,92))});c.listen(a,'pointerup',()=>{on=false;const A=a.getBoundingClientRect(),B=z.getBoundingClientRect();c.finish(Math.hypot(A.x-B.x,A.y-B.y)<95,'Missed the target.')});time(c)}
function slider(c,m){const w=el('div','slider-game'),out=el('div','slider-readout','50%'),r=el('input','arcade-slider'),ok=el('button','confirm-button','SET');r.type='range';r.min=0;r.max=100;r.value=50;w.append(out,r,ok);c.arena.append(w);c.listen(r,'input',()=>out.textContent=r.value+'%');c.listen(ok,'pointerdown',()=>c.finish(Math.abs(+r.value-m.n)<=3,`Set to ${r.value}%.`));time(c)}
function compare(c,m){const nums=[];while(nums.length<6){const n=Math.floor(rand(5,196));if(!nums.includes(n))nums.push(n)}const ans=m.hi?nums.indexOf(Math.max(...nums)):nums.indexOf(Math.min(...nums));pick(c,nums,ans);time(c)}
function moving(c,m){const b=btn(c,m.s,'moving-target');let hits=0,move=()=>place(b,rand(12,88),rand(16,84));move();c.listen(b,'pointerdown',e=>{e.stopPropagation();if(++hits===m.hits)c.finish(true);else move()});c.every(()=>{if(!c.done)move()},m.speed);time(c)}
function direction(c,m){const ar=['↑','→','↓','←'],i=Math.floor(rand(0,4));c.arena.append(el('div','direction-hero',ar[i]));let answer=m.mode==='same'?i:(i+2)%4;if(m.rotate)answer=(answer+m.rotate+4)%4;pick(c,ar,answer);time(c)}
function pairs(c,m){const items=sh([m.pair,m.pair,m.x,m.y,m.z,m.q]),w=el('div','pair-grid pair-grid-hard');let first=null;c.arena.append(w);items.forEach((v,i)=>{const b=el('button','pair-card',v);b.type='button';w.append(b);c.listen(b,'pointerdown',()=>{if(first===null){first=i;b.classList.add('picked')}else c.finish(i!==first&&items[i]===items[first],i!==first&&items[i]===items[first]?'':'Not a pair.')})});time(c)}
function word(c,m){const items=m.items,answer=m.mode==='long'?items.reduce((a,v,i)=>v.length>items[a].length?i:a,0):items.reduce((a,v,i)=>v.length<items[a].length?i:a,0),mix=sh(items.map((v,i)=>({v,i})));pick(c,mix.map(x=>x.v),mix.findIndex(x=>x.i===answer));time(c)}
function precision(c,m){const t=el('div','precision-track'),z=el('span','precision-zone'),n=el('i','precision-needle');z.style.left=m.a+'%';z.style.width=(m.b-m.a)+'%';t.append(z,n);c.arena.append(t);let x=0,d=1;c.every(()=>{x+=d*m.speed;if(x>=100||x<=0)d*=-1;n.style.left=x+'%'},16);c.listen(c.arena,'pointerdown',()=>c.finish(x>=m.a&&x<=m.b,`Stopped at ${Math.round(x)}%.`));time(c)}
function pattern(c,m){const box=el('div','pattern-sequence',m.seq.join('  '));c.arena.append(box);const vals=sh([m.answer,...m.wrong]);pick(c,vals,vals.indexOf(m.answer),'pattern-choices');time(c)}
function path(c,m){const cols=m.cols,rows=Math.ceil(m.n/cols),grid=el('div','path-grid');grid.style.gridTemplateColumns=`repeat(${cols},1fr)`;c.arena.append(grid);const total=cols*rows,cells=[];for(let i=0;i<total;i++){const b=el('button','path-cell','');b.type='button';grid.append(b);cells.push(b)}let base=[];for(let r=0;r<rows;r++){const row=[...Array(cols).keys()].map(x=>r*cols+x);if(r%2)row.reverse();base.push(...row)}if(Math.random()<.5)base.reverse();const pathSeq=base.slice(0,m.n),pulse=Math.max(180,Math.min(520,2200/m.n));pathSeq.forEach((idx,i)=>c.later(()=>{cells[idx].classList.add('lit');c.later(()=>cells[idx].classList.remove('lit'),pulse*.72)},300+i*pulse));const preview=450+m.n*pulse;c.later(()=>{c.sub.textContent='Repeat the path.';let k=0;cells.forEach((b,i)=>c.listen(b,'pointerdown',()=>{if(i!==pathSeq[k])return c.finish(false,'Path broken.');b.classList.add('picked');if(++k===pathSeq.length)c.finish(true)}))},preview);time(c,'Path expired.',m.limitMs)}

const specs=[];const add=(kind,rows)=>rows.forEach(r=>specs.push({kind,id:`${kind}-${specs.length+1}`,weight:1,...r}));
add('path',[
 {title:'FOLLOW THE PATH · EASY',sub:'Watch 5 tiles.',n:5,cols:3,limitMs:12000},
 {title:'FOLLOW THE PATH · NORMAL',sub:'Watch 9 tiles.',n:9,cols:3,limitMs:15000},
 {title:'FOLLOW THE PATH · MODERATE',sub:'Watch 13 tiles.',n:13,cols:4,limitMs:18000},
 {title:'FOLLOW THE PATH · DIFFICULT',sub:'Watch 17 tiles.',n:17,cols:5,limitMs:22000},
 {title:'FOLLOW THE PATH · EXTREME',sub:'Watch 25 tiles.',n:25,cols:5,limitMs:28000}
]);
add('hold',[1500,2000,2500,3000,3500].map(ms=>({title:`HOLD ${(ms/1000).toFixed(1)} SECONDS.`,sub:'Release precisely.',ms})));
add('odd',[['●','○'],['■','□'],['★','☆'],['▲','△'],['◆','◇']].map(([a,b],i)=>({title:'FIND THE ODD ONE.',sub:'Scan carefully.',a,b,total:i>1?16:12})));
add('math',['+','−','×','+','−'].map(op=>({title:'SOLVE IT.',sub:'Choose the answer.',op})));
add('memory',[4,5,6,5,6].map(n=>({title:`REMEMBER ${n} TILES.`,sub:'Then tap them.',n})));
add('reaction',['GO!','NOW!','READY!','GREEN!','TAP!'].map(word=>({title:`WAIT FOR ${word.replace('!','')}.`,sub:'Do not tap early.',word})));
add('swipe',['up','right','down','left','up'].map(dir=>({title:`SWIPE ${dir.toUpperCase()}.`,sub:'One clean swipe.',dir})));
add('order',[false,true,false,true,false].map((rev,i)=>({title:rev?'5 → 1.':'1 → 5.',sub:'Numbers move after every correct tap.',rev,variant:i})));
add('color',['red','blue','green','yellow','purple'].map(color=>({title:`TAP ${color.toUpperCase()}.`,sub:'Find all three.',color})));
add('count',['●','★','■','▲','♥'].map(shape=>({title:'COUNT THEM.',sub:'Choose the total.',shape})));
add('drag',[['◆','▣'],['★','○'],['■','⌂'],['●','◎'],['♦','▤']].map(([a,b])=>({title:'DRAG TO TARGET.',sub:'Drop it inside.',a,b})));
add('slider',[17,33,52,68,87].map(n=>({title:`SET ${n}%.`,sub:'Within three points.',n})));
add('compare',[true,false,true,false,true].map(hi=>({title:hi?'TAP THE LARGEST.':'TAP THE SMALLEST.',sub:'Compare six numbers.',hi})));
add('pattern',[
 {title:'WHAT COMES NEXT?',sub:'2 · 4 · 8 · 16 · ?',seq:[2,4,8,16,'?'],answer:32,wrong:[24,30,34]},
 {title:'WHAT COMES NEXT?',sub:'1 · 1 · 2 · 3 · 5 · ?',seq:[1,1,2,3,5,'?'],answer:8,wrong:[6,7,9]},
 {title:'WHAT COMES NEXT?',sub:'1 · 4 · 9 · 16 · ?',seq:[1,4,9,16,'?'],answer:25,wrong:[20,24,27]},
 {title:'WHAT COMES NEXT?',sub:'21 · 18 · 15 · 12 · ?',seq:[21,18,15,12,'?'],answer:9,wrong:[8,10,11]},
 {title:'WHAT COMES NEXT?',sub:'3 · 6 · 12 · 24 · ?',seq:[3,6,12,24,'?'],answer:48,wrong:[36,42,54]}
]);
add('moving',[
 {s:'●',hits:4,speed:1100},{s:'★',hits:4,speed:950},{s:'♥',hits:5,speed:900},{s:'⚡',hits:5,speed:800},{s:'◆',hits:6,speed:720}
].map(x=>({title:`CATCH IT ${x.hits} TIMES.`,sub:'It keeps moving.',...x})));
add('direction',[{mode:'same',rotate:0},{mode:'opposite',rotate:0},{mode:'same',rotate:1},{mode:'opposite',rotate:1},{mode:'same',rotate:-1}].map((x,i)=>({title:i<2?(x.mode==='same'?'MATCH THE ARROW.':'TAP THE OPPOSITE.'):'ROTATE THEN CHOOSE.',sub:i<2?'Choose direction.':(x.rotate===1?'Rotate 90° clockwise.':'Rotate 90° anticlockwise.'),...x})));
add('pairs',[['A','B','C','D','E'],['7','2','9','4','6'],['●','■','▲','◆','○'],['★','♥','◆','☀','♣'],['X','Y','Z','Q','R']].map(([pair,x,y,z,q])=>({title:'MATCH THE PAIR.',sub:'Find the only duplicate.',pair,x,y,z,q})));
add('word',[{mode:'long',items:['CAT','ELEPHANT','BIRD','FOX']},{mode:'short',items:['BLUE','RED','PURPLE','GREEN']},{mode:'long',items:['SUN','MOUNTAIN','SEA','SKY']},{mode:'short',items:['APPLE','FIG','BANANA','MANGO']},{mode:'long',items:['GO','READY','WAIT','START']}].map(x=>({title:x.mode==='long'?'LONGEST WORD.':'SHORTEST WORD.',sub:'Read first.',...x})));
add('precision',[[46,54,2.0],[21,28,2.2],[72,79,2.4],[48,52,2.6],[36,44,2.8]].map(([a,b,speed])=>({title:'STOP IN THE ZONE.',sub:'Tap at the right moment.',a,b,speed})));
add('math',[{op:'+'},{op:'−'},{op:'×'},{op:'+'},{op:'×'}].map(x=>({title:'QUICK MATH.',sub:'Choose the answer.',...x})));

const run={path,hold,odd,math,memory,reaction,swipe,order,color,count,drag,slider,compare,pattern,moving,direction,pairs,word,precision};
export const challenges=specs.slice(0,100).map(m=>make(m,(c,x)=>run[x.kind](c,x)));
export const challengeCount=challenges.length;
