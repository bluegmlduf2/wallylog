import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

if (!process.env.JWT_SECRET) {
    throw new Error(
        "JWT_SECRET 환경변수가 설정되지 않았습니다. 하드코딩된 기본값을 사용하면 토큰 위조가 가능해 반드시 설정해야 합니다."
    );
}
const JWT_SECRET: string = process.env.JWT_SECRET;
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;

export interface JWTPayload {
    userId: string;
    type: string;
    iat: number;
    exp: number;
}

export function generateToken(userId: string): string {
    // 토큰에 저장할 payload 생성
    const payload = {
        userId,
        type: "admin",
        iat: Math.floor(Date.now() / 1000),
    };

    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: "24h", // jwt의 유효기간을 24시간으로 설정(토큰자체를 해킹당할 경우를 대비)
        issuer: "wallylog",
        audience: "wallylog-admin",
    });
}

export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET, {
            issuer: "wallylog",
            audience: "wallylog-admin",
        }) as JWTPayload;

        // 성공시 payload 반환
        return decoded;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}

export async function verifyPassword(password: string): Promise<boolean> {
    if (!ADMIN_PASSWORD_HASH) {
        // 환경변수에 해시가 없으면 평문 비교 (개발용)
        const plainPassword = process.env.ADMIN_PASSWORD;
        if (!plainPassword) return false;
        return password === plainPassword;
    }

    try {
        return await bcrypt.compare(password, ADMIN_PASSWORD_HASH!);
    } catch (error) {
        console.error("Password verification failed:", error);
        return false;
    }
}

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
}

// 토큰 블랙리스트 (메모리 기반 - 프로덕션에서는 Redis 등 사용 권장)
const tokenBlacklist = new Set<string>();

export function addTokenToBlacklist(token: string): void {
    tokenBlacklist.add(token);

    // 만료된 토큰들을 정기적으로 정리 (24시간 후)
    setTimeout(() => {
        tokenBlacklist.delete(token);
    }, 24 * 60 * 60 * 1000);
}

export function isTokenBlacklisted(token: string): boolean {
    return tokenBlacklist.has(token);
}

// IP 기반 브루트포스 방지
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15분

export function checkBruteForce(ip: string): boolean {
    const now = Date.now();
    const attempts = loginAttempts.get(ip);

    if (!attempts) {
        return true; // 첫 시도
    }

    // 락아웃 시간이 지났으면 초기화
    if (now - attempts.lastAttempt > LOCKOUT_TIME) {
        loginAttempts.delete(ip);
        return true;
    }

    // 최대 시도 횟수 초과
    if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
        return false;
    }

    return true;
}

export function recordLoginAttempt(ip: string, success: boolean): void {
    const now = Date.now();

    if (success) {
        // 성공시 기록 삭제
        loginAttempts.delete(ip);
        return;
    }

    const attempts = loginAttempts.get(ip);
    if (!attempts) {
        loginAttempts.set(ip, { count: 1, lastAttempt: now });
    } else {
        attempts.count += 1;
        attempts.lastAttempt = now;
    }
}
