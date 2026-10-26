import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
// One-time exact import of the owner's approved specification, never a browser bundle.
const source=readFileSync(process.argv[2],'utf8');
const section=source.slice(source.indexOf('# 13. COMPLETE QUESTION BANK'));
const chunks=[...section.matchAll(/\*\*Q(\d+)\. ([\s\S]*?)\*\*([\s\S]*?)(?=\*\*Q\d+\.|## 14\.|$)/g)];
const questions=chunks.map(([,n,prompt,body])=>{
  const number=Number(n),type=number<=12?'mcq':'short';
  const explanation=body.match(/Explanation: ([^\r\n]+)/)?.[1];
  const options=type==='mcq'?Object.fromEntries([...body.matchAll(/^([A-D])\. (.+?)\s*$/gm)].map(m=>[m[1],m[2].trim()])):undefined;
  const answer=type==='mcq'?body.match(/Correct answer: ([A-D]) —/)?.[1]:body.match(/Canonical answer: \*\*(.+?)\*\*/)?.[1];
  const variants=type==='short'?[answer,...[...(body.split('Explanation:')[0]).matchAll(/^- (.+)\r?$/gm)].map(m=>m[1].trim())]:[answer];
  if(!answer||!explanation||(options&&Object.keys(options).length!==4))throw Error('Incomplete Q'+n);
  return {id:'q'+n.padStart(2,'0'),number,type,prompt,options,answer,variants,explanation,week:[11,12,19,20].includes(number)?2:1};
});
if(questions.length!==20)throw Error('Expected exactly 20 questions');
const target=new URL('../app/battle13/sets/',import.meta.url);mkdirSync(target,{recursive:true});
writeFileSync(new URL('science-f1-ch6.json',target),JSON.stringify({id:'science-f1-ch6',title:'Set 1 — Form 1 Science, Chapter 6',subject:'Science',questions},null,2)+'\n');
console.log('Imported all 20 questions verbatim.');
