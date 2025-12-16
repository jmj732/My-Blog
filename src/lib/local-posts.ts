import fs from "fs";
import path from "path";
import matter from "gray-matter";
import crypto from "crypto";
import { pipeline } from "@xenova/transformers";

// Define local post interface
export interface LocalPost {
    slug: string;
    title: string;
    content: string;
    authorId?: number;
    createdAt?: Date;
    hash: string; // Content hash for diffing
    embedding?: number[];
}

export class LocalPostManager {
    private postsDir: string;
    private embedder: any = null;

    constructor(postsDir: string) {
        this.postsDir = postsDir;
    }

    // Initialize embedding model
    async initEmbedder() {
        if (!this.embedder) {
            console.log("Loading embedding model...");
            // Use a small, fast model suitable for local usage
            this.embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
        }
    }

    // Calculate hash of content + title to detect changes
    private calculateHash(content: string, title: string): string {
        return crypto.createHash("md5").update(`${title}:${content}`).digest("hex");
    }

    // Generate embedding for text
    async generateEmbedding(text: string): Promise<number[]> {
        if (!this.embedder) await this.initEmbedder();

        // Truncate text if too long (simple approach) or rely on model's truncation
        const output = await this.embedder(text, { pooling: "mean", normalize: true });
        return Array.from(output.data);
    }

    // Read all posts from directory
    async getAllPosts(): Promise<LocalPost[]> {
        if (!fs.existsSync(this.postsDir)) {
            console.warn(`Posts directory not found: ${this.postsDir}`);
            return [];
        }

        const files = fs.readdirSync(this.postsDir).filter(f => f.endsWith(".md") || f.endsWith(".mdx"));
        const posts: LocalPost[] = [];

        for (const file of files) {
            const filePath = path.join(this.postsDir, file);
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const { data, content } = matter(fileContent);

            // Slug from filename (simpler) or frontmatter
            const slug = data.slug || file.replace(/\.mdx?$/, "");

            posts.push({
                slug,
                title: data.title || slug,
                content, // Raw markdown content
                authorId: data.authorId,
                createdAt: data.date ? new Date(data.date) : undefined,
                hash: this.calculateHash(content, data.title || slug)
            });
        }

        return posts;
    }
}
