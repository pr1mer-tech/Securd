import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const host = process.env.POSTGRES_HOST;
const port = process.env.POSTGRES_PORT;
const database = process.env.POSTGRES_DATABASE;

const queryClient = postgres("postgres://username:password@host.com:5432/database", {
    host,
    port: parseInt(port || "5432"),
    database,
    username: user,
    password,
    ssl: true
});

export const db = drizzle(queryClient, { schema });