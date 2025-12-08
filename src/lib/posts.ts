import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    createdAt: Date | null;
}

export interface PaginatedPosts {
    posts: Post[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Get paginated posts from the database
 * Optimized: excludes large content field from list view
 */
export async function getPosts(page: number = 1, pageSize: number = 20): Promise<PaginatedPosts> {
    const offset = (page - 1) * pageSize;

    // Get total count (optimized with index on createdAt)
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(posts);

    // Get paginated posts (excludes content for performance)
    const postsList = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: sql<string>`''`, // Empty string for list view
            createdAt: posts.createdAt,
        })
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(pageSize)
        .offset(offset);

    return {
        posts: postsList,
        total: count,
        page,
        pageSize,
        totalPages: Math.ceil(count / pageSize),
    };
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    const [post] = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: posts.content,
            createdAt: posts.createdAt,
        })
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1);

    return post || null;
}

/**
 * Get recent posts (for sidebar, homepage, etc.)
 * Optimized: excludes content field
 */
export async function getRecentPosts(limit: number = 5): Promise<Post[]> {
    return db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: sql<string>`''`, // Empty string for list view
            createdAt: posts.createdAt,
        })
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit);
}
