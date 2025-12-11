import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/reviews", reviewRoutes);
app.use("/api/uploads", uploadRoutes);
app.use(errorHandler);

app.listen(config.port, () => console.log(`Server running on port ${config.port}`));
