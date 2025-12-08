import { NextResponse } from "next/server";
import { fetchPostsFeed } from "@/lib/posts-feed";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get("limit") || "20", 10);
    const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 100 ? limitParam : 20;

    const cursorCreatedAt = searchParams.get("cursorCreatedAt");
    const cursorId = searchParams.get("cursorId");
    const cursor = cursorCreatedAt && cursorId ? { created_at: cursorCreatedAt, id: cursorId } : null;

    try {
        const { rows, nextCursor } = await fetchPostsFeed(limit, cursor);
        return NextResponse.json({ rows, nextCursor });
    } catch (error) {
        console.error("[posts_feed]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
