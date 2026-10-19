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
