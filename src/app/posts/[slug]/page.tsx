import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPostBySlug } from "@/lib/posts";
import CommentSection from "@/components/comments/comment-section";

type ParamsPromise = Promise<{ slug: string }>;

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

// Helper to render Novel JSON content  
function renderNovelContent(jsonString: string) {
    try {
        const content = JSON.parse(jsonString);
        if (!content.content) return null;

        return content.content.map((node: any, idx: number) => {
            if (node.type === "heading") {
                const text = node.content?.[0]?.text || "";
                const level = node.attrs.level;
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
                const text = node.content?.[0]?.text || "";
                return <p key={idx} className="mt-6 leading-relaxed text-muted-foreground">{text}</p>;
            }

            if (node.type === "codeBlock") {
                const code = node.content?.[0]?.text || "";
                return (
                    <pre key={idx} className="mt-6 overflow-x-auto border-2 border-border bg-muted p-4 text-sm font-mono">
                        <code>{code}</code>
                    </pre>
                );
            }

            if (node.type === "blockquote") {
                const text = node.content?.[0]?.content?.[0]?.text || "";
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

export default async function PostPage({ params }: { params: ParamsPromise }) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="container max-w-3xl py-16">
            <Link
                href="/posts"
                className="inline-flex items-center text-sm text-muted-foreground transition hover:text-primary font-bold"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                포스트 목록으로
            </Link>

            <header className="mt-6 space-y-4">
                <p className="text-sm font-mono uppercase tracking-widest text-primary font-bold" suppressHydrationWarning>
                    {post.createdAt ? dateFormatter.format(new Date(post.createdAt)) : "날짜 없음"}
                </p>
                <h1 className="text-4xl font-black tracking-tighter md:text-5xl uppercase">
                    {post.title}
                </h1>
            </header>

            <div className="mt-10 border-t-2 border-border pt-10 leading-relaxed">
                {renderNovelContent(post.content)}
            </div>

            <CommentSection postId={post.id} />
        </article>
    );
}
