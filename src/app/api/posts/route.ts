
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { posts } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user) {
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

        await db.insert(posts).values({
            title,
            content,
            slug: uniqueSlug,
        });

        return NextResponse.json({ success: true, slug: uniqueSlug });
    } catch (error) {
        console.error("[POSTS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
