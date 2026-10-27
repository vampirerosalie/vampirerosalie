# Battle 13 — exact 120-territory illustrated board

Approved for integration and publication, 27 October 2026. The checks below describe the local verification performed before release.

## Design and geometry

The map uses the approved contiguous warm-white hex-board concept, with a rainbow, wooded coast, village, waterfalls and carved frame. Selectable land stays clear of scenery. There are exactly **119 ordinary/mystery territories plus one Crown = 120**, using every original server ID, number and kind. Eight existing mystery IDs remain unchanged.

`app/battle13/client/illustrated-layout.js` builds one connected axial hex grid. Shared vertices near the centre expand the Crown to 128% linear size; its neighbouring edges adapt without overlaps or gaps. The other tiles remain complete six-sided territories. All hit areas and state colours are real SVG, not painted approximations. Backend data, rules, questions and scoring are unchanged.

Initial territory surfaces are warm ivory. A reusable opaque patch of painted paving ensures peripheral scenery cannot show through a playable tile. Team colours are separate server-driven overlays; no flags. The transparent castle sprite leaves a visible ownership-coloured apron. Mist is an independent layer that disappears only when the server reports that exact mystery resolved.

Phones show the complete map without top/bottom letterboxing or district shortcut buttons. Small targets zoom on first tap. Drag, pinch, wheel, keyboard, reduced motion, reset, focus and Choose territory remain supported. This is fixed-view 2.5D raster scenery with vector hit areas, not free-rotation 3D; deep zoom will soften illustration detail.

## Assets

Built-in image_gen was used, not the fallback CLI. Original generated outputs retained outside the repo; source copies are here:

- `map-source/kingdom-board-v2.png` → `public/battle13/assets/map/kingdom-board-v2.webp` (1536 × 1024). Generated from a code-defined board-footprint guide and the approved concept as style reference. Runtime paving texture is sampled from a clear area of this asset using SVG pattern placement.
- `map-source/crown-castle-v2.png` → `public/battle13/assets/map/crown-castle-v2.png` (600 px wide, genuine alpha preserved). Separate illustrated ivory/cobalt/gold castle, no ownership flags.
- Existing `map-source/mist.png` → `public/battle13/assets/map/mist.webp`, unchanged.

The older `kingdom.png`/`kingdom.webp` are retained as historical assets; the renderer uses the new versioned assets. Generated images were format-converted/resized for delivery. Geometry is established by code, never by counting generated artwork.

## Prompt specifications

Background: exact placement guide for central ivory island; premium painted 2.5D miniature kingdom; turquoise/sapphire sea, carved walnut/gold frame, rich forest upper left, red-roof village and rainbow upper right, harbour and waterfall lower right. Central area empty warm-white fine stone texture, no grid, castle, fog, ownership colours, text or objects. All scenery outside playable region. Approved concept supplies visual style.

Castle: isolated transparent sprite matching the approved central castle; ivory towers, cobalt steep roofs, gold finials, compact foundation, elevated three-quarter view, polished miniature storybook painting. No scene, tile, text, flags or opaque background.

## Verification

- `node --test test/battle13/*.test.js`: 25 passed, including exact count, preserved IDs/kinds, convex six-vertex polygons, shared Crown edges, zero overlapping interiors and a connected board.
- `node scripts/verify-territory-map.mjs`: all 120 centres select their original ID; eight mysteries, server-only reveal and refresh persistence; 12 team colours, Crown apron, fortress/shield state; zoom/pan/reset, keyboard, reduced motion; 360/390px layouts without horizontal overflow or letterboxing; no district buttons.
- `node scripts/verify-territory-browser.mjs http://localhost:3013`: isolated local teacher and student browser contexts plus 10 additional teams; QR decoding, private marking/finalization, claims, question progression, reconnection and draft preservation, fullscreen, late QR, End/New Game and explicit teacher bookmarks. No uncaught browser errors.

These are automated local-browser checks, not physical-phone or classroom tests. Release verification is performed separately after publishing. Preview: http://localhost:3416/ while the local preview process is running.

## Coastline alignment repair — 27 October 2026

The upper board edge previously cut across trees/buildings because the illustrated footprint differed from the actual hex silhouette. Added `map-source/kingdom-board-v3.png` and runtime `public/battle13/assets/map/kingdom-board-v3.webp`. The renderer now uses v3 for scenery; v2 remains the paving texture source. No territory geometry, IDs or state behavior changed.

Built-in image_gen edit, using the exact current footprint as placement reference and v2 as art reference. Prompt: preserve 1536×1024 composition, rainbow, forest, village, harbour and sea; match the ivory footprint and place a narrow low moss/flower/rock verge outside it; move tall trees and buildings back from the playable edge; no extra hexes, grid lines, castle, mist or text in the background. Source output: `exec-299d95f7-a677-49b7-93c9-9e87fff48aa7.png`. Runtime format conversion only.

Rebuilt renderer and reran `scripts/verify-territory-map.mjs`: all 120 hit targets, eight mysteries, server-only reveal, owner colours, zoom/pan, 360/390px fit, reduced motion and keyboard checks passed. Inspected the actual composite screenshot, including upper-left/top/upper-right edges. Local review only; not deployed.

### Four small edge repairs

Added `map-source/coastal-verge.png` and runtime `public/battle13/assets/map/coastal-verge.webp`, generated with built-in image_gen: seamless finely painted emerald/olive moss, low groundcover, tiny limestone gravel and sparse small wildflowers; no trees, buildings, paths or grid. Source: `exec-ec50bd7e-15f1-43d0-845b-b64948810d46.png`.

`BOARD_BOUNDARY` is derived from the 120 polygons' exterior edges. A non-interactive, masked illustrated grass/stone strip follows that exact boundary only in the four user-marked areas, with feathered transitions. It does not change any territory position or hit target. All other scenery remains visible. Added a test proving the boundary encloses exactly the summed territory area. Five geometry tests and the complete map browser check passed after repair; inspected the composited map screenshot. Local preview only.
