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

export type PostsCursor = {
    createdAt: string;
    id: string;
};

export type PostFeedType = "admin" | "community";

export interface CursorPostsResult {
    posts: Post[];
    nextCursor: PostsCursor | null;
}

type BackendAuthor = {
    id?: number | string;
    name?: string | null;
    email?: string | null;
    role?: string | null;
};

type BackendCursorPostRow = {
    id: number | string;
    slug: string;
    title: string;
    createdAt?: string;
    authorId?: number | string;
    authorName?: string;
    authorRole?: string;
    author?: BackendAuthor | null;
    user?: BackendAuthor | null;
};

type BackendCursorPostsResponse = {
    rows: BackendCursorPostRow[];
    nextCursor?: {
        createdAt: string;
        id: number | string;
    } | null;
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
 * Get posts using cursor-based pagination.
 */
async function getPostsByCursor(params: {
    limit?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
    type?: PostFeedType;
}): Promise<CursorPostsResult> {
    const query = new URLSearchParams({
        limit: String(params.limit ?? 20),
    });

    if (params.cursorCreatedAt && params.cursorId) {
        query.set("cursorCreatedAt", params.cursorCreatedAt);
        query.set("cursorId", params.cursorId);
    }

    if (params.type) {
        query.set("type", params.type);
    }

    const data = await apiRequest<BackendCursorPostsResponse>(`/api/v1/posts/cursor?${query.toString()}`);

    const mappedPosts: Post[] = (data?.rows ?? []).map((row) => ({
        id: String(row.id),
        title: row.title,
        slug: row.slug,
        content: "",
        createdAt: row.createdAt ? new Date(row.createdAt) : null,
        authorId: extractAuthorId(row),
        author: {
            id: extractAuthorId(row),
            name: extractAuthorName(row) || null,
            email: "",
            role: extractAuthorRole(row),
        },
    }));

    return {
        posts: mappedPosts,
        nextCursor: data?.nextCursor
            ? { createdAt: data.nextCursor.createdAt, id: String(data.nextCursor.id) }
            : null,
    };
}

export async function getPosts(params?: {
    limit?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
}): Promise<CursorPostsResult> {
    return getPostsByCursor({ ...params, type: "admin" });
}

export async function getCommunityPosts(params?: {
    limit?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
}): Promise<CursorPostsResult> {
    return getPostsByCursor({ ...params, type: "community" });
}

/**
 * Backward-compatible alias for lists without a type filter.
 */
export async function getPostsCursor(params?: {
    limit?: number;
    cursorCreatedAt?: string;
    cursorId?: string;
    type?: PostFeedType;
}): Promise<CursorPostsResult> {
    return getPostsByCursor(params ?? {});
}

/**
 * Get recent posts (for sidebar, homepage, etc.) from backend API
 */
export async function getRecentPosts(limit: number = 5, type?: PostFeedType): Promise<Post[]> {
    const params = new URLSearchParams({
        limit: String(limit),
    });

    if (type) params.set("type", type);

    const data = await apiRequest<BackendCursorPostsResponse>(`/api/v1/posts/cursor?${params.toString()}`);

    return (data?.rows ?? []).map((row) => ({
        id: String(row.id),
        title: row.title,
        slug: row.slug,
        content: "",
        createdAt: row.createdAt ? new Date(row.createdAt) : null,
        authorId: extractAuthorId(row),
        author: {
            id: extractAuthorId(row),
            name: extractAuthorName(row) || null,
            email: "",
            role: extractAuthorRole(row),
        },
    }));
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
