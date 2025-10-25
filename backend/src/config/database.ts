import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { parse } from 'pg-connection-string';
import * as path from 'path';

config();

// Parse DATABASE_URL if provided (for Render/Heroku)
const getDatabaseConfig = (): DataSourceOptions => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Parse connection string (Render format)
    const parsedConfig = parse(databaseUrl);

    return {
      type: 'postgres',
      host: parsedConfig.host || 'localhost',
      port: parseInt(parsedConfig.port || '5432'),
      username: parsedConfig.user || 'postgres',
      password: parsedConfig.password,
      database: parsedConfig.database || 'learning_platform',
      synchronize: true, // Auto-create tables in production
      logging: true, // Enable logging to debug
      entities: [path.join(__dirname, '../entities/**/*.{ts,js}')], // Use path.join for reliable resolution
      migrations: process.env.NODE_ENV === 'production'
        ? ['dist/database/migrations/**/*.js']
        : ['src/database/migrations/**/*.ts'],
      subscribers: [],
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      extra: {
        max: 20,
        connectionTimeoutMillis: 2000,
      },
    };
  }

  // Fallback to individual env vars (local development)
  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE || 'learning_platform',
    synchronize: true, // Auto-create tables
    logging: true,
    entities: [path.join(__dirname, '../entities/**/*.{ts,js}')], // Use path.join for reliable resolution
    migrations: ['src/database/migrations/**/*.ts'],
    subscribers: [],
    ssl: false,
    extra: {
      max: 20,
      connectionTimeoutMillis: 2000,
    },
  };
};

export const AppDataSource = new DataSource(getDatabaseConfig());
