import { test } from 'node:test';
import assert from 'node:assert/strict';

Object.assign(process.env, {
  JWT_SECRET: 'test-only-secret', CLIENT_ORIGIN: 'http://localhost:5173',
  ADMIN_EMAIL: 'admin@example.test', ADMIN_PASSWORD: 'test-password'
});
const { app } = await import('../app.js');

test('API preserves authentication, response contracts and cascade deletion', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/api`;
  let token;
  async function call(path, method = 'GET', body, authenticated = true) {
    const response = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json', ...(authenticated && token ? { Authorization: `Bearer ${token}` } : {}) },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {})
    });
    return { status: response.status, body: await response.json() };
  }
  assert.equal((await call('/clients')).status, 401);
  assert.equal((await call('/login', 'POST', { email: process.env.ADMIN_EMAIL, password: 'wrong' })).status, 401);
  assert.equal((await call('/login', 'POST', { email: process.env.ADMIN_EMAIL })).status, 401);
  const login = await call('/login', 'POST', { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  assert.equal(login.status, 200);
  assert.equal(login.body.user.email, process.env.ADMIN_EMAIL);
  assert.equal('passwordHash' in login.body.user, false);
  token = login.body.token;
  const clients = (await call('/clients')).body.data;
  assert.equal(clients.length, 2);
  const allProjects = (await call('/projects')).body.projects;
  assert.equal(allProjects.length, 3);
  const filtered = (await call(`/projects?clientId=${clients[0].id}`)).body.projects;
  assert.equal(filtered.length, 2);
  assert.ok(filtered.every((p) => p.clientId === clients[0].id));
  assert.equal((await call('/clients', 'POST', {})).status, 400);
  assert.equal((await call('/clients', 'POST', { name: 'Test', email: 123 })).status, 400);
  assert.equal((await call('/clients', 'POST', { name: 'Duplicate', email: clients[0].email.toUpperCase() })).status, 409);
  const added = await call('/clients', 'POST', { name: 'New client', email: 'new@example.test' });
  assert.equal(added.status, 201);
  assert.equal(added.body.data.name, 'New client');
  assert.equal((await call(`/clients/${clients[0].id}`, 'DELETE')).status, 200);
  assert.equal((await call(`/clients/${clients[0].id}`, 'DELETE')).status, 404);
  assert.ok(!(await call('/clients')).body.data.some((c) => c.id === clients[0].id));
  const remaining = (await call('/projects')).body.projects;
  assert.equal(remaining.length, 1);
  assert.ok(remaining.every((p) => p.clientId !== clients[0].id));
  assert.equal((await call('/missing')).status, 404);
  const malformed = await fetch(base + '/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(malformed.status, 400);
  token = 'invalid-token';
  assert.equal((await call('/projects')).status, 401);
});
