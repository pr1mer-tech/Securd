import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

const queryClient = new Pool({ connectionString: process.env.POSTGRES_CONNECTIONSTRING ?? "" });

export const db = drizzle(queryClient, { schema });