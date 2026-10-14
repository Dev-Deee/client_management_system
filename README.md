the front end is not displaying so I am starting troubleshooting

I observed that there was no import of react in the App.jsx file

I have added the import to App.jsx at 1 and its still not displaying. its just showing a white blank page

checked the console and found Uncaught TypeError: Cannot read properties of undefined (reading 'map') at App.jsx:277. the projects state was declared with useState() with no default, so it was undefined until loadProjects() finished. changed it to useState([]) in App.jsx

after that fix the console showed 401 Unauthorized on /api/clients and /api/projects, then Cannot read properties of undefined (reading 'length') at App.jsx:231. this was because loadClients() was reading result.clients from the login response, but the server actually returns { data: clients }, so clients was always undefined. changed setClients(result.clients) to setClients(result.data) in App.jsx

the 401s themselves were caused by a stale token left over in localStorage from earlier testing, which skipped the login screen and sent bad auth to the api. cleared it with localStorage.clear() in the browser console and refreshed, which brought back the login form

tried adding a client and got "Name and email are required" even though both fields were filled in. the addClient() fetch request in App.jsx was missing the Content-Type: application/json header, so express.json() never parsed the body and req.body came through empty on the server. added the header to the request in App.jsx

looked at how new client ids were generated in server.js, id: clients.length + 1. this breaks once a client is deleted, since length no longer tracks the highest id used and can produce a duplicate id. it also doesn't scale well as the data grows. switched users, clients and projects to use randomUUID() from node:crypto instead, and updated the seed projects to reference the generated client ids. this also fixed a second bug where delete client never worked, because client.id was a number and req.params.id is always a string, so client.id !== id was always true

ran the app end to end and went through the assessment checklist (frontend, backend, api communication, data handling, client management, project filtering, authentication, security, error handling). biggest issues found in server.js:
- login response included the admin user's plaintext password in the json body
- auth was a single hardcoded "demo-token" string, same for every login, never expired, and wasn't tied to a session at all. confirmed you could call protected endpoints with Authorization: Bearer demo-token without ever logging in
- password was stored and compared in plaintext
- deleting a client left its projects behind with a clientId pointing at nothing
- no uniqueness check on client email
- unknown routes returned Express's default html 404 instead of json
- malformed JSON body returned 500 instead of 400
- frontend fetch calls had no try/catch, so a network error or a non-json response just failed silently
- no logout control on the frontend, and no handling for a stale/expired token besides a hard crash

starting from security and auth and working down. moved the admin email/password and jwt secret into server/.env (gitignored), with a server/.env.example checked in as a template. added dotenv, bcryptjs and jsonwebtoken to server/package.json. the seed admin password is now hashed with bcrypt at startup instead of stored in plaintext. /api/login verifies with bcrypt.compareSync and issues a real jwt (unique per login, signed, expires after JWT_EXPIRES_IN) instead of returning the static "demo-token". the login response no longer includes the password or hash. the authenticate middleware now verifies the jwt signature and expiry instead of string-matching a hardcoded token

