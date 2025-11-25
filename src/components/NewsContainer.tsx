"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import NewsCard from "./NewsCard";
import {
    NewsResponse,
    NewsSource,
    Language,
} from "@/app/api/generate-news/route";

export default function NewsContainer() {
    const [language, setLanguage] = useState<Language>("ko");
    const [data, setData] = useState<(NewsSource & { date: string })[]>([]);
    const [allDates, setAllDates] = useState<string[]>([]);
    const [displayedDates, setDisplayedDates] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [noMore, setNoMore] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (
                scrollTop + windowHeight >= documentHeight - 200 &&
                !loading &&
                !noMore
            ) {
                loadMoreDates();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [displayedDates, loading, noMore]);

    const fetchData = async (date?: string) => {
        try {
            setLoading(true);

            const response = await fetch(
                date ? `/api/generate-news?date=${date}` : `/api/generate-news`
            );

            if (!response.ok)
                throw new Error("데이터를 불러오는데 실패했습니다");

            const json: NewsResponse = await response.json();

            const sourcesWithDate = json.sources.map((s) => ({
                ...s,
                date: json.date,
            }));

            setData((prev) => [...prev, ...sourcesWithDate]);
            setAllDates(json.allDates);
            setDisplayedDates((prev) =>
                prev.includes(json.date) ? prev : [...prev, json.date]
            );
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "알 수 없는 에러입니다"
            );
        } finally {
            setLoading(false);
        }
    };

    const getPreviousDate = (current: string) => {
        const sorted = [...allDates].sort();
        const index = sorted.indexOf(current);
        return index > 0 ? sorted[index - 1] : null;
    };

    const loadMoreDates = async () => {
        if (!displayedDates.length) return;

        const last = displayedDates[displayedDates.length - 1];
        const previousDate = getPreviousDate(last);

        if (!previousDate) {
            setNoMore(true);
            return;
        }

        fetchData(previousDate);
    };

    const formatDate = (dateString: string) => {
        const year = Number(dateString.slice(0, 4));
        const month = Number(dateString.slice(4, 6)) - 1;
        const day = Number(dateString.slice(6, 8));
        return new Date(year, month, day).toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    const languages = [
        { value: "original", label: "Original" },
        { value: "ko", label: "한국어" },
        { value: "ja", label: "日本語" },
        { value: "en", label: "English" },
    ];

    if (error)
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12">
                {/* 언어 선택 */}
                <div className="text-center mb-4 md:mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200">
                            <Globe className="w-4 h-4 text-gray-600" />
                            <div className="flex gap-1 flex-wrap">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.value}
                                        onClick={() =>
                                            setLanguage(lang.value as Language)
                                        }
                                        className={`px-3 py-1 rounded-full transition-all ${
                                            language === lang.value
                                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                                                : "text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 rounded-full mb-4">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>Today&apos;s IT Tech News</span>
                    </div>
                </div>

                {/* 날짜별 뉴스 섹션 */}
                {displayedDates.map((date, i) => (
                    <div key={date} className="mb-16">
                        {i === 1 && (
                            <div className="mb-12 mt-16 text-center">
                                <h3 className="text-gray-900">지난 뉴스</h3>
                                <div className="h-1 w-20 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full mt-2 mx-auto" />
                            </div>
                        )}

                        <div className="mb-6">
                            <h3 className="text-gray-900">
                                {formatDate(date)}
                            </h3>
                            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {data
                                .filter((src) => src.date === date)
                                .map((news, index) => (
                                    <NewsCard
                                        key={news.id}
                                        news={news}
                                        language={language}
                                        index={index}
                                    />
                                ))}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
                    </div>
                )}

                {noMore && (
                    <div className="text-center py-8 text-gray-600">
                        <p>No more news to load</p>
                    </div>
                )}
            </main>
        </div>
    );
}
