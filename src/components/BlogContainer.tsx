"use client";

import { useState } from "react";
import PostList from "./PostList";
import CategoryFilter from "./CategoryFilter";
import { formatKoreanDate } from "@/lib/date";
import type { Post } from "@/lib/posts";
import { useTranslations } from "next-intl";

interface BlogContainerProps {
    initialPosts: Post[];
    initialHasMore: boolean;
    categories: string[];
    postCounts: Record<string, number>;
}

export default function BlogContainer({
    initialPosts,
    initialHasMore,
    categories,
    postCounts,
}: BlogContainerProps) {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const t = useTranslations();

    return (
        <>
            {/* 모바일용 카테고리 필터 */}
            <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                postCounts={postCounts}
                isMobile={true}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Posts */}
                <div className="lg:col-span-2">
                    <PostList
                        initialPosts={initialPosts}
                        initialHasMore={initialHasMore}
                        selectedCategory={selectedCategory}
                    />
                </div>

                {/* Sidebar */}
                <div className="space-y-8 hidden lg:block">
                    {/* 카테고리 필터 (PC용) */}
                    <CategoryFilter
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onCategoryChange={setSelectedCategory}
                        postCounts={postCounts}
                        isMobile={false}
                    />

                    {/* About */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            About
                        </h3>
                        <div className="text-gray-600 text-sm leading-relaxed">
                            <div
                                dangerouslySetInnerHTML={{
                                    __html: t("site.description"),
                                }}
                            />
                            <br />
                            - JAVASCRIPT
                            <br />
                            - VUEJS <br />
                            - PHP <br />
                            - LARAVEL <br />
                            <br />
                        </div>
                    </div>

                    {/* Recent Posts */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Recent Posts
                        </h3>
                        <div className="space-y-3">
                            {initialPosts.slice(0, 5).map((post) => (
                                <div key={post.slug}>
                                    <a
                                        href={`/posts/${post.slug}`}
                                        className="text-sm text-gray-700 hover:text-blue-600 transition-colors line-clamp-2"
                                    >
                                        {post.title}
                                    </a>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatKoreanDate(post.date)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
