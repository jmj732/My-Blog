import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiBase } from "@/lib/api-client";

/**
 * POST /api/auth/logout
 * Proxy logout request to backend and clear all auth-related cookies.
 */
export async function POST() {
    const cookieStore = await cookies();
    const backendUrl = `${getApiBase()}/api/v1/auth/logout`;

    console.log("[Proxy Logout] Sending request to:", backendUrl);

    // Forward all cookies to backend
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    try {
        const res = await fetch(backendUrl, {
            method: "POST",
            headers: {
                Cookie: cookieHeader,
            },
        });

        console.log("[Proxy Logout] Backend response status:", res.status);
    } catch (err) {
        console.error("[Proxy Logout] Backend request failed:", err);
    }

    // Clear all auth-related cookies on the frontend
    const response = NextResponse.json({ success: true, data: null, error: null });

    // Clear JWT_TOKEN
    response.cookies.set("JWT_TOKEN", "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });

    // Clear JSESSIONID
    response.cookies.set("JSESSIONID", "", {
        path: "/",
        maxAge: 0,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
    });

    console.log("[Proxy Logout] Cleared cookies: JWT_TOKEN, JSESSIONID");

    return response;
}
