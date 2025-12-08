import type { Metadata } from "next";
import { Search, Sparkles } from "lucide-react";

import { SearchPanel } from "@/components/search/search-panel";

type SearchPageProps = {
    searchParams: Promise<{ q?: string }>;
};

export const metadata: Metadata = {
    title: "검색 | AI Blog",
    description: "로컬 임베딩을 사용하여 모든 MDX 아티클에 대해 의미 기반 검색을 실행하세요.",
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const initialQuery = params?.q ?? "";

    return (
        <section className="container max-w-4xl py-16 md:py-24">
            <div className="mx-auto max-w-2xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-purple-300">
                    <Search className="h-4 w-4" />
                    의미 기반 검색
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                    완벽한 인사이트를 즉시 찾아보세요
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Supabase에 저장된 로컬 Transformers.js 임베딩과 pgvector 유사도 검색으로 구동됩니다.
                </p>
            </div>

            <div className="mt-12 rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-8 shadow-[0_20px_70px_rgba(124,58,237,0.15)]">
                <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-purple-300" />
                    입력하는 즉시 매칭이 시작됩니다
                </div>
                <SearchPanel autoFocus initialQuery={initialQuery} />
            </div>
        </section>
    );
}
