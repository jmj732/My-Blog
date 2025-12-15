"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

type AuthUser = {
    id?: string;
    name?: string | null;
    nickname?: string | null;
    email?: string | null;
    role?: string | null;
    avatarUrl?: string | null;
};

type AuthContextValue = {
    user: AuthUser | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMe = useCallback(async () => {
        setLoading(true);
        try {
            if (typeof document === "undefined") {
                setUser(null);
                setError(null);
                return;
            }

            const cookieString = document.cookie || "";
            const token = extractJwtFromCookies(cookieString);

            if (!token) {
                setUser(null);
                setError(null);
                return;
            }

            const decoded = decodeJwtPayload(token);
            if (!decoded) {
                setUser(null);
                setError("로그인 정보를 읽을 수 없어요");
                return;
            }

            const nextUser: AuthUser = {
                id: decoded.sub ?? decoded.userId ?? decoded.id,
                name:
                    decoded.nickname ?? decoded.nickName ?? decoded.name ?? decoded.email ?? null,
                nickname: decoded.nickname ?? decoded.nickName ?? null,
                email: decoded.email ?? null,
                role: decoded.role ?? decoded.roles?.[0] ?? decoded.auth ?? null,
                avatarUrl: decoded.avatar_url ?? decoded.avatarUrl ?? null,
            };

            setUser(nextUser);
            setError(null);
        } catch (err) {
            console.error("Failed to parse auth token:", err);
            setUser(null);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                refresh: fetchMe,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}

function extractJwtFromCookies(cookieString: string): string | null {
    const cookies = cookieString.split(";").map((c) => c.trim()).filter(Boolean);
    const candidates = new Map<string, string>();

    for (const cookie of cookies) {
        const [rawName, ...rest] = cookie.split("=");
        if (!rawName || rest.length === 0) continue;
        const name = rawName.trim();
        const value = rest.join("=").trim();
        if (!value) continue;
        candidates.set(name, value);
    }

    const preferredNames = ["accessToken", "access_token", "token", "jwt", "authorization"];
    for (const name of preferredNames) {
        const value = candidates.get(name);
        if (value && isLikelyJwt(value)) {
            return value;
        }
    }

    for (const value of candidates.values()) {
        if (isLikelyJwt(value)) {
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
    if (parts.length < 2) {
        return null;
    }

    try {
        const payload = parts[1];
        const decoded = decodeBase64Url(payload);
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

function decodeBase64Url(input: string): string {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const paddingNeeded = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(paddingNeeded);

    if (typeof atob !== "function") {
        throw new Error("Base64 decoding is not available in this environment");
    }

    return atob(padded);
}
