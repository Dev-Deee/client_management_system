import "dotenv/config";

for (const name of ["JWT_SECRET", "CLIENT_ORIGIN", "ADMIN_EMAIL", "ADMIN_PASSWORD"]) {
  if (!process.env[name]) {
    throw new Error(`${name} is not set. Add it to server/.env`);
  }
}

export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
  clientOrigin: process.env.CLIENT_ORIGIN,
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD
};
