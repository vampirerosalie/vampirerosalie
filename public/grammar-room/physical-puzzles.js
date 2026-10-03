import {accepts} from './core.js';
import {initialBookOrder,swapBooks,initialDialWord,turnLetter} from './physical-puzzle-data.js';
function node(tag,text,className){const element=document.createElement(tag);if(text!==null&&text!==undefined)element.textContent=text;if(className)element.className=className;return element;}
function button(text,className,click){const b=node('button',text,className);b.type='button';b.onclick=click;return b;}
function arrow(direction){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 24 24');svg.setAttribute('aria-hidden','true');svg.classList.add(direction);const path=document.createElementNS(svg.namespaceURI,'path');path.setAttribute('d','M12 5 21 19H3Z');svg.append(path);return svg;}
export function renderPhysicalPuzzle({host,question,state,audio,onComplete}){
 const shell=node('section',null,`physical-puzzle ${question.type==='books'?'bookshelf-closeup':'lockbox-closeup'}`);
 const instruction=node('p',question.prompt,'physical-instruction');shell.append(instruction);
 const feedback=node('p',null,'physical-feedback');feedback.setAttribute('role','status');feedback.hidden=true;
 let complete=false;
 const reject=()=>{audio.effect('wrong');feedback.hidden=false;feedback.textContent=`Not quite. ${question.hint}`;shell.classList.remove('try-again');void shell.offsetWidth;shell.classList.add('try-again');};
 const solve=()=>{if(complete)return;complete=true;audio.effect('correct');shell.classList.add('mechanism-solved');shell.querySelectorAll('button').forEach(b=>b.disabled=true);feedback.hidden=false;feedback.textContent=question.feedback;feedback.classList.add('success');onComplete();};
 if(question.type==='books'){
  state.order??=initialBookOrder(question.tiles);let selected=null;
  shell.append(node('p','Tap a book, then tap another to swap them. Read left to right, shelf by shelf.','mechanism-help'));
  const shelf=node('div',null,'book-shelves');shelf.setAttribute('aria-label','Arrange the books');
  const sentence=node('p',null,'assembled-sentence');sentence.setAttribute('aria-label','Current sentence');
  const paint=()=>{shelf.replaceChildren();state.order.forEach((wordIndex,slot)=>{
   const b=button(null,`spine-book book-colour-${wordIndex%6}${slot===selected?' selected':''}`,()=>{
    if(complete)return;if(selected===null){selected=slot;paint();return;}if(selected===slot){selected=null;paint();return;}
    const previous=selected;state.order=swapBooks(state.order,selected,slot);selected=null;audio.effect('turn');paint();
    [previous,slot].forEach(i=>shelf.children[i].animate?.([{transform:'translateY(-10px)',filter:'brightness(1.4)'},{transform:'translateY(0)',filter:'brightness(1)'}],{duration:260,easing:'ease-out'}));
   });b.setAttribute('aria-label',`Book ${slot+1}: ${question.tiles[wordIndex]}`);b.setAttribute('aria-pressed',String(slot===selected));
   b.append(node('span',String(slot+1),'book-slot'),node('span',question.tiles[wordIndex],'book-word'),node('span','—','book-band'));shelf.append(b);
  });sentence.textContent=state.order.map(i=>question.tiles[i]).join(' ');};
  paint();shell.append(shelf,sentence,feedback,button('Listen to the shelf','mechanism-button',()=>{if(accepts(question,state.order.map(i=>question.tiles[i]).join(' ')))solve();else reject();}));
 }else if(question.type==='seal'){
  const seal=node('div','◇','grammar-seal');seal.setAttribute('aria-hidden','true');shell.append(seal,node('p','Choose the sentence strip that keeps the original tense.','mechanism-help'));
  const strips=node('div',null,'sentence-strips');question.choices.forEach((choice,i)=>{const b=button(null,'sentence-strip',()=>{if(accepts(question,String(i))){b.classList.add('chosen');solve();}else{b.classList.add('rejected');reject();}});b.append(node('span','ABC'[i],'strip-letter'),node('span',choice));strips.append(b);});
  shell.append(strips,feedback);const resting=node('div','· · · · · · · · · ·','sleeping-dials');resting.setAttribute('aria-label','Ten dials waiting for the grammar seal to break');shell.append(resting);
 }else if(question.type==='dials'){
  const letterCount=question.answers[0].length;
  state.letters??=initialDialWord(letterCount).split('');
  shell.style.setProperty('--dial-count',String(letterCount));
  shell.append(node('p',`Turn the dials with the arrows, or swipe a letter up or down. Read positions 1–${letterCount} in order.`,'mechanism-help'));
  const preview=node('div',null,'dial-word');preview.setAttribute('aria-label','Current lock word');
  const rack=node('div',null,'dial-rack'),wheels=[];
  const lock=node('div','LOCKED','lock-status');lock.setAttribute('aria-live','polite');
  const update=()=>{preview.replaceChildren(...state.letters.map(letter=>node('span',letter)));};
  const rotate=(index,delta)=>{if(complete)return;state.letters[index]=turnLetter(state.letters[index],delta);const reel=wheels[index];reel.querySelector('.dial-current').textContent=state.letters[index];reel.querySelector('.dial-previous').textContent=turnLetter(state.letters[index],-1);reel.querySelector('.dial-next').textContent=turnLetter(state.letters[index],1);reel.setAttribute('aria-label',`Dial ${index+1}, ${state.letters[index]}`);reel.animate?.([{transform:`rotateX(${delta>0?-35:35}deg) translateY(${delta>0?-5:5}px)`},{transform:'rotateX(0) translateY(0)'}],{duration:170,easing:'ease-out'});audio.effect('turn');update();if(accepts(question,state.letters.join(''))){lock.textContent='UNLOCKED';audio.effect('clue');solve();}};
  state.letters.forEach((letter,i)=>{
   const unit=node('div',null,'dial-unit');unit.append(node('span',String(i+1),'dial-number'));
   const up=button(null,'dial-arrow',()=>rotate(i,1));up.append(arrow('up'));up.setAttribute('aria-label',`Next letter on dial ${i+1}`);
   const down=button(null,'dial-arrow',()=>rotate(i,-1));down.append(arrow('down'));down.setAttribute('aria-label',`Previous letter on dial ${i+1}`);
   const reel=node('div',null,'letter-reel');reel.setAttribute('aria-label',`Dial ${i+1}, ${letter}`);reel.append(node('span',turnLetter(letter,-1),'dial-previous'),node('strong',letter,'dial-current'),node('span',turnLetter(letter,1),'dial-next'));
   let startY=null;reel.addEventListener('pointerdown',e=>{e.preventDefault();startY=e.clientY;reel.setPointerCapture(e.pointerId);});reel.addEventListener('pointerup',e=>{if(startY!==null&&Math.abs(e.clientY-startY)>18)rotate(i,e.clientY<startY?1:-1);startY=null;});reel.addEventListener('pointercancel',()=>startY=null);wheels.push(reel);unit.append(up,reel,down);rack.append(unit);
  });
  update();shell.append(preview,rack,lock,feedback,button('Try the lock','mechanism-button',()=>{if(accepts(question,state.letters.join(''))){lock.textContent='UNLOCKED';solve();}else reject();}));
 }
 host.append(shell);
}
