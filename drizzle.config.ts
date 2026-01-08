import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    dialect: 'postgresql',
    out: "./.drizzle",
    schema: './server/db/schema/*',
    dbCredentials: {
        url: process.env.DATABASE_URL as string,
    },
    schemaFilter: ['gw2trivia'],
    tablesFilter: ['*'],
    introspect: {
        casing: 'camel',
    },
});