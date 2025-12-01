import type { AnchorHTMLAttributes, HTMLAttributes } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";

import { getAllPosts, getPostBySlug, type Post } from "@/lib/mdx";

type ParamsPromise = Promise<{ slug: string }>;

const dateFormatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
});

const mdxComponents = {
    h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="mt-8 text-4xl font-bold tracking-tight" {...props} />
    ),
    h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="mt-10 text-3xl font-semibold tracking-tight" {...props} />
    ),
    h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="mt-8 text-2xl font-semibold tracking-tight" {...props} />
    ),
    p: (props: HTMLAttributes<HTMLParagraphElement>) => (
        <p className="mt-6 leading-relaxed text-muted-foreground" {...props} />
    ),
    a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
            className="font-semibold text-purple-400 underline-offset-4 hover:text-white hover:underline"
            {...props}
        />
    ),
    ul: (props: HTMLAttributes<HTMLUListElement>) => (
        <ul className="mt-6 list-disc space-y-2 pl-6 text-muted-foreground" {...props} />
    ),
    ol: (props: HTMLAttributes<HTMLOListElement>) => (
        <ol className="mt-6 list-decimal space-y-2 pl-6 text-muted-foreground" {...props} />
    ),
    code: (props: HTMLAttributes<HTMLElement>) => (
        <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm" {...props} />
    ),
    pre: (props: HTMLAttributes<HTMLPreElement>) => (
        <pre
            className="mt-6 overflow-x-auto rounded-2xl border border-white/10 bg-black/60 p-4 text-sm text-white/90"
            {...props}
        />
    ),
    blockquote: (props: HTMLAttributes<HTMLElement>) => (
        <blockquote
            className="mt-8 border-l-4 border-purple-500/60 bg-white/5 px-6 py-4 text-lg italic text-muted-foreground"
            {...props}
        />
    ),
    hr: (props: HTMLAttributes<HTMLHRElement>) => (
        <hr className="my-10 border-white/10" {...props} />
    ),
};

export async function generateStaticParams() {
    return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
    params,
}: {
    params: ParamsPromise;
}): Promise<Metadata> {
    try {
        const { slug } = await params;
        const post = getPostBySlug(slug);
        return {
            title: `${post.title} | AI Blog`,
            description: post.description,
            openGraph: {
                title: post.title,
                description: post.description,
                type: "article",
            },
        };
    } catch {
        return {
            title: "Post not found",
        };
    }
}

export default async function PostPage({ params }: { params: ParamsPromise }) {
    const { slug } = await params;

    let postData: Post | undefined;
    try {
        postData = getPostBySlug(slug);
    } catch {
        notFound();
    }

    if (!postData) {
        notFound();
    }

    const post = postData;

    return (
        <article className="container max-w-3xl py-16">
            <Link
                href="/posts"
                className="inline-flex items-center text-sm text-muted-foreground transition hover:text-white"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to posts
            </Link>

            <header className="mt-6 space-y-4">
                <p className="text-sm font-mono uppercase tracking-widest text-purple-400">
                    {dateFormatter.format(new Date(post.date))}
                </p>
                <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                    {post.title}
                </h1>
                {post.description && (
                    <p className="text-lg text-muted-foreground">{post.description}</p>
                )}
            </header>

            <div className="mt-10 border-t border-white/10 pt-10 text-lg leading-relaxed">
                <MDXRemote source={post.content} components={mdxComponents} />
            </div>
        </article>
    );
}
