# Battle 13 verification — 26 October 2026

## Executed locally

- Full repository test run: **336 passed, 0 failed**. Includes 20 new Territory Wars SQLite/D1 tests and existing battle tests. Two old menu fixtures were extended for the additional thirteenth battle; their existing behaviour assertions remain.
- TypeScript: `pnpm exec tsc --noEmit --incremental false` passed.
- Cloudflare production build passed using the existing Worker configuration and D1 binding.
- Real local HTTP + separate Playwright Chrome contexts at **390 × 844 and 360 × 844** passed. Two phone browser sessions and ten further HTTP clients joined the same new labelled test room. Both screens had no horizontal overflow.
- The actual server-generated QR SVG was rasterised and decoded with jsQR; its payload matched that room's student join URL exactly.
- Browser-tested: room creation, large joining QR, 12 teams, simultaneous shared question, MCQ selection/submission, hidden dashboard answers, opened automatic review, finalisation, Next Question, real 3D canvas tap, zoom, confirmed territory claim, illustrated outcome, refresh recovery, short-answer draft persistence between tabs and refresh, game-only fullscreen enter/exit, reopening QR, confirmed End Game and student-only result restoration. No uncaught browser errors.
- Every browser-created test room is ended in the script's cleanup; tests do not modify existing classroom rooms.

## Server acceptance coverage

The isolated integration suite covers all approved variants and rejection cases, MCQ key, unchanged 20-question order, exact 120-cell map and special counts, twelve unique colours, concurrency across separate store instances, room isolation, automatic and manual marking in both directions, individual and bulk finalisation, stale review revisions, unanswered status, deliberate reveal, action-debt amendments, ten-second server deadline, expiring typing status, each action cost, three-Fortress limit, atomic fortified capture, simultaneous neutral claims, all mystery probability boundaries and once-only activation, Shield and Rebellion targeting, final Crown bonus, Science tie-break and shared ranks, lost-response retries, stale target/resource rejection, pause, final locking, HTTP role gates, private keys and safe joining links.

## Visual verification

Actual screenshots were inspected for the illustrated lobby, teacher fullscreen map, phone MCQ page, phone map and outcome art. Runtime art has been compressed to WebP; original PNGs are retained. The map is a real lightweight Three.js scene, not a flat illustration overlay. Its stylised procedural models are less detailed than the supplied reference image.

## Remaining physical checks

Not yet tested on actual student phones, actual projected QR scanning, mobile on-screen keyboards or older/low-memory GPUs. Chrome touch/portrait emulation and software WebGL are not proof of physical-phone performance. The renderer offers a labelled territory-list fallback if WebGL cannot start. Classroom Wi-Fi quality and real-room supervision remain to be reviewed by the teacher.

The source includes `scripts/verify-territory-browser.mjs` for repeating the browser flow against local or deployed HTTPS. Screenshots and logs are in ignored `outputs/battle13/`.

## Published-site verification

The existing GitHub-to-Cloudflare workflow published Battle 13 at `https://grammartest.grammarclassroom.workers.dev/?battle=13&teacher=1`. The deployed application JS, HTML, map data and CSS were compared to the tested source and matched. The browser flow above also passed against the live HTTPS site using a new labelled test room, which was ended afterwards. Health endpoints for Kitchen, Demolition, Black Market, Lantern Keeper, Museum, Treasure Raid and Territory Wars returned HTTP 200.

Additional follow-up checks passed locally for all 20 questions awarding exactly 20 Science points/Actions, rejection of invalid question-set keys, New Game opening a fresh room, and explicit teacher bookmarks restoring their requested room even when a newer room exists.

## Royal phone presentation revision — 26 October 2026

Student-only visual revision: royal leather/walnut plaques, parchment questions, illustrated counters and navigation, integrated Shield/Rebellion card faces, themed joining/waiting/results and action dialogs. The teacher layout, map renderer/data, question set and server rules are unchanged. Original material PNGs and the exact built-in image-generation prompts are in `artwork/battle13/`.

- All 20 Battle 13 server/integration tests passed again.
- Cloudflare production build passed.
- `scripts/verify-territory-phone.mjs` passed 14 local visual states at 390px and 360px, plus a shortened 390 × 500 viewport. It uses the actual game engine in a local in-memory simulation; it does not prove live multiplayer or physical-phone keyboard behaviour.
- Covered joining, waiting, MCQ, preserved MCQ selection, submitted status, empty/held cards, targeting, territory dialog, committed outcome, short answer, standings and final results. Checked no horizontal overflow, image loading, typed draft persistence through navigation/reload, reachable submit above fixed navigation, and no illustration overlapping the final-results heading.
- Screenshots and the local simulation report are under ignored `outputs/battle13/royal-phone/`. Physical-phone review remains outstanding.
