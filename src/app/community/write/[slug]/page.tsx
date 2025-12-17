import { notFound } from "next/navigation";

import { getPostBySlug } from "@/lib/posts";
import { WritePageClient } from "@/app/write/write-page-client";

interface CommunityEditPageProps {
    params: Promise<{ slug: string }>;
}

export default async function CommunityEditPage({ params }: CommunityEditPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
        notFound();
    }

    return (
        <WritePageClient
            user={{}}
            initialPost={post}
            apiEndpoint="/api/v1/community/posts"
            editApiEndpoint="/api/v1/community/posts"
            viewPathPrefix="/community/posts"
            afterDeleteHref="/community"
            backHref={`/community/posts/${encodeURIComponent(post.slug)}`}
        />
    );
}
