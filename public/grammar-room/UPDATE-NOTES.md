# September 2026 game update

- Character height increased from 184 to 216 room pixels. Sprite extraction now ignores stray pixels from adjacent rows, fixing the elevated left-facing walk. Left-facing feet remain anchored to the floor throughout the cycle.
- Bookshelf: tap two books to swap their positions. Complete a sentence arrangement, then a passive-voice arrangement to collect S. Selection, swapping and completion have visual feedback.
- Lockbox: choose the correct simple-past passive sentence strip to break the seal. Then solve four meaning clues by spelling their words with alphabet dials, using arrows or vertical swipes, to collect R. The words are mysterious (10 letters), necessary (9), fragile (7) and ancient (7). Every new round starts with all dials at A; the dial count matches the word length. Alphabet rotation wraps in both directions.
- Closing a puzzle preserves its stage and arrangement until the page reloads. Completing one stage does not award a clue; solved objects cannot award duplicates. All six clues, SECRET and the final grammar seal remain required.
- Existing room artwork, walking design, mobile controls and exploration are retained. No object-location sparkles were added. Close-ups reuse room.png with functional CSS books, seal and dials; there are no placeholder assets.

## Changed files

- animation.js: larger character, isolated sprite bounds and grounded left walk.
- physical-puzzle-data.js: two bookshelf stages, five lockbox stages, all-A dial start and pure interaction helpers.
- physical-puzzles.js / physical-puzzles.css: responsive interactive close-ups.
- core.js / game.js: stage-aware progress, puzzle routing, session state and panel scroll reset.
- questions.js / scripts/generate-battle5-data.mjs: updated generated question bank.
- audio.js: dial/book movement sound; index.html: new stylesheet; README.md: updated instructions.
- scripts/test-battle5.mjs / scripts/test-battle5-physical.mjs: stage counts, answers, book swaps, dial alphabet, partial completion gating and sprite floor alignment.

## Validation

Game logic, animation and physical-puzzle checks pass. Phone-sized browser checks cover seal rejection, stage advancement, all-A dials and layout. Actual iPhone Safari hardware testing remains with the teacher.
