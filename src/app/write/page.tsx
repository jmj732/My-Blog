import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { WritePageClient } from "./write-page-client";

export default async function WritePage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/api/auth/signin");
    }

    if (session.user.email !== process.env.ADMIN_EMAIL) {
        redirect("/");
    }

    return <WritePageClient user={session.user} />;
}
