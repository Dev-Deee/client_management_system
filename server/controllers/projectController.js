import { listProjects as getProjects } from "../services/projectService.js";

export function listProjects(req, res) {
  res.json({ projects: getProjects(req.query.clientId) });
}
