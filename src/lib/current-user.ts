import "server-only";

import { cookies } from "next/headers";

import { getApiBase, parseJsonWithBigIntProtection } from "@/lib/api-client";
import { getUserIdFromAuthMeData, getUserRoleFromAuthMeData } from "@/lib/auth";

type CurrentUser = Record<string, unknown> & {
    id?: string;
    role?: string | null;
};

// Helper to get current user from backend (server-side).
export async function getCurrentUser(): Promise<CurrentUser | null> {
    try {
        const cookieStore = await cookies();
        const backendUrl = `${getApiBase()}/api/v1/auth/me`;

        const cookieHeader = cookieStore
            .getAll()
            .map((c) => `${c.name}=${c.value}`)
            .join("; ");

        const res = await fetch(backendUrl, {
            method: "GET",
            headers: {
                Cookie: cookieHeader,
            },
            cache: "no-store",
        });

        if (!res.ok || res.status === 401) {
            return null;
        }

        const text = await res.text();
        const payload = parseJsonWithBigIntProtection(text);
        const data =
            payload && typeof payload === "object" && "data" in payload
                ? (payload as { data?: unknown }).data
                : payload;

        if (!data || typeof data !== "object") return null;

        const normalizedId = getUserIdFromAuthMeData(data);
        const normalizedRole = getUserRoleFromAuthMeData(data);
        return {
            ...(data as Record<string, unknown>),
            ...(normalizedId ? { id: normalizedId } : {}),
            ...(normalizedRole ? { role: normalizedRole } : {}),
        };
    } catch (err) {
        console.error("[getCurrentUser] Failed:", err);
        return null;
    }
}

