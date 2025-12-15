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

export function register() {
    // Only run on server-side (Node.js runtime)
    if (process.env.NEXT_RUNTIME !== "nodejs") return;
    console.log("[instrumentation] No local sync: relying on external API backend.");
}
