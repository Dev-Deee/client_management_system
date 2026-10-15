import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { apiRouter } from "./routes/api.js";

export const app = express();
app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());
app.use("/api", apiRouter);
app.use((req, res) => res.status(404).json({ message: "Not found" }));
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ message: err.message });
});
