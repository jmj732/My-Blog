
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/ai";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.email !== process.env.ADMIN_EMAIL) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, content } = body;

        if (!title || !content) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        // Ensure unique slug (simple version, might need improvement for high volume)
        const uniqueSlug = `${slug}-${Date.now()}`;

        const embedding = await generateEmbedding(`${title}\n\n${content}`);

        await db.insert(posts).values({
            title,
            content,
            slug: uniqueSlug,
            embedding,
        });

        return NextResponse.json({ success: true, slug: uniqueSlug });
    } catch (error) {
        console.error("[POSTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
