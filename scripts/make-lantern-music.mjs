// Original, wordless Battle 10 loop. Run with: node scripts/make-lantern-music.mjs
// Gentle 6/8 coastal theme: celesta, muted strings, harp, and a low lantern pulse.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const sampleRate = 24000;
const eighth = 0.4;
const bar = eighth * 6;
const bars = 16;
const seconds = bars * bar;
const samples = Math.round(seconds * sampleRate);
const mix = new Float32Array(samples);
const output = fileURLToPath(new URL('../public/battle10/assets/lantern-house-theme.wav', import.meta.url));

const hz = semitone => 440 * 2 ** ((semitone - 69) / 12);
function tone({ at, length, note, gain, partials, attack = 0.01, release = 0.25, vibrato = 0 }) {
  const start = Math.max(0, Math.floor(at * sampleRate));
  const count = Math.min(samples - start, Math.floor(length * sampleRate));
  const frequency = hz(note);
  for (let i = 0; i < count; i++) {
    const t = i / sampleRate;
    const envelope = Math.min(1, t / attack) * Math.min(1, (length - t) / release);
    const phase = 2 * Math.PI * frequency * (t + vibrato * Math.sin(2 * Math.PI * 4.1 * t) / frequency);
    let wave = 0;
    for (const [harmonic, level] of partials) wave += level * Math.sin(phase * harmonic);
    mix[start + i] += gain * envelope * wave;
  }
}

// D minor, B-flat, F, C: a warmer, more hopeful sound than Battle 9's market cue.
const chords = [
  { pad: [50, 57, 62], harp: [62, 69, 74], bass: 38 },
  { pad: [46, 53, 58], harp: [58, 65, 70], bass: 34 },
  { pad: [53, 57, 60], harp: [60, 65, 69], bass: 41 },
  { pad: [48, 55, 60], harp: [60, 67, 72], bass: 36 },
];
const pad = [[1, 0.55], [2, 0.17], [3, 0.08]];
const bell = [[1, 0.78], [2, 0.12], [3, 0.3], [4, 0.06]];
const harp = [[1, 0.75], [2, 0.19], [3, 0.08]];
const low = [[1, 0.8], [2, 0.11]];
const melodies = [
  [[0, 74], [2, 77], [3, 76], [5, 74]],
  [[0, 70], [2, 74], [3, 72], [5, 70]],
  [[0, 69], [2, 72], [3, 74], [5, 72]],
  [[0, 67], [2, 72], [3, 76], [5, 72]],
  [[0, 77], [2, 79], [3, 77], [5, 74]],
  [[0, 74], [2, 77], [3, 79], [5, 77]],
  [[0, 76], [2, 74], [3, 72], [5, 69]],
  [[0, 72], [2, 70], [3, 69], [5, 67]],
];

for (let measure = 0; measure < bars; measure++) {
  const start = measure * bar;
  const chord = chords[measure % chords.length];
  for (const note of chord.pad) tone({ at: start, length: bar, note, gain: 0.028, partials: pad, attack: 0.6, release: 0.65, vibrato: 0.003 });
  for (const step of [0, 3]) tone({ at: start + step * eighth, length: 1.1, note: chord.bass, gain: 0.035, partials: low, attack: 0.04, release: 0.7 });
  for (let step = 0; step < 6; step++) {
    const note = chord.harp[[0, 1, 2, 1, 2, 1][step]];
    tone({ at: start + step * eighth, length: 0.67, note, gain: step === 0 || step === 3 ? 0.034 : 0.024, partials: harp, attack: 0.004, release: 0.45 });
  }
  const phrase = melodies[measure % melodies.length];
  for (const [step, note] of phrase) {
    tone({ at: start + step * eighth, length: step === 5 ? 0.4 : 0.72, note, gain: 0.056, partials: bell, attack: 0.006, release: 0.37 });
  }
}

// Quiet stereo-free echo keeps the small loop light enough for classroom Wi-Fi.
for (const [delaySeconds, strength] of [[0.23, 0.13], [0.47, 0.075]]) {
  const delay = Math.round(delaySeconds * sampleRate);
  for (let i = samples - 1; i >= delay; i--) mix[i] += mix[i - delay] * strength;
}

let peak = 0;
for (let i = 0; i < samples; i++) {
  const edge = Math.min(1, i / (sampleRate * 0.22), (samples - 1 - i) / (sampleRate * 0.45));
  mix[i] *= Math.max(0, edge);
  peak = Math.max(peak, Math.abs(mix[i]));
}
const scale = 0.74 / peak;
const wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28);
wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, mix[i] * scale)) * 32767), 44 + i * 2);
writeFileSync(output, wav);
console.log(`Wrote ${output} (${seconds.toFixed(1)} s, ${wav.length} bytes)`);
