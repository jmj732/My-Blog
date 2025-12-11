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

async function checkAdmin() {
    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        console.log("🔍 Checking for admin user with email:", adminEmail);

        if (!adminEmail) {
            console.error("❌ ADMIN_EMAIL not set in .env.local");
            process.exit(1);
        }

        const adminUser = await db.query.users.findFirst({
            where: eq(users.email, adminEmail),
        });

        if (!adminUser) {
            console.error("❌ Admin user not found in database");
            console.log("\n📝 Please sign in at least once to create the user account");
        } else {
            console.log("\n✅ Admin user found:");
            console.log("   ID:", adminUser.id);
            console.log("   Name:", adminUser.name);
            console.log("   Email:", adminUser.email);
            console.log("   Role:", adminUser.role);

            if (adminUser.role !== "admin") {
                console.log("\n⚠️  User role is not 'admin'!");
                console.log("   Run: npm run fix-admin-role");
            } else {
                console.log("\n✅ Admin role is correctly set!");
            }
        }
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await client.end();
        process.exit(0);
    }
}

checkAdmin();
