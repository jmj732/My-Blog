import { notFound } from "next/navigation";

import { getPostBySlug } from "@/lib/posts";
import { WritePageClient } from "../write-page-client";

interface EditPageProps {
    params: Promise<{ slug: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);
    if (!post) {
        notFound();
    }

    return <WritePageClient user={{}} initialPost={post} />;
}
