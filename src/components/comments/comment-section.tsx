"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";
import type { Comment } from "@/lib/comments";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CommentSectionProps {
    postId: string;
}

export default function CommentSection({ postId }: CommentSectionProps) {
    const { data: session, status } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isAdmin = session?.user?.email === process.env.ADMIN_EMAIL;

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/comments?postId=${postId}`);
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [postId]);

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
            {status === "loading" ? (
                <div className="text-muted-foreground">로딩 중...</div>
            ) : status === "authenticated" ? (
                <div className="mb-8">
                    <CommentForm postId={postId} onSuccess={handleCommentChange} />
                </div>
            ) : (
                <div className="mb-8 p-6 border-2 border-border bg-muted/30 rounded-lg">
                    <p className="text-muted-foreground text-center">
                        댓글을 작성하려면{" "}
                        <Link href="/api/auth/signin" className="text-primary font-bold hover:underline">
                            로그인
                        </Link>
                        이 필요합니다.
                    </p>
                </div>
            )}

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
                            currentUserId={session?.user?.id}
                            isAdmin={isAdmin}
                            onCommentChange={handleCommentChange}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
