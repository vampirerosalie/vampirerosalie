# Battle 7: Crazy Kitchen on the existing Grammar Test Worker

## Scope

Battle 7 is served by the existing Worker and the existing `DB` D1 binding. It does not create a second website or service, and it does not use or change Battles 1–6's room/board tables or `/api/game` route.

- Teacher entry: `/?battle=7`
- Team QR/join URL: `/?battle=7&join=12345`
- Projector URL: `/?battle=7&screen=12345`
- Embedded game: `/battle7/index.html`
- API: `/api/kitchen/rooms` and `/api/kitchen/rooms/:pin/{join,state,action,qr.svg}`
- Service probe: `GET /api/kitchen/health`

The QR SVG is rendered locally with the pinned `qrcode` dependency; it sends no room or pupil information to an external QR service. Host/team bearer keys never belong in URLs.

## Migration and deployment

`drizzle/0004_crazy_kitchen.sql` creates only `kitchen_rooms`, `kitchen_presence`, and an expiry index. The Drizzle schema, journal, and snapshot are included. No legacy table is dropped or altered. The migration uses `IF NOT EXISTS`, so it is safe if the first-request bootstrap already created these tables.

1. Install the locked dependencies: `pnpm install --frozen-lockfile`.
2. Run `pnpm run test:battle7`, `pnpm exec tsc --noEmit`, and `pnpm run lint`.
3. Run `pnpm run build:cloudflare`. This builds the existing Worker and generates `dist/server/wrangler.json`; it does not deploy.
4. For an authorized production rollout, apply only the new migration against the intended database:

   `pnpm exec wrangler d1 execute grammartest-db --remote --config dist/server/wrangler.json --file drizzle/0004_crazy_kitchen.sql`

5. Then deploy the existing Worker using its normal authorized deployment workflow, `pnpm run deploy:cloudflare`.
6. Smoke-test teacher room creation, two/ten team joins, review/reveal, cooking, reconnect, QR, and one legacy Battle 1–6 room on the same production origin.

For local D1, use `--local` instead of `--remote`; the API also creates its tables automatically on first use. The existing deploy preparation script retains the configured production database ID unless explicitly overridden with `CLOUDFLARE_D1_DATABASE_ID`.

Do not blindly reapply historical SQL migrations to an existing database. This change's SQL is independent and idempotent, but older migrations need their existing tracking to be respected. Creating tables on first request means the new Worker is not blocked solely by missing migration setup; explicit migration before rollout remains preferable.

No push, remote migration, or production deployment is performed by the test/build commands.

## Consistency and retry contract

