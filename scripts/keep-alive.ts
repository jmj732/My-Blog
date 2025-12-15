import "dotenv/config";

const rawBase =
  process.env.KEEP_ALIVE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://gc-board-latest-1.onrender.com";

const base = rawBase.replace(/\/+$/, "");
const intervalMs = Number(process.env.KEEP_ALIVE_INTERVAL_MS ?? 5 * 60 * 1000);
const timeoutMs = Number(process.env.KEEP_ALIVE_TIMEOUT_MS ?? 5000);
const targetUrl = `${base}/`;

if (!Number.isFinite(intervalMs) || intervalMs <= 0) {
  throw new Error(`Invalid KEEP_ALIVE_INTERVAL_MS: ${process.env.KEEP_ALIVE_INTERVAL_MS}`);
}

const logPrefix = () => new Date().toISOString();

const pingOnce = async () => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const started = Date.now();
  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      cache: "no-store",
    });
    const elapsed = Date.now() - started;
    const bodyPreview = await res
      .text()
      .then((text) => text.replace(/\s+/g, " ").slice(0, 120))
      .catch(() => "");
    console.log(
      `[${logPrefix()}] ${res.status} ${res.statusText} ${elapsed}ms ${targetUrl} ${bodyPreview}`,
    );
  } catch (error) {
    const elapsed = Date.now() - started;
    console.error(`[${logPrefix()}] ping failed after ${elapsed}ms:`, error);
  } finally {
    clearTimeout(timer);
  }
};

const main = async () => {
  console.log(
    `[${logPrefix()}] keep-alive started → ${targetUrl} every ${intervalMs}ms (timeout ${timeoutMs}ms)`,
  );
  await pingOnce();
  setInterval(pingOnce, intervalMs);
};

main();
