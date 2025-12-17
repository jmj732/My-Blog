
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { LocalPostManager, LocalPost } from "@/lib/local-posts";

// Load environment variables from .env.local
dotenv.config({ path: ".env.local" });

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "https://gc-board-latest-1.onrender.com").replace(/\/$/, "");
const SYNC_TOKEN = process.env.POST_SYNC_TOKEN || process.env.SYNC_TOKEN;
const JWT_TOKEN = process.env.JWT_TOKEN;

// Temporary path to posts - adjust as needed
const POSTS_DIR = path.join(process.cwd(), "content", "posts");

interface RemotePostStub {
    slug: string;
    version?: number; // Or some hash if available, but spec didn't mention hash exposed in list
    // Spec shows /posts returns title, etc. We probably need to fetch individual to check hash or assume always sync?
    // Optimization: Spec /posts list might not enough for diff if no hash. 
    // Plan: 
    // 1. Get list of remote slugs.
    // 2. Ideally server exposes a way to check 'last_updated' or 'hash'.
    //    If not, we might have to fetch details or just overwrite.
    //    Wait, the user prompt said "changedPosts는 diff 후 결과만 포함... 프론트에서 로컬 diff(예: 수정 타임스탬프나 비교해시)를 먼저 계산".
    //    This implies we need to KNOW the remote state. 
    //    If remote doesn't give us a hash, we can't really "diff" without fetching content.
    //    For now, let's assume we fetch all remote posts details or just the list and if we can't diff, we sync.
    //    Actually, we can try to store a local state file `.sync-state.json` to track what we last pushed. That's safer and faster.
}

const SYNC_STATE_FILE = path.join(process.cwd(), ".sync-state.json");

interface SyncState {
    [slug: string]: {
        hash: string;
        lastSynced: string;
    }
}

function loadSyncState(): SyncState {
    if (fs.existsSync(SYNC_STATE_FILE)) {
        return JSON.parse(fs.readFileSync(SYNC_STATE_FILE, "utf-8"));
    }
    return {};
}

function saveSyncState(state: SyncState) {
    fs.writeFileSync(SYNC_STATE_FILE, JSON.stringify(state, null, 2));
}

async function main() {
    const isDryRun = process.argv.includes("--dry-run");

    if (!SYNC_TOKEN && !JWT_TOKEN && !isDryRun) {
        console.error("Error: SYNC_TOKEN or JWT_TOKEN must be set in .env.local");
        process.exit(1);
    }

    console.log(`Starting sync to ${API_BASE_URL}... ${isDryRun ? "(DRY RUN)" : ""}`);
    if (SYNC_TOKEN) console.log(`Using SYNC_TOKEN: ${SYNC_TOKEN.slice(0, 5)}...`);
    else console.log("No SYNC_TOKEN found.");

    // 1. Load local posts
    const manager = new LocalPostManager(POSTS_DIR);
    const localPosts = await manager.getAllPosts();
    console.log(`Found ${localPosts.length} local posts.`);

    // 2. Load sync state (to avoid unnecessary uploads)
    const syncState = loadSyncState();
    const postsToSync: LocalPost[] = [];

    for (const post of localPosts) {
        const lastState = syncState[post.slug];

        // If hash is different or never synced, add to queue
        if (!lastState || lastState.hash !== post.hash) {
            console.log(`[Changed] ${post.slug}`);

            // Generate embedding only if needed (changed)
            // console.log(`  Generating embedding for ${post.slug}...`);
            try {
                const embedding = await manager.generateEmbedding(post.content); // Use content for embedding
                post.embedding = embedding;
            } catch (e) {
                console.error(`  Failed to generate embedding for ${post.slug}:`, e);
                // Proceed without embedding? Or fail? Prompt says "embedding을 넣으면... 백엔드가 다시 생성합니다."
                // So safe to skip if fails.
            }

            postsToSync.push(post);
        } else {
            console.log(`[Skipped] ${post.slug} (unchanged)`);
        }
    }

    if (postsToSync.length === 0) {
        console.log("No posts to sync.");
        return;
    }

    // 3. Send to API
    console.log(`Syncing ${postsToSync.length} posts...`);

    if (isDryRun) {
        console.log("Dry run: Skipping API call.");
        console.log("Payload preview:", JSON.stringify({
            posts: postsToSync.map(p => ({
                slug: p.slug,
                title: p.title,
                embeddingLength: p.embedding?.length
            }))
        }, null, 2));
        return;
    }

    const payload = {
        posts: postsToSync.map(p => ({
            slug: p.slug,
            title: p.title,
            content: p.content,
            authorId: p.authorId, // Optional
            createdAt: p.createdAt ? p.createdAt.toISOString() : undefined,
            embedding: p.embedding,
            id: p.id
        }))
    };

    // Add X-Sync-Token header
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
    };
    if (SYNC_TOKEN) headers["Authorization"] = `Bearer ${SYNC_TOKEN}`;
    // if (JWT_TOKEN) headers["Authorization"] = `Bearer ${JWT_TOKEN}`; // JWT disabled in favor of Sync Token

    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/posts/sync`, {
            method: "POST",
            headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`API error: ${response.status} ${response.statusText} - ${text}`);
        }

        const result = await response.json();
        console.log("Sync success:", result);

        // 4. Update sync state
        for (const post of postsToSync) {
            syncState[post.slug] = {
                hash: post.hash,
                lastSynced: new Date().toISOString()
            };
        }
        saveSyncState(syncState);

    } catch (error) {
        console.error("Sync failed:", error);
        process.exit(1);
    }
}

main().catch(console.error);