- Each HTTP request constructs a fresh `KitchenD1Store` and game core from D1. No live room object or lock is shared between requests or Worker isolates.
- A room has a monotonically increasing integer version. Joins/actions save with an atomic `UPDATE ... WHERE version = ? AND expires_at > ?`.
- A losing compare-and-swap discards all local changes and reloads the latest state. Inventory, target protection, phase, and the global discovery bonus are revalidated. Up to 20 attempts are made with short jittered pauses; exhausted contention returns `503 CONCURRENT_UPDATE` and `Retry-After: 1`.
- Every action requires a stable `requestId`. Its actor-scoped signature and result are stored in the same JSON write as the gameplay mutation. A repeated ID returns the original result, and a different payload with the same ID returns `409 RECEIPT_CONFLICT`.
- Round-sensitive reveal, advance, cook and steal commands capture `questionId` and `expectedPhase` when first created. Cooking/stealing may cross question-to-reveal for the same question, but never act on a later question. These stay fixed on retry. A never-committed late command returns `409 STALE_CONTEXT`; an already-committed receipt is replayed before checking the current phase.
- Clients must retain and retry the same pending action/requestId after network failure, timeout, `429`, or `5xx`. A DB write can commit even if its response is lost. A new ID is not an appropriate retry after an uncertain response.
- A join's client identity and per-room secret yield the same team token on reconnect, including after a Worker restart or a lost join response. The secret is persisted in a server-only column; bearer credentials and question answer keys are not included in public/team snapshots.
- Room creation uses a collision-safe insert and an atomic 100-active-room capacity check. Creation is not action-receipt-based: a fresh create request can create another room, so the UI should not automatically repeat a teacher's creation after an uncertain response.
- Direct D1 binding reads are used, without unconstrained replica sessions, so CAS retries read the primary database. See [Cloudflare's D1 consistency documentation](https://developers.cloudflare.com/d1/best-practices/read-replication/).

## Private presentation data

Sentence-rebuild authoring IDs never enter public or pupil JSON. Presentation IDs are keyed HMAC values scoped to the persisted room, question and source token; their order is independent of canonical word positions and stable across reconnects. Host canonical/accepted token orders use the same presentation mapping. This filter also protects previously saved room data with positional authoring IDs.

Shared cooking reveals expose dish names, outcomes and stars, without another team's ingredient combinations or recipe keys. Hosts may review full cook records; a pupil receives full combinations only for their own team. The team's private recipe book is never included in another role's snapshot.

## Presence, retention, and limits

Presence uses separate `kitchen_presence` rows. A team is online for 20 seconds after its latest authenticated request. SQL throttles each team's heartbeat update to at most one write per five seconds. Presence polling never increments or overwrites the room's gameplay version.

Rooms expire 48 hours after creation and become inaccessible immediately at expiry. Expired rows are deleted opportunistically when a new room is created; foreign-key cascading removes their presence. Physical deletion is not a scheduled purge when the site is idle. There are no personal accounts; persisted data consists of room settings, team nicknames/device IDs, answer submissions, game state, hashed bearer keys, per-room secrets, and action receipts. Keep D1 and Worker administration private.

Requests accept JSON objects only, capped at 8 KiB by actual byte count. POST requests reject foreign origins. Responses use `Cache-Control: no-store`. Bearer keys are accepted only via `Authorization`. The API has an isolate-local burst guard, not a distributed abuse quota; the authoritative room capacity and all gameplay limits are enforced in D1.

A finite 20-question game stores up to 100 recent cooks so the projector can catch up on all practical cooking events. There are 40 ordinary recipes and one Sneaky Snack recipe, 2–10 configured teams, and teams may cook anytime during an active question or reveal. Reveal advances directly to the next question (or final results after question 20). Exactly three ingredients are consumed. Legacy saved rush states remain untimed and can advance immediately.

## Verification coverage

`pnpm run test:battle7` includes:

- The original core rules and teacher-controlled answer visibility, with filesystem persistence replaced by JSON restore.
- Real SQLite SQL through an asynchronous D1-shaped adapter that deliberately overlaps requests and checks that CAS failures occur.
- Ten-team join/submit/review races, same-station claims, identical receipt retries, no double-spending, one discovery bonus, theft protection, dropped responses after commit, and retry exhaustion.
- Shared/throttled presence, expiry/cascade cleanup, preservation of a legacy room table, concurrent room capacity, and migration/bootstrap interoperability.
- HTTP route contract, local QR SVG, same-origin links, byte limits, role checks, answer/credential hiding, and retriable error responses.

SQLite adapter tests validate SQL and algorithm behavior locally. They do not replace a production-region load test, device testing on school Wi-Fi, or a deployed Worker/D1 smoke test.


## October 9 flow revision (base a1f58a3)

- Selecting Battle 7 immediately opens/resumes the teacher lobby with the shared Grammar Battle header, battle chooser, QR/PIN and live teams. Configure 2–10 team stations before starting.
- QR joins are student-only. A tab-scoped navigation marker preserves the student route through back, refresh and BFCache; teacher and pupil tabs can share localStorage without sharing role intent. Actual API permissions still require the server-validated host/team bearer capability.
- Early End game and normal final results retain each student’s team/results view. Students may enter a new student PIN, never fall through to the old teacher menu.
- The phone has Question, Cook, Pantry and Recipes tabs. Cooking is available during questions and reveals, and its result is a nonblocking dismissible notice.
- Each accepted answer awards two independently drawn ingredients using the configured ingredient weights; duplicates are allowed. Receipt replay and repeated Accept clicks return the original pair without granting it again.
- Changing an accepted answer to rejected is allowed only until neither awarded ingredient has been consumed or stolen. This prevents negative inventory and reversal/re-accept duplication; the teacher review explains a locked reward.
- No new database migration or credential grant is required. Recipes stay hidden until discovered. Every ordinary valid three-ingredient cook now earns at least one star: uncatalogued combinations make a one-star basic dish, without a first-discovery bonus or a recipe-book unlock. Fixed named recipes keep their existing values and first-discovery bonuses. Sneaky Snack still gives a useful steal power instead of stars.
- Revision checks: 87 automated tests (HTTP, real SQLite D1 adapter, frontend DOM contracts and shell lifecycle), TypeScript, focused lint and build pass. Aggregate lint still reports the pre-existing vendor `public/grammar-room/qrcode.min.js` `no-this-alias` error.
- Real browser UI verification of this revision remains pending: the local executor could not launch Chromium because of a socket restriction, and the cloud browser could not reach the isolated local preview. The included browser QA script must run on a supported local preview before deployment. No production test or deployment was performed by this revision.
