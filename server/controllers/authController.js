import * as authService from "../services/authService.js";

export function login(req, res) {
  const { email, password } = req.body || {};
  res.json(authService.login(email, password));
}
