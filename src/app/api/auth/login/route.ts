import { NextRequest, NextResponse } from "next/server";
import { getApiBase } from "@/lib/api-client";

/**
 * GET /api/auth/login
 * GitHub OAuth 로그인 시작
 *
 * 백엔드 OAuth 엔드포인트로 리다이렉트하되,
 * 콜백 URL을 프론트엔드 /api/auth/callback으로 설정
 */
export async function GET(request: NextRequest) {
    const backendBase = getApiBase();
    const frontendBase = request.nextUrl.origin;
    const callbackUrl = `${frontendBase}/api/auth/callback`;

    console.log("[Auth Login] Starting OAuth flow");
    console.log("[Auth Login] Backend base:", backendBase);
    console.log("[Auth Login] Callback URL:", callbackUrl);

    // 백엔드 OAuth URL 구성
    // 백엔드가 redirect_uri 파라미터를 지원하는 경우
    const backendOAuthUrl = `${backendBase}/oauth2/authorization/github?redirect_uri=${encodeURIComponent(
        callbackUrl
    )}`;

    console.log("[Auth Login] Redirecting to:", backendOAuthUrl);

    return NextResponse.redirect(backendOAuthUrl);
}
