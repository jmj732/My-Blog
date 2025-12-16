import { NextResponse } from "next/server";
import { getApiBase } from "@/lib/api-client";

/**
 * GET /api/auth/login
 * GitHub OAuth 로그인 시작
 *
 * 백엔드 OAuth 엔드포인트로 리다이렉트
 * 백엔드가 로그인 성공 후 FRONTEND_URL로 자동 리다이렉트
 */
export async function GET() {
    const backendBase = getApiBase();
    const backendOAuthUrl = `${backendBase}/oauth2/authorization/github`;

    console.log("[Auth Login] Starting OAuth flow");
    console.log("[Auth Login] Redirecting to:", backendOAuthUrl);

    return NextResponse.redirect(backendOAuthUrl);
}
