import { readFileSync, writeFileSync } from 'node:fs';

const sourcePath = 'C:/Users/HUAWEI/Desktop/Witchs_Potion_English_Game_Prototype_V1.html';
const source = readFileSync(sourcePath, 'utf8');

const questionsMatch = source.match(/const QUESTIONS=(\[[\s\S]*?\]);\s*\nconst COORDS=/);
if (!questionsMatch) throw new Error('Could not find the Witch\'s Potion question bank.');
const questions = JSON.parse(questionsMatch[1]);
if (questions.length !== 60) throw new Error(`Expected 60 questions, found ${questions.length}.`);

const coordsMatch = source.match(/const COORDS=(\{[^\n]+\});/);
if (!coordsMatch) throw new Error('Could not find potion coordinates.');
const coords = JSON.parse(coordsMatch[1]);

const imageMatch = source.match(/\.shelf\{[^}]*background-image:url\("data:image\/png;base64,([^\"]+)"\)/);
if (!imageMatch) throw new Error('Could not find the illustrated potion shelf.');

const dataSource = `export type PotionQuestion = {\n  id: string;\n  category: string;\n  type: 'MCQ' | 'TYPED';\n  prompt: string;\n  answer: string;\n  options: string[];\n  note: string;\n  time: number;\n};\n\nexport const POTION_QUESTIONS: PotionQuestion[] = ${JSON.stringify(questions, null, 2)};\n\nexport const POTION_COORDS: Record<number, readonly [number, number]> = ${JSON.stringify(coords, null, 2)};\n`;

writeFileSync(new URL('../app/battle6-data.ts', import.meta.url), dataSource);
writeFileSync(new URL('../public/witch-potion-shelf.png', import.meta.url), Buffer.from(imageMatch[1], 'base64'));
console.log(`Extracted ${questions.length} questions and the illustrated 40-potion shelf.`);
