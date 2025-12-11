import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "../src/db/schema";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, {
    prepare: false,
    max: 1,
    ssl: "require",
});
const db = drizzle(client, { schema: { users } });

async function fixAdminRole() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        console.log("🔧 Updating admin role for:", adminEmail);

        if (!adminEmail) {
            console.error("❌ ADMIN_EMAIL not set in .env.local");
            process.exit(1);
        }

        const result = await db
            .update(users)
            .set({ role: "admin" })
            .where(eq(users.email, adminEmail))
            .returning();

        if (result.length === 0) {
            console.error("❌ User not found. Please sign in at least once.");
        } else {
            console.log("\n✅ Admin role updated successfully!");
            console.log("   ID:", result[0].id);
            console.log("   Name:", result[0].name);
            console.log("   Email:", result[0].email);
            console.log("   Role:", result[0].role);
        }
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.end();
        process.exit(0);
    }
}

fixAdminRole();
