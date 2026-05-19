import { config } from 'dotenv';
import { z } from 'zod';

config();

const EnvSchema = z.object({
  PORT: z.string().default('4001'),
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  JOB_SECRET: z.string().min(8).default('change-me'),
  JWT_ISSUER: z.string().optional(),
});

export const env = EnvSchema.parse(process.env);
