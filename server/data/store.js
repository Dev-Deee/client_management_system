import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { config } from "../config.js";

// This demo intentionally keeps data in memory; restarting resets it.
const clients = [
  { id: randomUUID(), name: "Acme Limited", email: "contact@acme.test" },
  { id: randomUUID(), name: "Bright Solutions", email: "hello@bright.test" }
];

export const store = {
  users: [{
    id: randomUUID(),
    name: "Admin User",
    email: config.adminEmail,
    passwordHash: bcrypt.hashSync(config.adminPassword, 10)
  }],
  clients,
  projects: [
    { id: randomUUID(), name: "Website Development", clientId: clients[0].id },
    { id: randomUUID(), name: "Mobile Application", clientId: clients[1].id },
    { id: randomUUID(), name: "UI/UX Design", clientId: clients[0].id }
  ]
};
