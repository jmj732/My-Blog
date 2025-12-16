import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getApiBase } from "@/lib/api-client";

/**
 * Proxy route for authenticated API requests
 * Forwards cookies from frontend to backend
 *
 * Usage: /api/proxy/v1/posts → https://backend/api/v1/posts
 */

async function proxyRequest(request: NextRequest, method: string) {
    const cookieStore = await cookies();
    const pathname = request.nextUrl.pathname;

    // Extract the path after /api/proxy/
    const targetPath = pathname.replace(/^\/api\/proxy/, "/api");
    const backendUrl = `${getApiBase()}${targetPath}${request.nextUrl.search}`;

    console.log(`[Proxy ${method}] ${targetPath} → ${backendUrl}`);

    // Forward all cookies to backend
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    // Prepare headers
    const headers: HeadersInit = {
        Cookie: cookieHeader,
    };

    // Forward Content-Type if present
    const contentType = request.headers.get("content-type");
    if (contentType) {
        headers["Content-Type"] = contentType;
    }

    // Get request body for POST/PATCH/PUT
    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
        try {
            body = await request.text();
        } catch {
            body = undefined;
        }
    }

    try {
        const res = await fetch(backendUrl, {
            method,
            headers,
            body,
            cache: "no-store",
        });

        console.log(`[Proxy ${method}] Backend response:`, res.status);

        // Forward the response
        const responseBody = await res.text();
        const response = new NextResponse(responseBody, {
            status: res.status,
            statusText: res.statusText,
            headers: {
                "Content-Type": res.headers.get("content-type") || "application/json",
            },
        });

        return response;
    } catch (err) {
        console.error(`[Proxy ${method}] Request failed:`, err);
        return NextResponse.json(
            { success: false, data: null, error: "Proxy request failed" },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    return proxyRequest(request, "POST");
}

export async function PATCH(request: NextRequest) {
    return proxyRequest(request, "PATCH");
}

export async function PUT(request: NextRequest) {
    return proxyRequest(request, "PUT");
}

export async function DELETE(request: NextRequest) {
    return proxyRequest(request, "DELETE");
}

export async function GET(request: NextRequest) {
    return proxyRequest(request, "GET");
}
