/**
 * Next.js Instrumentation Hook
 *
 * Heavy work here blocks the server from starting. Previously we awaited a full
 * post sync (including embedding generation), which stalled boot when network
 * access was restricted. We now gate the sync behind an env flag and run it in
 * the background with a timeout so the server can start immediately.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

const shouldSyncOnBoot = process.env.POST_SYNC_ON_BOOT === "true";
const syncTimeoutMs = Number(process.env.POST_SYNC_TIMEOUT_MS ?? "15000");

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`${label} timed out after ${ms}ms`));
        }, ms);

        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

export function register() {
    // Only run on server-side (Node.js runtime)
    if (process.env.NEXT_RUNTIME !== "nodejs") return;

    if (!shouldSyncOnBoot) {
        console.log("[instrumentation] Skipping post sync on boot (POST_SYNC_ON_BOOT != 'true').");
        return;
    }

    const runSync = async () => {
        try {
            const { syncPostsToDatabase } = await import("@/lib/post-sync");
            console.log("[instrumentation] Starting automatic post sync...");
            const result = await withTimeout(
                syncPostsToDatabase(),
                syncTimeoutMs,
                "post sync"
            );
            console.log(
                `[instrumentation] Post sync completed: ${result.inserted} inserted, ${result.updated} updated (${result.total} total)`
            );
        } catch (error) {
            console.error("[instrumentation] Post sync skipped due to error:", error);
        }
    };

    // Fire-and-forget so server start is never blocked
    void runSync();
}
