import { db } from "@/lib/db";
import { comments } from "@/db/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    parentId: string | null;
    content: string;
    isDeleted: number;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}

/**
 * Get all comments for a post with user information
 */
export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
    const result = await db.query.comments.findMany({
        where: eq(comments.postId, postId),
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
        orderBy: [desc(comments.createdAt)],
    });

    return result;
}

/**
 * Create a new comment
 */
export async function createComment(data: {
    postId: string;
    userId: string;
    content: string;
    parentId?: string | null;
}): Promise<Comment> {
    const [comment] = await db
        .insert(comments)
        .values({
            postId: data.postId,
            userId: data.userId,
            content: data.content,
            parentId: data.parentId || null,
        })
        .returning();

    // Fetch the comment with user data
    const commentWithUser = await db.query.comments.findFirst({
        where: eq(comments.id, comment.id),
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    if (!commentWithUser) {
        throw new Error("Failed to create comment");
    }

    return commentWithUser;
}

/**
 * Update a comment's content
 */
export async function updateComment(
    id: string,
    content: string
): Promise<Comment | null> {
    const [updated] = await db
        .update(comments)
        .set({
            content,
            updatedAt: new Date(),
        })
        .where(eq(comments.id, id))
        .returning();

    if (!updated) return null;

    // Fetch the updated comment with user data
    const commentWithUser = await db.query.comments.findFirst({
        where: eq(comments.id, id),
        with: {
            user: {
                columns: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
    });

    if (!commentWithUser) return null;

    return commentWithUser;
}

/**
 * Soft delete a comment (marks as deleted but keeps in DB for thread structure)
 */
export async function deleteComment(id: string): Promise<boolean> {
    const [deleted] = await db
        .update(comments)
        .set({
            isDeleted: 1,
            updatedAt: new Date(),
        })
        .where(eq(comments.id, id))
        .returning();

    return !!deleted;
}
