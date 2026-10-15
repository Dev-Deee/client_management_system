import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set. Add it to server/.env");
}

if (!CLIENT_ORIGIN) {
  throw new Error("CLIENT_ORIGIN is not set. Add it to server/.env");
}

app.use(cors({ origin: CLIENT_ORIGIN }));
app.use(express.json());

const users = [
  {
    id: randomUUID(),
    name: "Admin User",
    email: process.env.ADMIN_EMAIL,
    passwordHash: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
  }
];

let clients = [
  {
    id: randomUUID(),
    name: "Acme Limited",
    email: "contact@acme.test"
  },
  {
    id: randomUUID(),
    name: "Bright Solutions",
    email: "hello@bright.test"
  }
];

let projects = [
  {
    id: randomUUID(),
    name: "Website Development",
    clientId: clients[0].id
  },
  {
    id: randomUUID(),
    name: "Mobile Application",
    clientId: clients[1].id
  },
  {
    id: randomUUID(),
    name: "UI/UX Design",
    clientId: clients[0].id
  }
];

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  const user = users.find((item) => item.email === email);

  const passwordMatches =
    user && bcrypt.compareSync(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).json({
      message: "Invalid email or password"
    });
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const { passwordHash, ...publicUser } = user;

  res.json({
    token,
    user: publicUser
  });
});

// Authentication middleware
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

// Get clients
app.get("/api/clients", authenticate, (req, res) => {
  res.json({
    data: clients
  });
});

// Add client
app.post("/api/clients", authenticate, (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  const emailTaken = clients.some(
    (client) => client.email.toLowerCase() === email.toLowerCase()
  );

  if (emailTaken) {
    return res.status(409).json({
      message: "A client with this email already exists"
    });
  }

  const newClient = {
    id: randomUUID(),
    name,
    email
  };

  clients.push(newClient);

  res.status(201).json({
    data: newClient
  });
});

// Delete client
app.delete("/api/clients/:id", authenticate, (req, res) => {
  const id = req.params.id;

  const originalLength = clients.length;

  clients = clients.filter(
    (client) => client.id !== id
  );

  if (clients.length === originalLength) {
    return res.status(404).json({message: "Client not found"
    });
  }

  projects = projects.filter((project) => project.clientId !== id);

  res.json({
    message: "Client deleted successfully"
  });
});

// Get projects
app.get("/api/projects", authenticate, (req, res) => {
  const { clientId } = req.query;

  let result = projects;

  if (clientId) {
    result = projects.filter(
      (project) => project.clientId === clientId
    );
  }

  res.json({
    projects: result
  });
});

// Unknown route
app.use((req, res) => {
  res.status(404).json({
    message: "Not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
