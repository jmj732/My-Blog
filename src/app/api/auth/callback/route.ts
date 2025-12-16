import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * GET /api/auth/callback
 * OAuth 콜백 핸들러 - 백엔드에서 받은 토큰을 프론트엔드 쿠키에 설정
 *
 * 백엔드 OAuth 플로우:
 * 1. 사용자가 /oauth2/authorization/github 접속
 * 2. GitHub 인증 후 백엔드 콜백으로 리다이렉트
 * 3. 백엔드가 JWT_TOKEN 발급 후 이 엔드포인트로 리다이렉트 (쿠키 또는 쿼리로 토큰 전달)
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    console.log("[Auth Callback] Query params:", { token: !!token, error });

    // 에러가 있으면 홈으로 리다이렉트
    if (error) {
        console.error("[Auth Callback] OAuth error:", error);
        return NextResponse.redirect(new URL("/?error=auth_failed", request.url));
    }

    // 토큰이 쿼리 파라미터로 전달된 경우
    if (token) {
        console.log("[Auth Callback] Setting JWT_TOKEN from query parameter");
        const response = NextResponse.redirect(new URL("/", request.url));

        response.cookies.set("JWT_TOKEN", token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7일
        });

        return response;
    }

    // 토큰이 없으면 백엔드 쿠키에서 가져오기 시도
    const cookieStore = await cookies();
    const backendToken = cookieStore.get("JWT_TOKEN");

    console.log("[Auth Callback] Backend cookie:", { hasToken: !!backendToken });

    if (backendToken) {
        console.log("[Auth Callback] Setting JWT_TOKEN from backend cookie");
        const response = NextResponse.redirect(new URL("/", request.url));

        response.cookies.set("JWT_TOKEN", backendToken.value, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7일
        });

        return response;
    }

    // 토큰을 찾을 수 없으면 에러
    console.error("[Auth Callback] No token found");
    return NextResponse.redirect(new URL("/?error=no_token", request.url));
}
