const DEFAULT_API_BASE = "https://gc-board-latest-1.onrender.com";

export function getApiBase() {
    return (process.env.NEXT_PUBLIC_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, "");
}

export function buildApiUrl(path: string) {
    const base = getApiBase();
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${base}${normalizedPath}`;
}

type ApiResponse<T> = {
    success?: boolean;
    data?: T;
    error?: string | null;
};

type ApiRequestOptions = RequestInit & {
    useProxy?: boolean;
};

export async function apiRequest<T>(path: string, init?: ApiRequestOptions): Promise<T> {
    const useProxy = init?.useProxy ?? false;

    // If useProxy is true, use the local proxy route to forward cookies
    // Otherwise, call the backend directly
    let url: string;
    if (useProxy) {
        // Convert /api/v1/... to /api/proxy/v1/...
        const proxyPath = path.replace(/^\/api\//, "/api/proxy/");
        url = proxyPath;
    } else {
        url = buildApiUrl(path);
    }

    const { useProxy: _, ...fetchInit } = init || {};

    const response = await fetch(url, {
        credentials: "include",
        ...fetchInit,
        headers: {
            "Content-Type": "application/json",
            ...(fetchInit?.headers || {}),
        },
    });

    let body: ApiResponse<T> | T | null = null;
    try {
        // Parse JSON with big number handling to prevent precision loss
        // Snowflake IDs are 18+ digits which exceed JavaScript's safe integer limit
        const text = await response.text();
        const safeText = text.replace(
            /:(\s*)(\d{15,})(\s*)([,\}])/g,
            ':"$2"$3$4'
        );
        body = JSON.parse(safeText);
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
