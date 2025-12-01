import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, PenTool } from "lucide-react";

import { getAllPosts } from "@/lib/mdx";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
});

export const metadata: Metadata = {
    title: "All Posts | AI Blog",
    description: "Browse every MDX article published on the AI-powered blog.",
};

export default function PostsPage() {
    const posts = getAllPosts();

    return (
        <section className="container py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
                <div className="inline-flex items-center gap-2 rounded-full glass-effect px-4 py-2 text-sm font-medium text-purple-500">
                    <PenTool className="h-4 w-4" />
                    Latest Insights
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
                    Featured Posts
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                    Long-form thoughts about AI-assisted writing, developer productivity, and design systems.
                </p>
            </div>

            <div className="mt-12 grid gap-6">
                {posts.length === 0 && (
                    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-muted-foreground glass-effect">
                        No posts yet. Add MDX files under <code className="rounded bg-muted px-2 py-1">content/posts</code> to see them listed here.
                    </div>
                )}

                {posts.map((post) => (
                    <Link
                        key={post.slug}
                        href={`/posts/${post.slug}`}
                        className="group rounded-2xl border border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08]"
                    >
                        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                            <span className="rounded-full bg-white/5 px-3 py-1">
                                {dateFormatter.format(new Date(post.date))}
                            </span>
                            <span className="font-mono uppercase tracking-wide text-xs text-purple-400">
                                MDX
                            </span>
                        </div>
                        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
                            {post.title}
                        </h2>
                        {post.description && (
                            <p className="mt-3 text-base text-muted-foreground">
                                {post.description}
                            </p>
                        )}
                        <div className="mt-6 inline-flex items-center text-sm font-semibold text-purple-400 transition-all group-hover:gap-3 group-hover:text-white">
                            Read article
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
