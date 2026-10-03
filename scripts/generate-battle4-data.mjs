import { readFileSync, writeFileSync } from 'node:fs';

const [inputPath, questionsPath, answersPath] = process.argv.slice(2);
if (!inputPath || !questionsPath || !answersPath) {
  throw new Error('Usage: node generate-battle4-data.mjs INPUT QUESTIONS_TS ANSWERS_TS');
}

const source = readFileSync(inputPath, 'utf8').replace(/\r\n/g, '\n');
const sectionPattern = /^###\s+(\d+)\.\s*$/gm;
const matches = [...source.matchAll(sectionPattern)];

function plain(value) {
  return value
    .replace(/^---$/gm, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function categoryFor(number) {
  if (number <= 20) return 'VOCABULARY';
  if (number <= 35) return 'GRAMMAR';
  if (number <= 50) return 'EDITING';
  if (number <= 65) return 'READING';
  if (number <= 95) return 'WRITING';
  if (number <= 105) return 'EDITING';
  return 'GRAMMAR';
}

const questions = [];
const answers = {};

for (let index = 0; index < matches.length; index += 1) {
  const number = Number(matches[index][1]);
  const start = matches[index].index + matches[index][0].length;
  const end = matches[index + 1]?.index ?? source.length;
  const block = source.slice(start, end).trim();
  const answerStart = block.search(/^\*\*Jawapan/m);
  if (answerStart < 0) throw new Error(`Question ${number} has no answer marker.`);

  const questionPart = block.slice(0, answerStart).trim();
  const answerPart = block.slice(answerStart).trim();
  const optionMatches = [...questionPart.matchAll(/^([A-D])\.\s+(.+)$/gm)];
  const options = optionMatches.map((match) => plain(match[2]));
  const prompt = plain(questionPart.replace(/^([A-D])\.\s+(.+)$/gm, ''));

  const lines = answerPart.split('\n');
  const explanationIndex = lines.findIndex((line) => /^\*\*Penerangan:/.test(line.trim()));
  const chineseIndex = lines.findIndex((line) => /^\*\*中文解释：/.test(line.trim()));
  const answerEnd = [explanationIndex, chineseIndex].filter((value) => value >= 0).sort((a, b) => a - b)[0] ?? lines.length;
  const answerLines = lines.slice(0, answerEnd);
  answerLines[0] = answerLines[0]
    .replace(/^\*\*Jawapan:\*\*\s*/, '')
    .replace(/^\*\*Jawapan:\s*/, '')
    .replace(/\*\*\s*$/, '');
  let answer = plain(answerLines.join('\n'));

  const explanationLines = explanationIndex >= 0
    ? lines.slice(explanationIndex, chineseIndex >= 0 ? chineseIndex : lines.length)
    : [];
  if (explanationLines.length) {
    explanationLines[0] = explanationLines[0]
      .replace(/^\*\*Penerangan:\*\*\s*/, '')
      .replace(/^\*\*Penerangan:\s*/, '')
      .replace(/\*\*\s*$/, '');
  }
  const chineseLines = chineseIndex >= 0 ? lines.slice(chineseIndex) : [];
  if (chineseLines.length) {
    chineseLines[0] = chineseLines[0]
      .replace(/^\*\*中文解释：\*\*\s*/, '')
      .replace(/^\*\*中文解释：\s*/, '')
      .replace(/\*\*\s*$/, '');
  }
  const malayExplanation = plain(explanationLines.join('\n'));
  const chineseExplanation = plain(chineseLines.join('\n'));
  const explanation = [
    malayExplanation ? `Penerangan: ${malayExplanation}` : '',
    chineseExplanation ? `中文解释：${chineseExplanation}` : '',
  ].filter(Boolean).join('\n\n');

  let optionLetter = null;
  if (options.length) {
    const letterMatch = answer.match(/^([A-D])(?:\.|\b)/);
    optionLetter = letterMatch?.[1] ?? null;
    if (optionLetter) {
      const option = options[optionLetter.charCodeAt(0) - 65];
      if (option) answer = option;
    }
  }

  const id = `BM${String(number).padStart(3, '0')}`;
  questions.push({
    id,
    category: categoryFor(number),
    type: options.length ? 'MCQ' : 'OPEN',
    prompt: `Soalan ${number}\n${prompt}`,
    options,
    timeSec: options.length ? 60 : 90,
  });
  answers[id] = { answer, explanation, optionLetter };
}

if (questions.length !== 120) throw new Error(`Expected 120 questions, found ${questions.length}.`);
for (const question of questions) {
  if (!question.prompt || !answers[question.id].answer || !answers[question.id].explanation.includes('中文解释：')) {
    throw new Error(`Question ${question.id} is incomplete.`);
  }
}

writeFileSync(
  questionsPath,
  `import type { BoardQuestion } from './battle3-data';\n\nexport const BM_BOARD_QUESTIONS: BoardQuestion[] = ${JSON.stringify(questions, null, 2)};\n`,
);
writeFileSync(
  answersPath,
  `// Server-only Battle 4 BM answers and bilingual teaching explanations.\nexport type BmBoardAnswer = { answer: string; explanation: string; optionLetter: string | null };\n\nexport const BM_BOARD_ANSWERS: Record<string, BmBoardAnswer> = ${JSON.stringify(answers, null, 2)};\n`,
);

console.log(JSON.stringify({ questions: questions.length, mcq: questions.filter((question) => question.type === 'MCQ').length, open: questions.filter((question) => question.type === 'OPEN').length }));
