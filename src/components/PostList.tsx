"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useInView } from "react-intersection-observer";
import { formatKoreanDate } from "@/lib/date";
import type { Post } from "@/lib/posts";
import Loading from "@/components/Loading";
import { useTranslations } from "next-intl";

interface PostListProps {
    initialPosts: Post[];
    initialHasMore: boolean;
    selectedCategory: string;
}

export default function PostList({
    initialPosts,
    initialHasMore,
    selectedCategory,
}: PostListProps) {
    const [posts, setPosts] = useState<Post[]>(initialPosts);
    const [page, setPage] = useState(2); // 첫 페이지는 이미 로드됨
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [loading, setLoading] = useState(false);
    const t = useTranslations();

    const { ref, inView } = useInView({
        threshold: 0,
        rootMargin: "50px", // 50px 전에 미리 로드
    });

    // useEffect 의존성에 함수가 있으면 매번 새로 생성되어 무한 렌더링 발생 가능
    // useCallback으로 함수를 기억시켜서 무한 렌더링 방지
    // page, loading, hasMore가 바뀔 때만 함수도 바뀜
    const loadMorePosts = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const categoryParam =
                selectedCategory === "all"
                    ? ""
                    : `&category=${selectedCategory}`;
            const response = await fetch(
                `/api/posts?page=${page}&limit=10${categoryParam}`
            );
            const data = await response.json();

            if (data.posts) {
                setPosts((prev) => [...prev, ...data.posts]);
                setHasMore(data.hasMore);
                setPage((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Failed to load more posts:", error);
        } finally {
            setLoading(false);
        }
    }, [page, loading, hasMore, selectedCategory]);

    // 카테고리가 변경되면 포스트 목록을 다시 로드
    useEffect(() => {
        const loadPostsForCategory = async () => {
            setLoading(true);
            setPage(2); // 페이지 리셋

            try {
                const categoryParam =
                    selectedCategory === "all"
                        ? ""
                        : `&category=${selectedCategory}`;
                const response = await fetch(
                    `/api/posts?page=1&limit=10${categoryParam}`
                );
                const data = await response.json();

                if (data.posts) {
                    setPosts(data.posts);
                    setHasMore(data.hasMore);
                }
            } catch (error) {
                console.error("Failed to filter posts:", error);
            } finally {
                setLoading(false);
            }
        };

        // 초기 로드가 아닌 카테고리 변경 시에만 실행
        if (selectedCategory !== "all" || posts !== initialPosts) {
            loadPostsForCategory();
        }
    }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

    // 외부에 있는 함수 loadMorePosts가 변경될 수 있어 최신 함수 사용 위해 의존성에 포함 (무한 루프를 막기 위해 useCallback사용)
    useEffect(() => {
        if (inView && hasMore && !loading) {
            loadMorePosts();
        }
    }, [inView, hasMore, loading, loadMorePosts]);

    return (
        <div className="space-y-8">
            {posts.map((post) => (
                <article
                    key={post.slug}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                    <div className="p-6">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                            <time dateTime={post.date}>
                                {formatKoreanDate(post.date)}
                            </time>
                            {post.category && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 ml-2 rounded-full">
                                        {post.category}
                                    </span>
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                            <Link
                                href={`/posts/${post.slug}`}
                                className="hover:text-blue-600 transition-colors"
                            >
                                {post.title}
                            </Link>
                        </h2>
                        <Link
                            href={`/posts/${post.slug}`}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                            {t("post.readMore")}
                        </Link>
                    </div>
                </article>
            ))}

            {/* 로딩 인디케이터와 스크롤 트리거 */}
            <div ref={ref} className="flex justify-center py-8">
                {loading && (
                    <div className="flex items-center space-x-2">
                        <Loading size="small" />
                        <span className="pl-2 text-gray-600">
                            {t("post.loading")}
                        </span>
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <div className="text-gray-500 text-center">
                        <p>{t("post.complete")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
