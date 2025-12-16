import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiBase } from "@/lib/api-client";

/**
 * GET /api/auth/me
 * Proxy to backend to get current user info.
 * Forwards cookies from browser to backend.
 */
export async function GET() {
    const cookieStore = await cookies();
    const backendUrl = `${getApiBase()}/api/v1/auth/me`;

    console.log("[Proxy Me] Sending request to:", backendUrl);

    // Forward all cookies to backend
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    try {
        const res = await fetch(backendUrl, {
            method: "GET",
            headers: {
                Cookie: cookieHeader,
            },
            cache: "no-store",
        });

        console.log("[Proxy Me] Backend response status:", res.status);

        if (res.status === 401) {
            return NextResponse.json(
                { success: true, data: null, error: null },
                { status: 200 }
            );
        }

        if (!res.ok) {
            return NextResponse.json(
                { success: false, data: null, error: res.statusText },
                { status: res.status }
            );
        }

        const payload = await res.json();
        console.log("[Proxy Me] Backend payload:", payload);

        // Forward any Set-Cookie headers from backend to browser
        const response = NextResponse.json(payload);

        const setCookieHeader = res.headers.get("set-cookie");
        if (setCookieHeader) {
            response.headers.set("set-cookie", setCookieHeader);
        }

        return response;
    } catch (err) {
        console.error("[Proxy Me] Request failed:", err);
        return NextResponse.json(
            { success: false, data: null, error: "Internal server error" },
            { status: 500 }
        );
    }
}
