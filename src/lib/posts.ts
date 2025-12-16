import "server-only";
import { apiRequest } from "@/lib/api-client";

export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    createdAt: Date | null;
    authorId?: string;
    author?: {
        id: string;
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

type BackendAuthor = {
    id?: number | string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
};

function extractAuthorId(payload: {
    authorId?: number | string;
    userId?: number | string;
    author?: BackendAuthor | null;
    user?: BackendAuthor | null;
}): string {
    const direct =
        payload.authorId ??
        payload.userId ??
        payload.author?.id ??
        payload.user?.id;
    return direct !== undefined && direct !== null ? String(direct) : "";
}

function extractAuthorName(payload: {
    authorName?: string;
    userName?: string;
    author?: BackendAuthor | null;
    user?: BackendAuthor | null;
}): string | null {
    return (
        payload.authorName ??
        payload.userName ??
        payload.author?.name ??
        payload.user?.name ??
        null
    );
}

function extractAuthorRole(payload: {
    authorRole?: string;
    userRole?: string;
    author?: BackendAuthor | null;
    user?: BackendAuthor | null;
}): string {
    return (
        payload.authorRole ??
        payload.userRole ??
        payload.author?.role ??
        payload.user?.role ??
        "user"
    );
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
            authorId?: number | string;
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
        authorId: extractAuthorId(p),
        author: {
            id: extractAuthorId(p),
            name: extractAuthorName(p) || "jmj732",
            email: "",
            role: extractAuthorRole(p),
        },
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
            authorId?: number | string;
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
        authorId: extractAuthorId(p),
        author: {
            id: extractAuthorId(p),
            name: extractAuthorName(p) || "jmj732",
            email: "",
            role: extractAuthorRole(p),
        },
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
        authorId?: number | string;
        authorName?: string;
        authorRole?: string;
        userId?: number | string;
        userName?: string;
        userRole?: string;
        author?: BackendAuthor | null;
        user?: BackendAuthor | null;
    } | null>(`/api/v1/posts/${encodeURIComponent(slug)}`);

    if (!data) return null;

    return {
        id: String(data.id),
        title: data.title,
        slug: data.slug,
        content: data.content,
        createdAt: data.createdAt ? new Date(data.createdAt) : null,
        authorId: extractAuthorId(data),
        author: {
            id: extractAuthorId(data),
            name: extractAuthorName(data) || "jmj732",
            email: "",
            role: extractAuthorRole(data),
        },
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
            authorId?: number | string;
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
        authorId: extractAuthorId(p),
        author: {
            id: extractAuthorId(p),
            name: extractAuthorName(p) || "jmj732",
            email: "",
            role: extractAuthorRole(p),
        },
    }));
}
