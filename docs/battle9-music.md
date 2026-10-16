# Violet Market music

Original synthesized instrumental: **Lanterns at the Violet Market**.
Soft bell tones, plucked arpeggios and sustained minor-key chords; no vocals or third-party recordings/samples.
Reproducible offline composition: `node scripts/generate-market-music.mjs`.
Asset: `public/battle9/assets/violet-market.wav` (32 seconds, 22,050 Hz mono PCM16, 1,411,244 bytes).
Note tails wrap across the loop boundary; peak amplitude is limited to 0.65.

The authenticated teacher UI offers Play/Pause and volume, initially off and 18% volume.
Only volume is remembered. The file is fetched lazily on Play; native browser audio handles playback.
The audio object remains independent of game re-renders. No music polling, server commands, database writes, sockets or additional game messages exist.
End-game, room changes, leaving the page or losing the teacher role pause and reset playback.
Student and projector views have no player or audio request. Audio failures remain local and do not block game code.

Verification: 189 Battles 7–9 tests passed, including six player/audio tests. Browser checks covered Play, Pause, volume and game-end stop. TypeScript and production build checked before publishing. The composition is deliberately a simple synthesized loop rather than a professionally recorded track.
