import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { errorMiddleware } from "../middlewares/error.middleware.js";
import { notFoundMiddleware } from "../middlewares/not-found.middleware.js";
import { createRootRouter } from "../routes/index.js";

type AppConfig = {
  corsOrigin: string;
  nodeEnv?: "development" | "test" | "production";
};

export function createApp({ corsOrigin, nodeEnv = "development" }: AppConfig) {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));
  app.use(morgan(nodeEnv === "test" ? "tiny" : "dev"));
  app.use(express.json());
  app.use(createRootRouter());
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
