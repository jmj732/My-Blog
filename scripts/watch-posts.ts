import chokidar from "chokidar";
import { spawn } from "child_process";
import path from "path";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

console.log(`Watching for changes in ${POSTS_DIR}...`);

let isSyncing = false;
let pendingSync = false;

const debounceTime = 1000; // 1 second debounce
let timeout: NodeJS.Timeout | null = null;

function runSync() {
    if (isSyncing) {
        pendingSync = true;
        return;
    }

    isSyncing = true;
    console.log("Change detected. Running sync...");

    const syncProcess = spawn("npm", ["run", "sync-posts"], {
        stdio: "inherit",
        shell: true,
    });

    syncProcess.on("close", (code) => {
        isSyncing = false;
        if (code === 0) {
            console.log("Sync completed successfully.");
        } else {
            console.error(`Sync failed with code ${code}`);
        }

        if (pendingSync) {
            pendingSync = false;
            triggerSync();
        }
    });
}

function triggerSync() {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(runSync, debounceTime);
}

const watcher = chokidar.watch(POSTS_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    ignoreInitial: true, // Don't run on startup for existing files
});

watcher
    .on("add", (path) => {
        console.log(`File added: ${path}`);
        triggerSync();
    })
    .on("change", (path) => {
        console.log(`File changed: ${path}`);
        triggerSync();
    })
    .on("unlink", (path) => {
        console.log(`File removed: ${path}`);
        // Note: The current sync script might not handle deletions (remote deletion).
        // It relies on .sync-state.json and local file list.
        // If we want to handle deletions, sync-posts.ts needs modification.
        // For now, we just run sync, which will UPSERT existing files.
        // Deletions might need manual cleanup or an update to sync-posts.
        triggerSync();
    });
