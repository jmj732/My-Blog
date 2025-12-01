import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { DrizzleAdapter } from "@auth/drizzle-adapter";

import { db } from "@/lib/db";

if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    throw new Error(
        "Missing GitHub OAuth credentials. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET."
    );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: DrizzleAdapter(db),
    secret: process.env.AUTH_SECRET,
    trustHost: true,
    session: {
        strategy: "database",
    },
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
        }),
    ],
});

