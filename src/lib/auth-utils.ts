import "server-only";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function isAdmin(userEmail: string | null | undefined): Promise<boolean> {
    if (!userEmail) return false;

    // Check ADMIN_EMAIL env variable
    if (userEmail === process.env.ADMIN_EMAIL) {
        return true;
    }

    // Check DB role
    const user = await db.query.users.findFirst({
        where: eq(users.email, userEmail),
    });

    return user?.role === "admin";
}

export async function canWrite(userEmail: string | null | undefined): Promise<boolean> {
    return !!userEmail; // Any authenticated user can write
}

export async function requireAuth() {
    const session = await auth();
    if (!session?.user?.email) {
        return { error: "Unauthorized", status: 401 };
    }
    return { user: session.user, email: session.user.email };
}

export async function requireAdmin() {
    const authResult = await requireAuth();
    if ("error" in authResult) return authResult;

    const adminCheck = await isAdmin(authResult.email);
    if (!adminCheck) {
        return { error: "Forbidden: Admin only", status: 403 };
    }

    return authResult;
}
