// Original synthesized score. Optional replacement files are configured here.
export const AUDIO_FILES={music:null,open:null,correct:null,wrong:null,clue:null,door:null,turn:null};
export class RoomAudio{
 constructor(){this.muted=false;this.ctx=null;this.timer=null;this.music=null;this.clips=new Set();this.beat=0;}
 start(){if(!this.ctx){this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.35;this.master.connect(this.ctx.destination);}this.ctx.resume();if(!this.timer&&!this.music){if(AUDIO_FILES.music){this.music=new Audio(AUDIO_FILES.music);this.music.loop=true;this.music.volume=.22;this.music.muted=this.muted;this.music.play().catch(()=>{});}else{this.tick();this.timer=setInterval(()=>this.tick(),700);}}}
 tone(freq,at,duration=.8,volume=.1,type='sine'){if(!this.ctx)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(0,at);g.gain.linearRampToValueAtTime(volume,at+.03);g.gain.exponentialRampToValueAtTime(.001,at+duration);o.connect(g);g.connect(this.master);o.start(at);o.stop(at+duration+.05);}
 tick(){if(!this.ctx||document.hidden)return;const melody=[293.66,440,587.33,440,349.23,523.25,698.46,523.25,261.63,392,523.25,392,329.63,440,659.25,440];const t=this.ctx.currentTime;this.tone(melody[this.beat%16],t,1.7,.045);if(this.beat%4===0)this.tone(melody[this.beat%16]/2,t,2.7,.045);this.beat++;}
 effect(name){if(AUDIO_FILES[name]){const clip=new Audio(AUDIO_FILES[name]);clip.muted=this.muted;this.clips.add(clip);clip.onended=()=>this.clips.delete(clip);clip.play().catch(()=>this.clips.delete(clip));return;}if(!this.ctx)return;const notes={turn:[330],open:[392,523.25],correct:[523.25,659.25],wrong:[220,196],clue:[523.25,659.25,783.99,1046.5],door:[261.63,329.63,392,523.25,659.25,1046.5]}[name]||[];notes.forEach((n,i)=>this.tone(n,this.ctx.currentTime+i*.12,name==='door'?2: .65,.14));}
 toggle(){this.muted=!this.muted;if(this.master)this.master.gain.value=this.muted?0:.35;if(this.music)this.music.muted=this.muted;this.clips.forEach(c=>c.muted=this.muted);return this.muted;}
 suspend(){this.ctx?.suspend();this.music?.pause();this.clips.forEach(c=>c.pause());}
 resume(){this.ctx?.resume();if(this.music)this.music.play().catch(()=>{});}
}
