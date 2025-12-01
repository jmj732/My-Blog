"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Search, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";

type SearchResult = {
    slug: string;
    title: string;
    description: string;
    date?: string;
    similarity?: number;
};

type SearchPanelProps = {
    initialQuery?: string;
    autoFocus?: boolean;
    onNavigate?: () => void;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

export function SearchPanel({ initialQuery = "", autoFocus, onNavigate }: SearchPanelProps) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [usedFallback, setUsedFallback] = useState(false);
    const abortRef = useRef<AbortController | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);

    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEffect(() => {
        return () => {
            abortRef.current?.abort();
        };
    }, []);

    useEffect(() => {
        if (!query.trim()) {
            abortRef.current?.abort();
            setResults([]);
            setError(null);
            setUsedFallback(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);
        const handle = setTimeout(async () => {
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
                    signal: controller.signal,
                });
                const payload = await response.json();

                if (!response.ok) {
                    setError(payload.error ?? "검색에 실패했습니다.");
                }

                setResults(payload.results ?? []);
                setUsedFallback(Boolean(payload.fallback));
            } catch (err) {
                if ((err as Error).name === "AbortError") {
                    return;
                }
                setError("네트워크 오류가 발생했습니다.");
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => {
            clearTimeout(handle);
        };
    }, [query]);

    const helperText = useMemo(() => {
        if (!query) {
            return "Search MDX posts semantically. Try “vector search” or “NextAuth tips”.";
        }
        if (isLoading) {
            return "Generating embeddings and looking for matches...";
        }
        if (usedFallback) {
            return "Vector search is warming up. Showing lexical matches for now.";
        }
        return null;
    }, [query, isLoading, usedFallback]);

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search posts, topics, or keywords..."
                    className="h-14 rounded-2xl bg-white/5 pl-12 pr-4 text-lg"
                />
            </div>

            {helperText && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    {helperText}
                </p>
            )}

            {error && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            <div className="space-y-3">
                {isLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching the knowledge base…
                    </div>
                )}

                {!isLoading && query && results.length === 0 && (
                    <p className="rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-muted-foreground">
                        No matches yet. Try refining your keywords or syncing posts to the database.
                    </p>
                )}

                <ul className="space-y-3">
                    {results.map((result) => {
                        const matchLabel =
                            typeof result.similarity === "number"
                                ? `${Math.round(
                                      Math.min(Math.max(result.similarity, 0), 1) * 100
                                  )}% match`
                                : null;

                        return (
                            <li key={result.slug}>
                                <Link
                                    href={`/posts/${result.slug}`}
                                    onClick={() => onNavigate?.()}
                                    className="block rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent p-5 transition hover:border-white/20 hover:bg-white/10"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                                        {result.date && (
                                            <time dateTime={result.date}>
                                                {dateFormatter.format(new Date(result.date))}
                                            </time>
                                        )}
                                        {matchLabel && (
                                            <span className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-purple-300">
                                                {matchLabel}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="mt-2 text-lg font-semibold text-white">{result.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {result.description}
                                    </p>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
