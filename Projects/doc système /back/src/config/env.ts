import { z } from "zod";

const corsOriginSchema = z
  .string()
  .min(1, "CORS_ORIGIN is required")
  .refine(
    (value) =>
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .every((item) => z.url().safeParse(item).success),
    "CORS_ORIGIN must contain one or more valid URLs",
  );

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CORS_ORIGIN: corsOriginSchema,
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
