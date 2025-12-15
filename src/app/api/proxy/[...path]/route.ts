import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = "https://gc-board-latest-1.onrender.com";

async function proxy(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    // 1. Reconstruct Target URL
    // params is a Promise in Next.js 15+
    const { path: pathArray } = await params;
    // pathArray is an array like ['v1', 'posts']
    // We want: https://backend/api/v1/posts
    const path = pathArray.join("/");
    const query = request.nextUrl.search; // ?limit=20
    const targetUrl = `${BACKEND_URL}/api/${path}${query}`;

    // 2. Prepare Headers
    const headers = new Headers();
    // Copy incoming headers that matter
    const allowedHeaders = ["content-type", "authorization", "cookie", "user-agent", "accept"];
    request.headers.forEach((value, key) => {
        if (allowedHeaders.includes(key.toLowerCase())) {
            headers.set(key, value);
        }
    });

    // Explicitly set Host logic if needed, but fetch handles host usually.
    // Important: Do NOT forward Origin/Referer blindly to avoid CORS on backend if it's strict.
    // Usually backend sees server-to-server so CORS isn't the same, but Origin might check.

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers: headers,
            body: request.body,
            // @ts-ignore - Duplex is needed for streaming bodies in some Next.js versions/Node
            duplex: "half",
            redirect: "manual" // Handle redirects manually if needed
        });

        // 3. Process Response
        const responseHeaders = new Headers(response.headers);

        // 4. Rewrite Cookies
        // The backend sends: Set-Cookie: JSESSIONID=...; Path=/; Secure; HttpOnly
        // We want to pass this to the browser.
        // If it sends Domain=..., we might want to strip it so it matches current FE domain.

        const setCookieHeader = response.headers.get("set-cookie");
        if (setCookieHeader) {
            // Simple strip of Domain attribute
            // Note: Multiple set-cookie headers are merged in fetch API sometimes, need care.
            // But usually for One session cookie it's fine.
            const newCookie = setCookieHeader
                .replace(/Domain=[^;]+;?/gi, "")
                .replace(/SameSite=[^;]+;?/gi, "") // We set our own
                + "; SameSite=Lax"; // Force Lax for now to ensure it works, or None if needed for iframes

            responseHeaders.set("set-cookie", newCookie);
        }

        // Remove strict CORS that might confuse browser (since we are same origin now)
        responseHeaders.delete("access-control-allow-origin");

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });

    } catch (e: any) {
        console.error("Proxy Error:", e);
        return NextResponse.json({ error: "Proxy failed", details: e.message }, { status: 502 });
    }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
export const PATCH = proxy;
export const HEAD = proxy;
