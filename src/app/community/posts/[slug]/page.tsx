import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { hasAdminRole } from "@/lib/auth";
import { getCurrentUser } from "@/lib/current-user";
import { getPostBySlug } from "@/lib/posts";
import CommentSection from "@/components/comments/comment-section";
import { PostActions } from "@/components/posts/post-actions";

type ParamsPromise = Promise<{ slug: string }>;

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

type NovelNode = {
    type?: string;
    attrs?: { level?: number };
    text?: string;
    content?: NovelNode[];
};

type NovelDocument = {
    content?: NovelNode[];
};

function extractText(node?: NovelNode): string {
    if (!node) return "";
    if (typeof node.text === "string") return node.text;
    if (Array.isArray(node.content)) {
        return node.content.map(extractText).join("");
    }
    return "";
}

function renderNovelContent(jsonString: string) {
    try {
        const parsed = JSON.parse(jsonString) as NovelDocument;
        const nodes = Array.isArray(parsed.content) ? parsed.content : [];

        return nodes.map((node, idx) => {
            if (node.type === "heading") {
                const text = extractText(node);
                const level = node.attrs?.level ?? 1;
                const sizeClasses: Record<number, string> = {
                    1: "text-4xl font-black uppercase tracking-tighter mt-8",
                    2: "text-3xl font-bold uppercase tracking-tight mt-10",
                    3: "text-2xl font-bold uppercase tracking-tight mt-8",
                };

                if (level === 1) return <h1 key={idx} className={sizeClasses[1]}>{text}</h1>;
                if (level === 2) return <h2 key={idx} className={sizeClasses[2]}>{text}</h2>;
                if (level === 3) return <h3 key={idx} className={sizeClasses[3]}>{text}</h3>;
            }

            if (node.type === "paragraph") {
                const text = extractText(node);
                return <p key={idx} className="mt-6 leading-relaxed text-muted-foreground">{text}</p>;
            }

            if (node.type === "codeBlock") {
                const code = extractText(node);
                return (
                    <pre key={idx} className="mt-6 overflow-x-auto border-2 border-border bg-muted p-4 text-sm font-mono">
                        <code>{code}</code>
                    </pre>
                );
            }

            if (node.type === "blockquote") {
                const text = extractText(node);
                return (
                    <blockquote key={idx} className="mt-8 border-l-4 border-primary bg-muted px-6 py-4 text-lg italic">
                        {text}
                    </blockquote>
                );
            }

            return null;
        });
    } catch {
        return <p className="text-muted-foreground">콘텐츠를 표시할 수 없습니다.</p>;
    }
}

export async function generateMetadata({
    params,
}: {
    params: ParamsPromise;
}): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "포스트를 찾을 수 없습니다",
        };
    }

    return {
        title: `${post.title} | AI Blog`,
        openGraph: {
            title: post.title,
            type: "article",
        },
    };
}

export const dynamic = "force-dynamic";

export default async function CommunityPostPage({ params }: { params: ParamsPromise }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    const user = await getCurrentUser();
    const isAdmin = hasAdminRole(user?.role, (user as { roles?: unknown })?.roles);
    const postAuthorId = post.authorId || post.author?.id || "";
    const isOwner = !!user?.id && !!postAuthorId && String(user.id) === postAuthorId;
    const canEdit = isAdmin || isOwner;
    const currentUserId = user?.id ? String(user.id) : undefined;

    return (
        <article className="container max-w-3xl py-16">
            <Link
                href="/community"
                className="inline-flex items-center text-sm text-muted-foreground transition hover:text-primary font-bold"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                커뮤니티 목록으로
            </Link>

            <header className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-sm">
                    <span className="font-mono uppercase tracking-widest text-primary font-bold" suppressHydrationWarning>
                        {post.createdAt ? dateFormatter.format(new Date(post.createdAt)) : "날짜 없음"}
                    </span>
                    {post.author?.name && (
                        <>
                            <span className="text-muted-foreground">•</span>
                            <span className="font-mono uppercase tracking-wide text-foreground font-bold">
                                {post.author.name}
                            </span>
                        </>
                    )}
                </div>
                <h1 className="text-4xl font-black tracking-tighter md:text-5xl uppercase">
                    {post.title}
                </h1>
                {canEdit && <PostActions slug={post.slug} variant="community" />}
            </header>

            <div className="mt-10 border-t-2 border-border pt-10 leading-relaxed">
                {renderNovelContent(post.content)}
            </div>

            <CommentSection postId={post.id} isAdmin={isAdmin} currentUserId={currentUserId} />
        </article>
    );
}

