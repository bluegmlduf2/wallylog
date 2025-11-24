"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Grecaptcha = {
    ready: (cb: () => void) => void;
    execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare const grecaptcha: Grecaptcha;

export default function LoginForm() {
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!password.trim()) {
            setError("비밀번호를 입력하세요.");
            return;
        }

        grecaptcha.ready(function () {
            grecaptcha
                .execute(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "", {
                    action: "submit",
                })
                .then(async function (token) {
                    try {
                        setIsLoading(true);
                        setError("");
                        const response = await fetch("/api/auth/login", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ password, token }),
                        });

                        if (response.ok) {
                            // 로그인 성공시 글쓰기 페이지로 리다이렉트
                            router.push("/");
                        } else {
                            const result = await response.json();
                            setError(result.error || "로그인에 실패했습니다.");
                        }
                    } catch (error) {
                        console.error("Login error:", error);
                        setError("로그인 중 오류가 발생했습니다.");
                    } finally {
                        setIsLoading(false);
                    }
                });
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-md text-sm">
                    {error}
                </div>
            )}

            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    관리자 비밀번호
                </label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="비밀번호를 입력하세요"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2 px-4 rounded-md font-medium ${
                    isLoading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700"
                } text-white transition-colors`}
            >
                {isLoading ? "로그인 중..." : "로그인"}
            </button>
        </form>
    );
}
