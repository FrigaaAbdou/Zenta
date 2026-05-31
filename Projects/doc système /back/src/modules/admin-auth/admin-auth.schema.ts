import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.email("A valid admin email is required").trim().toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
