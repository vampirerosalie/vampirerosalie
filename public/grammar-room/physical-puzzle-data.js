export const bookshelfStages=[
 {type:'books',label:'The first shelf',prompt:'Arrange the books to form a correct sentence.',tiles:['The','ancient','books','were','arranged','according','to','their','colours'],answers:['The ancient books were arranged according to their colours'],hint:'Start with “The ancient books”. Read left to right, one shelf at a time.',feedback:'The shelf clicks softly. One row is now in the correct order.'},
 {type:'books',label:'The hidden bookmark',prompt:'Form the passive voice sentence:\nThe librarian had hidden the silver bookmark behind the atlas.',tiles:['The','silver','bookmark','had','been','hidden','behind','the','atlas','by','the','librarian'],answers:['The silver bookmark had been hidden behind the atlas by the librarian'],hint:'Begin “The silver bookmark had been hidden”. Place the location next, then who hid it.',feedback:'A golden letter slips from between the books: S'}
];
export const lockboxStages=[
 {type:'seal',label:'The grammar seal',prompt:'Rewrite this sentence in passive voice:\n“The guard locked the wooden box before sunset.”',choices:['The wooden box was locked by the guard before sunset.','The wooden box locked by the guard before sunset.','The wooden box had been locked by the guard before sunset.'],answers:['0'],hint:'Keep the original simple past tense. The box receives the action: use “was + past participle”.',feedback:'The grammar seal breaks. The letter dials begin to glow.'},
 ...[
  {word:'mysterious',meaning:'Strange and difficult to explain or understand; full of secrets.',hint:'An adjective beginning with “my-”. It describes something that is a mystery.'},
  {word:'necessary',meaning:'Needed; essential for a particular purpose.',hint:'An adjective beginning with “ne-”. Use one “c” and a double “s”.'},
  {word:'fragile',meaning:'Easily broken or damaged.',hint:'An adjective beginning with “fr-”. Handle a glass ornament this way.'},
  {word:'ancient',meaning:'Belonging to the very distant past; thousands of years old.',hint:'An adjective beginning with “an-”, often used to describe Egypt or Rome long ago.'}
 ].map(({word,meaning,hint},i)=>({type:'dials',label:`Word lock ${i+1} of 4`,prompt:`Meaning: ${meaning}\nFind the ${word.length}-letter word.`,answers:[word],hint,feedback:i===3?'The lockbox opens. Inside is a red letter: R':`Word lock ${i+1} clicks open. Another word is waiting.`}))
];
export const dialAlphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
export const initialDialWord=(length)=>'A'.repeat(length);
export function turnLetter(letter,delta){const index=dialAlphabet.indexOf(letter);if(index<0||!Number.isInteger(delta))throw Error('Invalid dial rotation');return dialAlphabet[((index+delta)%26+26)%26];}
export function initialBookOrder(words){return words.map((_,i)=>i).slice(2).reverse().concat([1,0]);}
export function swapBooks(order,from,to){if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=order.length||to>=order.length)throw Error('Invalid book slot');const next=[...order];[next[from],next[to]]=[next[to],next[from]];return next;}
