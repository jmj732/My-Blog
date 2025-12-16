"use client";

import { useState, useEffect, useCallback } from "react";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";
import type { Comment } from "@/types/comment";
import { apiRequest } from "@/lib/api-client";

interface CommentSectionProps {
    postId: string;
    isAdmin?: boolean;
    currentUserId?: string;
}

export default function CommentSection({ postId, isAdmin = false, currentUserId }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    type BackendComment = {
        id: string | number;
        postId: string | number;
        userId: string | number;
        userName: string | null;
        deleted: boolean;
        content: string;
        createdAt: string;
        updatedAt?: string;
        parentId?: string | number | null;
    };

    const fetchComments = useCallback(async () => {
        try {
            const data = await apiRequest<BackendComment[]>(
                `/api/v1/comments?postId=${encodeURIComponent(postId)}`
            );

            const mapped: Comment[] = (data ?? []).map((c) => ({
                id: String(c.id),
                postId: String(c.postId),
                userId: String(c.userId),
                parentId: c.parentId ? String(c.parentId) : null,
                content: c.content,
                isDeleted: !!c.deleted,
                createdAt: c.createdAt,
                updatedAt: c.updatedAt ?? null,
                user: {
                    id: String(c.userId),
                    name: c.userName,
                    email: null,
                    image: null,
                },
            }));

            setComments(mapped);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setIsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleCommentChange = () => {
        fetchComments();
    };

    // Get top-level comments (no parent)
    const topLevelComments = comments.filter((c) => !c.parentId);

    return (
        <section className="mt-16 border-t-2 border-border pt-12">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">
                댓글 {comments.length}
            </h2>

            {/* Comment Form for Authenticated Users */}
            <div className="mb-8">
                <CommentForm postId={postId} onSuccess={handleCommentChange} />
            </div>

            {/* Comments List */}
            {isLoading ? (
                <div className="text-muted-foreground">댓글을 불러오는 중...</div>
            ) : topLevelComments.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                    첫 댓글을 작성해보세요!
                </div>
            ) : (
                <div className="space-y-4">
                    {topLevelComments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            allComments={comments}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            onCommentChange={handleCommentChange}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
