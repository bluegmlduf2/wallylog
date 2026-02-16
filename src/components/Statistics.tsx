"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, Trophy, TrendingUp, ChevronRight } from "lucide-react";
import { Score } from "@/app/api/generate-english/route";
import { EmptyStatisticsView } from "@/components/EmptyStatisticsView";

interface StatisticsProps {
    fetchData: (day: number) => void;
    setActiveTab: React.Dispatch<
        React.SetStateAction<"patterns" | "quiz" | "statistics">
    >;
    availableDays: number;
}

interface ScoreRecord {
    [key: string]: Score;
}

export function Statistics({
    fetchData,
    setActiveTab,
    availableDays,
}: StatisticsProps) {
    const t = useTranslations();
    const [statistics, setStatistics] = useState<ScoreRecord>();

    // 로컬 스토리지에서 점수 불러오기
    const loadAllScoreFromStorage = () => {
        const rawScoresJson = localStorage.getItem("quizScore");

        if (!rawScoresJson) {
            return;
        }

        const storedScores: ScoreRecord = JSON.parse(rawScoresJson);
        const statisticsData: ScoreRecord = {};

        for (let i = 1; i < availableDays + 1; i++) {
            statisticsData[i] = storedScores[i] || { correct: 0 };
        }

        setStatistics(statisticsData);
    };

    useEffect(() => {
        loadAllScoreFromStorage();
    }, []);

    // 학습 기록이 없을 때 빈 화면 표시
    if (!statistics) {
        return <EmptyStatisticsView setActiveTab={setActiveTab} />;
    }

    const days = Object.keys(statistics).sort((a, b) => Number(a) - Number(b));
    const totalCorrect = days.reduce(
        (sum, day) => sum + statistics[day].correct,
        0,
    );
    const maxCorrect = Math.max(...days.map((day) => statistics[day].correct));

    const onDayClick = (day: number) => {
        fetchData(day);
        setActiveTab("quiz");
    };

    return (
        <div className="space-y-4">
            {/* Summary Card */}
            <div className="rounded-2xl shadow-lg overflow-hidden">
                <div className="p-5 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            <span className="text-blue-100">
                                {t("englishPattern.statistics.totalCorrect")}
                            </span>
                        </div>
                        <div className="text-3xl">{totalCorrect}</div>
                    </div>
                </div>
            </div>

            {/* Daily Statistics */}
            <div className="rounded-2xl shadow-lg bg-white p-6">
                <div className="flex items-center gap-2 mb-5">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-gray-900">
                        {t("englishPattern.statistics.dailyStatistics")}
                    </h3>
                </div>

                <div className="space-y-4">
                    {days.map((day) => {
                        const correct = statistics[day].correct;
                        const percentage =
                            maxCorrect > 0 ? (correct / 10) * 100 : 0;

                        return (
                            <button
                                key={day}
                                onClick={() => onDayClick(Number(day))}
                                className="w-full space-y-1.5 text-left hover:bg-blue-50 p-3 -m-0.5 rounded-xl transition-all group cursor-pointer border-2 border-transparent hover:border-blue-200"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-700 group-hover:text-blue-700 transition-colors">
                                            Day {day}
                                        </span>
                                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                    <span className="text-blue-600">
                                        {correct}
                                        {t("englishPattern.statistics.correct")}
                                    </span>
                                </div>
                                <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Motivation Card */}
            {totalCorrect > 0 && (
                <div className="rounded-2xl shadow-md bg-gradient-to-br from-cyan-50 to-blue-50 p-5 border-2 border-cyan-100">
                    <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-cyan-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-gray-900 mb-1">
                                {totalCorrect >= 30
                                    ? t("englishPattern.statistics.amazing")
                                    : totalCorrect >= 15
                                      ? t("englishPattern.statistics.excellent")
                                      : t("englishPattern.statistics.good")}
                            </p>
                            <p className="text-gray-600 text-sm">
                                {totalCorrect >= 30
                                    ? t(
                                          "englishPattern.statistics.amazingMessage",
                                      )
                                    : totalCorrect >= 15
                                      ? t(
                                            "englishPattern.statistics.excellentMessage",
                                        )
                                      : t(
                                            "englishPattern.statistics.goodMessage",
                                        )}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
