import "server-only";
import { apiRequest } from "@/lib/api-client";

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
 * Get paginated posts from backend API
 */
export async function getPosts(page: number = 1, pageSize: number = 20): Promise<PaginatedPosts> {
    const params = new URLSearchParams({
        page: String(Math.max(page - 1, 0)),
        pageSize: String(pageSize),
        type: "admin",
    });

    const data = await apiRequest<{
        content: {
            id: number | string;
            slug: string;
            title: string;
            content: string;
            authorName?: string;
            authorRole?: string;
            createdAt?: string;
        }[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
    }>(`/api/v1/posts?${params.toString()}`);

    const mappedPosts: Post[] = (data?.content ?? []).map((p) => ({
        id: String(p.id),
        title: p.title,
        slug: p.slug,
        content: p.content,
        createdAt: p.createdAt ? new Date(p.createdAt) : null,
        author: p.authorName
            ? {
                name: p.authorName,
                email: "",
                role: p.authorRole ?? "user",
            }
            : null,
    }));

    return {
        posts: mappedPosts,
        total: data?.totalElements ?? mappedPosts.length,
        page,
        pageSize,
        totalPages: data?.totalPages ?? 1,
    };
}

/**
 * Get paginated Community posts from backend API
 */
export async function getCommunityPosts(page: number = 1, pageSize: number = 20): Promise<PaginatedPosts> {
    const params = new URLSearchParams({
        page: String(Math.max(page - 1, 0)),
        pageSize: String(pageSize),
        type: "community",
    });

    const data = await apiRequest<{
        content: {
            id: number | string;
            slug: string;
            title: string;
            content: string;
            authorName?: string;
            authorRole?: string;
            createdAt?: string;
        }[];
        totalElements: number;
        totalPages: number;
        number: number;
        size: number;
    }>(`/api/v1/posts?${params.toString()}`);

    const mappedPosts: Post[] = (data?.content ?? []).map((p) => ({
        id: String(p.id),
        title: p.title,
        slug: p.slug,
        content: p.content,
        createdAt: p.createdAt ? new Date(p.createdAt) : null,
        author: p.authorName
            ? {
                name: p.authorName,
                email: "",
                role: p.authorRole ?? "user",
            }
            : null,
    }));

    return {
        posts: mappedPosts,
        total: data?.totalElements ?? mappedPosts.length,
        page,
        pageSize,
        totalPages: data?.totalPages ?? 1,
    };
}

/**
 * Get a single post by slug from backend API
 */
export async function getPostBySlug(slug: string): Promise<Post | null> {
    const data = await apiRequest<{
        id: number | string;
        slug: string;
        title: string;
        content: string;
        createdAt?: string;
        authorName?: string;
        authorRole?: string;
    } | null>(`/api/v1/posts/${encodeURIComponent(slug)}`);

    if (!data) return null;

    return {
        id: String(data.id),
        title: data.title,
        slug: data.slug,
        content: data.content,
        createdAt: data.createdAt ? new Date(data.createdAt) : null,
        author: data.authorName
            ? {
                name: data.authorName,
                email: "",
                role: data.authorRole ?? "user",
            }
            : null,
    };
}

/**
 * Get recent posts (for sidebar, homepage, etc.) from backend API
 */
export async function getRecentPosts(limit: number = 5): Promise<Post[]> {
    const params = new URLSearchParams({
        page: "0",
        pageSize: String(limit),
    });

    const data = await apiRequest<{
        content: {
            id: number | string;
            slug: string;
            title: string;
            content: string;
            createdAt?: string;
            authorName?: string;
            authorRole?: string;
        }[];
    }>(`/api/v1/posts?${params.toString()}`);

    return (data?.content ?? []).map((p) => ({
        id: String(p.id),
        title: p.title,
        slug: p.slug,
        content: p.content,
        createdAt: p.createdAt ? new Date(p.createdAt) : null,
        author: p.authorName
            ? {
                name: p.authorName,
                email: "",
                role: p.authorRole ?? "user",
            }
            : null,
    }));
}
