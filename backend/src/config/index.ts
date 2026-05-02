import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const jwtSecretSchema = process.env.NODE_ENV === 'test'
  ? z.string().min(10).default('test-secret')
  : z.string().min(10, 'JWT_SECRET must be set');

const envSchema = z.object({
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_KEY: z.string().optional(),
  MONGODB_URI: z.string().optional(),
  CLAUDE_API_KEY: z.string().optional(),
  JWT_SECRET: jwtSecretSchema,
  RATE_LIMIT_WINDOW_MS: z.string().regex(/^[0-9]+$/).default('60000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().regex(/^[0-9]+$/).default('60'),
  PORT: z.string().regex(/^[0-9]+$/).default('4000')
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.format());
  throw new Error('Invalid environment configuration');
}

export const config = {
  supabaseUrl: parsed.data.SUPABASE_URL,
  supabaseKey: parsed.data.SUPABASE_KEY,
  mongodbUri: parsed.data.MONGODB_URI,
  claudeApiKey: parsed.data.CLAUDE_API_KEY,
  jwtSecret: parsed.data.JWT_SECRET,
  rateLimitWindowMs: Number(parsed.data.RATE_LIMIT_WINDOW_MS),
  rateLimitMaxRequests: Number(parsed.data.RATE_LIMIT_MAX_REQUESTS),
  port: Number(parsed.data.PORT)
};
