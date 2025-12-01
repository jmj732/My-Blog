import { NextResponse } from "next/server";

import { syncPostsToDatabase } from "@/lib/post-sync";

export async function POST(request: Request) {
    const syncToken = request.headers.get("x-sync-token");
    const expectedToken = process.env.POST_SYNC_TOKEN;
    if (expectedToken && expectedToken !== syncToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const summary = await syncPostsToDatabase();
        return NextResponse.json(summary);
    } catch (error) {
        console.error("[posts.sync] failed:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
}
