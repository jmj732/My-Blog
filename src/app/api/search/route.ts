import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";

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
type DatabaseClient = (typeof import("@/lib/db"))["db"];
let cachedDb: DatabaseClient | null = null;

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

        const dbFallback = await dbLexicalSearch(query, limit);
        if (dbFallback.length > 0) {
            return NextResponse.json({ results: dbFallback, fallback: true, source: "db" });
        }

        const fileFallback = lexicalSearch(query, limit);
        return NextResponse.json({ results: fileFallback, fallback: true, source: "files" });
    } catch (error) {
        console.error("[search] vector search failed", error);
        const dbFallback = await dbLexicalSearch(query, limit);
        if (dbFallback.length > 0) {
            return NextResponse.json({
                results: dbFallback,
                fallback: true,
                source: "db",
                error: "Vector search unavailable. Showing DB lexical matches instead.",
            });
        }

        const fileFallback = lexicalSearch(query, limit);
        return NextResponse.json({
            results: fileFallback,
            fallback: true,
            source: "files",
            error: "Vector search unavailable. Showing file-based matches instead.",
        });
    }
}

async function vectorSearch(embedding: number[], limit: number) {
    if (!process.env.DATABASE_URL) {
        console.warn("[search] DATABASE_URL is missing; skipping vector search");
        return [];
    }

    const db = await getDatabase();
    if (!db) {
        return [];
    }

    if (embedding.length === 0) {
        return [];
    }

    // pgvector requires string representation: '[val1,val2,...]'
    const vectorString = `[${embedding.join(",")}]`;

    try {
        const rows = await db.execute(
            sql`
                SELECT slug, title, content, created_at,
                       1 - (embedding <=> ${vectorString}::vector) AS similarity
                FROM post
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> ${vectorString}::vector
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
    } catch (error) {
        console.error("[search] database query failed", error);
        return [];
    }
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

async function dbLexicalSearch(query: string, limit: number): Promise<SearchResult[]> {
    const db = await getDatabase();
    if (!db) return [];

    const normalized = query.toLowerCase();
    try {
        const rows = await db.execute(
            sql`
                SELECT slug, title, content, created_at
                FROM post
                WHERE slug IS NOT NULL
            `
        );

        return rows
            .map((row) => {
                const title = (row.title as string) ?? "";
                const content = (row.content as string) ?? "";
                const haystack = `${title} ${content}`.toLowerCase();
                const hits = haystack.split(normalized).length - 1;
                const score = hits > 0 ? hits : haystack.includes(normalized) ? 0.1 : 0;
                return {
                    slug: row.slug as string,
                    title,
                    description: createExcerpt(content),
                    date: row.created_at
                        ? new Date(row.created_at as string | number | Date).toISOString()
                        : undefined,
                    similarity: score,
                };
            })
            .filter((result) => (result.similarity ?? 0) > 0)
            .sort((a, b) => (b.similarity ?? 0) - (a.similarity ?? 0))
            .slice(0, limit);
    } catch (error) {
        console.error("[search] db lexical fallback failed", error);
        return [];
    }
}

async function getDatabase(): Promise<DatabaseClient | null> {
    if (cachedDb) {
        return cachedDb;
    }

    try {
        const { db } = await import("@/lib/db");
        cachedDb = db;
        return db;
    } catch (error) {
        console.error("[search] failed to initialize database client", error);
        return null;
    }
}
