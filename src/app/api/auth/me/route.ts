import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiBase, parseJsonWithBigIntProtection } from "@/lib/api-client";
import { getUserIdFromAuthMeData, getUserRoleFromAuthMeData } from "@/lib/auth";

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

        const text = await res.text();
        const payload = parseJsonWithBigIntProtection(text);
        console.log("[Proxy Me] Backend payload:", payload);

        if (payload && typeof payload === "object" && "data" in payload) {
            const data = (payload as { data?: unknown }).data;
            const normalizedId = getUserIdFromAuthMeData(data);
            const normalizedRole = getUserRoleFromAuthMeData(data);
            if (data && typeof data === "object") {
                (payload as { data: Record<string, unknown> }).data = {
                    ...(data as Record<string, unknown>),
                    ...(normalizedId ? { id: normalizedId } : {}),
                    ...(normalizedRole ? { role: normalizedRole } : {}),
                };
            }
        }

        // Forward any Set-Cookie headers from backend to browser
        const response = NextResponse.json(payload);

        const setCookieHeader = res.headers.get("set-cookie");
        if (setCookieHeader) {
            console.log("[Proxy Me] Set-Cookie header from backend:", setCookieHeader);

            // Parse cookies from Set-Cookie header and set them on frontend
            const cookies = setCookieHeader.split(",").map((c) => c.trim());
            for (const cookie of cookies) {
                // Extract cookie name and value
                const match = cookie.match(/^([^=]+)=([^;]+)/);
                if (match) {
                    const [, name, value] = match;
                    if (name === "JWT_TOKEN" || name === "JSESSIONID") {
                        console.log(`[Proxy Me] Setting ${name} cookie on frontend`);
                        response.cookies.set(name, value, {
                            path: "/",
                            httpOnly: true,
                            secure: process.env.NODE_ENV === "production",
                            sameSite: "lax",
                            maxAge: 60 * 60 * 24 * 7, // 7일
                        });
                    }
                }
            }
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
