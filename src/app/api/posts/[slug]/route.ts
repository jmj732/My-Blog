import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import { posts } from "@/db/schema";
import { db } from "@/lib/db";
import { generateEmbedding } from "@/lib/ai";

type RouteContext = {
    params: Promise<{ slug: string }>;
};

export async function PATCH(req: Request, { params }: RouteContext) {
    try {
        const session = await auth();
        if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        const body = await req.json();
        const { title, content } = body ?? {};

        if (!slug || !title || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const embedding = await generateEmbedding(`${title}\n\n${content}`);

        const [updated] = await db
            .update(posts)
            .set({
                title,
                content,
                embedding,
            })
            .where(eq(posts.slug, slug))
            .returning({ slug: posts.slug });

        if (!updated) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, slug: updated.slug });
    } catch (error) {
        console.error("[POSTS_PATCH]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
    try {
        const session = await auth();
        if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { slug } = await params;
        if (!slug) {
            return NextResponse.json({ error: "Missing slug" }, { status: 400 });
        }

        const [removed] = await db
            .delete(posts)
            .where(eq(posts.slug, slug))
            .returning({ slug: posts.slug });

        if (!removed) {
            return NextResponse.json({ error: "Post not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[POSTS_DELETE]", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
