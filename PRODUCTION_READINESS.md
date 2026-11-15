# ChessArena production-readiness checklist

This checklist tracks the requested commercial-platform requirements. A feature is not complete until its user flow, server behavior, persistence, authorization, error cases, and relevant device sizes have been verified. "Implemented" does not mean live-database or production verification has passed.

Status definitions: **IMPLEMENTED** = code path exists; **PARTIAL** = meaningful implementation exists but important work remains; **UNVERIFIED** = not yet tested; **BLOCKED** = requires external configuration or infrastructure; **NOT STARTED** = no complete implementation.

## Required quality gates

| Requirement | Status | Evidence / next step |
|---|---|---|
| Complete frontend for every advertised feature | PARTIAL | Local play, tournament creation, public club discovery, and feature pages exist; club detail/management, tournament rounds, and remaining route flows still need completion and accessibility review. |
| Real backend for every advertised feature | PARTIAL | Authenticated game/matchmaking APIs, club membership RPCs, tournament creation/invites, puzzles, and friend requests exist; apply the new SQL patch and verify with staging users. |
| Persistent database integration | PARTIAL | Core Supabase tables are reachable; the updated compatibility patch adds transactional game completion/rating operations plus the earlier missing game fields and profile backfill. Apply it in staging and verify authenticated flows. |
| Authentication and authorization | PARTIAL | Demo auth was removed; Supabase auth and role/participant checks exist. Verify real email flows, session expiry, RLS, and authorization boundaries on staging. |
| Test all user interactions | PARTIAL | 28 automated tests pass, including friend-chat emoji and online-game finalization flows; puzzle hints/solutions work against seeded data. Club, tournament, and authenticated cross-account flows still need staging verification. |
| Test edge cases and error states | PARTIAL | API request parsing and game/matchmaking validation exist; add targeted tests for malformed requests, concurrency, stale sessions, database failures, and retry behavior. |
| Mobile responsiveness | PARTIAL | `/play`, `/puzzles`, `/tournaments`, and `/social` were checked at 375px wide with no horizontal overflow. Verify other routes, touch behavior, and additional device sizes. |
| Performance | UNVERIFIED | No production profiling, bundle review, or load testing has been completed. |
| Security | PARTIAL | Fake auth/data and permissive policies were addressed; migration, RLS, secrets, API boundaries, dependencies, and deployment still need verification. |
| No fabricated statistics or multiplayer | PARTIAL | Home leaderboard and several feature pages now use database data; search all remaining routes and test empty/error states. Socket.IO remains an isolated in-memory service and must not be presented as production multiplayer. |
| No unfinished controls / console errors | PARTIAL | Club actions, tournament creation, and friend chat are wired to secured database operations; apply the updated SQL patch before using those controls. |
| Preserve existing real functionality | IMPLEMENTED | Local guest hot-seat play remains available and is distinct from online play. |

## Route and feature inventory

| Route / surface | Status | Current implementation / next verification |
|---|---|---|
| `/` | PARTIAL | Leaderboard preview queries Supabase and no longer supplies sample players; browser test confirmed the missing-table error is surfaced with an actionable message. |
| `/play` | PARTIAL | Local hot-seat and in-browser computer play are implemented, with color/difficulty choices, legal move search, checkmate detection, click/drag input, target hints, move history, undo, promotion selection, and board arrows. Engine/board tests pass; a live matchmaking attempt exposed a missing profile row for an existing account. Apply the updated compatibility SQL, then verify the real queue lifecycle. |
| `/game/[gameId]` | PARTIAL | Authenticated participant polling and legal persisted moves exist; the latest migration adds atomic result finalization, one-time Elo/stat changes, and rating-change display. Apply the patch and verify real games/races. Server-authoritative clocks and draw offers are not implemented. |
| `/games` | UNVERIFIED | Supabase game-history query exists; verify privacy and actual persisted completed-game records. |
| `/leaderboard` | PARTIAL | Profile sync and transactional Elo updates for completed online games are implemented. Ratings still need migration and staging verification; game-type-specific ratings and tournament result updates are not implemented. |
| `/puzzles` | PARTIAL | Two legal mate-in-one puzzles were seeded into Supabase. The page renders them and the server-side hint and correct-solution endpoints return the expected moves. Persisting authenticated puzzle progress still needs verification. |
| `/tournaments` | PARTIAL | Create public tournaments with four formats, time control, scheduled start, capacity, optional club association, and rated-event label; existing join and invitation flows remain. Round generation, pairings, live game assignments, standings, rated results, and editing/cancellation are not implemented. |
| `/clubs` | PARTIAL | Public club discovery, search, creation, joining, and leaving use protected database RPCs; owner transfer, private invitations, club roles/moderation UI, club discussion, and club detail pages remain. |
| `/social` | PARTIAL | Database profile search, friend requests, and private messaging between accepted friends exist; chat supports emoji, read receipts, and five-second refresh. Apply the updated SQL patch, then verify RLS and messaging with two authenticated staging users. Direct challenges are not implemented. |
| `/settings` | PARTIAL | Loads and saves account preferences in an owner-only table; verify RLS and persistence against staging. |
| `/profile/[username]` | PARTIAL | Public profile fields are queried explicitly; private preferences are loaded/edited only by the profile owner. Verify privacy and game-history behavior against staging. |
| `/admin/dashboard` | PARTIAL | Restricted to `app_metadata.role === 'admin'`; no verified administrative management workflows. |
| Authentication and password recovery | PARTIAL | Supabase login/signup/reset/update pages exist; verify real email delivery, redirects, expired links, and rate-limit handling. |
| `/api/games/[gameId]` | PARTIAL | Authenticated participant-only reads, legal-move validation, persisted FEN compare-and-swap, and resignation exist; test authorization and concurrency against staging. |
| `/api/matchmaking` | PARTIAL | Authenticated database RPC handlers exist; test queue expiry, simultaneous joins, cancellation, and match creation against staging. |
| Socket.IO service | NOT STARTED | Separate in-memory process is not connected to the web match flow and is not durable or horizontally scalable. |

