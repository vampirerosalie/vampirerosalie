# Battle 12 — Treasure Raid

Integrated for personal review on the existing grammartest Cloudflare Worker and D1 database. No new hosting service, account, credentials or battle replacement.

## Try it

1. Open `/?battle=12&teacher=1` on the teacher laptop, or `/battle12/?teacher=1` directly.
2. Create a room. Scan its joining QR on a phone and enter only a name. Each name is one independent crew internally; no predefined group selection.
3. The lobby shows a large joining QR and room PIN prominently on the left, above Start question 1 and the joined names. During play the QR is available through **Show joining QR**, not repeated below the map or scores. Read opens all nine illustrated paragraphs on either role.
4. The left teacher desk follows Battle 7: current question, optional **Start 10-second countdown**, **Waiting / Answered** roster, **Review answers**, then **Finalize & reveal answer**. The island and latest confirmed student destinations stay on the right. Answers are not rendered or fetched for review until Review answers opens a dialog on this same page. Close it to hide the answer text; an open dialog is still visible on a mirrored projector.
5. Approved allowlist matches receive an automatic, provisional Accept suggestion. Unmatched submissions remain pending, never automatically rejected. In Review answers use **Accept**, **Mark wrong**, or the explicitly confirmed **Accept all submitted answers** (including unmatched answers). Decisions can be changed until finalization; students see only that their answer was submitted. **Finalize & reveal answer** locks decisions, closes submissions, reveals the answer and awards exactly one Action per accepted answer. Missing answers earn zero. Only then does **Next question** appear. The optional countdown is server-authoritative, lasts exactly ten seconds and cannot restart on refresh. Each student submits once per question, like Battle 7.
6. **Join QR** remains available during play for late arrivals/rejoining. Same browser/device storage restores identity; clearing storage or changing browser does not recover that capability automatically.
7. Normal completion: finalize all 18 questions → final normal play → Final banking → wait for bank/pass → show results. **Pause actions / Resume actions** remains independent: reviewing/revealing and advancing ordinary questions do not change the manual pause setting. Explore/bank still costs one Action, and markers move only after a confirmed resource action.
8. **End Game** is a different, confirmed immediate termination. Only existing Vault totals score; no automatic banking, late marking or further actions. Student links remain student pages.

Keep the teacher browser's storage: the room owner capability is saved there, never in the QR. This uses the site's existing capability-based ownership pattern, not a newly introduced school-wide login service. A URL or PIN alone grants no access to an existing room's teacher endpoints.

## Architecture

- `content.json`: byte-identical supplied nine paragraphs, 18 questions, variants, evidence and tests. SHA-256 `3b5a0deda3144fd817b72d6d00a2f3a0ae76f8a99cac08418cd45e1d98bbe542`.
- `core/engine.js`: supplied V02 rules, converted from its browser/CommonJS wrapper to ESM. Rules/normalization are unchanged. This file and content key are server-only.
- `core/game.js`: role validation, name-only joining, response/turn versions, durable receipts, output redaction, cryptographic per-exploration server entropy, explicit termination and stable rankings.
- `d1-store.js`: existing museum-style D1 compare-and-swap pattern, isolated `treasure_rooms` / `treasure_presence` tables created idempotently in the existing DB. Forty registrations per room, 48-hour room retention. Entire resource transactions retry against the winning version; no localStorage game authority.
- `http.js`, `app/api/treasure/[...path]/route.ts`: same-origin JSON API, protected teacher review and student-safe errors; QR includes only a joining URL.
- `public/battle12`: responsive HTML/CSS/JS and original artwork. No prototype role switcher, RNG, answer bank or demo controls. Local storage is limited to device capabilities, drafts, reader position and retry receipts.
- Shared selection adds Battle 12 without replacing the other battle modules. Its dedicated teacher page keeps a chooser linking back to Battles 1–12.

## Artwork and audio manifest

All art below is supplied original V02 artwork copied from the user's bundle without cropping, stretching or compositing. Portrait readers use contain sizing.

| Asset | Use |
| --- | --- |
| `island.png` | Original 1672 × 941 island map, lobby and exploration |
| `paragraph_01.png` | Ship deck / introduction |
| `paragraph_02.png` | Grandmother's map in the cabin |
| `paragraph_03.png` | Supplies and departure |
| `paragraph_04.png` | Landing on the island |
| `paragraph_05.png` | Alternative route |
| `paragraph_06.png` | Rest and navigation |
| `paragraph_07.png` | Search by the rocks |
| `paragraph_08.png` | Discovery of the chest |
| `paragraph_09.png` | Return to the ship |
| `master-of-the-feast.mp3` | Optional teacher-only music; default off, volume control |

Music: **Master of the Feast**, Kevin MacLeod (incompetech.com), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). [Official track / attribution](https://www.incompetech.com/music/royalty-free/index.html?isrc=USUAN1400019). Downloaded from the composer on 2026-10-23. Original recording, with browser playback fades at the repeat boundary. SHA-256 `7d8c1e5ebfd4c842718fa7c6bd81e8804cd0e743fe1496936f526dd514e65409`. Attribution appears on the teacher screen. No audio requested by student screens.

## Verification

### Shared teacher shell

Teacher entry is `/?battle=12&teacher=1`. Existing direct `/battle12/?teacher=1` or owned `?host=PIN` bookmarks return to that shell. Its persistent Battle 1–12 selector and fullscreen control surround the embedded teacher desk. The inner desk retains the map, same-page review dialog, QR and illustrated reader. Student joins remain direct `/battle12/?join=PIN` links; no student-to-teacher redirect is added. Switching battles does not end a room. The current host PIN is reflected in the outer URL when creating a new room, without remounting the active panel.

### Illustrated discoveries

Six individual transparent PNGs in `public/battle12/assets/rewards/`: `gems.png` (gem pouch), `shield.png` (protection), `raid.png` and `sabotage.png` (held cards), `trap.png` (island mishap), and `vault.png` (banked treasure). Generated separately with the built-in image generator; original prompts are preserved in `reward-art-prompts.json`. No sprite-sheet cropping. The fixed manifest is `public/battle12/reward-art.js`.

Artwork appears only after a committed outcome, or for items already held in the Cards view. A duplicate card shows its actual gem conversion; blocked attacks show the shield. Server metadata selects presentation only: the original engine, probabilities, costs and amounts remain unchanged. Animations respect reduced motion; illustrations use contain sizing rather than stretching.

See `QA.md`. Run `node --test test/battle12/integration.test.js`, the repository suite `node --test "test/**/*.test.js"`, and `pnpm run build:cloudflare`.

`node scripts/verify-battle12.mjs https://grammartest.grammarclassroom.workers.dev` creates a NEW labelled three-participant test room, checks the deployed source/QR/core flow/auth/termination, and closes that room in `finally`. It never selects an existing classroom room and prints no capabilities. Do not run unneeded repetitions during a class.

Publication uses this repository's existing main-branch GitHub push → Cloudflare build/deploy workflow. No paid infrastructure added.
