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

            const body = (await res.json()) as { user: AuthUser | null };
            setUser(body.user ?? null);
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
