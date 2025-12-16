"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { getUserIdFromAuthMeData, getUserRoleFromAuthMeData } from "@/lib/auth";

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
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMe = useCallback(async () => {
        // Use local proxy instead of backend directly
        const proxyMeUrl = "/api/auth/me";
        setLoading(true);
        console.log("[AuthProvider] Fetching user from proxy:", proxyMeUrl);
        try {
            const res = await fetch(proxyMeUrl, {
                credentials: "include",
                cache: "no-store",
            });

            console.log("[AuthProvider] Proxy response status:", res.status);

            if (!res.ok) {
                const message = res.statusText || "Failed to load auth";
                throw new Error(message);
            }

            const payload = await res.json();
            console.log("[AuthProvider] Proxy payload:", payload);
            const data = payload?.data;

            if (data) {
                const normalizedId = getUserIdFromAuthMeData(data);
                const normalizedRole = getUserRoleFromAuthMeData(data);
                const mappedUser: AuthUser = {
                    id: normalizedId,
                    name: data.name ?? data.email ?? null,
                    nickname: data.nickname ?? data.name ?? null,
                    email: data.email ?? null,
                    role: normalizedRole,
                    avatarUrl: data.image ?? data.avatarUrl ?? null,
                };
                setUser(mappedUser);
            } else {
                setUser(null);
            }
            setError(null);
        } catch (err) {
            console.error("[AuthProvider] Failed to fetch auth state:", err);
            setUser(null);
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    const logout = useCallback(async () => {
        console.log("[AuthProvider] Logout initiated");
        try {
            // Use local proxy instead of backend directly
            const proxyLogoutUrl = "/api/auth/logout";
            console.log("[AuthProvider] Sending logout request to proxy:", proxyLogoutUrl);

            const res = await fetch(proxyLogoutUrl, {
                method: "POST",
                credentials: "include",
            });
            console.log("[AuthProvider] Logout response status:", res.status, res.statusText);

            // Even if the backend fails, we accept it as logged out on frontend
        } catch (err) {
            console.error("[AuthProvider] Logout failed with error:", err);
        } finally {
            console.log("[AuthProvider] Clearing local user state");
            setUser(null);
            setError(null);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                error,
                refresh: fetchMe,
                logout,
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
