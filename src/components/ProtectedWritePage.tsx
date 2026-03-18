"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WriteForm from "./WriteForm";
import Loading from "@/components/Loading";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedWritePage() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [categories, setCategories] = useState<string[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthLoading && isAuthenticated) {
            const fetchCategories = async () => {
                setIsCategoriesLoading(true);
                try {
                    const categoriesResponse = await fetch("/api/categories");
                    if (categoriesResponse.ok) {
                        const data = await categoriesResponse.json();
                        setCategories(data.categories);
                    }
                } catch (error) {
                    console.error("Categories fetch error:", error);
                } finally {
                    setIsCategoriesLoading(false);
                }
            };

            fetchCategories();
        }
    }, [isAuthLoading, isAuthenticated]);

    // 로딩 중 (인증 또는 카테고리 조회)
    if (isAuthLoading || isCategoriesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4">
                        <Loading size="big" />
                    </div>
                    <p className="text-gray-600">인증 확인 중...</p>
                </div>
            </div>
        );
    }

    // 인증되지 않은 경우
    if (!isAuthenticated) {
        return (
            <div className="max-w-md mx-auto px-4 py-16">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        접근 권한이 없습니다
                    </h1>
                    <p className="text-gray-600 mb-6">
                        이 페이지에 접근하려면 로그인이 필요합니다.
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        );
    }

    // 인증된 경우
    return (
        <div className="max-w-4xl mx-auto lg:px-4 lg:py-8">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        새 포스트 작성
                    </h1>
                </div>
                <WriteForm categories={categories} />
            </div>
        </div>
    );
}
