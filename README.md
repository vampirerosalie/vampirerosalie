# Grammar Test — Six Classroom Battles

A teacher-led multiplayer classroom game with six activities, QR joining, resilient phone reconnection, private answer review, scoring, board-game mechanics, and Witch's Potion.

## Cloudflare deployment

This project deploys as one Cloudflare Worker with static assets and a D1 database.

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Create a D1 database named `grammartest-db`.
3. Set `CLOUDFLARE_D1_DATABASE_ID` to that database's ID.
4. Apply the SQL files in `drizzle/` in numerical order.
5. Run `pnpm run deploy`.

The visible website and `/api/game` are served from the same origin, so student QR links require no separate API configuration.
