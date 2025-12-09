import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { updateComment, deleteComment } from "@/lib/comments";
import { db } from "@/lib/db";
import { comments } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * PATCH /api/comments/[id]
 * Update a comment (owner or admin only)
 */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = params;
        const body = await req.json();
        const { content } = body;

        if (!content || content.trim().length === 0) {
            return new NextResponse("Content is required", { status: 400 });
        }

        // Get the comment to check ownership
        const [comment] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, id))
            .limit(1);

        if (!comment) {
            return new NextResponse("Comment not found", { status: 404 });
        }

        // Check if user is owner or admin
        const isOwner = comment.userId === session.user.id;
        const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

        if (!isOwner && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedComment = await updateComment(id, content.trim());

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
 * DELETE /api/comments/[id]
 * Soft delete a comment (owner or admin only)
 */
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { id } = params;

        // Get the comment to check ownership
        const [comment] = await db
            .select()
            .from(comments)
            .where(eq(comments.id, id))
            .limit(1);

        if (!comment) {
            return new NextResponse("Comment not found", { status: 404 });
        }

        // Check if user is owner or admin
        const isOwner = comment.userId === session.user.id;
        const isAdmin = session.user.email === process.env.ADMIN_EMAIL;

        if (!isOwner && !isAdmin) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const success = await deleteComment(id);

        if (!success) {
            return new NextResponse("Failed to delete comment", { status: 500 });
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("[COMMENTS_DELETE]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
