"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { buildApiUrl } from "@/lib/api-client";

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
        const backendMeUrl = buildApiUrl("/api/v1/auth/me");
        setLoading(true);
        try {
            const res = await fetch(backendMeUrl, {
                credentials: "include",
                cache: "no-store",
            });

            if (res.status === 401) {
                setUser(null);
                setError(null);
                return;
            }

            if (!res.ok) {
                const message = res.statusText || "Failed to load auth";
                throw new Error(message);
            }

            const payload = await res.json();
            const data = payload?.data;

            if (data) {
                const mappedUser: AuthUser = {
                    id: data.id ? String(data.id) : undefined,
                    name: data.name ?? data.email ?? null,
                    nickname: data.nickname ?? data.name ?? null,
                    email: data.email ?? null,
                    role: data.role ?? null,
                    avatarUrl: data.image ?? data.avatarUrl ?? null,
                };
                setUser(mappedUser);
            } else {
                setUser(null);
            }
            setError(null);
        } catch (err) {
            console.error("Failed to fetch auth state:", err);
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
        console.log("Logout initiated");
        try {
            const backendLogoutUrl = buildApiUrl("/api/v1/auth/logout"); // Standard Spring Security logout
            console.log("Sending logout request to:", backendLogoutUrl);

            const res = await fetch(backendLogoutUrl, {
                method: "POST",
                credentials: "include",
            });
            console.log("Logout response status:", res.status, res.statusText);

            // Even if the backend fails, we accept it as logged out on frontend
        } catch (err) {
            console.error("Logout failed with error:", err);
        } finally {
            console.log("Clearing local user state");
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
