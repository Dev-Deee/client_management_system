import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { store } from "../data/store.js";
import { httpError } from "../helpers/httpError.js";

export function login(email, password) {
  const user = store.users.find((item) => item.email === email);
  if (!user || typeof password !== "string" || !bcrypt.compareSync(password, user.passwordHash)) {
    throw httpError(401, "Invalid email or password");
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
  const { passwordHash, ...publicUser } = user;
  return { token, user: publicUser };
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}
