"use client"; // 해당 페이지는 서버사이드 렌더링하지 않을 생각이다. 그렇기 때문에 바로 클라이언트 렌더링용 use client 선언

import { useState } from "react";
import { Locale,FlagsValue } from "@/lib/locale";

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
                throw new Error(errorData.error || "퀴즈 생성에 실패했습니다.");
            }

            const quiz = await response.json();
            setCurrentQuiz(quiz);
        } catch (error) {
            console.error("퀴즈 생성 오류:", error);
            setError(
                error instanceof Error
                    ? error.message
                    : "알 수 없는 오류가 발생했습니다."
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
                    🎯 바이브 코딩 테스트
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
                                            퀴즈 생성 실패
                                        </p>
                                        <p className="text-sm">{error}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 난이도 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                난이도 선택
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
                                        {level === "easy"
                                            ? "🟢 초급"
                                            : level === "medium"
                                            ? "🟡 중급"
                                            : "🔴 고급"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 코딩 언어 선택 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                코딩 언어 선택
                            </label>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                {(
                                    [
                                        {
                                            value: "javascript",
                                            label: "JavaScript",
                                        },
                                        {
                                            value: "python",
                                            label: "Python",
                                        },
                                        { value: "java", label: "Java" },
                                        { value: "cpp", label: "C++" },
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
                                사용자 언어 선택
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(
                                    [
                                        { value: "ko", label: "🇰🇷 한국어" },
                                        {
                                            value: "en",
                                            label: "🇺🇸 English",
                                        },
                                        { value: "ja", label: "🇯🇵 日本語" },
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
                            {loading ? "문제 생성 중..." : "🚀 문제 시작하기"}
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
                                    💡 해설
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
                                    정답 확인
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
                                        처음으로
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
                    🎯 바이브 코딩 테스트란?
                </h3>
                <div className="space-y-2 text-gray-700">
                    <p>
                        • AI가 생성한 코드와 4개의 설명 중 틀린 설명을 찾는
                        게임입니다
                    </p>
                    <p>• 난이도와 프로그래밍 언어를 선택할 수 있습니다</p>
                    <p>• 한국어, 영어, 일본어로 문제를 풀 수 있습니다</p>
                    <p>• 코드 리딩 능력과 프로그래밍 지식을 테스트해보세요!</p>
                </div>
            </div>
        </main>
    );
}
