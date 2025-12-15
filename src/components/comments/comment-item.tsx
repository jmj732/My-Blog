"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Edit2, Trash2 } from "lucide-react";
import CommentForm from "./comment-form";
import type { Comment } from "@/types/comment";
import { apiRequest } from "@/lib/api-client";

interface CommentItemProps {
    comment: Comment;
    allComments: Comment[];
    currentUserId?: string;
    isAdmin?: boolean;
    onCommentChange: () => void;
    depth?: number;
}

export default function CommentItem({
    comment,
    allComments,
    currentUserId,
    isAdmin = false,
    onCommentChange,
    depth = 0,
}: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const isOwner = currentUserId === comment.userId;
    const isDeleted = !!comment.isDeleted;
    const canEdit = isOwner || isAdmin;

    // Get child comments (replies to this comment)
    const replies = allComments.filter((c) => c.parentId === comment.id);

    const handleDelete = async () => {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            await apiRequest<void>(`/api/v1/comments/${comment.id}`, {
                method: "DELETE",
            });
            onCommentChange();
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("댓글 삭제에 실패했습니다.");
        }
    };

    const handleReplySuccess = () => {
        setIsReplying(false);
        onCommentChange();
    };

    const handleEditSuccess = () => {
        setIsEditing(false);
        onCommentChange();
    };

    // Normalize dates in case the API returned strings
    const createdDate = new Date(comment.createdAt);
    const updatedDate = comment.updatedAt ? new Date(comment.updatedAt) : null;

    // Format date
    const formattedDate = new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(createdDate);

    const wasEdited =
        updatedDate !== null &&
        !isNaN(updatedDate.getTime()) &&
        updatedDate.getTime() !== createdDate.getTime();

    return (
        <div className={depth > 0 ? "ml-8 mt-4" : "mt-4"}>
            <div className="border-2 border-border bg-muted/30 p-4 rounded-lg">
                {/* Comment Header */}
                <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                        {comment.user?.image && (
                            <Image
                                src={comment.user.image}
                                alt={comment.user.name || "User"}
                                width={32}
                                height={32}
                                unoptimized
                                className="w-8 h-8 rounded-full border-2 border-border"
                            />
                        )}
                        <div>
                            <div className="font-bold text-sm uppercase tracking-wide">
                                {comment.user?.name || "익명"}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                                {formattedDate}
                                {wasEdited && <span className="ml-2">(수정됨)</span>}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {canEdit && !isDeleted && (
                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditing(!isEditing)}
                                className="h-8 px-2"
                            >
                                <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                className="h-8 px-2 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Comment Content */}
                {isEditing ? (
                    <div className="mt-3">
                        <CommentForm
                            postId={comment.postId}
                            initialContent={comment.content}
                            isEditing={true}
                            commentId={comment.id}
                            onSuccess={handleEditSuccess}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                ) : (
                    <>
                        <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                            {isDeleted ? (
                                <span className="text-muted-foreground italic">[삭제된 댓글입니다]</span>
                            ) : (
                                comment.content
                            )}
                        </p>

                        {/* Reply Button */}
                        {!isDeleted && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsReplying(!isReplying)}
                                className="mt-2 h-8 px-2 text-sm uppercase font-bold"
                            >
                                <MessageSquare className="mr-1 h-3 w-3" />
                                답글
                            </Button>
                        )}
                    </>
                )}
            </div>

            {/* Reply Form */}
            {isReplying && (
                <div className="ml-8 mt-3">
                    <CommentForm
                        postId={comment.postId}
                        parentId={comment.id}
                        onSuccess={handleReplySuccess}
                        onCancel={() => setIsReplying(false)}
                    />
                </div>
            )}

            {/* Nested Replies (Recursive) */}
            {replies.length > 0 && (
                <div className="mt-2">
                    {replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            allComments={allComments}
                            currentUserId={currentUserId}
                            isAdmin={isAdmin}
                            onCommentChange={onCommentChange}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
