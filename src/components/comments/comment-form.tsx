"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api-client";

interface CommentFormProps {
    postId: string;
    parentId?: string | null;
    onSuccess: () => void;
    onCancel?: () => void;
    initialContent?: string;
    isEditing?: boolean;
    commentId?: string;
}

export default function CommentForm({
    postId,
    parentId,
    onSuccess,
    onCancel,
    initialContent = "",
    isEditing = false,
    commentId,
}: CommentFormProps) {
    const [content, setContent] = useState(initialContent);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!content.trim()) return;

        setIsSubmitting(true);

        try {
            if (isEditing && commentId) {
                // Update existing comment
                await apiRequest<void>(`/api/v1/comments/${commentId}`, {
                    method: "PATCH",
                    body: JSON.stringify({ content }),
                });
            } else {
                // Create new comment
                await apiRequest<void>(`/api/v1/comments`, {
                    method: "POST",
                    body: JSON.stringify({ postId, content, parentId }),
                });
            }

            setContent("");
            onSuccess();
        } catch (error) {
            console.error("Error submitting comment:", error);
            alert("댓글 작성에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={parentId ? "답글을 작성하세요..." : "댓글을 작성하세요..."}
                className="w-full min-h-[100px] p-3 border-2 border-border bg-background rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                disabled={isSubmitting}
            />
            <div className="flex gap-2">
                <Button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="uppercase font-bold"
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? "수정" : "작성"}
                </Button>
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="uppercase font-bold"
                    >
                        취소
                    </Button>
                )}
            </div>
        </form>
    );
}
