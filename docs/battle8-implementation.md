# Battle 8 implementation map

- Battle 6 is Witch’s Potion: `app/battle6.tsx` (`TeacherPotion`, `StudentPotion`) and `app/api/game/route.ts` (`potionCommand`, answer submission, `startCountdown`, `markMissing`). Its teacher review drawer and phone countdown establish the classroom interaction.
- Battle 7 is Crazy Kitchen, also the Kitchen Battle: `public/battle7/app.js` (teacher, projector and student routes, QR/PIN, retry receipts), `app/battle7/core/game.js` (`GameStore` room/action authority and continuous cooking), `app/battle7/d1-store.js` (D1 compare-and-swap room writes and presence), `app/battle7/http.js` (server API and QR). Its continuous answering-plus-actions pattern is the basis for Battle 8.
- The registry/menu is `app/page.tsx` (`BATTLE_CHOICES` and both battle selectors). Battle 8 is added there as a direct route to `public/battle8/index.html`; it does not replace the Battle 6 or 7 routes or their state.
- Battle 8 has separate server-side D1 tables, opaque teacher/team tokens, idempotent action receipts, independent question and card state, and one authoritative absolute countdown. Students receive only card-back IDs for unchosen offers and no answer keys.
- The V03 prototype and supplied raster assets provide the house art and parchment/wood visual direction. The canonical Form 3 JSON is copied unchanged to `app/battle8/data/question-bank.json` and imported only by the server route.

## Verification and limits

- `test/battle8/core.test.js` checks the fixed bank, 12 starting pieces, independent shared answers, manual rewards, mixed blind cards, sabotage, deadlines, final lock, role boundaries and retry safety.
- `test/battle8/d1.test.js` exercises real SQLite semantics with 40 overlapping joins, 40 submissions/reviews, concurrent draw/choice attempts, a lost response after a durable write, and a loaded 40-team room at question 21.
- The existing `test/battle7/*.test.js` suite is unchanged. Build, TypeScript and lint checks were run separately.
- Local teacher, public projector and student tabs were checked with one real room. The phone layout was inspected at 390 px and 430 px without horizontal overflow; an unopened offer survived a reload.
- This is not a classroom-scale Cloudflare load test. The supplied card weights remain provisional balance settings. Check the release record for publication status.
