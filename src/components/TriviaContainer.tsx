"use client";
import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Calendar } from "lucide-react";
import Loading from "@/components/Loading";
import { TriviaQuiz } from "@/components/TriviaQuiz";
import { TriviaResponse } from "@/app/api/generate-trivia/route";

export default function TriviaContainer() {
    const locale = useLocale();
    const t = useTranslations("trivia");
    const [data, setData] = useState<TriviaResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [availableDates, setAvailableDates] = useState<string[]>([]);

    const fetchData = async (date?: string) => {
        try {
            setLoading(true);
            const url = date
                ? `/api/generate-trivia?date=${date}`
                : `/api/generate-trivia`;
            const res = await fetch(url);
            if (!res.ok) {
                throw new Error(t("loadError"));
            }
            const jsonData = (await res.json()) as TriviaResponse;
            setData(jsonData);
            setSelectedDate(jsonData.date);
            if (jsonData.allDates) {
                setAvailableDates(jsonData.allDates);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : t("unknownError"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [locale]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md mx-auto px-6">
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                <div className="max-w-md mx-auto px-6 py-8">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-white text-2xl font-bold">
                            {t("title")}
                        </h1>
                        <div className="relative">
                            <select
                                value={selectedDate}
                                onChange={(e) => fetchData(e.target.value)}
                                className="appearance-none bg-white/20 !text-white border border-white/30 rounded-lg px-4 py-2 pr-10 cursor-pointer hover:bg-white/30 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                {availableDates.map((d, index) => (
                                    <option
                                        key={d}
                                        value={d}
                                        className="text-gray-900"
                                    >
                                        Day {index + 1}
                                    </option>
                                ))}
                            </select>
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
                        </div>
                    </div>
                    <p className="text-blue-100">{t("description")}</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto -mt-4">
                <div className="px-6 pb-6">
                    <TriviaQuiz questions={data.questions} />
                </div>
            </div>
        </div>
    );
}
