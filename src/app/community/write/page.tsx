import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WritePageClient } from "@/app/write/write-page-client";

export default async function CommunityWritePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    return <WritePageClient user={session.user} apiEndpoint="/api/community/posts" />;
}
