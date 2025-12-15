const DEFAULT_API_BASE = "https://gc-board-latest-1.onrender.com";

function getApiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");
}

function buildApiUrl(path: string) {
    const base = getApiBase();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
}

type ApiResponse<T> = {
    success?: boolean;
    data?: T;
    error?: string | null;
};

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const url = buildApiUrl(path);
    const response = await fetch(url, {
        credentials: "include",
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init?.headers || {}),
        },
    });

    let body: ApiResponse<T> | T | null = null;
    try {
        body = await response.json();
    } catch {
        body = null;
    }

    const isError =
        !response.ok ||
        (body && typeof body === "object" && "success" in body && body.success === false);

    if (isError) {
        const errorMessage =
            (body && typeof body === "object" && "error" in body && (body as ApiResponse<T>).error) ||
            response.statusText ||
            "Request failed";
        throw new Error(errorMessage ?? "Request failed");
    }

    if (body && typeof body === "object" && "data" in body) {
        return (body as ApiResponse<T>).data as T;
    }

    return (body as T) ?? (null as T);
}
