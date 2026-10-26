# Battle 13 illustrated map — 26 October 2026

Approved fixed-view 2.5D illustration integrated with the real multiplayer game. No backend rules, questions, scoring, map IDs or Mystery Land probabilities changed.

## Asset manifest

- `map-source/kingdom.png`: original approved 1536×1024 illustration; runtime `public/battle13/assets/map/kingdom.webp`.
- `map-source/mist.png`: transparent painted mist; runtime `public/battle13/assets/map/mist.webp`, resized to 384px wide, alpha preserved.
- Both created with the built-in `image_gen.imagegen` tool. No CLI fallback. The first was a new opaque illustration; the second a new transparent sprite. No input reference attached to these calls.
- Original generated files retained in `C:\Users\HUAWEI\.codex\generated_images\01a01939-3b63-78c0-b629-b21f759e139a\exec-289d8eb4-8c40-4dd1-b38c-b043a4a346b7.png` and `exec-6f7ef9d7-efe4-414e-815c-b9c93eb47021.png`.

## Geometry and visual state

`app/battle13/client/illustrated-layout.js` partitions the ten existing illustrated terraces into 119 stone territories. The central castle is the remaining Crown territory. All 120 original backend IDs and numbers remain unchanged; the eight existing mysteries are distributed among eight terraces. Rendering coordinates are separate from authoritative game data.

`illustrated-kingdom.js` renders SVG hit areas above the illustration. Ownership changes the stone colour without adding flags. Castle ownership changes its base line and small gate seal, preserving the original roofs and architecture. The background's decorative painted castle banners are static scenery, not team-ownership markers. Fortress/shield symbols remain visible. Mist is an independent painted layer, hidden only when server state marks that exact territory resolved. Clicking or zooming does not clear it.

Small targets first zoom their terrace; another tap opens the ordinary territory confirmation. Terrace shortcuts and Choose territory remain available on phones. Wheel/pinch zoom, drag pan, keyboard selection, reduced motion, poll updates, resize and disposal are supported. The map uses ordinary image/SVG rendering and does not require WebGL.

The 1536px landscape is fixed-view raster art, so deep zoom is inherently softer than vector overlays. Focus zoom is capped; numbered hit areas and controls remain live SVG/HTML. No free 3D rotation is provided. Physical phones and real classroom conditions are not established by browser simulation.

## Checks

- `node --test test/battle13/*.test.js`: engine/security/concurrency rules and exact layout coverage.
- `node scripts/verify-territory-map.mjs`: isolated engine/browser simulation, all 120 hit targets, eight mist states, claim-only reveal, refresh, all twelve colours, Crown, shield/fortress, keyboard, pan/zoom and 360/390px layouts. Fixtures exist only inside this test script.
- `node scripts/verify-territory-phone.mjs`: existing full illustrated phone flows.
- `node scripts/verify-territory-browser.mjs <base-url>`: separate teacher/student sessions, 12 teams, decodable QR, marking, claims, question navigation, draft preservation, End/New Game, refresh and teacher bookmarks. Results are stored in ignored `outputs/battle13/`.

## Kingdom illustration prompt

Use case: stylized-concept. Asset: a gorgeous production-quality illustrated 2.5D fixed-view kingdom game board background, landscape 3:2 composition. Create a lavish sunlit miniature fantasy kingdom seen from an elevated isometric three-quarter camera. A detailed ivory stone royal castle with many elegant cobalt blue shingled turrets, antique gold finials, bright banners, a broad stairway and arched gate sits on a central island. Surrounding it is a connected board of about 19 large clearly separated ivory limestone hexagonal territory platforms on lush layered cliffs above vivid sapphire-to-turquoise water. Keep about 8 of the hexagonal tops visibly clear, smooth warm ivory stone for interactive territory selection overlays, distributed left, right and foreground; do not put tall objects on all tiles. Thin engraved gold edges, moss at the margins. Fill the remaining territories and edges with beautifully detailed miniature timber villages with terracotta roofs, mixed emerald fir trees and delicate deciduous trees, warm stone arched bridges, a small harbour and sailboat at right, purple crystal grotto at left, two cascades with white foam, a small golden temple at lower right. This should look like a premium lovingly hand-crafted illustrated boardgame diorama, very detailed and richly painted, not low-poly or primitive geometry. Lively saturated natural colour, warm afternoon sun, cool shadow pockets, intricate hand-painted textures, foliage variety, gold highlights. Castle silhouette elegant and crisp. Whole island board visible with breathing room all around, irregular scenic shoreline, turquoise water surrounding it and a dark carved walnut table visible at all four edges. No UI, no words, no lettering, no numbers, no logos, no labels, no question marks, no controls baked into image. Avoid flat pastel washed-out appearance, uniform ball trees, conical trees, simplistic cuboid houses, plastic look or very large blank areas. Fixed viewpoint designed for real HTML overlays on the clear territories. The finished scene should feel like a beautiful richly coloured fantasy miniature brought to life, with readable board geometry. Highest visual polish, landscape image.

## Mist sprite prompt

Use case: stylized-concept. Production game sprite on genuinely transparent background. An isolated low bank of beautifully hand-painted magical white and cool pale lavender mist, seen from an elevated isometric camera, roughly oval and horizontal, with softly curling wisps and layered volumetric cloud puffs. Dense opaque white-grey mist in the middle completely conceals what is beneath it, thinner delicate translucent wisps at the edges. Refined storybook miniature kingdom illustration, warm light at upper left, cool soft shadows within, charming mysterious atmosphere, not stormy. No buildings, no land, no sky, no letters, no question marks, no shadows outside the cloud, no rectangular backdrop, no flag. Wide horizontal cloud sprite with transparent margins on every side. This will be layered over individual mystery territories on a beautiful richly painted fantasy boardgame map. Crisp detailed painted forms, no blur, not photoreal weather.
