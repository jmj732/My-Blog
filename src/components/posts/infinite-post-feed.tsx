"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api-client";

type FeedType = "admin" | "community";

type PostCursor = {
    createdAt: string;
    id: string;
};

type CursorPostRow = {
    id: string;
    slug: string;
    title: string;
    createdAt: string | null;
};

type CursorPostsResponse = {
    rows: CursorPostRow[];
    nextCursor: PostCursor | null;
};

type InfinitePostFeedProps = {
    type: FeedType;
    hrefPrefix: string;
    initialRows: CursorPostRow[];
    initialCursor: PostCursor | null;
    limit?: number;
    emptyState?: ReactNode;
};

const dateFormatter = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

export function InfinitePostFeed({
    type,
    hrefPrefix,
    initialRows,
    initialCursor,
    limit = 20,
    emptyState,
}: InfinitePostFeedProps) {
    const [rows, setRows] = useState<CursorPostRow[]>(initialRows);
    const [cursor, setCursor] = useState<PostCursor | null>(initialCursor);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    const badge = useMemo(() => {
        if (type === "admin") {
            return { label: "ADMIN", className: "text-primary" };
        }
        return { label: "COMMUNITY", className: "text-foreground" };
    }, [type]);

    const loadMore = useCallback(async () => {
        if (isLoading || !cursor) return;

        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                limit: String(Math.min(Math.max(limit, 1), 100)),
                type,
                cursorCreatedAt: cursor.createdAt,
                cursorId: cursor.id,
            });

            const data = await apiRequest<CursorPostsResponse>(
                `/api/v1/posts/cursor?${params.toString()}`,
                { useProxy: true }
            );

            setRows((prev) => prev.concat(data.rows ?? []));
            setCursor(data.nextCursor ?? null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "요청에 실패했습니다.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, [cursor, isLoading, limit, type]);

    useEffect(() => {
        const node = sentinelRef.current;
        if (!node) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    void loadMore();
                }
            },
            { rootMargin: "600px 0px" }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [loadMore]);

    return (
        <div className="mt-12 grid gap-6 max-w-4xl mx-auto">
            {rows.length === 0 && (
                emptyState ?? (
                    <div className="border border-border bg-muted p-10 text-center">
                        아직 포스트가 없습니다.
                    </div>
                )
            )}

            {rows.map((row) => (
                <Link
                    key={row.id}
                    href={`${hrefPrefix}/${encodeURIComponent(row.slug)}`}
                    className="group border-2 border-border bg-card p-6 transition-all duration-300 hover:border-primary"
                >
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="border border-border bg-muted px-3 py-1 font-mono text-xs" suppressHydrationWarning>
                            {row.createdAt ? dateFormatter.format(new Date(row.createdAt)) : "날짜 없음"}
                        </span>
                        <span className={`font-mono uppercase tracking-wide text-xs font-bold ${badge.className}`}>
                            {badge.label}
                        </span>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                        {row.title}
                    </h2>
                    <div className="mt-6 inline-flex items-center text-sm font-bold uppercase tracking-wide text-foreground transition-all group-hover:gap-3 group-hover:text-primary">
                        아티클 읽기
                        <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                </Link>
            ))}

            <div className="pt-2">
                {error && (
                    <div className="mb-4 border border-destructive/40 bg-destructive/10 p-4 text-sm">
                        <p className="text-destructive">{error}</p>
                        <div className="mt-3">
                            <Button
                                variant="outline"
                                className="rounded-none border-2 border-border"
                                onClick={() => void loadMore()}
                                disabled={isLoading || !cursor}
                            >
                                다시 시도
                            </Button>
                        </div>
                    </div>
                )}

                {cursor ? (
                    <div className="flex justify-center" ref={sentinelRef}>
                        <Button
                            variant="outline"
                            className="rounded-none border-2 border-border hover:border-primary"
                            onClick={() => void loadMore()}
                            disabled={isLoading}
                        >
                            {isLoading ? "불러오는 중..." : "더 보기"}
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-center text-sm text-muted-foreground">
                        더 이상 포스트가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
}
