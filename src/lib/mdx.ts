import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type PostMeta = {
    slug: string;
    title: string;
    date: string;
    description: string;
};

export type Post = PostMeta & {
    content: string;
};

function normalizeSlug(slug: string) {
    return slug.replace(/\.mdx$/, "");
}

function ensurePostsDirectory() {
    if (!fs.existsSync(postsDirectory)) {
        return false;
    }
    return true;
}

export function createExcerpt(markdown: string, maxLength = 160) {
    const plainText = markdown
        .replace(/```[\s\S]*?```/g, "")
        .replace(/`([^`]+)`/g, "$1")
        .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
        .replace(/[#>*_~-]/g, "")
        .replace(/\s+/g, " ")
        .trim();
    if (!plainText) {
        return "";
    }
    return plainText.length > maxLength
        ? `${plainText.slice(0, maxLength).trim()}…`
        : plainText;
}

export function getPostSlugs() {
    if (!ensurePostsDirectory()) {
        return [];
    }
    return fs.readdirSync(postsDirectory).filter((file) => file.endsWith(".mdx"));
}

export function getPostBySlug(slug: string): Post {
    if (!ensurePostsDirectory()) {
        throw new Error("Posts directory is missing");
    }

    const realSlug = normalizeSlug(slug);
    const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);
    if (!fs.existsSync(fullPath)) {
        throw new Error(`Post not found for slug: ${realSlug}`);
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    const description =
        data.description ||
        data.excerpt ||
        createExcerpt(content);

    return {
        slug: realSlug,
        title: data.title ?? realSlug,
        date: data.date ?? new Date().toISOString(),
        description,
        content,
    };
}

export function getAllPosts(): PostMeta[] {
    const slugs = getPostSlugs();
    const posts = slugs
        .map((slug) => {
            const post = getPostBySlug(slug);
            return {
                slug: post.slug,
                title: post.title,
                date: post.date,
                description: post.description,
            };
        })
        .sort((post1, post2) => {
            const a = new Date(post1.date).getTime();
            const b = new Date(post2.date).getTime();
            return b - a;
        });
    return posts;
}

export function getAllPostsWithContent(): Post[] {
    const slugs = getPostSlugs();
    return slugs.map((slug) => getPostBySlug(slug));
}
