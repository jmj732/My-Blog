import { notFound } from "next/navigation";

import { getPostBySlug } from "@/lib/posts";
import { WritePageClient } from "../write-page-client";

interface EditPageProps {
    params: { slug: string };
}

export default async function EditPage({ params }: EditPageProps) {
    const post = await getPostBySlug(params.slug);
    if (!post) {
        notFound();
    }

    return <WritePageClient user={{}} initialPost={post} />;
}
