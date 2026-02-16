import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle, Shuffle, Trophy, Info } from "lucide-react";
import { PatternItem } from "@/app/api/generate-english/route";
import { Volume2 } from "lucide-react";
import { textToSpeech } from "@/lib/textToSpeech";
import { Score } from "@/app/api/generate-english/route";

interface QuizQuestion {
    type: "sentence" | "meaning";
    question: string;
    correctAnswer: string;
    options: string[];
    pattern: string;
}

interface QuizPageProps {
    patterns: PatternItem[];
    selectedDay: number;
    onNextRandomQuiz: () => void;
}

export default function QuizPage({
    patterns,
    selectedDay,
    onNextRandomQuiz,
}: QuizPageProps) {
    const t = useTranslations();
    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
        null,
    );
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [score, setScore] = useState<Score>({ correct: 0 });
    const [isOpenTooltip, setIsOpenTooltip] = useState(false);

    const generateQuestion = (): QuizQuestion => {
        const randomPattern =
            patterns[Math.floor(Math.random() * patterns.length)];
        const questionType = Math.random() > 0.5 ? "sentence" : "meaning";

        if (questionType === "sentence") {
            const randomExample =
                randomPattern.examples[
                    Math.floor(Math.random() * randomPattern.examples.length)
                ];

            const allTranslations = patterns.flatMap((p) =>
                p.examples.map((e) => e.translation),
            );

            const wrongAnswers = allTranslations
                .filter((t) => t !== randomExample.translation)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            const options = [randomExample.translation, ...wrongAnswers].sort(
                () => Math.random() - 0.5,
            );

            return {
                type: "sentence",
                question: randomExample.sentence,
                correctAnswer: randomExample.translation,
                options,
                pattern: randomPattern.pattern,
            };
        } else {
            const allMeanings = patterns.map((p) => p.meaning);
            const wrongAnswers = allMeanings
                .filter((m) => m !== randomPattern.meaning)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);

            const options = [randomPattern.meaning, ...wrongAnswers].sort(
                () => Math.random() - 0.5,
            );

            return {
                type: "meaning",
                question: randomPattern.pattern,
                correctAnswer: randomPattern.meaning,
                options,
                pattern: randomPattern.pattern,
            };
        }
    };

    const startNewQuestion = () => {
        setCurrentQuestion(generateQuestion());
        setSelectedAnswer(null);
        setIsAnswered(false);
    };

    const handleAnswerSelect = (answer: string) => {
        if (isAnswered) return;

        setSelectedAnswer(answer);
        setIsAnswered(true);

        const isCorrect = answer === currentQuestion?.correctAnswer;
        // 현재 화면에서 점수 업데이트
        setScore((prev) => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
        }));
        // 로컬 스토리지에 점수 저장
        const newScore = {
            correct: score.correct + (isCorrect ? 1 : 0),
        };
        saveScoreToStorage(selectedDay.toString(), newScore);
    };

    // 로컬 스토리지에서 점수 불러오기
    const loadScoreFromStorage = () => {
        const storedScore = localStorage.getItem("quizScore");

        if (!storedScore) {
            setScore({ correct: 0 });
            return;
        }

        const parsedScore = JSON.parse(storedScore) as Record<string, Score>;

        setScore(parsedScore[selectedDay] || { correct: 0 });
    };

    // 로컬 스토리지에 점수 저장하기
    const saveScoreToStorage = (day: string, score: Score) => {
        // 기존 저장된 점수 가져오기
        const storedScore = localStorage.getItem("quizScore");
        const parsedScore: Record<string, Score> = storedScore
            ? JSON.parse(storedScore)
            : {};

        // 특정 날짜 점수 업데이트
        parsedScore[day] = score;

        // 다시 로컬스토리지에 저장
        localStorage.setItem("quizScore", JSON.stringify(parsedScore));
    };

    useEffect(() => {
        loadScoreFromStorage();
        startNewQuestion();
    }, []);

    // 현재 질문이 없으면 빈 화면 표시
    if (!currentQuestion) {
        return null;
    }

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const correctCount = score.correct;

    // 정답수에 따른 메시지
    const getCorrectMessage = () => {
        if (score.correct === 10)
            return t("englishPattern.quizSection.perfectMemory");
        if (score.correct >= 8)
            return t("englishPattern.quizSection.formingMemory");
        if (score.correct >= 6)
            return t("englishPattern.quizSection.accumulatingMemory");
        if (score.correct >= 3)
            return t("englishPattern.quizSection.shortTermMemory");
        return t("englishPattern.quizSection.needsReview");
    };

    return (
        <div className="space-y-4">
            {/* Score Cards */}
            <div>
                <div className="rounded-2xl shadow-md">
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className="h-5 w-5" />
                                <span className="text-cyan-100">
                                    {t(
                                        "englishPattern.quizSection.repeatCount",
                                    )}
                                </span>
                                <div className="relative rounded-2xl">
                                    <Info
                                        className="h-4 w-4 cursor-pointer"
                                        onMouseEnter={() =>
                                            setIsOpenTooltip(true)
                                        }
                                        onMouseLeave={() =>
                                            setIsOpenTooltip(false)
                                        }
                                    />
                                    {isOpenTooltip && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2  z-10">
                                            <div className="bg-gray-900 text-white text-sm rounded-lg py-2 px-3 whitespace-nowrap shadow-lg">
                                                {t(
                                                    "englishPattern.quizSection.repeatInfo",
                                                )}
                                                <br />
                                                {t(
                                                    "englishPattern.quizSection.repeatPersist",
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl mb-0.5">
                                    {correctCount}
                                </div>
                            </div>
                        </div>
                        {score.correct > 0 && (
                            <div className="text-sm text-cyan-100 mt-2">
                                {getCorrectMessage()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <div className="rounded-2xl shadow-lg bg-white">
                <div className="p-6">
                    <div className="mb-4">
                        <div className="flex items-center mb-4">
                            <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm mr-2">
                                {currentQuestion.type === "sentence"
                                    ? t(
                                          "englishPattern.quizSection.sentenceQuiz",
                                      )
                                    : t(
                                          "englishPattern.quizSection.meaningQuiz",
                                      )}
                            </div>
                            <Volume2
                                className="h-5 w-5 cursor-pointer hover:text-gray-200"
                                onClick={() =>
                                    textToSpeech(currentQuestion.question)
                                }
                            />
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-2xl border-2 border-blue-100">
                            <p className="text-gray-900 text-lg">
                                {currentQuestion.question}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        {currentQuestion.options.map((option, index) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrectOption =
                                option === currentQuestion.correctAnswer;

                            let buttonClass =
                                "w-full text-left py-4 px-5 rounded-xl transition-all ";

                            if (isAnswered) {
                                if (isCorrectOption) {
                                    buttonClass +=
                                        "bg-green-50 border-2 border-green-400 text-green-900 cursor-default";
                                } else if (isSelected && !isCorrect) {
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
                                    key={index}
                                    className={buttonClass}
                                    onClick={() => handleAnswerSelect(option)}
                                    disabled={isAnswered}
                                >
                                    <div className="flex items-center justify-between w-full gap-3">
                                        <span className="flex-1 text-left">
                                            {option}
                                        </span>
                                        {isAnswered && isCorrectOption && (
                                            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                                        )}
                                        {isAnswered &&
                                            isSelected &&
                                            !isCorrect && (
                                                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                                            )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {isAnswered && (
                        <div
                            className={`mt-4 p-4 rounded-2xl ${
                                isCorrect
                                    ? "bg-green-50 border-2 border-green-200"
                                    : "bg-red-50 border-2 border-red-200"
                            }`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                {isCorrect ? (
                                    <>
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        <span className="text-green-900">
                                            {t(
                                                "englishPattern.quizSection.correct",
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-5 w-5 text-red-600" />
                                        <span className="text-red-900">
                                            {t(
                                                "englishPattern.quizSection.incorrect",
                                            )}
                                        </span>
                                    </>
                                )}
                            </div>
                            <p className="text-gray-700 text-sm">
                                {t("englishPattern.quizSection.pattern")}{" "}
                                <span className="text-blue-600">
                                    {currentQuestion.pattern}
                                </span>
                            </p>
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={startNewQuestion}
                            disabled={!isAnswered}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white h-12 text-base rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {t("englishPattern.quizSection.nextQuestion")}
                        </button>
                        <button
                            onClick={onNextRandomQuiz}
                            className="h-12 px-6 border-2 border-blue-200 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            title={t("englishPattern.quizSection.randomQuiz")}
                        >
                            <Shuffle className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
