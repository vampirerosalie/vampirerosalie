# Battle 9: English Black Market

Added to the existing grammartest teacher shell at `/?battle=9&teacher=1`.
Students use the room-specific QR / copied link, or a five-digit PIN on the student entry page.
The supplied 25 questions and 13 ordered auction lots are preserved; earlier battles are unchanged apart from the new navigation choice.

## Rules and safeguards

- Always 40 available places, with no teacher capacity selector; teacher starts with any joined count (1–40). Team identities and pending action receipts survive refresh/reconnect.
- $100 and 0 TP initially. Answers are automatically marked using the key; teacher can override Accept/Reject before confirmation. Marks stay private until confirmation; accepted confirmed answers grant $25 and 1 TP exactly once. Missing answers earn zero. Confirmation locks the question. Existing undecided answers upgrade without overwriting manual marks or confirmed rewards.
- Auctions after questions 2, 4, …, 24, 25. No default deadline; optional 10-second countdown or immediate SOLD. Only the winner pays. Server deadline rejects late bids and settles once on the next room request.
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
