import { supabase } from "./supabase";

export type PostFeedCursor = {
    created_at: string;
    id: string;
} | null;

export interface PostFeedRow {
    id: string;
    slug: string;
    title: string;
    created_at: string;
}

export async function fetchPostsFeed(
    pageSize: number = 20,
    cursor: PostFeedCursor = null
): Promise<{ rows: PostFeedRow[]; nextCursor: PostFeedCursor }>
{
    const { data, error } = await supabase.rpc("posts_feed", {
        in_page_size: pageSize,
        in_cursor_created_at: cursor?.created_at ?? null,
        in_cursor_id: cursor?.id ?? null,
    });

    if (error) {
        throw new Error(`posts_feed failed: ${error.message}`);
    }

    const rows = (data as PostFeedRow[]) ?? [];
    const nextCursor =
        rows.length === pageSize
            ? {
                  created_at: rows[rows.length - 1].created_at,
                  id: rows[rows.length - 1].id,
              }
            : null;

    return { rows, nextCursor };
}
