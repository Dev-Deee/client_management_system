import { Router } from "express";
import { authenticate } from "../middleware/authenticate.js";
import { login } from "../controllers/authController.js";
import { listClients, addClient, deleteClient } from "../controllers/clientController.js";
import { listProjects } from "../controllers/projectController.js";

export const apiRouter = Router();
apiRouter.post("/login", login);
apiRouter.get("/clients", authenticate, listClients);
apiRouter.post("/clients", authenticate, addClient);
apiRouter.delete("/clients/:id", authenticate, deleteClient);
apiRouter.get("/projects", authenticate, listProjects);
