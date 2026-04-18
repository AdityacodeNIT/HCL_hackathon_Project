import cors from "cors";
import express from "express";
import { API_PREFIX } from "./config/constants.js";
import env from "./config/env.js";
import errorHandler from "./middleware/error-handler.js";
import notFound from "./middleware/not-found.js";
import authRoutes from "./modules/auth/auth.routes.js";
import catalogRoutes from "./modules/catalog/catalog.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import schedulingRoutes from "./modules/scheduling/scheduling.routes.js";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS."));
    },
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      message: "Hospital vaccine booking API is running.",
    },
  });
});

app.use(`${API_PREFIX}/health`, healthRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}`, catalogRoutes);
app.use(`${API_PREFIX}`, schedulingRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
