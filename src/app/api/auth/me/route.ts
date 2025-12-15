import { NextRequest, NextResponse } from "next/server";

type AuthUser = {
    id?: string;
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
};

type JwtPayload = {
    sub?: string;
    userId?: string;
    id?: string;
    nickname?: string;
    nickName?: string;
    name?: string;
    email?: string;
    role?: string;
    roles?: string[];
    auth?: string;
    avatar_url?: string;
    avatarUrl?: string;
    [key: string]: unknown;
};

const PREFERRED_COOKIE_NAMES = ["JWT_TOKEN", "accessToken", "access_token", "token", "jwt", "authorization"];

export async function GET(request: NextRequest) {
    try {
        const token = extractJwtFromCookies(request);

        if (!token) {
            return NextResponse.json({ user: null }, { status: 401, headers: noStoreHeaders() });
        }

        const payload = decodeJwtPayload(token);
        if (!payload) {
            return NextResponse.json({ user: null }, { status: 401, headers: noStoreHeaders() });
        }

        const user: AuthUser = {
            id: payload.sub ?? payload.userId ?? payload.id,
            name: payload.nickname ?? payload.nickName ?? payload.name ?? payload.email ?? null,
            nickname: payload.nickname ?? payload.nickName ?? null,
            email: payload.email ?? null,
            role: payload.role ?? payload.roles?.[0] ?? payload.auth ?? null,
            avatarUrl: payload.avatar_url ?? payload.avatarUrl ?? null,
        };

        return NextResponse.json({ user }, { headers: noStoreHeaders() });
    } catch (error) {
        console.error("Failed to read JWT cookie:", error);
        return NextResponse.json({ error: "Failed to read auth" }, { status: 500, headers: noStoreHeaders() });
    }
}

function extractJwtFromCookies(request: NextRequest): string | null {
    for (const name of PREFERRED_COOKIE_NAMES) {
        const value = request.cookies.get(name)?.value;
        if (value && isLikelyJwt(value)) {
            return value;
        }
    }

    for (const { value } of request.cookies.getAll()) {
        if (value && isLikelyJwt(value)) {
            return value;
        }
    }

    return null;
}

function isLikelyJwt(value: string) {
    return /^[A-Za-z0-9-_]+?\.[A-Za-z0-9-_]+(?:\.[A-Za-z0-9-_]+)?$/.test(value);
}

function decodeJwtPayload(token: string): JwtPayload | null {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    try {
        const payload = parts[1];
        const decoded = decodeBase64Url(payload);
        return JSON.parse(decoded) as JwtPayload;
    } catch {
        return null;
    }
}

function decodeBase64Url(input: string): string {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const paddingNeeded = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(paddingNeeded);
    return Buffer.from(padded, "base64").toString("utf-8");
}

function noStoreHeaders() {
    return {
        "Cache-Control": "no-store, max-age=0",
        Pragma: "no-cache",
    };
}
