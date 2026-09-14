import{load,save}from'./storage.js';
import{AudioSystem}from'./audio.js';
import{Game}from'./game.js';
import{flash,vibrate}from'./effects.js';

const $=s=>document.querySelector(s),stats=load(),audio=new AudioSystem(stats.muted);
const els={app:$('#app'),intro:$('#intro'),game:$('#game'),over:$('#gameover'),hud:$('#hud'),arena:$('#arena'),instruction:$('#instruction'),sub:$('#sub'),timer:$('#timer'),score:$('#score'),best:$('#best'),final:$('#final-score'),finalBest:$('#final-best'),verdict:$('#verdict'),flash:$('#flash'),toast:$('#toast'),restart:$('#restart')};
const game=new Game({stats,audio,els});
els.best.textContent=stats.best;

const forbidden=$('#forbidden');
forbidden.addEventListener('pointerdown',()=>{forbidden.classList.add('pressed');audio.play('press');vibrate(30)});
forbidden.addEventListener('pointerup',()=>{
  forbidden.classList.remove('pressed');
  audio.startMusic();
  flash(els.flash);
  setTimeout(()=>game.start(),140);
},{once:true});
forbidden.addEventListener('keydown',e=>{
  if(['Enter',' '].includes(e.key)){
    audio.play('press');
    audio.startMusic();
    flash(els.flash);
    setTimeout(()=>game.start(),140);
  }
},{once:true});
$('#restart').addEventListener('click',()=>game.start());

const mute=$('#mute');
function paintMute(){
  mute.textContent=stats.muted?'×':'♪';
  mute.classList.toggle('muted',stats.muted);
  mute.setAttribute('aria-label',stats.muted?'Unmute sound':'Mute sound');
}
paintMute();
mute.addEventListener('click',()=>{
  stats.muted=!stats.muted;
  audio.setMuted(stats.muted);
  if(!stats.muted)audio.play('click');
  save(stats);
  paintMute();
});

const menu=$('#site-menu'),menuToggle=$('#menu-toggle'),menuClose=$('#menu-close');
function openMenu(){
  game.pauseForMenu();
  menu.classList.add('open');
  menu.setAttribute('aria-hidden','false');
  menuToggle.setAttribute('aria-expanded','true');
  menuToggle.setAttribute('aria-label','Close menu');
  document.body.classList.add('menu-open');
  menuClose.focus();
}
function closeMenu(){
  if(!menu.classList.contains('open'))return;
  menu.classList.remove('open');
  menu.setAttribute('aria-hidden','true');
  menuToggle.setAttribute('aria-expanded','false');
  menuToggle.setAttribute('aria-label','Open menu');
  document.body.classList.remove('menu-open');
  game.resumeFromMenu();
  menuToggle.focus();
}
menuToggle.addEventListener('click',()=>menu.classList.contains('open')?closeMenu():openMenu());
menuClose.addEventListener('click',closeMenu);
menu.querySelectorAll('[data-close-menu]').forEach(x=>x.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open'))closeMenu()});

const share=$('#share-game');
share?.addEventListener('click',async()=>{
  const data={title:"DON'T PRESS THAT",text:'Play brain games and mini challenges.',url:'https://whyiamdoingthis.fun/'};
  try{
    if(navigator.share)await navigator.share(data);
    else if(navigator.clipboard){await navigator.clipboard.writeText(data.url);share.textContent='Link copied';setTimeout(()=>share.textContent='Share this game',1500)}
  }catch{}
});

for(const type of ['contextmenu','selectstart','dragstart']){
  document.addEventListener(type,event=>event.preventDefault(),{capture:true});
}
document.addEventListener('gesturestart',event=>event.preventDefault(),{capture:true,passive:false});
