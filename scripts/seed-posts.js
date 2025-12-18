/* eslint-disable no-console */

const dotenv = require("dotenv");

dotenv.config({ path: ".env.local" });

const DEFAULT_API_BASE = "https://gc-board-latest-1.onrender.com";

function getEnv(name) {
    const value = process.env[name];
    return value && String(value).trim() ? String(value).trim() : null;
}

function maskSecret(value) {
    if (!value) return "(none)";
    if (value.length <= 8) return `${value.slice(0, 2)}…${value.slice(-2)}`;
    return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i += 1) {
        const token = argv[i];
        if (!token.startsWith("--")) continue;
        const key = token.slice(2);
        const next = argv[i + 1];
        if (!next || next.startsWith("--")) {
            args[key] = true;
        } else {
            args[key] = next;
            i += 1;
        }
    }
    return args;
}

function pad(num, width) {
    return String(num).padStart(width, "0");
}

function makeNovelJson(title, index, createdAtIso) {
    return JSON.stringify({
        content: [
            {
                type: "heading",
                attrs: { level: 1 },
                content: [{ type: "text", text: title }],
            },
            {
                type: "paragraph",
                content: [
                    {
                        type: "text",
                        text: `Seed post #${index.toLocaleString("en-US")} (${createdAtIso}).`,
                    },
                ],
            },
        ],
    });
}

async function postJson(url, headers, body) {
    const res = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...headers,
        },
        body: JSON.stringify(body),
    });

    const text = await res.text();
    if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
    }

    try {
        return JSON.parse(text);
    } catch {
        return text;
    }
}

async function main() {
    const args = parseArgs(process.argv);

    const count = Number(args.count ?? 10000);
    const chunkSize = Number(args.chunk ?? 200);
    const type = args.type === "community" ? "community" : "admin";
    const prefix = String(args.prefix ?? `seed-${Date.now()}`);
    const yes = args.yes === true || args.yes === "true";

    if (!Number.isFinite(count) || count <= 0) {
        console.error("Invalid --count (must be a positive number).");
        process.exit(1);
    }
    if (!Number.isFinite(chunkSize) || chunkSize <= 0 || chunkSize > 1000) {
        console.error("Invalid --chunk (must be 1..1000).");
        process.exit(1);
    }

    const apiBase = (getEnv("NEXT_PUBLIC_API_BASE_URL") || DEFAULT_API_BASE).replace(/\/$/, "");
    const syncToken = getEnv("POST_SYNC_TOKEN") || getEnv("SYNC_TOKEN");
    const jwtToken = getEnv("JWT_TOKEN");

    const endpoint = `${apiBase}/api/v1/posts/sync`;

    const authorIdRaw = args.authorId ? String(args.authorId) : null;
    const authorId = authorIdRaw && authorIdRaw.trim() ? authorIdRaw.trim() : null;

    if (type === "community" && !authorId) {
        console.error("For --type community, you must provide --authorId <snowflakeId>.");
        process.exit(1);
    }

    const headers = {};

    // Spec mentions X-Sync-Token; keep Authorization support for compatibility with existing script.
    if (syncToken) headers["X-Sync-Token"] = syncToken;
    if (jwtToken) headers["Authorization"] = `Bearer ${jwtToken}`;
    else if (syncToken) headers["Authorization"] = `Bearer ${syncToken}`;

    console.log(`API_BASE_URL: ${apiBase}`);
    console.log(`Endpoint:     ${endpoint}`);
    console.log(`Type:         ${type}`);
    console.log(`Count:        ${count}`);
    console.log(`Chunk:        ${chunkSize}`);
    console.log(`Prefix:       ${prefix}`);
    if (type === "community") console.log(`AuthorId:     ${authorId}`);
    console.log(`X-Sync-Token: ${maskSecret(syncToken)}`);
    console.log(`JWT_TOKEN:    ${maskSecret(jwtToken)}`);

    if (!yes) {
        console.error('Refusing to run without explicit confirmation. Re-run with "--yes".');
        process.exit(1);
    }

    const startedAt = Date.now();
    let sent = 0;

    for (let offset = 0; offset < count; offset += chunkSize) {
        const size = Math.min(chunkSize, count - offset);
        const now = new Date();
        const createdAtIso = now.toISOString();

        const posts = Array.from({ length: size }, (_, i) => {
            const index = offset + i + 1;
            const slug = `${prefix}-${pad(index, 6)}`;
            const title = `${type === "admin" ? "Admin" : "Community"} Seed Post ${pad(index, 6)}`;

            const post = {
                slug,
                title,
                content: makeNovelJson(title, index, createdAtIso),
                createdAt: createdAtIso,
            };

            if (type === "community" && authorId) {
                post.authorId = Number.isFinite(Number(authorId)) ? Number(authorId) : authorId;
            }

            return post;
        });

        const result = await postJson(endpoint, headers, { posts });
        sent += size;

        const elapsedSec = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
        const rate = Math.round(sent / elapsedSec);
        console.log(`[${sent}/${count}] synced (rate ~${rate}/s)`, typeof result === "object" ? result : "");
    }

    console.log(`Done. Inserted/updated ${count} posts.`);
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});

