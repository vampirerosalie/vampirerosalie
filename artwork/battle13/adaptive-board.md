# Adaptive kingdom board — 28 October 2026

New Battle 13 rooms lock the board at Start Game using joined teams (including disconnected registered teams): `min(112, teams × 10)` claimable territories, including the Crown, plus all eight permanent Mystery Lands. Seven to eleven teams therefore receive 70, 80, 90, 100 or 110 claimable territories. Twelve teams receive 112. The remaining ordinary cells become blocked grassy reserves. The 120 IDs, polygons, artwork, Crown, mystery positions and all scoring/Action costs stay unchanged.

Selection retains the ordinary cells closest to the centre in axial distance, with deterministic coordinate tie-breaking. Blocked cells are outer ordinary cells, never mysteries or the Crown. Room state stores the mask and starting count atomically; late joins, reconnects, host refresh and retries cannot resize it. Rooms created before this feature retain their full board, even if still in the lobby. Create a new room to use adaptive sizing.

Grass uses the same SVG polygon as the existing stone surface. It hides its number and cannot be claimed, fortified, shielded, explored or targeted with Rebellion. The server rejects all such actions before any resource change. Tapping it explains that it is not playable; the fallback list disables it. Teacher and students receive the same board mask. Random mystery effects exclude blocked tiles.

## Asset

Built-in image generation created `map-source/grass-reserve-v1.png`, format-optimized to `public/battle13/assets/map/grass-reserve-v1.webp` (512 × 512). This adds one texture; it does not replace or repaint the landscape. The source remains in the repository.

Prompt: “Create a game terrain texture asset, square 1024x1024, entire frame filled edge to edge with softly painted short meadow grass seen straight from above. Premium handcrafted miniature medieval kingdom board-game illustration, warm muted sage and olive green with golden light, fine visible painterly grass blades and subtle natural variation. A very few tiny cream wildflowers and sparse low grass tufts. Even illumination, modest detail readable when reduced to a small tile. No trees, no houses, no rocks, no objects, no hexagon outlines, no borders, no labels, no numbers, no text. This square texture will be clipped by code into exact hexagon shapes to cover disabled spaces in an illustrated ivory-stone kingdom board. Grass texture only, flat terrain, opaque background.”

## Checks performed

- Battle 7–13 unit/integration regression suites: 357 passing, including 38 Battle 13 cases.
- Adaptive board tests exercise every team count 2–12, original IDs/kinds, outer-cell selection, Crown/mystery retention, concurrent/replayed Start, disconnects, late joining, saved-state reload, all blocked actions with zero debit, ordinary capture, private Shield, Crown scoring and legacy-room compatibility.
- `scripts/verify-territory-board.mjs`: real room API, isolated teacher and separate 360/390px student browsers, seven joined test teams, 70+8+42 sizing, hidden numbers and grass fill, blocked tap/list/API, valid claim, refresh/late join, End Game, asset loading and no horizontal overflow or browser errors.
- `scripts/verify-territory-map.mjs`: original 120 exact hit centres, ownership colours, Crown, eight mysteries, keyboard, reduced motion, zoom/pan/reset and portrait layout.

These are automated browser simulations, not physical-phone or classroom balance tests. Ten territories per team is the agreed starting balance; it is not a guarantee that every class fills the map.
