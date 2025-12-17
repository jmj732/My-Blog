import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Users, ChevronLeft, ChevronRight, PenLine } from "lucide-react";
import { getCommunityPosts } from "@/lib/posts";
import { Button } from "@/components/ui/button";

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

export const metadata: Metadata = {
    title: "커뮤니티 | AI Blog",
    description: "사용자들이 작성한 커뮤니티 포스트를 찾아보세요.",
};

interface CommunityPageProps {
    searchParams: Promise<{ page?: string }>;
}

export default async function CommunityPage({ searchParams }: CommunityPageProps) {
    const params = await searchParams;
    const currentPage = Number(params.page) || 1;
    const { posts, total, totalPages } = await getCommunityPosts(currentPage, 20);

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
                    총 <span className="font-bold text-primary">{total.toLocaleString()}</span>개의 커뮤니티 포스트
                </p>

                <Link href="/community/write" className="inline-block mt-6">
                    <Button className="border-2 border-primary rounded-none uppercase font-bold">
                        <PenLine className="w-4 h-4 mr-2" />
                        글쓰기
                    </Button>
                </Link>
            </div>

            <div className="mt-12 grid gap-6 max-w-4xl mx-auto">
                {posts.length === 0 && (
                    <div className="border border-border bg-muted p-10 text-center">
                        <p className="text-muted-foreground mb-4">아직 커뮤니티 포스트가 없습니다.</p>
                        <Link href="/community/write">
                            <Button className="border-2 border-primary rounded-none uppercase font-bold">
                                첫 포스트 작성하기
                            </Button>
                        </Link>
                    </div>
                )}

                {posts.map((post) => (
                    <Link
                        key={post.id}
                        href={`/community/posts/${encodeURIComponent(post.slug)}`}
                        className="group border-2 border-border bg-card p-6 transition-all duration-300 hover:border-primary"
                    >
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="border border-border bg-muted px-3 py-1 font-mono text-xs" suppressHydrationWarning>
                                {post.createdAt ? dateFormatter.format(new Date(post.createdAt)) : "날짜 없음"}
                            </span>
                            <span className="font-mono uppercase tracking-wide text-xs text-foreground font-bold">
                                {post.author?.name || "익명"}
                            </span>
                        </div>
                        <h2 className="mt-4 text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                            {post.title}
                        </h2>
                        <div className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wide text-foreground transition-all group-hover:gap-3 group-hover:text-primary">
                            아티클 읽기
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                    <Link
                        href={`/community?page=${currentPage - 1}`}
                        className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                    >
                        <Button
                            variant="outline"
                            disabled={currentPage <= 1}
                            className="border-2 border-border hover:border-primary rounded-none"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            이전
                        </Button>
                    </Link>

                    <div className="flex items-center gap-2">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <Link key={pageNum} href={`/community?page=${pageNum}`}>
                                    <Button
                                        variant={currentPage === pageNum ? "default" : "outline"}
                                        className={`w-10 h-10 rounded-none border-2 ${currentPage === pageNum
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "border-border hover:border-primary"
                                            }`}
                                    >
                                        {pageNum}
                                    </Button>
                                </Link>
                            );
                        })}
                    </div>

                    <Link
                        href={`/community?page=${currentPage + 1}`}
                        className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                    >
                        <Button
                            variant="outline"
                            disabled={currentPage >= totalPages}
                            className="border-2 border-border hover:border-primary rounded-none"
                        >
                            다음
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            )}
        </section>
    );
}
