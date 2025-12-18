import type { Metadata } from "next";
import { PenTool } from "lucide-react";
import { getCursorPosts } from "@/lib/posts";
import { InfinitePostFeed } from "@/components/posts/infinite-post-feed";

export const metadata: Metadata = {
    title: "전체 포스트 | AI Blog",
    description: "AI 기반 블로그에 게시된 모든 아티클을 찾아보세요.",
};

export const dynamic = "force-dynamic";

export default async function PostsPage() {
    const { rows, nextCursor } = await getCursorPosts({ type: "admin", limit: 20 });

    return (
        <section className="container py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-bold uppercase tracking-wide">
                    <PenTool className="h-4 w-4" />
                    최신 인사이트
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl uppercase">
                    전체 포스트
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    최신 포스트를 무한 스크롤로 확인하세요.
                </p>
            </div>

            <InfinitePostFeed
                type="admin"
                hrefPrefix="/posts"
                initialRows={rows}
                initialCursor={nextCursor}
            />
        </section>
    );
}
