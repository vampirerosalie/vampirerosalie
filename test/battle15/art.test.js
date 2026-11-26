import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { QUESTIONS } from '../../app/battle15/questions.js';

const site = new URL('../../public/', import.meta.url);
const artDir = new URL('battle15/art/', site);
const referenced = new Set(QUESTIONS.flatMap(q => [q.scene, ...q.options.map(option => option.art)]));

test('every story scene, answer face and table illustration ships as a local WebP', () => {
  assert.equal(QUESTIONS.length, 32);
  for (const q of QUESTIONS) {
    assert.equal(q.options.length, 5);
    assert.equal(new Set(q.options.map(option => option.art)).size, 5, 'Distinct faces for question ' + q.id);
    assert.ok(!q.options.some(option => option.art === q.scene), 'Question scene must differ from answer art');
  }
  for (const name of ['table', 'table-phone', 'hero', 'flash', 'extra', 'raise', 'shield',
    'back', 'frame', 'winner-table-wide', 'winner-table-compact', 'chip-1', 'chip-2', 'chip-3']) {
    referenced.add('/battle15/art/' + name + '.webp');
  }
  for (const path of referenced) {
    assert.match(path, /^\/battle15\/art\/[a-z0-9-]+\.webp$/i);
    const bytes = readFileSync(new URL(path.slice(1), site));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', path);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP', path);
  }
  assert.ok(readdirSync(artDir).every(name => !name.toLowerCase().endsWith('.pdf')));
});

test('browser sources omit the keyed bank and the soundtrack has visible attribution', () => {
  const dir = new URL('battle15/', site);
  const clientCode = readdirSync(dir).filter(file => /\.(?:html|js)$/.test(file))
    .map(file => readFileSync(new URL(file, dir), 'utf8')).join('\n');
  assert.doesNotMatch(clientCode, /bank\.json|art\.json|correctId/);
  for (const q of QUESTIONS) assert.ok(!clientCode.includes(q.correctId));
  assert.match(clientCode, /Backbay Lounge/);
  assert.match(clientCode, /Kevin MacLeod/);
  assert.match(clientCode, /creativecommons\.org\/licenses\/by\/4\.0/);
  assert.ok(readFileSync(new URL('battle15/audio/backbay-lounge.mp3', site)).length > 100000);
});
