import science from './sets/science-f1-ch6.json' with {type:'json'};
// Add future reviewed banks here. Private answer keys never enter public/.
export const SETS = Object.freeze({[science.id]:science});
export const setList=()=>Object.values(SETS).map(({id,title,subject,questions})=>({id,title,subject,count:questions.length,types:[...new Set(questions.map(q=>q.type))]}));
export function normalize(value){return String(value).normalize('NFKC').toLowerCase().trim().replace(/[.!?;:]+$/g,'').replace(/[“”"‘’]/g,'').replace(/\s*,\s*/g,',').replace(/\s+/g,' ').trim();}
export const mark=(q,value)=>q.type==='mcq'?value===q.answer:q.variants.some(v=>normalize(v)===normalize(value));
export const publicQuestion=q=>({id:q.id,number:q.number,type:q.type,prompt:q.prompt,...(q.options?{options:q.options}:{})});
