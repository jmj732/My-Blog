import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://gc-board-latest-1.onrender.com").replace(/\/$/, "");
const SYNC_TOKEN = process.env.POST_SYNC_TOKEN;

async function sendRequest(payload: any, label: string) {
    console.log(`\n--- Testing: ${label} ---`);
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/posts/sync`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${SYNC_TOKEN}`
            },
            body: JSON.stringify({ posts: [payload] })
        });

        console.log(`Status: ${response.status}`);
        const text = await response.text();
        console.log(`Body: ${text}`);
    } catch (e) {
        console.error(e);
    }
}

async function main() {
    // 384-dim dummy embedding
    const validEmbedding = Array(384).fill(0.05);

    // Case 1: Unique slug, valid embedding, minimal fields
    await sendRequest({
        slug: `debug-${Date.now()}`,
        title: "Debug Post",
        content: "Debug content",
        embedding: validEmbedding
    }, "Unique Slug + Valid 384-dim Embedding");

    // Case 2: Same slug (conflict test)
    await sendRequest({
        slug: "hello-world",
        title: "Hello World",
        content: "Content",
        embedding: validEmbedding
    }, "Existing Slug 'hello-world'");

    // Case 3: Invalid embedding dim (conflict test)
    await sendRequest({
        slug: `debug-dim-${Date.now()}`,
        title: "Debug Dim",
        content: "Content",
        embedding: [0.1, 0.2] // Wrong dim
    }, "Unique Slug + Wrong Embedding Dim (2)");
}

main();
