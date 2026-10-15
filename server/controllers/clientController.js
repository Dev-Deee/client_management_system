import * as clientService from "../services/clientService.js";

export function listClients(req, res) {
  res.json({ data: clientService.listClients() });
}

export function addClient(req, res) {
  const { name, email } = req.body || {};
  res.status(201).json({ data: clientService.addClient(name, email) });
}

export function deleteClient(req, res) {
  clientService.deleteClient(req.params.id);
  res.json({ message: "Client deleted successfully" });
}
