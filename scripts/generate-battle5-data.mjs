import fs from 'node:fs';
import {bookshelfStages,lockboxStages} from '../public/grammar-room/physical-puzzle-data.js';
const source=fs.readFileSync(process.argv[2], 'utf8').replace(/\r/g,'');
const specs=[['bookshelf','Bookshelf','S'],['clock','Old clock','E'],['table','Study diary','C'],['lockbox','Lockbox','R'],['mirror','Enchanted mirror','E'],['window','Moonlit window','T']];
const parts=source.split(/OBJECT \d: /).slice(1);
const unquote=s=>s.trim().replace(/^[“"]|[”"]$/g,'');
const objects=specs.map(([id,name,letter],i)=>{
 const part=parts[i].split('\nFINAL DOOR\n')[0];
 const intro=unquote(part.split('Object message before puzzle:')[1].trim().split('\n\n')[0]);
 const questions=[...part.matchAll(/Question (\d) — ([^\n]+)\n([\s\S]*?)(?=\nQuestion \d|\nAfter all 4 questions:)/g)].map(m=>{
  const body=m[3]; const prompt=body.split('Correct answer:')[0].trim();
  const choices=[...prompt.matchAll(/^([A-D])\. (.+)$/gm)].map(x=>x[2].trim());
  const correct=body.split('Correct answer:')[1].split(/\n\n(?:Accepted answers?:|Hint:)/)[0].trim();
  const accepted=body.match(/Accepted answers?:\n([\s\S]*?)\n\nHint:/)?.[1].split('\n').filter(Boolean)??[correct];
  const hint=body.split('Hint:')[1].split('Feedback after correct:')[0].trim();
  const feedback=unquote(body.split('Feedback after correct:')[1]);
  const isTiles=m[2].includes('rearrangement');
  const lines=prompt.split('\n').filter(x=>!(/^[A-D]\. /.test(x)));
  const tiles=isTiles?lines.find(x=>x.includes(' / ')).split(' / '):undefined;
  return {label:m[2],type:choices.length?'mcq':isTiles?'tiles':'text',prompt:lines.filter(x=>!isTiles||!x.includes(' / ')).join('\n').trim(),choices,answers:choices.length?[String('ABCD'.indexOf(correct))]:accepted,hint,feedback,...(tiles?{tiles}:{})};
 });
 const reward=unquote(part.split('After all 4 questions:')[1].split('Show:')[1].split('\n\nSet:')[0]);
 return {id,name,letter,intro,reward,questions};
});
if(objects.some(x=>x.questions.length!==4)) throw Error('Expected exactly four questions per object');
// The teacher requested base-verb cues so these assess tense rather than guessing a verb.
objects.find(o=>o.id==='clock').questions[1].prompt=objects.find(o=>o.id==='clock').questions[1].prompt.replace('children ___ outside','children ___ (play) outside');
objects.find(o=>o.id==='window').questions[1].prompt=objects.find(o=>o.id==='window').questions[1].prompt.replace('wind ___ outside','wind ___ (blow) outside');
Object.assign(objects.find(o=>o.id==='bookshelf'),{intro:'Two enchanted shelves hold a golden letter. Put the books in order to release it.',reward:'A golden letter slips from between the books: S',questions:bookshelfStages});
Object.assign(objects.find(o=>o.id==='lockbox'),{intro:'A grammar seal and four word locks protect the lockbox. Break the seal, then use each meaning clue to spell its word with the letter dials.',questions:lockboxStages});
const reading=unquote(source.split('Reading text:')[1].split('Question 1')[0]);
const finalPart=source.split('Question — Final mixed grammar, MCQ')[1].split('\nENDING')[0];
const finalQuestion={label:'The final grammar seal',type:'mcq',prompt:'Choose the best sentence:',choices:[...finalPart.matchAll(/^[A-D]\. (.+)$/gm)].map(x=>x[1].trim()),answers:['1'],hint:finalPart.split('Hint:')[1].split('Feedback after correct:')[0].trim(),feedback:unquote(finalPart.split('Feedback after correct:')[1])};
fs.mkdirSync('public/grammar-room',{recursive:true});
fs.writeFileSync('public/grammar-room/questions.js',`// Question bank transcribed from the supplied Battle 5 brief.\nexport const objects = ${JSON.stringify(objects,null,2)};\nexport const reading = ${JSON.stringify(reading)};\nexport const finalQuestion = ${JSON.stringify(finalQuestion,null,2)};\n`);
