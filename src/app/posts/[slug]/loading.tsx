import { ArrowLeft, Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <article className="container max-w-3xl py-16">
            {/* 뒤로가기 버튼 스켈레톤 */}
            <div className="inline-flex items-center text-sm text-muted-foreground">
                <ArrowLeft className="mr-2 h-4 w-4 opacity-50" />
                <span className="opacity-50">포스트 목록으로</span>
            </div>

            {/* 헤더 스켈레톤 */}
            <header className="mt-6 space-y-4">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="h-12 w-3/4 animate-pulse rounded bg-muted" />
            </header>

            {/* 본문 스켈레톤 */}
            <div className="mt-10 border-t-2 border-border pt-10">
                <div className="flex flex-col items-center justify-center gap-4 py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">글을 불러오는 중...</p>
                </div>

                <div className="space-y-4">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                    <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
                    <div className="mt-8 h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                </div>
            </div>

            {/* 댓글 섹션 스켈레톤 */}
            <div className="mt-16 border-t-2 border-border pt-10">
                <div className="h-6 w-32 animate-pulse rounded bg-muted" />
                <div className="mt-6 space-y-4">
                    <div className="h-24 w-full animate-pulse rounded-lg bg-muted" />
                </div>
            </div>
        </article>
    );
}
