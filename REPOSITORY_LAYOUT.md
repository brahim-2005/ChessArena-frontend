# Frontend repository layout

This repository contains the current runnable ChessArena Next.js application.
It intentionally preserves the existing app instead of removing API routes
that the frontend currently calls.

The API handlers remain in `src/app/api`. The `ChessArena-backend` repository
organizes a copy of those handlers, but the frontend is not yet configured to
call a separately deployed API service. Extracting the API requires updating
authentication cookies, CORS, and API URLs and testing the complete signed-in
flows.

The SQL and database migration files are organized in `ChessArena-database`.
