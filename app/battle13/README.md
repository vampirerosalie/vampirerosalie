# Battle 13 — Territory Wars

Integrated in the existing classroom shell at `/?battle=13&teacher=1`. The student join QR opens `/battle13/index.html?join=PIN`. Existing battles retain their own engines, state and assets.

## Teacher workflow

1. Choose **Set 1 — Form 1 Science, Chapter 6**, then Create a new room.
2. Display the large lobby QR. Two to twelve teams enter names, one participating phone per team. Edit team names or swap their colours in the lobby.
3. Start Game. The question/review panel is left; the interactive kingdom is right. Optional ten-second countdown closes only answers, not territory play. **Pause actions** separately controls territory moves.
4. **Review answers** opens the submitted answers and automatic suggestions. Accept/Mark wrong overrides them. Finalize individually or all remaining answers. **Reveal answer** is deliberate. **Next Question** appears after finalisation.
5. Show joining QR and game-only fullscreen remain available. End Game requires confirmation and locks results. New Game creates a fresh room. Students remain on their own results page.

An open answer review is visible on a projector mirroring the teacher screen. Closed review data is not present in normal dashboard responses.

## Question sets

`sets/science-f1-ch6.json` is the server-only approved 25-question bank. The first 20 questions came from the supplied specification; five additional Lesson 2 questions were appended with the user's wording and answers.

To add Set 2: add a reviewed JSON bank with a unique `id`, `title`, `subject`, and ordered `questions`; import it in `sets.js` and add it to `SETS`. The selector automatically lists available sets. Both MCQs and short-answer sets use the same engine. Do not put answer banks in `public/` or import `sets.js` into the browser. A set is fixed once its room starts.

## Authoritative multiplayer

The API is `/api/territory/*`, reusing the site's Cloudflare Worker and D1 binding. `d1-store.js` follows the existing Battle 12 compare-and-swap store pattern, using separate `territory_rooms` and `territory_presence` tables. No schema or data of other battles is changed. Separate requests/Worker instances atomically retry against the current version. The browser polls roughly every 1.8 seconds; this is real cross-device server state, not localStorage simulation. Local storage holds only credentials, drafts and retry receipts.

Teacher/student credentials are room-scoped capabilities. PIN and URL flags do not grant teacher rights. The server checks role, phase, question, action balance, tile version, inventory and resource version. Receipts make retries idempotent. A stale territory request requires fresh confirmation, and spends nothing. Disconnected clients retain their team identity and state.

Full action history is retained on the server and available in authenticated teacher review responses. Students receive only their own action log; the projected host view receives no private card/Shield log. Final-mark corrections adjust Science and Action balances. Spent Actions can create a visible debt repaid by future rewards; completed map moves are never rolled back.

## Permanent mysteries and secret Shields

New rooms use `mysteryRules: 2`: 112 claimable territories (including the Crown) and eight permanently unowned mystery locations. Artwork, geometry and all 120 IDs are unchanged. Each team can explore each mystery once for one Action. Personal exploration persists through refresh/reconnection and is never shared with opponents. The fog stays in place; only the exploring team sees its check mark.

The authoritative draw is 30% Shield, 30% Rebellion, 20% random steal, 20% random loss. A steal chooses an enemy territory without a Fortress. A loss chooses any owned non-mystery territory, including the Crown or a Fortress. Shields remain in the eligible draw and block the chosen effect once, without a redraw. No eligible target means no land affected; the visit and Action are consumed. A successful loss clears that territory's Fortress. The Crown bonus follows its final owner as before.

Cards and placed Shields are visible only to their owner. Placing a Shield costs no Actions and protects one owned territory against one capture, Rebellion, mystery steal or mystery loss. Placement does not change the public tile version or appear in opponents' logs. It still uses the team's resource version and atomic room transaction to reject duplicate/stale actions. Card use is disabled on mystery locations server-side.

Rooms created before this update retain their original once-per-room mystery rules to avoid removing existing land or changing an ongoing game's scoring. Create a new room to use permanent mysteries. Locked results stay unchanged. Shield privacy applies to both versions.

## Other explicit edge-case choices

- Legacy rooms split their 35% card outcome equally between Shield and Rebellion.
- A Shield blocks a Rebellion by consuming both cards; no Action points are spent.
- Explicit early End Game also applies the one-time final Crown bonus. The confirmation explains this, and unfinalised answers earn nothing.
- Set 1 has 25 questions, including five additional Chapter 6 · Lesson 2 questions (21–25). Future banks may have their own count; labels and Science maximum derive from the selected set.
- Rooms expire after 48 hours, following the existing room pattern. Reconnection is possible until expiry.

## Artwork and 3D

Original 2D background and outcome art: `artwork/battle13/source/`; runtime WebP files and manifest record their destinations. UI text, buttons, counters and answer inputs are real HTML.

`client/kingdom.js` constructs the real selectable Three.js miniature scene (mesh ground, models, clouds, mountains, bridges, rainbow and water). The fixed 120-ID map is in `public/battle13/map-data.js`: 111 ordinary lands, eight Mysteries and one Crown. Ground ownership changes independently of decorative materials. The lightweight procedural models deliberately use less detail than the reference illustration. Rendering is on demand, with batched static geometry and capped pixel ratio. No remote 3D CDN is needed.

Drag to pan, pinch/scroll to zoom, right-drag/two-finger rotate; select a tile by tapping. A labelled territory list provides an accessible alternative and WebGL-failure recovery. All choices still pass through the same server confirmation checks.

## Development and verification

`pnpm run test:battle13` runs the isolated SQLite-backed D1 concurrency/API tests.
`pnpm run build:cloudflare` rebuilds the self-hosted 3D bundle and site using the established deployment configuration.
`node scripts/verify-territory-browser.mjs http://localhost:3013` exercises the real teacher and student browser flow. It needs Playwright/Sharp installed or exposed through `NODE_PATH`; it creates labelled test teams in a fresh room and ends only that room in cleanup.

Browser emulation is not physical-phone testing. Real device GPU performance, on-screen keyboards and scanning a projected QR with a physical camera still need teacher review.
