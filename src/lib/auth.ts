export function normalizeRole(role: unknown): string | null {
    if (typeof role !== "string") return null;
    const trimmed = role.trim();
    if (!trimmed) return null;
    const upper = trimmed.toUpperCase();
    return upper.startsWith("ROLE_") ? upper.slice("ROLE_".length) : upper;
}

export function hasAdminRole(role: unknown, roles?: unknown): boolean {
    if (normalizeRole(role) === "ADMIN") return true;
    if (Array.isArray(roles)) {
        return roles.some((r) => normalizeRole(r) === "ADMIN");
    }
    return false;
}

export function normalizeUserId(id: unknown): string | undefined {
    if (id === null || id === undefined) return undefined;
    if (typeof id === "string") return id;
    if (typeof id === "number") return String(id);
    if (typeof id === "bigint") return id.toString();
    return undefined;
}

export function getUserIdFromAuthMeData(data: unknown): string | undefined {
    if (!data || typeof data !== "object") return undefined;
    const record = data as Record<string, unknown>;
    return normalizeUserId(record.id ?? record.userId);
}

export function getUserRoleFromAuthMeData(data: unknown): string | null {
    if (!data || typeof data !== "object") return null;
    const record = data as Record<string, unknown>;
    const role = record.role;
    const roles = record.roles;

    if (hasAdminRole(role, roles)) return "ADMIN";
    return (
        normalizeRole(role) ??
        (Array.isArray(roles) ? normalizeRole(roles[0]) : null)
    );
}

