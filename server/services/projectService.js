import { store } from "../data/store.js";

export function listProjects(clientId) {
  return clientId
    ? store.projects.filter((project) => project.clientId === clientId)
    : store.projects;
}
