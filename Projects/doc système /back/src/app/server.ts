import "dotenv/config";

import { connectToDatabase } from "../config/db.js";
import { getEnv } from "../config/env.js";
import { createApp } from "./app.js";

async function startServer() {
  const env = getEnv();

  await connectToDatabase();

  const app = createApp({
    corsOrigin: env.CORS_ORIGIN,
    nodeEnv: env.NODE_ENV,
  });

  app.listen(env.PORT, () => {
    console.log(`Back server listening on http://127.0.0.1:${env.PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to start back server", error);
  process.exitCode = 1;
});
