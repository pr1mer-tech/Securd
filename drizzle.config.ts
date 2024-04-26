import { defineConfig } from 'drizzle-kit'
export default defineConfig({
    schema: "./db/schema.ts",
    out: "./drizzle",
    driver: 'pg',
    dbCredentials: {
        host: process.env.POSTGRES_HOST!,
        port: Number.parseInt(process.env.POSTGRES_PORT || "5432"),
        database: process.env.POSTGRES_DATABASE!,
        user: process.env.POSTGRES_USER!,
        password: process.env.POSTGRES_PASSWORD!,
        ssl: true
    },
    verbose: true,
    strict: true,
})