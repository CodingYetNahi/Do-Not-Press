const MUSIC_TRACKS=[
  'https://raw.githubusercontent.com/Anubhav9/Yellow-Olive/main/media/resources/music_files/battle_music_2.mp3',
  'https://raw.githubusercontent.com/Anubhav9/Yellow-Olive/main/media/resources/music_files/screen_2_music.mp3',
  'https://raw.githubusercontent.com/Anubhav9/Yellow-Olive/main/media/resources/music_files/signal_town_intro_music.mp3'
];

export class AudioSystem{
  constructor(muted=false){
    this.muted=muted;
    this.ctx=null;
    this.music=null;
    this.track=0;
    this.musicStarted=false;
  }
  unlock(){
    if(this.muted)return;
    this.ctx??=new (window.AudioContext||window.webkitAudioContext)();
    this.ctx.resume();
  }
  ensureMusic(){
    if(this.music)return;
    this.music=new Audio();
    this.music.preload='none';
    this.music.volume=.18;
    this.music.loop=false;
    this.music.addEventListener('ended',()=>this.nextTrack());
    this.music.addEventListener('error',()=>this.nextTrack(true));
  }
  startMusic(){
    if(this.muted)return;
    this.ensureMusic();
    if(!this.music.src){
      this.music.src=MUSIC_TRACKS[this.track];
    }
    this.music.play().then(()=>{this.musicStarted=true}).catch(()=>{});
  }
  nextTrack(fromError=false){
    if(!this.music)return;
    this.track=(this.track+1)%MUSIC_TRACKS.length;
    this.music.src=MUSIC_TRACKS[this.track];
    if(!this.muted&&this.musicStarted&&!fromError)this.music.play().catch(()=>{});
    else if(!this.muted&&this.musicStarted&&fromError)setTimeout(()=>this.music?.play().catch(()=>{}),250);
  }
  tone(freq=440,d=.08,type='sine',gain=.045,delay=0){
    if(this.muted)return;
    this.unlock();
    if(!this.ctx)return;
    const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(gain,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
    o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+d);
  }
  play(name){
    const map={click:[260,.05,'square'],press:[110,.13,'sawtooth'],count:[540,.07,'square'],warning:[150,.15,'sawtooth'],fail:[90,.5,'sawtooth'],score:[720,.08,'sine']};
    if(name==='success'){this.tone(520,.12);this.tone(780,.16,'sine',.05,.08)}
    else{const a=map[name]||map.click;this.tone(...a)}
  }
  setMuted(v){
    this.muted=v;
    if(v){this.music?.pause()}
    else{this.unlock();this.startMusic()}
  }
}
