import { auth } from "@/auth";
import { db } from "@/lib/db";
import { posts, users } from "@/db/schema";
import { NextResponse } from "next/server";
import { generateEmbedding } from "@/lib/ai";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, content } = body;

        if (!title || !content) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // Get user ID from email
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email),
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣]+/g, "-")
            .replace(/(^-|-$)+/g, "");

        // Ensure unique slug
        const uniqueSlug = `${slug}-${Date.now()}`;

        const embedding = await generateEmbedding(`${title}\n\n${content}`);

        await db.insert(posts).values({
            title,
            content,
            slug: uniqueSlug,
            authorId: user.id,
            embedding: embedding || undefined,
        });

        return NextResponse.json({ success: true, slug: uniqueSlug });
    } catch (error) {
        console.error("[COMMUNITY_POSTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
