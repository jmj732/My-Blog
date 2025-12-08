import { inArray } from "drizzle-orm";
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

    const existing = await db.query.posts.findMany({
        columns: {
            slug: true,
        },
    });
    const existingSet = new Set(existing.map((p) => p.slug));

    let inserted = 0;
    let updated = 0;
    let deleted = 0;

    for (const post of mdxPosts) {
        let embedding: number[] | null = null;
        try {
            embedding = await generateEmbedding(`${post.title}\n\n${post.content}`);
        } catch (error) {
            console.error("[post-sync] embedding generation failed, storing null", error);
        }

        await db
            .insert(posts)
            .values({
                slug: post.slug,
                title: post.title,
                content: post.content,
                embedding,
                createdAt: parseDate(post.date),
            })
            .onConflictDoUpdate({
                target: posts.slug,
                set: {
                    title: post.title,
                    content: post.content,
                    embedding,
                    createdAt: parseDate(post.date),
                },
            });

        if (existingSet.has(post.slug)) {
            updated += 1;
        } else {
            inserted += 1;
        }
    }

    const mdxSlugSet = new Set(mdxPosts.map((p) => p.slug));
    const slugsToDelete = existing.filter((p) => !mdxSlugSet.has(p.slug)).map((p) => p.slug);

    if (slugsToDelete.length > 0) {
        await db.delete(posts).where(inArray(posts.slug, slugsToDelete));
        deleted = slugsToDelete.length;
    }

    return {
        total: mdxPosts.length,
        inserted,
        updated,
        deleted,
    };
}
