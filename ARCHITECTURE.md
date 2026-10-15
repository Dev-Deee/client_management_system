# Code structure

## Server

- `server.js` starts the HTTP listener; `app.js` assembles Express middleware and routes without opening a port.
- `config.js` loads and validates environment configuration.
- `routes/api.js` maps endpoints to controllers and applies authentication.
- `controllers/` translates HTTP input and output. Services hold authentication, client, and project logic without depending on Express.
- `data/store.js` owns the existing in-memory seed data. Restarting the process resets all changes.
- `middleware/authenticate.js` verifies bearer tokens; `helpers/httpError.js` creates errors carrying HTTP status codes.

The existing API paths, status codes, and response envelopes remain unchanged. Invalid credential/body types now receive controlled 401/400 errors instead of incidental runtime errors. Admin email and password are checked at startup alongside the existing required configuration.

## Client

- `App.jsx` owns the persisted session and switches between login and dashboard.
- `api.js` owns request serialization, authorization headers, response parsing, and network/HTTP errors.
- `hooks/useClientManagement.js` owns client/project data, filtering, mutations, and session-expiry handling. List effects cancel obsolete requests; mutations refresh both lists, including after cascade deletion.
- `components/` contains the login, dashboard, client form, client list, and project list. Form field state stays in the corresponding form.

The UI and styles are retained. No runtime dependencies were added.

## Checks

With dependencies installed, run `npm test` in both `server/` and `client/`, and `npm run build` in `client/`.

Server tests use isolated test credentials and an ephemeral loopback port. They exercise authentication, response contracts, validation, duplicate emails, filtering, cascade deletion, and error responses. Client tests cover the API transport helper; the build checks JSX/module compilation. These checks do not constitute browser interaction tests.
