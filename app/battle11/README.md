# Battle 11 — The Missing Museum Jewel

Local implementation of the six-station detective reading game. It uses the existing Cloudflare D1 binding `DB`, the same room-capability pattern as Battles 7–10, and its own `museum_rooms` and `museum_presence` tables. Schema creation occurs when the API is first used. There is no paid service, new credential, or live deployment in this change.

## Run and try

1. Start the existing site with `pnpm run dev`.
2. Open `/?battle=11&teacher=1` on the teacher computer. A room-specific joining QR and five-digit PIN appear.
3. Open `Print Station Cards` and print all six cards from `/battle11/cards.html`. They are permanent and can be reused with later rooms. Each card also has a printable backup code for a camera that cannot scan.
4. Join one group from a second browser/device using the teacher joining QR, then press `Start Game` on the teacher screen.
5. On the group phone, tap `Scan Station QR` and scan any printed station card. The map does not open paragraphs directly. A group can save an A–H answer and leave early, or its visit expires after five minutes.
6. After six distinct stations have saved answers, Review Mode unlocks. Final Submission locks the group's six choices. The teacher may separately `Reveal Results` and `End / Close Room`.

The six QR payloads are the permanent, room-independent `STATION_PAYLOADS` in `core/game.js`; the card page reads them from the same server configuration. A new class creates a new *joining* QR, not new station QR codes. The correct key lives only in `data.js` on the authoritative server; it is not sent to students until the teacher deliberately releases results.

## Rules and safety

The room accepts up to 40 groups; the six stations admit at most two groups each, so only 12 may be inside at a time. The D1 compare-and-swap store handles simultaneous admissions, answer moves, and submissions. Every visit has a server timestamp and expires 300 seconds after admission; refreshing cannot renew it. Station 1 → 1 is blocked during exploration, whereas Station 1 → 2 → 1 is legal. A full-station rejection does not count as an intervening visit. Review permits consecutive revisits but still requires scanning and a free slot.

Normal teacher projection shows occupancy, connection and saved-answer indicators, not chosen letters or the key. Results and paragraph solutions appear on that same screen only after teacher release; do not project it if you intend the solutions to stay private. Timed access does not prevent photos, notes or sharing already-seen text outside the game.

## Tests and remaining physical checks

`node --test test/battle11/core.test.js test/battle11/d1.test.js` covers exact content, all six codes, two-slot admission including simultaneous scans, cross-room isolation, expiry, reconnection, route restrictions, ungraded saves, atomic answer moves, review, final scores and ranking. The whole repository test suite and `pnpm run build` also pass locally. A browser check joined a local room and showed the live teacher roster/student map. The actual phone rear-camera permission/scanning, paper print contrast and classroom network across physical devices still need to be tried before class.

## Artwork

Seven original generated paper-cut illustrations are stored in `public/battle11/assets` and listed in `assets/manifest.json`. Text, answers, buttons and QR patterns are real HTML/SVG and are not baked into the artwork.

## 2026-10-24 museum visual refresh

Added `public/battle11/museum-theme.css`: local Georgia/system typography, red velvet and parchment materials, a prominent lobby QR, teacher case desk beside six numbered station tiles, and the full progress table below. Existing museum hero art is reused and compressed; material provenance is in `assets/ui/manifest.json`. No music installed pending the owner's selection. No changes to passages, options, scoring, admissions, timers, server code or permanent printed cards.

Verification: all 305 repository tests passed; Cloudflare production build passed. Local HTTP smoke check (`node scripts/verify-battle11-theme.mjs http://localhost:3016`) passed in disposable room 13132, closed afterwards. Actual browser room 14046 tested lobby QR, name join, start, teacher layout at 1214px with no horizontal overflow, student typography at 390/360px, all eight options, station entry using the existing printed-code fallback, save-and-leave, refresh and late-joining QR. Closed only that test room. Physical camera scanning, phone hardware and projector appearance were not tested. The same smoke script can verify deployed file hashes, permanent QR payloads, privacy and the station lifecycle on the existing live origin.

## Approved dark illustrated redesign

Teacher music: optional “Thinking Music” by Kevin MacLeod, enabled with Play music in the lobby/live teacher view. It loops at 18% volume by default, has pause and volume controls, survives UI refreshes without restarting, and stops on room closure or leaving the page. Students do not receive an audio player. The original artist MP3 and attribution are stored in `public/battle11/assets/thinking-music.mp3` and `public/battle11/MUSIC-CREDIT.txt` (CC BY 4.0).

The revised theme uses burgundy panels and antique gold across the teacher dashboard and all student states. Only the paragraph reading surface uses muted parchment; QR codes retain their required white quiet margin. New illustrated phone/teacher surrounds and neutral station emblems have source PNGs and generation provenance in `artwork/battle11-ui/manifest.json`. The original story illustrations are unchanged.

On phones the station map and active reading workspace scroll above separate action controls. All eight sentence options remain fully readable. Draft selection and server-saved status are distinct. UI-only scroll memory retains reading/option position when returning from the answer overview; it does not cache paragraph bodies or change admission rules.

Verification for this revision: 309 repository tests passed, plus the Cloudflare production build. Browser layout checks covered 19 student states at both 360px and 390px (38 checks), including permission errors, expiry, review, confirmation, receipt and results. A separate real local teacher/student session checked joining, timed admission, all options, saving, departure, refresh and reading-position restoration. This is browser verification, not a physical-phone/camera/printed-card test. The local fixture gallery (`node scripts/preview-battle11-layouts.mjs`) binds only to loopback and is not shipped as a student route. No game content, backend rules, permanent station payloads or other battles were changed.
