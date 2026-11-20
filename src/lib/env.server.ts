import "server-only";
import { z } from "zod";

/** Server-only secrets. Importing this file from a Client Component fails the build. */

const serverSchema = z.object({
  SUPABASE_SECRET_KEY: z.string().min(1).optional(),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().min(1).optional(),
  CRON_SECRET: z.string().min(16).optional(),
});

const serverEnv = serverSchema.parse({
  SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || undefined,
  RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
  EMAIL_FROM: process.env.EMAIL_FROM || undefined,
  CRON_SECRET: process.env.CRON_SECRET || undefined,
});

export function requireServerEnv<K extends keyof typeof serverEnv>(key: K): string {
  const value = serverEnv[key];
  if (!value) {
    throw new Error(`Server-Umgebungsvariable ${key} fehlt (siehe .env.example).`);
  }
  return value;
}
