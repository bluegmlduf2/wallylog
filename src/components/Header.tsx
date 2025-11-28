"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.reload();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const handleLogin = () => {
        router.push("/login");
    };

    const isHomePage = pathname === "/";

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    {isHomePage ? (
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                WallyLog
                            </h1>
                            <p className="text-gray-600 mt-1 text-sm lg:text-base">
                                개발 블로그 및 일상생활 기록을 위한 공간
                            </p>
                        </div>
                    ) : (
                        <Link
                            href="/"
                            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                            WallyLog
                        </Link>
                    )}

                    <div className="flex items-center space-x-2 md:space-x-4">
                        {/* 로그인/로그아웃 아이콘 */}
                        {!isLoading && (
                            <>
                                {isAuthenticated ? (
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors group"
                                        aria-label="로그아웃"
                                        title="로그아웃"
                                    >
                                        <svg
                                            className="w-6 h-6 text-gray-600 group-hover:text-red-600 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                            />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleLogin}
                                        className="p-2 hover:bg-gray-100 rounded-md transition-colors group"
                                        aria-label="로그인"
                                        title="로그인"
                                    >
                                        <svg
                                            className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </>
                        )}

                        {/* 햄버거 버튼 */}
                        <button
                            onClick={toggleMenu}
                            className="flex flex-col justify-center items-center w-8 h-8 space-y-1 hover:bg-gray-100 rounded-md transition-colors p-1"
                            aria-label="메뉴 열기"
                        >
                            <div
                                className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                                    isMenuOpen
                                        ? "rotate-45 translate-y-1.5"
                                        : ""
                                }`}
                            ></div>
                            <div
                                className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                                    isMenuOpen ? "opacity-0" : ""
                                }`}
                            ></div>
                            <div
                                className={`w-6 h-0.5 bg-gray-600 transition-all duration-300 ${
                                    isMenuOpen
                                        ? "-rotate-45 -translate-y-1.5"
                                        : ""
                                }`}
                            ></div>
                        </button>
                    </div>
                </div>
            </div>

            {/* 드롭다운 메뉴 */}
            {isMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <nav className="flex flex-col space-y-3">
                            <Link
                                href="/"
                                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-md hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                홈
                            </Link>
                            <Link
                                href="/write"
                                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-md hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                글쓰기
                            </Link>
                            <Link
                                href="/search"
                                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-md hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                01. AI 게시글 검색
                            </Link>
                            <Link
                                href="/coding-test"
                                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-md hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                02. 바이브 코딩 테스트
                            </Link>
                            <Link
                                href="/pattern"
                                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-md hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                03. 영어 패턴 학습
                            </Link>
                            <Link
                                href="/news"
                                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-md hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                04. 오늘의 IT 뉴스
                            </Link>
                            <Link
                                href="/subscribe"
                                className="text-gray-700 hover:text-blue-600 transition-colors py-2 px-4 rounded-md hover:bg-gray-50"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                05. 영어패턴 & IT뉴스 구독
                            </Link>
                        </nav>
                    </div>
                </div>
            )}

            {/* 메뉴가 열렸을 때 배경 클릭으로 닫기 */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMenuOpen(false)}
                ></div>
            )}
        </header>
    );
}
