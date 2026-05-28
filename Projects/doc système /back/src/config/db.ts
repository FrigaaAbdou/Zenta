import mongoose from "mongoose";

import { getEnv } from "./env.js";

export async function connectToDatabase(uri = getEnv().MONGODB_URI) {
  await mongoose.connect(uri);
}

export async function disconnectFromDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
