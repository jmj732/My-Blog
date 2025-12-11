import "server-only";
import { db } from "@/lib/db";
import { posts, users } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    createdAt: Date | null;
    author?: {
        name: string | null;
        email: string;
        role: string;
    } | null;
}

export interface PaginatedPosts {
    posts: Post[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Get paginated Admin posts from the database (user role is 'admin')
 * Optimized: excludes large content field from list view
 */
export async function getPosts(page: number = 1, pageSize: number = 20): Promise<PaginatedPosts> {
    const offset = (page - 1) * pageSize;

    // Get total count of admin posts (authorId is null OR user role is 'admin')
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(sql`${posts.authorId} IS NULL OR ${users.role} = 'admin'`);

    // Get paginated admin posts (excludes content for performance)
    const postsList = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: sql<string>`''`.as("content"),
            createdAt: posts.createdAt,
            author: {
                name: users.name,
                email: users.email,
                role: users.role,
            },
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .where(sql`${posts.authorId} IS NULL OR ${users.role} = 'admin'`)
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
 * Get paginated Community posts from the database (user role is 'user')
 * Optimized: excludes large content field from list view
 */
export async function getCommunityPosts(page: number = 1, pageSize: number = 20): Promise<PaginatedPosts> {
    const offset = (page - 1) * pageSize;

    // Get total count of community posts (user role is 'user')
    const [{ count }] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .where(eq(users.role, "user"));

    // Get paginated community posts (excludes content for performance)
    const postsList = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: sql<string>`''`.as("content"),
            createdAt: posts.createdAt,
            author: {
                name: users.name,
                email: users.email,
                role: users.role,
            },
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .where(eq(users.role, "user"))
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
 * Includes author information for consistency with other post queries
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    const [post] = await db
        .select({
            id: posts.id,
            title: posts.title,
            slug: posts.slug,
            content: posts.content,
            createdAt: posts.createdAt,
            author: {
                name: users.name,
                email: users.email,
                role: users.role,
            },
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
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
            content: sql<string>`''`.as("content"), // Explicitly alias placeholder content
            createdAt: posts.createdAt,
            author: {
                name: users.name,
                email: users.email,
                role: users.role,
            },
        })
        .from(posts)
        .leftJoin(users, eq(posts.authorId, users.id))
        .orderBy(desc(posts.createdAt))
        .limit(limit);
}
