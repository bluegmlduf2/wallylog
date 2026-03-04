"use client"; // 해당 페이지는 서버사이드 렌더링하지 않을 생각이다. 그렇기 때문에 바로 클라이언트 렌더링용 use client 선언

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Locale, FlagsValue } from "@/lib/locale";

type Difficulty = "easy" | "medium" | "hard";
type Language = "javascript" | "python" | "java" | "cpp";

interface QuizOption {
    id: number;
    text: string;
    isCorrect: boolean;
}

interface Quiz {
    id: number;
    code: string;
    question: string;
    options: QuizOption[];
    explanation: string;
}

export default function CodingTestPage() {
    const t = useTranslations("codingTest");

    const [difficulty, setDifficulty] = useState<Difficulty>("easy");
    const [language, setLanguage] = useState<Language>("javascript");
    const [userLanguage, setUserLanguage] = useState<Locale>("ko");
    const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateQuiz = async () => {
        setLoading(true);
        setShowResult(false);
        setSelectedOption(null);
        setError(null);

        try {
            const response = await fetch("/api/generate-quiz", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    difficulty,
                    language,
                    userLanguage,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || t("errors.generationFailed"),
                );
            }
            const quiz = await response.json();
            setCurrentQuiz(quiz);
        } catch (error) {
            console.error("퀴즈 생성 오류:", error);
            setError(
                error instanceof Error ? error.message : t("errors.unknown"),
            );
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (optionId: number) => {
        if (showResult) return;
        setSelectedOption(optionId);
    };

    const submitAnswer = () => {
        if (selectedOption === null) return;

        setShowResult(true);
    };

    return (
        <main className="max-w-4xl mx-auto md:px-4 md:py-8">
            <div className="bg-white md:rounded-lg shadow-md p-6 md:mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
                    {t("title")}
                </h1>

                {!currentQuiz && (
                    <div className="space-y-6">
                        {/* 에러 표시 */}
                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-xl mr-2">⚠️</span>
                                    <div>
                                        <p className="font-medium">
                                            {t("errors.title")}
                                        </p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 난이도 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t("select.difficulty")}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(
                                    ["easy", "medium", "hard"] as Difficulty[]
                                ).map((level) => (
                                    <button
                                        key={level}
                                        onClick={() => setDifficulty(level)}
                                        className={`p-3 rounded-lg border-2 transition-colors ${
                                            difficulty === level
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-gray-300 hover:border-gray-400 text-gray-700"
                                        }`}
                                    >
                                        {t(`difficulty.${level}`)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 코딩 언어 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t("select.language")}
                            </label>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {(
                                    [
                                        {
                                            value: "javascript",
                                            label: t("languages.javascript"),
                                        },
                                        {
                                            value: "python",
                                            label: t("languages.python"),
                                        },
                                        {
                                            value: "java",
                                            label: t("languages.java"),
                                        },
                                        {
                                            value: "cpp",
                                            label: t("languages.cpp"),
                                        },
                                    ] as {
                                        value: Language;
                                        label: string;
                                    }[]
                                ).map((lang) => (
                                    <button
                                        key={lang.value}
                                        onClick={() => setLanguage(lang.value)}
                                        className={`p-3 rounded-lg border-2 transition-colors ${
                                            language === lang.value
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-gray-300 hover:border-gray-400 text-gray-700"
                                        }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 사용자 언어 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                {t("select.userLanguage")}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(
                                    [
                                        {
                                            value: "ko",
                                            label: t("userLanguages.ko"),
                                        },
                                        {
                                            value: "en",
                                            label: t("userLanguages.en"),
                                        },
                                        {
                                            value: "ja",
                                            label: t("userLanguages.ja"),
                                        },
                                    ] as FlagsValue[]
                                ).map((lang) => (
                                    <button
                                        key={lang.value}
                                        onClick={() =>
                                            setUserLanguage(lang.value)
                                        }
                                        className={`p-3 rounded-lg border-2 transition-colors ${
                                            userLanguage === lang.value
                                                ? "border-purple-500 bg-purple-50 text-purple-700"
                                                : "border-gray-300 hover:border-gray-400 text-gray-700"
                                        }`}
                                    >
                                        {lang.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={generateQuiz}
                            disabled={loading}
                            className="w-full py-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium text-lg"
                        >
                            {loading
                                ? t("generate.loading")
                                : t("generate.startButton")}
                        </button>
                    </div>
                )}

                {currentQuiz && (
                    <div className="space-y-6">
                        {/* 코드 블록 */}
                        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                            <pre className="text-green-400 text-sm">
                                <code>{currentQuiz.code}</code>
                            </pre>
                        </div>

                        {/* 문제 */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h3 className="text-lg font-medium text-blue-800 mb-2">
                                {currentQuiz.question}
                            </h3>
                        </div>

                        {/* 선택지 */}
                        <div className="space-y-3">
                            {currentQuiz.options.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() =>
                                        handleOptionSelect(option.id)
                                    }
                                    disabled={showResult}
                                    className={`w-full p-4 text-left rounded-lg border-2 transition-colors ${
                                        selectedOption === option.id
                                            ? showResult
                                                ? option.isCorrect
                                                    ? "border-green-500 bg-green-50 text-green-800"
                                                    : "border-red-500 bg-red-50 text-red-800"
                                                : "border-blue-500 bg-blue-50"
                                            : showResult && option.isCorrect
                                              ? "border-green-500 bg-green-50 text-green-800"
                                              : "border-gray-300 hover:border-gray-400"
                                    } ${
                                        showResult
                                            ? "cursor-default"
                                            : "cursor-pointer"
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mr-3">
                                            {option.id}
                                        </span>
                                        <span>{option.text}</span>
                                        {showResult &&
                                            selectedOption === option.id && (
                                                <span className="ml-auto">
                                                    {option.isCorrect
                                                        ? "✅"
                                                        : "❌"}
                                                </span>
                                            )}
                                        {showResult &&
                                            option.isCorrect &&
                                            selectedOption !== option.id && (
                                                <span className="ml-auto">
                                                    ✅
                                                </span>
                                            )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* 결과 및 설명 */}
                        {showResult && (
                            <div className="bg-yellow-50 rounded-lg p-4">
                                <h4 className="text-lg font-medium text-yellow-800 mb-2">
                                    {t("quiz.explanationTitle")}
                                </h4>
                                <p className="text-yellow-700">
                                    {currentQuiz.explanation}
                                </p>
                            </div>
                        )}

                        {/* 버튼들 */}
                        <div className="flex gap-4">
                            {!showResult ? (
                                <button
                                    onClick={submitAnswer}
                                    disabled={selectedOption === null}
                                    className="flex-1 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
                                >
                                    {t("buttons.checkAnswer")}
                                </button>
                            ) : (
                                <>
                                    <button
                                        onClick={() => {
                                            setCurrentQuiz(null);
                                            setError(null);
                                        }}
                                        className="flex-1 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium"
                                    >
                                        {t("buttons.startOver")}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* 도움말 */}
            <div className="bg-white md:rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {t("help.heading")}
                </h3>
                <div className="space-y-2 text-gray-700 whitespace-pre-line">
                    {/* help.items is a newline-separated string */}
                    {t("help.items")}
                </div>
            </div>
        </main>
    );
}
