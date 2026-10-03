# The Grammar Room: The Missing Word

Battle 5 is a standalone mobile browser game, with original room/character art and an original synthesized soundtrack. It uses native Canvas 2D and Web Audio, so it needs no game-engine download, server database, or build step. The existing classroom site's teacher lobby links to its QR entry page.

## Published entry points

- Teacher QR page: https://grammartest.vampirerosalie97.chatgpt.site/grammar-room/battle5.html
- Student game: https://grammartest.vampirerosalie97.chatgpt.site/grammar-room/index.html

## Change the QR destination

Open `config.js` in this folder and replace `PASTE_GAME_URL_HERE` with the complete hosted game URL, including `https://` and `/index.html` when applicable. Keep the quotes. Both the QR code and Enter the Game button use this one value.

If you leave the placeholder unchanged, the page automatically links to `index.html` in the same folder. Thus the supplied published QR page works immediately. A QR pointing at localhost only works on that computer; use a public URL for students.

## Test locally

From the `grammartest` project directory, with Node.js installed:

```powershell
node scripts/serve-battle5.mjs
```

Open `http://localhost:4175` for the game or `http://localhost:4175/battle5.html` for the QR page. Stop the server with Ctrl+C. Do not double-click the HTML files: browsers restrict JavaScript modules on file URLs.

For a phone on the same Wi-Fi, open `http://YOUR_COMPUTER_LAN_IP:4175/battle5.html`. The QR will then use that LAN address. The computer's firewall must permit the local server on a trusted private network. For classroom use, prefer the published HTTPS URL above.

Run the game logic checks from the same project directory:

```powershell
node scripts/test-battle5.mjs
node scripts/test-battle5-animation.mjs
node scripts/test-battle5-physical.mjs
```

## Host on another static web host

1. Upload every file in this folder together, retaining filenames and relative paths, to a static host supporting HTTPS and JavaScript modules.
2. Open the hosted `index.html` and play on a phone. Keep `room.png`, `walking-sheet.png`, all JavaScript files, and both CSS files beside it.
3. Open `battle5.html`. With the placeholder unchanged, its QR automatically points to the colocated game. If the game is hosted somewhere else, update `config.js` as above and upload it again.
4. Link your teacher's Battle 5 button to the hosted `battle5.html`.

This folder can be hosted separately from the existing classroom site. No backend is needed. Optional Google Fonts fall back to local serif/sans-serif fonts if unavailable. QR generation uses the included QRCode.js library locally.

## Controls and progress

- Phone: hold the direction buttons to walk; explore freely and tap A when a nearby object offers an interaction prompt. There are no object markers or floor rings.
- Desktop: WASD or arrows; Space or Enter to interact. Direction buttons also support keyboard activation.
- Puzzles pause movement. Close a puzzle to explore; completed questions remain completed during this page session.
- Reloading starts a new session. No student names or answers are sent to a server.
- The bookshelf has two physical puzzle stages and the lockbox has a grammar seal plus four word locks; the other four objects each have four questions. All six objects must be complete before the password is accepted; the final grammar seal must also be correct.
- The mute button controls music and effects. Music starts after Start Game and pauses when the page is hidden.

## Replace audio and artwork

The soundtrack and effects are synthesized, not copyrighted recordings. To supply audio files, put them in this folder and set the matching paths in `AUDIO_FILES` at the top of `audio.js` (`music`, `open`, `correct`, `wrong`, `clue`, `door`, `turn`). Null uses the built-in synthesis. The music replacement loops.

Room and character were created with the built-in image-generation tool. Exact prompts are in `ART-PROMPTS.txt`. The room is 1536×1024. The transparent `walking-sheet.png` has four direction rows (down, up, left, right), with six stride poses and two neutral/breathing poses per row. `animation.js` uses a foot-anchored atlas, eight-frame walking sequence and two-frame idle animation. Animation advances by actual distance travelled, so collision or releasing movement returns to idle. The character is 216 room pixels tall (increased from 184). Atlas extraction isolates the main connected character in each cell, excluding stray pixels from neighbouring rows; the left-facing feet stay anchored to the floor.

Interaction positions and furniture collisions are in `core.js` and must be adjusted if furniture moves in replacement art. Controls use SVG triangles, with Safari selection/callout gestures disabled on the game surface; answer fields remain editable. The two typed tense questions include `(play)` and `(blow)` cues.

The bookshelf has two tap-to-swap book arrangements. The lockbox has a passive-voice sentence-strip seal, followed by four meaning-based word locks with alphabet dials, all starting at A; arrows or vertical swipes turn the letters. A clue is earned only after every stage for that object. The new stage definitions live in `physical-puzzle-data.js`, and the functional close-ups in `physical-puzzles.js` and `physical-puzzles.css` reuse the room art without placeholder assets.

The question bank is in `questions.js` and follows the supplied brief, including the specified clock-tense wording. Typed answers ignore case, surrounding/repeated spaces and trailing full stops; full sentences are checked against the supplied grammatical variants, rather than loose keyword matching.

Third-party QR library: QRCode.js 1.0.0, copyright David Shim, MIT license; see `QRCODE-LICENSE.txt`.
