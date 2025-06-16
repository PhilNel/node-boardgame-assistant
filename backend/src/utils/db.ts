import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const MAX_CONNECTIONS = 10;
const IDLE_TIMEOUT_SECONDS = 20;
const CONNECT_TIMEOUT_SECONDS = 10;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}



export const sql = postgres(connectionString, {
  ssl: { rejectUnauthorized: false },
  max: MAX_CONNECTIONS,
  idle_timeout: IDLE_TIMEOUT_SECONDS,
  connect_timeout: CONNECT_TIMEOUT_SECONDS,
}); 