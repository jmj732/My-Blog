import "server-only";
import { inArray, sql } from "drizzle-orm";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/ai";
import { getAllPostsWithContent } from "@/lib/mdx";

type SyncSummary = {
    total: number;
    inserted: number;
    updated: number;
    deleted: number;
};

let ensuredAuthorColumn = false;

async function ensureAuthorIdColumn() {
    if (ensuredAuthorColumn) return;
    try {
        await db.execute(sql`ALTER TABLE "post" ADD COLUMN IF NOT EXISTS "author_id" text`);
        await db.execute(sql`
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes
                    WHERE schemaname = current_schema()
                    AND indexname = 'post_author_id_idx'
                ) THEN
                    CREATE INDEX post_author_id_idx ON "post" ("author_id");
                END IF;
            END
            $$;
        `);
    } catch (error) {
        console.error("[post-sync] failed to ensure author_id column", error);
    } finally {
        ensuredAuthorColumn = true;
    }
}

function parseDate(input: string) {
    const parsed = new Date(input);
    if (Number.isNaN(parsed.getTime())) {
        return new Date();
    }
    return parsed;
}

export async function syncPostsToDatabase(): Promise<SyncSummary> {
    const mdxPosts = getAllPostsWithContent();
    if (mdxPosts.length === 0) {
        return { inserted: 0, updated: 0, deleted: 0, total: 0 };
    }

    await ensureAuthorIdColumn();

    let inserted = 0;
    let updated = 0;

    for (const post of mdxPosts) {
        let embedding: number[] | null = null;
        try {
            // Repeat title 3x to boost its weight in semantic search
            const titleBoosted = `${post.title}\n${post.title}\n${post.title}`;
            embedding = await generateEmbedding(`${titleBoosted}\n\n${post.content}`);
        } catch (error) {
            console.error("[post-sync] embedding generation failed, storing null", error);
        }

        // Check if post already exists
        const existing = await db.query.posts.findFirst({
            where: sql`${posts.slug} = ${post.slug}`,
        });

        await db
            .insert(posts)
            .values({
                slug: post.slug,
                title: post.title,
                content: post.content,
                embedding,
                authorId: null, // Explicitly set as Admin post
                createdAt: parseDate(post.date),
            })
            .onConflictDoUpdate({
                target: posts.slug,
                set: {
                    title: post.title,
                    content: post.content,
                    embedding,
                    authorId: null, // Keep as Admin post on update
                    createdAt: parseDate(post.date),
                },
            });

        if (existing) {
            updated += 1;
        } else {
            inserted += 1;
        }
    }

    return {
        total: mdxPosts.length,
        inserted,
        updated,
        deleted: 0, // No longer deleting posts
    };
}
