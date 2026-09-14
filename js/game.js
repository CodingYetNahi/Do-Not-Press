import{challenges}from'./challenges/runtime.js';
import{record,save}from'./storage.js';
import{burst,flash,vibrate}from'./effects.js';

const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const durationFor=factory=>factory.limitMs||((factory.kind==='memory'||factory.kind==='hold')?11000:10000);

export class Game{
  constructor({stats,audio,els}){
    this.stats=stats;
    this.audio=audio;
    this.e=els;
    this.score=0;
    this.current=null;
    this.deck=[];
    this.recentKinds=[];
    this.recentIds=[];
    this.state='intro';
    this.pausePending=false;
    document.addEventListener('visibilitychange',()=>this.visibility());
    document.addEventListener('keydown',e=>this.key(e));
  }
  refillDeck(){this.deck=shuffle(challenges)}
  start(){
    this.audio.unlock();
    this.audio.startMusic();
    this.stats.games++;
    save(this.stats);
    this.score=0;
    this.recentKinds=[];
    this.recentIds=[];
    this.refillDeck();
    this.e.intro.classList.add('hidden');
    this.e.over.classList.add('hidden');
    this.e.game.classList.remove('hidden');
    this.e.hud.classList.remove('hidden');
    this.renderScore();
    this.next();
  }
  pick(){
    if(!this.deck.length)this.refillDeck();
    let candidates=this.deck.filter(x=>!this.recentKinds.includes(x.kind)&&!this.recentIds.includes(x.id));
    if(!candidates.length)candidates=this.deck.filter(x=>!this.recentIds.includes(x.id));
    if(!candidates.length)candidates=this.deck;
    const factory=candidates[Math.floor(Math.random()*candidates.length)];
    const index=this.deck.indexOf(factory);
    if(index>=0)this.deck.splice(index,1);
    this.recentKinds=[factory.kind,...this.recentKinds].slice(0,10);
    this.recentIds=[factory.id,...this.recentIds].slice(0,10);
    return factory;
  }
  next(){
    this.state='intro-challenge';
    const factory=this.pick();
    this.e.arena.replaceChildren();
    this.e.instruction.textContent=factory.title;
    this.e.sub.textContent=factory.sub;
    this.e.timer.firstElementChild.style.transition='none';
    this.e.timer.firstElementChild.style.transform='scaleX(1)';
    const delay=Math.max(700,950-this.score*3);
    this.transition=setTimeout(()=>this.run(factory),delay);
  }
  run(factory){
    this.state='active';
    const duration=durationFor(factory);
    this.current=factory({
      arena:this.e.arena,
      instruction:this.e.instruction,
      sub:this.e.sub,
      audio:this.audio,
      difficulty:1+this.score/12,
      onSuccess:()=>this.win(),
      onFail:r=>this.lose(r)
    });
    this.e.timer.firstElementChild.style.transition=`transform ${duration}ms linear`;
    requestAnimationFrame(()=>this.e.timer.firstElementChild.style.transform='scaleX(0)');
    this.current.start();
  }
  win(){
    if(this.state!=='active')return;
    this.state='success';
    const id=this.current.id;
    this.current.cleanup();
    this.audio.play('success');
    vibrate([20,35,20]);
    flash(this.e.flash,'#30d158');
    burst(this.e.arena,'#30d158',12);
    this.score++;
    this.stats.best=Math.max(this.stats.best,this.score);
    record(this.stats,id,this.score);
    this.renderScore();
    this.toast('+1');
    setTimeout(()=>this.next(),500);
  }
  lose(reason='Try again.'){
    if(!['active','intro-challenge'].includes(this.state))return;
    this.state='failure';
    clearTimeout(this.transition);
    this.current?.cleanup();
    this.audio.play('fail');
    vibrate([70,30,100]);
    flash(this.e.flash,'#ff453a');
    this.e.app.classList.add('shake');
    setTimeout(()=>{this.e.app.classList.remove('shake');this.showOver(reason)},420);
  }
  showOver(reason){
    this.state='over';
    this.e.game.classList.add('hidden');
    this.e.hud.classList.add('hidden');
    this.e.over.classList.remove('hidden');
    this.e.final.textContent=this.score;
    this.e.finalBest.textContent=this.stats.best;
    this.e.verdict.textContent=reason;
    save(this.stats);
    this.e.restart.focus();
  }
  renderScore(){
    this.e.score.textContent=this.score;
    this.e.best.textContent=this.stats.best;
    this.e.score.classList.remove('score-pop');
    void this.e.score.offsetWidth;
    this.e.score.classList.add('score-pop');
  }
  toast(t){
    this.e.toast.textContent=t;
    this.e.toast.classList.remove('go');
    void this.e.toast.offsetWidth;
    this.e.toast.classList.add('go');
  }
  key(e){
    if(this.state!=='active')return;
    if([' ','Enter'].includes(e.key)){
      e.preventDefault();
      const target=document.activeElement?.matches('button,input')?document.activeElement:this.e.arena.querySelector('button');
      target?.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:innerWidth/2,clientY:innerHeight/2,pointerId:1}));
      setTimeout(()=>target?.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,clientX:innerWidth/2,clientY:innerHeight/2,pointerId:1})),90);
    }
  }
  visibility(){
    if(document.hidden&&['active','intro-challenge'].includes(this.state)){
      this.pausePending=true;
      clearTimeout(this.transition);
      this.current?.cleanup();
      this.current=null;
      this.state='paused';
    }else if(!document.hidden&&this.pausePending){
      this.pausePending=false;
      this.next();
    }
  }
}
