import Link from "next/link";
import type { Metadata } from "next";
import { Users, PenLine } from "lucide-react";
import { getCursorPosts } from "@/lib/posts";
import { Button } from "@/components/ui/button";
import { InfinitePostFeed } from "@/components/posts/infinite-post-feed";

export const metadata: Metadata = {
    title: "커뮤니티 | AI Blog",
    description: "사용자들이 작성한 커뮤니티 포스트를 찾아보세요.",
};

export const dynamic = "force-dynamic";

export default async function CommunityPage() {
    const { rows, nextCursor } = await getCursorPosts({ type: "community", limit: 20 });

    return (
        <section className="container py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm font-bold uppercase tracking-wide">
                    <Users className="h-4 w-4" />
                    커뮤니티
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl uppercase">
                    커뮤니티 포스트
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    최신 커뮤니티 포스트를 무한 스크롤로 확인하세요.
                </p>

                <Link href="/community/write" className="inline-block mt-6">
                    <Button className="border-2 border-primary rounded-none uppercase font-bold">
                        <PenLine className="w-4 h-4 mr-2" />
                        글쓰기
                    </Button>
                </Link>
            </div>

            <InfinitePostFeed
                type="community"
                hrefPrefix="/community/posts"
                initialRows={rows}
                initialCursor={nextCursor}
                emptyState={(
                    <div className="border border-border bg-muted p-10 text-center">
                        <p className="text-muted-foreground mb-4">아직 커뮤니티 포스트가 없습니다.</p>
                        <Link href="/community/write">
                            <Button className="border-2 border-primary rounded-none uppercase font-bold">
                                첫 포스트 작성하기
                            </Button>
                        </Link>
                    </div>
                )}
            />
        </section>
    );
}
