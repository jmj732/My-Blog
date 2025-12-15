import { NextRequest, NextResponse } from "next/server";

import { buildApiUrl } from "@/lib/api-client";

type AuthUser = {
    id?: string;
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
};

type BackendMeResponse = {
    success?: boolean;
    data?: {
        id?: string | number;
        email?: string | null;
        name?: string | null;
        role?: string | null;
        image?: string | null;
        avatarUrl?: string | null;
        nickname?: string | null;
    } | null;
    error?: string | null;
};

export async function GET(request: NextRequest) {
    try {
        const backendUrl = buildApiUrl("/api/v1/auth/me");

        const backendRes = await fetch(backendUrl, {
            method: "GET",
            headers: {
                cookie: request.headers.get("cookie") ?? "",
                authorization: request.headers.get("authorization") ?? "",
            },
            cache: "no-store",
        });

        if ([401, 403, 404].includes(backendRes.status)) {
            return NextResponse.json({ user: null }, { status: 401, headers: noStoreHeaders() });
        }

        if (!backendRes.ok) {
            const text = await backendRes.text().catch(() => "Unknown error");
            console.error("Backend /auth/me error:", backendRes.status, text);
            return NextResponse.json({ error: "Failed to fetch auth" }, { status: 500, headers: noStoreHeaders() });
        }

        const payload = (await backendRes.json()) as BackendMeResponse;
        const data = payload?.data ?? null;

        if (!data) {
            return NextResponse.json({ user: null }, { status: 401, headers: noStoreHeaders() });
        }

        const user: AuthUser = {
            id: data.id ? String(data.id) : undefined,
            name: data.name ?? data.email ?? null,
            nickname: data.nickname ?? data.name ?? null,
            email: data.email ?? null,
            role: data.role ?? null,
            avatarUrl: data.image ?? data.avatarUrl ?? null,
        };

        return NextResponse.json({ user }, { headers: noStoreHeaders() });
    } catch (error) {
        console.error("Failed to fetch backend auth/me:", error);
        return NextResponse.json({ error: "Failed to read auth" }, { status: 500, headers: noStoreHeaders() });
    }
}

function noStoreHeaders() {
    return {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
    };
}
