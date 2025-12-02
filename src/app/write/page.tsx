import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WritePageClient } from "./write-page-client";

export default async function WritePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    return <WritePageClient user={session.user} />;
}
