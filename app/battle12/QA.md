# Treasure Raid integration verification — 2026-10-23

This is a personal-review build, not a claim of classroom readiness.

## Executed before publication

- Supplied untouched prototype: `node test.cjs` → **464 checks pass**; `node phone-test.cjs` → **67 checks pass**. These are baseline single-browser checks, not multiplayer evidence.
- Integrated repository: `node --test "test/**/*.test.js"` → **271 tests pass**, including twelve new Treasure Raid suites. An initial eleven-tab menu expectation was updated to twelve; existing battle behavior was not changed.
- `pnpm run build:cloudflare` → success, including `/api/treasure/:path+` and all previous routes.
- Exact source comparison: all ten PNGs and the content JSON match the source ZIP byte for byte.
- D1/HTTP tests use asynchronous SQLite-backed D1 adapters and independent store instances: 40 concurrent joins, reconnect/isolation, authenticated teacher review, student endpoint rejection, raw-answer retention, normalization, manual unmatched acceptance, one-time awards, stale question/review prevention, lost response retries, resource concurrency, shields/attack limits/duplicate cards, pause, all eighteen questions, final banking/pass, shared winners and explicit termination.
- API tests verify the default host state contains no submitted answer text, public/student payloads contain no key, expired rooms return safe JSON errors with no redirect, and all post-end resource/submission/marking writes are rejected.
- Real **local Cloudflare Worker + D1** smoke script: three concurrent name-only joins; actual room QR SVG matched and decoded to its student-only link; all nine image responses; teacher submission/acceptance; repeated receipt replay; exploration; pause/resume; banking; protected endpoints; confirmed immediate end; preserved results and student identity. Test rooms closed afterwards.

## Browser observations

Separate browser storage contexts: in-app browser teacher and Chrome student. Label: TEST Laptop Crew. Local test room 17307 closed after checking.

- Created room, joined by name without group selection, started shared question, submitted, marked in a separate teacher review page, explored, cancelled an exploration without spending, and banked after the second accepted answer.
- Exploration prompt showed only destination art/name/cost and a last-Action reminder, no odds or location reward hints. Actual exploration outcome appeared after confirmation.
- QR opened from the active dashboard. Teacher reader showed its illustration beside complete paragraph text; no text baked into images.
- 390 × 844 and 360 × 800 portrait views: document scrollWidth equalled viewport width (390/360). Navigation and draft retention verified. All nine image elements loaded successfully; paragraph 3 was rechecked after its initial asynchronous loading sample.
- Reader remembered the previously selected paragraph through reload. The student's typed answer survived reading navigation. Banked Vault 3 survived reload.
- End confirmation Cancel preserved active play. Confirmed end produced the same Vault 3 result on the student screen. Reload, Back and a direct teacher/review URL attempt stayed on `/battle12/?join=17307`, with no teacher controls.
- Teacher music playback reached the on state; stopped through its control. No student audio control. Volume and browser playback are local, independent of game state.
- Final student and teacher browser error/warning checks were empty. Runtime CommonJS import incompatibility and an intermediate guard typo were found during development, corrected and retested before publication.

## Remaining real-world verification

- No physical phone camera scan or mobile soft-keyboard testing was possible here. QR decoding and portrait viewport simulation are not a substitute.
- No classroom Wi-Fi / mobile-data load test or forty physical-device test. Concurrency coverage is automated server testing.
- Audio was verified to start in a browser, not reviewed for loudness on classroom speakers. The recording repeats with a short volume fade, not a claimed sample-perfect seamless loop.
- Identity depends on the same browser's saved capability. Clearing storage / switching browsers requires a new join; no unsafe name-only account recovery was added.
- A teacher review window remains visible on a mirrored display. Use an extended/private display when projecting the ordinary dashboard.

## Publication check

The existing GitHub → Cloudflare workflow is used. Run `scripts/verify-battle12.mjs` against the live origin after deployment; it verifies the frontend SHA, performs the real backend flow with clearly labelled test participants and closes its own new room. Record the live result in the delivery message; successful local tests alone do not prove deployment.
