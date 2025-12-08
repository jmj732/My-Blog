import { auth } from "@/auth";
import { NextResponse } from "next/server";
import {
    getCommentsByPostId,
    createComment,
} from "@/lib/comments";

/**
 * GET /api/comments?postId=xxx
 * Fetch all comments for a specific post
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get("postId");

        if (!postId) {
            return new NextResponse("Post ID is required", { status: 400 });
        }

        const comments = await getCommentsByPostId(postId);
        return NextResponse.json(comments);
    } catch (error) {
        console.error("[COMMENTS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/**
 * POST /api/comments
 * Create a new comment (top-level or reply)
 */
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { postId, content, parentId } = body;

        if (!postId || !content) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        if (content.trim().length === 0) {
            return new NextResponse("Comment cannot be empty", { status: 400 });
        }

        const comment = await createComment({
            postId,
            userId: session.user.id,
            content: content.trim(),
            parentId: parentId || null,
        });

        return NextResponse.json(comment, { status: 201 });
    } catch (error) {
        console.error("[COMMENTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
