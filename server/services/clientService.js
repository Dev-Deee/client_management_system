import { randomUUID } from "node:crypto";
import { store } from "../data/store.js";
import { httpError } from "../helpers/httpError.js";

export function listClients() {
  return store.clients;
}

export function addClient(name, email) {
  if (typeof name !== "string" || !name || typeof email !== "string" || !email) {
    throw httpError(400, "Name and email are required");
  }
  if (store.clients.some((client) => client.email.toLowerCase() === email.toLowerCase())) {
    throw httpError(409, "A client with this email already exists");
  }
  const client = { id: randomUUID(), name, email };
  store.clients.push(client);
  return client;
}

export function deleteClient(id) {
  if (!store.clients.some((client) => client.id === id)) {
    throw httpError(404, "Client not found");
  }
  store.clients = store.clients.filter((client) => client.id !== id);
  store.projects = store.projects.filter((project) => project.clientId !== id);
}
