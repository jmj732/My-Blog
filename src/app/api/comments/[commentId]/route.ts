import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { updateComment, deleteComment } from "@/lib/comments";
import { db } from "@/lib/db";
import { comments } from "@/db/schema";
import { eq } from "drizzle-orm";

type RouteParams = {
    params: Promise<{ commentId: string }>;
};

/**
 * PATCH /api/comments/[commentId]
 * Update a comment's content
 */
export async function PATCH(req: Request, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { commentId } = await params;
        const body = await req.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return new NextResponse("Content cannot be empty", { status: 400 });
        }

        // Check if user owns this comment
        const [existingComment] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, commentId))
            .limit(1);

        if (!existingComment) {
            return new NextResponse("Comment not found", { status: 404 });
        }

        if (existingComment.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedComment = await updateComment(commentId, content.trim());

        if (!updatedComment) {
            return new NextResponse("Failed to update comment", { status: 500 });
        }

        return NextResponse.json(updatedComment);
    } catch (error) {
        console.error("[COMMENTS_PATCH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

/**
 * DELETE /api/comments/[commentId]
 * Soft delete a comment (marks as deleted)
 */
export async function DELETE(req: Request, { params }: RouteParams) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { commentId } = await params;

        // Check if user owns this comment
        const [existingComment] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, commentId))
            .limit(1);

        if (!existingComment) {
            return new NextResponse("Comment not found", { status: 404 });
        }

        if (existingComment.userId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const success = await deleteComment(commentId);

        if (!success) {
            return new NextResponse("Failed to delete comment", { status: 500 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[COMMENTS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
