import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/ai";
import { createExcerpt, getAllPostsWithContent } from "@/lib/mdx";

type SearchResult = {
    slug: string;
    title: string;
    description: string;
    date?: string;
    similarity?: number;
};

const MAX_LIMIT = 10;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim() ?? "";
    if (!query) {
        return NextResponse.json({ results: [] });
    }

    const limitParam = Number(searchParams.get("limit"));
    const limit = Number.isFinite(limitParam)
        ? Math.min(Math.max(limitParam, 1), MAX_LIMIT)
        : 5;

    try {
        const embedding = await generateEmbedding(query);
        const vectorResults = await vectorSearch(embedding, limit);

        if (vectorResults.length > 0) {
            return NextResponse.json({ results: vectorResults });
        }

        const fallbackResults = lexicalSearch(query, limit);
        return NextResponse.json({ results: fallbackResults, fallback: true });
    } catch (error) {
        console.error("[search] vector search failed", error);
        const fallbackResults = lexicalSearch(query, limit);
        return NextResponse.json({
            results: fallbackResults,
            fallback: true,
            error: "Vector search unavailable. Showing lexical matches instead.",
        });
    }
}

async function vectorSearch(embedding: number[], limit: number) {
    if (embedding.length === 0) {
        return [];
    }

    const vectorLiteral = sql`ARRAY[${sql.join(
        embedding.map((value) => sql`${value}`),
        sql`, `
    )}]::vector`;

    const { rows } = await db.execute(
        sql`
            SELECT slug, title, content, created_at,
                   1 - (embedding <=> ${vectorLiteral}) AS similarity
            FROM post
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> ${vectorLiteral}
            LIMIT ${limit}
        `
    );

    return rows
        .filter((row) => row.slug)
        .map((row) => ({
            slug: row.slug as string,
            title: (row.title as string) ?? "",
            description: createExcerpt((row.content as string) ?? ""),
            date: row.created_at
                ? new Date(row.created_at as string | number | Date).toISOString()
                : undefined,
            similarity: row.similarity ? Number(row.similarity) : undefined,
        }));
}

function lexicalSearch(query: string, limit: number): SearchResult[] {
    const normalized = query.toLowerCase();
    return getAllPostsWithContent()
        .map((post) => {
            const haystack = `${post.title} ${post.content}`.toLowerCase();
            const hits = haystack.split(normalized).length - 1;
            const score = hits > 0 ? hits : haystack.includes(normalized) ? 0.1 : 0;
            return {
                slug: post.slug,
                title: post.title,
                description: createExcerpt(post.content),
                date: post.date,
                similarity: score,
            };
        })
        .filter((result) => (result.similarity ?? 0) > 0)
        .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
        .slice(0, limit);
}
