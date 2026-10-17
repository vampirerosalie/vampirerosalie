# Battle 9: English Black Market

Added to the existing grammartest teacher shell at `/?battle=9&teacher=1`.
Students use the room-specific QR / copied link, or a five-digit PIN on the student entry page.
The supplied 25 questions and 13 auction items are preserved; earlier battles are unchanged apart from the new navigation choice.

## Rules and safeguards

- Always 40 available places, with no teacher capacity selector; teacher starts with any joined count (1–40). Team identities and pending action receipts survive refresh/reconnect.
- $100 and 0 TP initially. Answers are automatically marked using the key; teacher can override Accept/Reject before confirmation. Marks stay private until confirmation; accepted confirmed answers grant $25 and 1 TP exactly once. Missing answers earn zero. Confirmation locks the question. Existing undecided answers upgrade without overwriting manual marks or confirmed rewards.
- Auctions after questions 2, 4, …, 24, 25. No default deadline; optional 10-second countdown or immediate SOLD. Only the winner pays. Server deadline rejects late bids and settles once on the next room request.
- New rooms save one controlled random order: first two distinct items from Bronze, Parcel, Gloves, Sapphire, Forbidden Box, Shield, Shadow Thief and Last Heist; remaining eleven use Fisher–Yates with cryptographic random draws. Ruby, Royal, Final Vault, Crown and Smuggler can appear anywhere in positions 3–13. Item prices, outcomes and artwork follow item identity, not position. The Final Vault is not a final-phase trigger. Future order is server-only, survives reconnect/CAS retries, and expires with the existing 48-hour room retention. Pre-update rooms keep their original sequence.
- Mystery outcomes selected on auction opening, not exposed before sale. Highest bid is reserved and cannot be stolen.
- Saved theft cards can be used during questions, auctions, results and final settlement. A shield blocks either money or TP theft and consumes both shield and attacking card. Cancellation/invalid empty targets preserve the card.
- Highest TP wins; money never breaks ties. Teacher can end early; student devices remain student-only, including after refresh or navigating to the root.
- Separate D1 market tables, optimistic versioned writes, bounded receipts/events, authenticated role checks. No new Cloudflare product or paid feature.

## Verification (2026-10-16)

- 183 passing tests across Battles 7, 8 and 9, including automatic MCQ/order/spelling marking, overrides, durable upgrade, fixed 40 places and starting with three teams.
- Battle 9 covers all 25 questions/13 auctions, hidden keys/outcomes, 40 concurrent joins/submissions/reviews, question 25 with full previous history, duplicate/retried confirmation, simultaneous bids/sales/thefts, timer settlement, shields, reserved funds, ties, role isolation and end-game locks.
- TypeScript no-emit check and production Vinext build passed.
- Browser QA uses separate teacher/student tabs with the actual local API/D1 adapter: QR lobby, joining, answering during countdown, private review, confirmation rewards, auctions and bids.
- Forty-client concurrency tests are automated, not a claim that 40 physical phones or weak real classroom Wi-Fi were tested. Browser sleep/network loss cannot be prevented, but state and identity are persisted for recovery.

Original built-in generated artwork and exact prompts are documented in `battle9-art.md`.

## Controlled auction randomization checks (2026-10-17)

- 196 passing tests across Battles 7–9; TypeScript and production build passed.
- 2,000 seeded new rooms: exact item permutation, all 56 allowed opening pairs observed, every powerful item observed at every permitted position 3–13, smaller treasures following larger ones.
- 20 complete randomized games: 25 unchanged questions / 13 auctions, identity/price/reward/artwork consistency, all mystery outcomes, no premature final phase, optional timer and duplicate SOLD.
- Independent D1 instances: concurrent reconnects, failed response after opening commit, exact replay, bid and sale races, durable order, no future-order leak.
- Frontend rendering checks confirm sprite identity follows the lot while auction numbering follows the position. Old rooms and legacy auction records retain their original items.
- `node scripts/test-battle9-auctions-live.mjs [base URL]` creates two isolated QA games and tests the deployed API flow; it ends its own rooms and never touches existing classroom games.
