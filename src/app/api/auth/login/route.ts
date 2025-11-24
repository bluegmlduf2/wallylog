import { NextRequest, NextResponse } from "next/server";
import {
    verifyPassword,
    generateToken,
    checkBruteForce,
    recordLoginAttempt,
} from "@/lib/jwt";

export async function POST(request: NextRequest) {
    try {
        const { password, token } = await request.json();

        // IP 주소 추출
        const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0] ||
            request.headers.get("x-real-ip") ||
            "unknown";

        // 브루트포스 공격 방지
        if (!checkBruteForce(ip)) {
            return NextResponse.json(
                {
                    error: "너무 많은 로그인 시도가 있었습니다. 15분 후 다시 시도해주세요.",
                },
                { status: 429 }
            );
        }

        // reCAPTCHA 검증
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        const verifyRes = await fetch(
            `https://www.google.com/recaptcha/api/siteverify`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: `secret=${secretKey}&response=${token}`,
            }
        );
        const verifyData = await verifyRes.json();

        // score가 1에 가까울수록 사람 0에 가까울수록 로봇
        // 참조 : https://developers.google.com/recaptcha/docs/v3?hl=ko&_gl=1*n1k18f*_up*MQ..*_ga*MTc1NjkzNjUwOC4xNzYzOTkyNjEz*_ga_SM8HXJ53K2*czE3NjM5OTI2MTMkbzEkZzAkdDE3NjM5OTQwNTckajYwJGwwJGgw
        if (
            !verifyData.success ||
            (verifyData.score && verifyData.score < 0.5)
        ) {
            return NextResponse.json(
                { error: "reCAPTCHA 검증에 실패했습니다" },
                { status: 401 }
            );
        }

        // 비밀번호 검증
        const isValidPassword = await verifyPassword(password);

        if (isValidPassword) {
            // JWT 토큰 생성
            const token = generateToken("admin");

            const response = NextResponse.json({
                success: true,
                message: "로그인 성공",
            });

            // HttpOnly 쿠키에 JWT 토큰 저장
            response.cookies.set("auth-token", token, {
                httpOnly: true, // 클라이언트 측 스크립트에서 접근할 수 없습니다.
                secure: process.env.NODE_ENV === "production", //  프로덕션 환경에서만 쿠키가 HTTPS를 통해 전송됩니다.
                sameSite: "strict", // CSRF 공격 방지를 위해 SameSite 속성을 설정합니다.
                maxAge: 60 * 60 * 24, // 쿠키의 유효 기간을 1일로 설정합니다.
                path: "/", // 쿠키가 적용될 경로를 설정합니다.
            });

            // 성공한 로그인 기록
            recordLoginAttempt(ip, true);

            return response;
        } else {
            // 실패한 로그인 기록
            recordLoginAttempt(ip, false);

            return NextResponse.json(
                { error: "잘못된 비밀번호입니다." },
                { status: 401 }
            );
        }
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { error: "로그인 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
