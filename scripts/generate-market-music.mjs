// Original composition: "Lanterns at the Violet Market". No samples or third-party recordings.
// Offline rendering only; the game plays the finished file using native browser audio.
import {writeFileSync} from 'node:fs';
const rate=22050, seconds=32, count=rate*seconds, mix=new Float64Array(count);
const hz=midi=>440*2**((midi-69)/12);
const chords=[[50,57,62,65],[48,55,60,64],[46,53,58,62],[45,52,57,61],
              [50,57,62,65],[53,60,65,69],[48,55,60,64],[45,52,57,61]];
function note(start,midi,duration,level,kind){
 const f=hz(midi),n=Math.floor(duration*rate);
 for(let i=0;i<n;i++){
  const t=i/rate,p=2*Math.PI*f*t;
  const attack=Math.min(1,t/(kind==='pad'?.45:.014));
  const release=Math.min(1,(duration-t)/.28);
  const wave=kind==='bell'?Math.sin(p)+.30*Math.sin(p*2)+.12*Math.sin(p*3):kind==='pluck'?Math.sin(p)+.25*Math.sin(p*2)+.09*Math.sin(p*3):Math.sin(p)+.12*Math.sin(p*2);
  const envelope=attack*release*(kind==='pad'?Math.sin(Math.PI*t/duration)**.6:Math.exp(-t/(kind==='bell'?1.05:.60)));
  mix[(Math.round(start*rate)+i)%count]+=level*wave*envelope;
 }
}
for(let bar=0;bar<8;bar++){
 const c=chords[bar],time=bar*4;
 for(const pitch of c)note(time,pitch,4.7,.045,'pad');
 const pattern=[0,1,2,1,3,2,1,2];
 pattern.forEach((p,i)=>note(time+i*.5,c[p]+12,1.7,i%2?.045:.063,'pluck'));
 note(time+.25,c[2]+24,3.6,.045,'bell');
 if(bar%2===1)note(time+2.75,c[3]+12,2.6,.035,'bell');
}
// Circular overlap retains the note tails at the loop boundary.
const peak=Math.max(...Array.from({length:32},(_,s)=>Math.max(...mix.slice(s*rate,(s+1)*rate).map(Math.abs))));
const wav=Buffer.alloc(44+count*2);
wav.write('RIFF');wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);
wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(count*2,40);
for(let i=0;i<count;i++)wav.writeInt16LE(Math.round(mix[i]/peak*.65*32767),44+i*2);
writeFileSync(new URL('../public/battle9/assets/violet-market.wav',import.meta.url),wav);
console.log(`Original 32-second mono loop: ${wav.length} bytes, peak 0.65, no clipping.`);
