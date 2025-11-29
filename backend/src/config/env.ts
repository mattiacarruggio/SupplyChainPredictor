/**
 * Environment Variable Validation
 *
 * Validates required environment variables are set at startup.
 * Fails fast if critical configuration is missing.
 */

export interface EnvConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  LOG_LEVEL: string;
}

function validateEnv(): EnvConfig {
  const required = ['DATABASE_URL'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file or environment configuration.`
    );
  }

  return {
    DATABASE_URL: process.env.DATABASE_URL!,
    NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
    PORT: parseInt(process.env.PORT || '4000', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  };
}

export const env = validateEnv();
