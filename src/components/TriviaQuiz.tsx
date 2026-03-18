import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Trophy, Shuffle } from "lucide-react";

interface TriviaAnswer {
    ko: string;
    en: string;
    ja: string;
    isCorrect: boolean;
}

interface TriviaQuestion {
    category: {
        ko: string;
        en: string;
        ja: string;
    };
    question: {
        ko: string;
        en: string;
        ja: string;
    };
    options: TriviaAnswer[];
}

interface TriviaQuizProps {
    questions: TriviaQuestion[];
}

export function TriviaQuiz({ questions }: TriviaQuizProps) {
    const locale = useLocale() as "ko" | "en" | "ja";
    const t = useTranslations("trivia");
    const [shuffledQuestions, setShuffledQuestions] = useState<
        TriviaQuestion[]
    >(() => [...questions]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<TriviaAnswer | null>(
        null,
    );
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState<number>(0);

    const shuffleArray = <T,>(arr: T[]) => {
        const copy = [...arr];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    };

    const randomizeQuiz = () => {
        setShuffledQuestions(shuffleArray(questions));
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
    };

    const startNext = () => {
        setSelectedAnswer(null);
        setIsAnswered(false);
        setCurrentIndex((i) => i + 1);
    };

    useEffect(() => {
        setShuffledQuestions(shuffleArray(questions));
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
    }, [questions]);

    const currentQuestion = shuffledQuestions[currentIndex];

    const restartQuiz = () => {
        setCurrentIndex(0);
        setScore(0);
        setSelectedAnswer(null);
        setIsAnswered(false);
    };

    const handleAnswerSelect = (answer: TriviaAnswer) => {
        if (isAnswered) return;
        setSelectedAnswer(answer);
        setIsAnswered(true);
        const isCorrect = answer.isCorrect;
        setScore((prev) => prev + (isCorrect ? 1 : 0));
    };

    if (!currentQuestion) return null;

    const display = (
        obj: Record<string, string | boolean> | TriviaAnswer | undefined,
    ): string => {
        if (!obj) return "";
        return String(obj[locale] || obj.en || obj.ko || "");
    };

    const isQuizComplete =
        currentIndex >= shuffledQuestions.length - 1 && isAnswered;

    return (
        <div className="space-y-4">
            {/* Score Card */}
            <div className="rounded-2xl shadow-md overflow-hidden">
                <div className="p-5 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5" />
                            <span className="text-cyan-100">{t("score")}</span>
                        </div>
                        <span className="text-3xl">
                            {score} / {shuffledQuestions.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="rounded-2xl shadow-lg bg-white">
                <div className="p-6">
                    <div className="mb-4">
                        <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mb-4">
                            [{display(currentQuestion.category)}]
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border-2 border-blue-100">
                            <p className="text-gray-900 text-lg">
                                {display(currentQuestion.question)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {currentQuestion.options.map((opt, idx) => {
                            const text = display(opt);
                            const isSelected = selectedAnswer === opt;
                            const isOptionCorrect = opt.isCorrect;

                            let buttonClass =
                                "w-full text-left py-4 px-5 rounded-xl transition-all ";

                            if (isAnswered) {
                                if (isOptionCorrect) {
                                    buttonClass +=
                                        "bg-green-50 border-2 border-green-400 text-green-900 cursor-default";
                                } else if (isSelected && !isOptionCorrect) {
                                    buttonClass +=
                                        "bg-red-50 border-2 border-red-400 text-red-900 cursor-default";
                                } else {
                                    buttonClass +=
                                        "bg-gray-50 border border-gray-200 text-gray-500 cursor-default";
                                }
                            } else {
                                buttonClass += isSelected
                                    ? "bg-blue-50 border-2 border-blue-400 text-blue-900 cursor-pointer"
                                    : "bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
                            }

                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswerSelect(opt)}
                                    className={buttonClass}
                                    disabled={isAnswered}
                                >
                                    <div className="flex items-center justify-between w-full gap-3">
                                        <span className="flex-1 text-left">
                                            {text}
                                        </span>
                                        {isAnswered && isOptionCorrect && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        )}
                                        {isAnswered &&
                                            isSelected &&
                                            !isOptionCorrect && (
                                                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                            )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-3 mt-6">
                        {isAnswered && !isQuizComplete && (
                            <button
                                onClick={startNext}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 text-base rounded-xl transition-all"
                            >
                                {t("nextQuestion")}
                            </button>
                        )}
                        {isAnswered && isQuizComplete && (
                            <div className="w-full p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border-2 border-cyan-200 text-center">
                                <p className="text-lg text-gray-900 mb-2">
                                    {t("complete")}
                                </p>
                                <p className="text-gray-700">
                                    {t("totalScore")}:{" "}
                                    <span className="text-cyan-600 font-bold">
                                        {score}
                                    </span>{" "}
                                    / {shuffledQuestions.length}
                                </p>
                                <div className="flex items-center justify-center gap-4 mt-4">
                                    <button
                                        onClick={restartQuiz}
                                        className="inline-flex items-center justify-center w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 text-base rounded-xl transition-all"
                                    >
                                        {t("retry")}
                                    </button>
                                    <button
                                        onClick={randomizeQuiz}
                                        className="h-12 px-6 border-2 border-blue-200 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all"
                                        title={t("randomQuestion")}
                                    >
                                        <Shuffle className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
