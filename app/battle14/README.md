# Battle 14 — Paintball Showdown

Open `/?battle=14&teacher=1` in the classroom site. Create a room and display its QR or copy its group link. The QR links directly to the phone interface. Choose a team name on the playing phone. The teacher can select which connected device controls each team's robot.

## Running a class

The 20 English questions use the supplied fixed order. Only the teacher can open the private review, override a mark, finalize the answers and reveal the key. Use the projector view when the class can see the teacher display. A projector mirroring the entire desktop can show the teacher's private windows too.

After questions 5, 10, 15 and 20, the teacher starts the next 60-second shootout. Each team receives five paintballs plus two per correct finalized answer in that block. The left thumb moves. The right thumb drags to aim and releases FIRE to shoot, or holds FIRE for repeated shots. On a computer, use WASD or the arrow keys to move, point to aim and click to fire. A checkmark beside an opponent means that team has already awarded its ordinary three points this round.

The teacher can pause, resume or end a round early. The final ranking uses accumulated shooting points. English results have their own column. Students can keep viewing the final board.

## Local checks

From the game repository:

```sh
pnpm run dev
pnpm run test:battle14
node scripts/verify-paintball-controls.mjs
node scripts/verify-paintball-classroom.mjs http://localhost:3418
node scripts/verify-paintball-load.mjs http://localhost:3418
```

Use the actual local Worker address for the classroom and load checks. Browser tests use Playwright and the Chrome browser channel. The mobile test exercises simultaneous touch pointers in a phone-sized browser.

For a physical phone trial on classroom Wi-Fi, build with `pnpm run build:cloudflare`, then run `pnpm exec wrangler dev --local --config dist/server/wrangler.json --ip 0.0.0.0 --port 3435` on the teacher laptop. Open the game on the laptop using its LAN address, such as `http://192.168.1.20:3435/?battle=14&teacher=1`, substituting the laptop's own address. The generated QR then uses that same address. Direct phone access depends on the Wi-Fi permitting devices to reach the laptop.

## Resource budget

Arena movement goes through a WebSocket to one room-specific Durable Object. The phone renders the scene with self-hosted Three.js. At ten inputs per second, twelve continuously moving controllers would send 28,800 input messages across the four minutes of play. Cloudflare currently counts twenty incoming WebSocket messages as one Durable Object request for billing. This example translates to 1,440 request equivalents for movement. Room creation, connection setup, other messages, active time and storage are additional. See [Cloudflare Durable Objects pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/).

This game introduces the `PAINTBALL_ROOMS` binding and a SQLite-backed Durable Object class. Publishing it requires the corresponding Worker configuration and migration. Local development and measurement use the local Worker runtime.

### Local multiplayer measurements

The WebSocket harness drove actual connections to a locally packaged Worker. During seven-second gameplay samples, 7 controllers sent 490 inputs and caused 5 arena checkpoint writes, 10 sent 700 inputs and caused 6 writes, and 12 sent 840 inputs and caused 8 writes. The samples include movement and shots. They are local Durable Object measurements.

With 12 controllers plus a teacher, projector and teammate observer, an additional 50.3-second sample sustained 120 inputs per second. The spectator received 8.57 batched updates per second, averaging 2.75 KiB/s of arena messages. Local round-trip latency averaged 3.6 ms. The server ended the round at 60 seconds. A seven-team game also finished all 20 questions and four shootouts. Physical phones, school Wi-Fi and production Cloudflare latency can yield different results.

