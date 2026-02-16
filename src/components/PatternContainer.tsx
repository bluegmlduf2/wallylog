"use client";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import PatternList from "@/components/PatternList";
import Loading from "@/components/Loading";
import Quiz from "@/components/Quiz";
import { Statistics } from "@/components/Statistics";
import { Calendar, ArrowLeft, BarChart3 } from "lucide-react";
import {
    PatternsResponse,
    PatternItem,
} from "@/app/api/generate-english/route";
import { englishPatternPageSchema } from "@/lib/seo";
import { useTranslations } from "next-intl";

export default function PatternContainer() {
    const locale = useLocale();
    const [data, setData] = useState<PatternsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<
        "patterns" | "quiz" | "statistics"
    >("patterns");
    const [selectedDay, setSelectedDay] = useState<number>(1);
    const [availableDays, setAvailableDays] = useState<number>(1);
    const t = useTranslations();

    // 언어에 따라 패턴 데이터를 변환하는 함수
    const transformPatternsForLocale = (
        patterns: PatternItem[],
    ): PatternItem[] => {
        // 일본어인 경우 의미와 예시 번역을 일본어로 대체
        if (locale === "ja") {
            return patterns.map((pattern) => ({
                ...pattern,
                meaning: pattern.meaning_ja || pattern.meaning,
                examples: pattern.examples.map((example) => ({
                    ...example,
                    translation: example.translation_ja || example.translation,
                })),
            }));
        }
        return patterns;
    };

    // 초기 로드 및 로케일 변경 시 데이터 로드
    useEffect(() => {
        fetchData();
    }, [locale]);

    const fetchData = async (day?: number) => {
        try {
            setLoading(true);

            const response = await fetch(
                day
                    ? `/api/generate-english?day=${day}`
                    : `/api/generate-english`,
            );
            if (!response.ok) {
                throw new Error(t("englishPattern.loadError"));
            }

            const jsonData = (await response.json()) as PatternsResponse & {
                totalCount: number;
            }; // totalCount 임시적으로 추가

            // 언어에 따라 데이터 변환
            const transformedData = {
                ...jsonData,
                patterns: transformPatternsForLocale(jsonData.patterns),
            };

            setData(transformedData); // 전체 데이터 설정
            setSelectedDay(transformedData.day); // 기본 선택 일자 설정
            setAvailableDays(transformedData.totalCount); // 최대 일자 설정
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : t("englishPattern.unknownError"),
            );
        } finally {
            setLoading(false);
        }
    };

    // 다음 퀴즈 문제를 무작위로 불러오기
    const onNextRandomQuiz = () => {
        // selectedDay를 제외한 무작위 일자 선택
        let randomDay;
        do {
            randomDay = Math.floor(Math.random() * availableDays) + 1;
        } while (randomDay === selectedDay);

        fetchData(randomDay);
    };

    const handleStatisticsClick = () => {
        if (activeTab === "statistics") {
            setActiveTab("patterns");
        } else {
            setActiveTab("statistics");
        }
    };

    if (loading)
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loading />
            </div>
        );

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-red-500">
                    {t("englishPattern.errorPrefix")}
                    {error}
                </div>
            </div>
        );
    }

    return (
        <>
            {/* SEO를 위한 영어패턴 페이지의 구조화된 데이터 json ld 추가  */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(englishPatternPageSchema),
                }}
            />
            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                    <div className="max-w-md mx-auto px-6 py-6">
                        <div className="flex items-center justify-between mb-2">
                            <h1 className="text-white text-2xl font-bold">
                                {t("englishPattern.title")}
                            </h1>
                            <div className="relative flex items-center gap-3">
                                <button
                                    onClick={handleStatisticsClick}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all border border-white/30"
                                    title={
                                        activeTab === "statistics"
                                            ? t("englishPattern.backBtn")
                                            : t("englishPattern.statisticsBtn")
                                    }
                                >
                                    {activeTab === "statistics" ? (
                                        <ArrowLeft className="h-5 w-5" />
                                    ) : (
                                        <BarChart3 className="h-5 w-5" />
                                    )}
                                </button>
                                <select
                                    value={selectedDay}
                                    onChange={(e) =>
                                        fetchData(Number(e.target.value))
                                    }
                                    className="appearance-none bg-white/20 !text-white border border-white/30 rounded-lg px-4 py-2 pr-10 cursor-pointer hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    {[...Array(availableDays)].map(
                                        (_, index) => (
                                            <option
                                                key={index + 1}
                                                value={index + 1}
                                                className="text-gray-900"
                                            >
                                                Day {index + 1}
                                            </option>
                                        ),
                                    )}
                                </select>
                                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
                            </div>
                        </div>
                        <p className="text-blue-100">
                            {t("englishPattern.description")}
                        </p>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-md md:max-w-xl mx-auto -mt-4">
                    {/* Tabs */}
                    <div className="px-6 mb-4">
                        <div className="grid grid-cols-2 bg-white shadow-sm rounded-lg p-1">
                            <button
                                onClick={() => setActiveTab("patterns")}
                                className={`py-2.5 rounded-md transition-all ${
                                    activeTab === "patterns"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                {t("englishPattern.patternList")}
                            </button>
                            <button
                                onClick={() => setActiveTab("quiz")}
                                className={`py-2.5 rounded-md transition-all ${
                                    activeTab === "quiz"
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-gray-600 hover:text-gray-900"
                                }`}
                            >
                                {t("englishPattern.quiz")}
                            </button>
                        </div>
                    </div>

                    <div className="px-6 pb-6">
                        {activeTab === "patterns" && data && (
                            <PatternList patterns={data.patterns} />
                        )}
                        {activeTab === "quiz" && data && (
                            <Quiz
                                patterns={data.patterns ?? []}
                                selectedDay={selectedDay}
                                onNextRandomQuiz={onNextRandomQuiz}
                            />
                        )}
                        {activeTab === "statistics" && (
                            <Statistics
                                fetchData={fetchData}
                                setActiveTab={setActiveTab}
                                availableDays={availableDays}
                            />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
