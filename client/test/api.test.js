import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api, request } from '../src/api.js';

test('API serializes requests and handles HTTP, network and parsing failures', async (t) => {
  let sent;
  const mock = t.mock.method(globalThis, 'fetch', async (...args) => {
    sent = args;
    return new Response(JSON.stringify({ data: { id: 'new' } }));
  });
  await api.addClient('session', 'New', 'new@example.test');
  assert.equal(sent[0], 'http://localhost:4000/api/clients');
  assert.equal(sent[1].headers.Authorization, 'Bearer session');
  assert.equal(sent[1].headers['Content-Type'], 'application/json');
  assert.deepEqual(JSON.parse(sent[1].body), { name: 'New', email: 'new@example.test' });
  await api.projects('session', 'a&b');
  assert.ok(sent[0].endsWith('?clientId=a%26b'));
  mock.mock.mockImplementation(async () => new Response('{"message":"Expired"}', { status: 401 }));
  await assert.rejects(request('/clients'), { status: 401, message: 'Expired' });
  mock.mock.mockImplementation(async () => new Response('not json', { status: 502 }));
  await assert.rejects(request('/clients'), { status: 502 });
  mock.mock.mockImplementation(async () => new Response('not json'));
  await assert.rejects(request('/clients'), /invalid response/);
  mock.mock.mockImplementation(async () => { throw new TypeError('Failed to fetch'); });
  await assert.rejects(request('/clients'), /Could not reach the server/);
  mock.mock.mockImplementation(async () => { throw new DOMException('Aborted', 'AbortError'); });
  await assert.rejects(request('/clients'), { name: 'AbortError' });
});
