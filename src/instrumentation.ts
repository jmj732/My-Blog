import { syncPostsToDatabase } from "@/lib/post-sync";

/**
 * Next.js Instrumentation Hook
 *
 * This function runs once when the server starts (both in dev and production).
 * It automatically syncs all MDX posts to the database with embeddings.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
    // Only run on server-side
    if (process.env.NEXT_RUNTIME === "nodejs") {
        try {
            console.log("[instrumentation] Starting automatic post sync...");
            const result = await syncPostsToDatabase();
            console.log(
                `[instrumentation] Post sync completed: ${result.inserted} inserted, ${result.updated} updated (${result.total} total)`
            );
        } catch (error) {
            console.error("[instrumentation] Failed to sync posts:", error);
            // Don't throw - allow server to start even if sync fails
        }
    }
}
