import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, {
    // Supabase/Postgres requires TLS; pgBouncer doesn't support prepared statements
    prepare: false,
    max: 1,
    ssl: "require",
});
export const db = drizzle(client, { schema });
