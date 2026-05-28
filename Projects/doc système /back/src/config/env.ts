import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CORS_ORIGIN: z.url("CORS_ORIGIN must be a valid URL"),
});

export type Env = z.infer<typeof envSchema>;

export function createEnv(input: NodeJS.ProcessEnv) {
  return envSchema.parse(input);
}

let envCache: Env | null = null;

export function getEnv() {
  if (!envCache) {
    envCache = createEnv(process.env);
  }

  return envCache;
}
