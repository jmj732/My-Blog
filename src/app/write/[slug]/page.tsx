import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { getPostBySlug } from "@/lib/posts";
import { WritePageClient } from "../write-page-client";

interface EditPageProps {
    params: { slug: string };
}

export default async function EditPage({ params }: EditPageProps) {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (session.user.email !== process.env.ADMIN_EMAIL) {
        redirect("/");
    }

    const post = await getPostBySlug(params.slug);
    if (!post) {
        notFound();
    }

    return <WritePageClient user={session.user} initialPost={post} />;
}