## External release blockers

- **BLOCKED:** The configured Supabase database exposes the core tables, but the existing `games` table is missing columns required by matchmaking, existing auth users may lack profile rows, and the new club schema/RPCs have not been applied. Apply the updated compatibility SQL on staging; verify RLS and authenticated flows before production.
- **BLOCKED:** Friend messaging requires the updated compatibility SQL and two authenticated accounts for end-to-end testing; delivery currently uses polling rather than Supabase Realtime.
- **BLOCKED:** Configure production email delivery, auth redirect URLs, and rate limits; provider throttling cannot be fixed in client code.
- **BLOCKED:** Implement durable multiplayer presence/recovery and server-authoritative clocks before advertising production competitive play.
- **BLOCKED:** Apply and test the new atomic game-finalization migration on staging before presenting the leaderboard as competitive; per-time-control ratings and tournament integration remain future work.
- **BLOCKED:** Run complete browser, accessibility, mobile, performance, and security verification before launch.
- **BLOCKED:** A credential-like local tool configuration was found nested under the project and is ignored by Git; move it outside the project and rotate any value that may have been exposed or committed.

## Work log

- Removed fabricated offline authentication, demo login, fixed-ID matchmaking response, and game-page fallback state.
- Added Supabase-backed auth recovery, matchmaking/game API paths, and database-backed leaderboard, puzzle, tournament, friend-request, and preference flows.
- Tightened SQL policies, isolated private preferences, restricted puzzle-solution columns, and added profile leaderboard synchronization plus matchmaking/tournament RPCs.
- Updated README claims to distinguish local play from online play and to disclose unverified production status.
- Production build and ESLint pass; the project test suite passes (28 tests). These do not replace staging database or browser verification.
- Rebuilt and restarted the local production server on port 3001 after making the home-page database error actionable; verified guest move/reset and the 375x812 `/play` viewport. Database-dependent home leaderboard remains unavailable until migration.
- Improved the local board to support both hot-seat sides, click-to-move with legal destination highlights, draggable moves, move history, one-ply undo, promotion piece selection, and board arrows; added tests for castling, en passant, promotion, and undo.
- Added local computer play with easy/medium/hard alpha-beta search and human color selection; it runs in-browser and is not represented as a remote opponent or a professional chess engine.
- Added tournament invitations by username with invitee accept/decline and server-side authorization/capacity checks. These database-dependent flows have not been tested until the updated schema is applied to staging.
- Supabase REST checks found the puzzle table empty and the existing `games` table missing columns required by matchmaking. A live matchmaking attempt also exposed an existing auth account without a corresponding `profiles` row (foreign-key failure).
- Added two authored, legal mate-in-one starter puzzles to the schema and compatibility seed scripts; validated each FEN and solution with `chess.js`. Seeded and verified both records in Supabase; the `/puzzles` page renders them, and the hint and correct-solution endpoints pass after restarting the server with the updated secret key.
- Added public club discovery, creation, joining, and leaving; membership writes are handled by authenticated database RPCs and owners cannot orphan their clubs.
- Added tournament creation with format, time control, scheduled start, player cap, rated label, and optional club affiliation. The matching compatibility migration has not yet been applied or exercised in an authenticated session.
- Added authenticated atomic online-game persistence for moves/resignations, one-time Elo and W/L/D updates, rating-change fields, and end-of-game rating display. Added API tests for checkmate finalization and participant rejection; the migration still needs to be applied and verified against Supabase.
- Added mobile navigation links for events and clubs. Verified `/clubs` at 375px without horizontal overflow; it currently reports the actionable migration message because `public.clubs` is not present in the configured database yet.
- Final validation after the recent messaging and game-result changes: production build and ESLint pass; 28 automated tests pass. No authenticated club/tournament/chat flow or SQL migration has been tested against Supabase yet.
- Expanded the idempotent compatibility SQL to add missing game columns and backfill profiles/preferences for existing auth accounts. It still needs to be applied in Supabase before matchmaking can be re-tested.
- Production dependency audit reports zero vulnerabilities. Development tooling still has advisories; a non-breaking audit fix is in progress.
- Do not paste credentials into chat or commit `.env.local`; keep service-role and database credentials server-side only.
