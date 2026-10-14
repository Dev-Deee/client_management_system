# Debugging Report

## Bugs Identified

**Frontend**
1. Blank white page on load — `App.jsx` used JSX without importing `React`.
2. Crash on load — `projects` state defaulted to `undefined` instead of `[]`, crashing on `.map()`.
3. Crash after login — `loadClients()` read `result.clients`, but the server returns `{ data: clients }`, so `clients` stayed `undefined` and crashed on `.length`.
4. Crash on a stale/expired token — a 401 response was treated like a normal response, with no handling to clear the token and return to login.
5. "Add Client" always failed with "Name and email are required" even with valid input.
6. No way to log out once logged in.
7. Hardcoded `API_URL` in `App.jsx`, not configurable per environment.
8. A single shared `message` state was reused across login, add-client, delete, and session-expiry messages, so messages from one action could linger and appear next to an unrelated one.
9. Deleting the client currently selected in the project filter left the filter pointing at a client id that no longer existed.
10. No error handling around any `fetch` call a network failure or non-JSON response failed silently.

**Backend**
11. New client ids were generated with `clients.length + 1`, which could produce duplicate ids once a client was deleted.
12. Deleting a client never actually removed it — `client.id` (a number) was compared to `req.params.id` (always a string).
13. Login stored and compared passwords in plaintext, and returned the password back in the login response.
14. Authentication was a single hardcoded token (`"demo-token"`), identical for every login, never expiring, and not tied to a session.
15. `cors()` had no origin restriction — it reflected any origin back.
16. Deleting a client left its projects behind, orphaned, still pointing at a `clientId` that no longer existed.
17. No uniqueness check on client email — the same email could be added as a new client any number of times.
18. Unknown routes returned Express's default HTML 404 instead of a JSON error, inconsistent with the rest of the API.
19. A malformed JSON request body returned 500 instead of 400.

## Root Causes

- Items 1–3: the starter code had incomplete React setup and state/response-shape mismatches between frontend and backend that were never exercised end-to-end before being handed off.
- Item 4, 9, 10: the frontend assumed every request succeeds and never accounted for auth failures, network failures, or state going stale after a mutation.
- Item 5: the `addClient` request body was JSON, but no `Content-Type` header was sent, so Express's `express.json()` middleware never parsed it and `req.body` came through empty.
- Item 11, 12: client ids were derived from array length/position instead of being independently generated and type-consistent, which breaks under deletion and under string/number comparison.
- Item 13, 14, 15: there was no real authentication system no hashing, no token issuance, no origin restriction just placeholder logic standing in for it.
- Item 16, 17: the API had no referential integrity or uniqueness rules, since the in-memory data model was never designed with those constraints.
- Item 18, 19: there was no catch-all route and no inspection of `err.status` in the error-handling middleware, so every unhandled case fell through to generic defaults.

## Solutions

- Added the missing `React` import and gave `projects` a default of `[]`.
- Fixed `loadClients()` to read `result.data`, matching the server's actual response shape.
- Added `"Content-Type": "application/json"` to the `addClient` request.
- Replaced `clients.length + 1` id generation with `randomUUID()` (from `node:crypto`) across users, clients, and projects, which also fixed delete (both sides are now strings).
- Moved admin credentials and the JWT secret into `server/.env` (gitignored, with `.env.example` checked in). Hashed the seed password with `bcrypt`. `/api/login` now verifies with `bcrypt.compareSync` and issues a real signed JWT (unique per login, expires after `JWT_EXPIRES_IN`) instead of a static token, and no longer returns the password in the response. The `authenticate` middleware verifies the JWT signature and expiry.
- Restricted CORS to a single configurable origin (`CLIENT_ORIGIN` in `server/.env`) instead of allowing any origin.
- `DELETE /api/clients/:id` now also removes any projects belonging to that client (cascade delete).
- `POST /api/clients` rejects a case-insensitive duplicate email with 409.
- Added a catch-all route returning a JSON 404 for unknown routes.
- Changed the error-handling middleware to respect `err.status` (body-parser sets 400 on a JSON parse failure) instead of always returning 500.
- Added `logout()` and an `authFetch()` wrapper that attaches the auth header and automatically logs out (clearing the token, showing a message) on any 401, used by all authenticated requests.
- Added a visible Logout button.
- Wrapped the login request and `authFetch()` in `try/catch`, showing "could not reach the server" instead of failing silently on a network error.
- Replaced the hardcoded `API_URL` with `import.meta.env.VITE_API_URL` (falling back to the same default), backed by `client/.env`/`.env.example`.
- Split the shared `message` state into `authMessage` (login screen) and `clientMessage` (add/delete client card).
- `deleteClient` now resets `selectedClient` to `""` if the deleted client was the one selected in the project filter.

## Testing

- Used the browser DevTools Console and Network tabs throughout to catch the actual thrown errors (`Uncaught TypeError`, `Uncaught ReferenceError`, failed requests) rather than guessing from symptoms.
- Exercised the backend directly with `curl` for every fix, independent of the frontend: login with correct/incorrect credentials, calling protected routes with no token / an old static token / a tampered token / a valid token, adding a duplicate-email client, deleting a client and re-checking `/api/projects` for orphaned entries, sending a malformed JSON body, and hitting an unknown route.
- After the frontend changes, ran a production `vite build` to confirm the app compiles cleanly with no syntax or import errors.
- Manually walked the UI flow after each round of fixes: load the page, log in, add a client, delete a client, filter projects by client, and confirm the empty/error states render as expected.

## Security

The most significant issues were in authentication:
- Passwords were stored and compared in plaintext, and the plaintext password was even returned to the client in the login response. Fixed by hashing with `bcrypt` and excluding the password field from any response.
- Authentication was effectively a hardcoded shared secret (`"demo-token"`) — the same token worked for every user, never expired, and could be used to call protected endpoints without ever logging in. Fixed by issuing real signed, expiring JWTs and verifying them server-side.
- `cors()` had no origin restriction, allowing any website to make authenticated requests against the API from a browser. Fixed by restricting to a single configurable origin.
- Secrets (JWT signing key, admin credentials) were hardcoded in source. Moved to a gitignored `.env` file with a checked-in `.env.example` template.

Known gaps that would need attention before production use:
- The login endpoint currently has no protection against brute-force attempts. Adding rate limiting (e.g. `express-rate-limit`, capped at around 10 attempts per 15 minutes per IP) would be a reasonable starting point.
- The token is stored in `localStorage`, which is readable by any script on the page — a real app would want to weigh this against httpOnly cookies, depending on the XSS threat model.
- There's no password reset, account lockout, or audit logging.
- The in-memory data store has no persistence and resets on every server restart; a production system would need a real database with proper constraints (unique email, foreign keys) instead of the application-level checks added here.

## Reflection

**Most investigation:** the authentication rebuild (plaintext password → bcrypt, static token → JWT) took the most work, since it touched credential storage, token issuance, and the auth middleware together, and needed the most careful testing to confirm nothing including the already-fixed parts of the app broke in the process.

**Debugging approach:** reproduce the symptom, read the actual error from the console or a direct `curl` call rather than guessing, trace it to the specific line, fix only that, then re-test the specific failure before moving to the next one. Backend issues were verified independently of the frontend wherever possible, which made it much faster to tell whether a given symptom was a frontend or backend problem.

**Unresolved / deliberately left as-is:** `/api/login` has no brute-force protection. This is flagged above under Security rather than silently left out.
