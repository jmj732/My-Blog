"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { apiRequest } from "@/lib/api-client";

type AuthUser = {
    id?: string;
    name?: string | null;
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
        setLoading(true);
        try {
            const data = await apiRequest<AuthUser>("/api/v1/auth/me");
            setUser(data ?? null);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);

            // 401 = 로그인 안 된 상태. 에러로 노출하지 않고 user를 null로 둔다.
            const isUnauthorized =
                message.toLowerCase().includes("unauthorized") || message.includes("401");
            if (!isUnauthorized) {
                console.error("Failed to fetch auth state:", err);
                setError(message);
            } else {
                setError(null);
            }
            setUser(null);
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
