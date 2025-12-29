import { NextRequest, NextResponse } from "next/server";
import { generatePatternWithFallback } from "@/lib/ai";
import { Locale } from "@/lib/locale";

interface QuizRequest {
    difficulty: "easy" | "medium" | "hard";
    language: "javascript" | "python" | "java" | "cpp";
    userLanguage: Locale;
}

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

// AI를 통해 퀴즈 생성
const generateQuizWithAI = async (
    difficulty: string,
    language: string,
    userLanguage: string
): Promise<Quiz> => {
    const difficultyMap = {
        easy:
            userLanguage === "ko"
                ? "초급"
                : userLanguage === "en"
                ? "Beginner"
                : "初級",
        medium:
            userLanguage === "ko"
                ? "중급"
                : userLanguage === "en"
                ? "Intermediate"
                : "中級",
        hard:
            userLanguage === "ko"
                ? "고급"
                : userLanguage === "en"
                ? "Advanced"
                : "上級",
    };

    const prompt =
        userLanguage === "ko"
            ? `${
                  difficultyMap[difficulty as keyof typeof difficultyMap]
              } 수준의 ${language} 프로그래밍 언어로 된 코딩 퀴즈를 생성해주세요.

            다음 조건을 만족해야 합니다:
            1. 10-20줄 정도의 실제 동작하는 코드를 작성해주세요
            2. 해당 코드에 대한 4개의 설명 중 1개는 틀린 설명이어야 합니다
            3. 모든 텍스트는 한국어로 작성해주세요
            4. 틀린 설명은 미묘하지만 명확히 틀려야 합니다

            다음 JSON 형식으로 반환해주세요:
            {
            "code": "실제 동작하는 ${language} 코드",
            "question": "다음 ${language} 코드에 대한 설명 중 틀린 것은?",
            "options": [
                {"id": 1, "text": "설명1", "isCorrect": false},
                {"id": 2, "text": "설명2", "isCorrect": false},
                {"id": 3, "text": "틀린설명", "isCorrect": true},
                {"id": 4, "text": "설명4", "isCorrect": false}
            ],
            "explanation": "왜 3번이 틀린지에 대한 자세한 설명"
            }

            반드시 JSON 형식으로만 응답해주세요.`
            : userLanguage === "en"
            ? `Generate a ${
                  difficultyMap[difficulty as keyof typeof difficultyMap]
              } level coding quiz in ${language} programming language.

            Requirements:
            1. Write 10-20 lines of actual working code
            2. Create 4 explanations about the code, where 1 should be incorrect
            3. All text should be in English
            4. The incorrect explanation should be subtle but clearly wrong

            Return in the following JSON format:
            {
            "code": "actual working ${language} code",
            "question": "Which explanation about the following ${language} code is incorrect?",
            "options": [
                {"id": 1, "text": "explanation1", "isCorrect": false},
                {"id": 2, "text": "explanation2", "isCorrect": false},
                {"id": 3, "text": "incorrect explanation", "isCorrect": true},
                {"id": 4, "text": "explanation4", "isCorrect": false}
            ],
            "explanation": "detailed explanation of why option 3 is incorrect"
            }

            Please respond only in JSON format.`
            : `${
                  difficultyMap[difficulty as keyof typeof difficultyMap]
              }レベルの${language}プログラミング言語でコーディングクイズを生成してください。

            条件:
            1. 10-20行程度の実際に動作するコードを書いてください
            2. そのコードについて4つの説明を作成し、そのうち1つは間違った説明にしてください
            3. すべてのテキストは日本語で作成してください
            4. 間違った説明は微妙ですが明確に間違っている必要があります

            次のJSON形式で返してください:
            {
            "code": "実際に動作する${language}コード",
            "question": "次の${language}コードについての説明で間違っているものは？",
            "options": [
                {"id": 1, "text": "説明1", "isCorrect": false},
                {"id": 2, "text": "説明2", "isCorrect": false},
                {"id": 3, "text": "間違った説明", "isCorrect": true},
                {"id": 4, "text": "説明4", "isCorrect": false}
            ],
            "explanation": "なぜ3番が間違っているかの詳細な説明"
            }

            JSON形式でのみ応答してください。`;

    const result = await generatePatternWithFallback(prompt);

    // AI 응답을 JSON으로 파싱
    let quizData;
    try {
        // JSON 부분만 추출 (마크다운 코드 블록이 있을 수 있음)
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : result.text;
        quizData = JSON.parse(jsonString);

        return {
            id: Math.floor(Math.random() * 1000),
            code: quizData.code,
            question: quizData.question,
            options: quizData.options,
            explanation: quizData.explanation,
        };
    } catch (parseError) {
        console.error("AI 응답 파싱 오류:", parseError);
        console.error("파싱 실패한 데이터:", result.text);

        // 파싱 실패 시 에러 발생시켜 상위에서 처리하도록 함
        throw new Error("AI가 생성한 퀴즈 데이터를 처리할 수 없습니다.");
    }
};

export async function POST(request: NextRequest) {
    try {
        const body: QuizRequest = await request.json();
        const { difficulty, language, userLanguage } = body;

        // 입력 검증
        if (!difficulty || !language || !userLanguage) {
            return NextResponse.json(
                { error: "필수 매개변수가 누락되었습니다." },
                { status: 400 }
            );
        }

        // AI를 통해 퀴즈 생성
        const quiz = await generateQuizWithAI(
            difficulty,
            language,
            userLanguage
        );

        return NextResponse.json(quiz);
    } catch (error) {
        console.error("Quiz generation error:", error);

        // OpenRouter API 에러 처리
        if (error instanceof Error) {
            const errorMessage = error.message;

            // AI 파싱 에러 처리
            if (
                errorMessage.includes(
                    "AI가 생성한 퀴즈 데이터를 처리할 수 없습니다"
                )
            ) {
                return NextResponse.json(
                    {
                        error: "AI가 퀴즈를 생성했지만 형식이 올바르지 않습니다. 다시 시도해주세요.",
                    },
                    { status: 422 }
                );
            }

            // Rate limit 관련 에러 처리
            if (errorMessage.includes("Too Many Requests")) {
                return NextResponse.json(
                    {
                        error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.",
                    },
                    { status: 429 }
                );
            }

            // API 키 관련 에러 처리
            if (
                errorMessage.includes("API key") ||
                errorMessage.includes("Unauthorized")
            ) {
                return NextResponse.json(
                    {
                        error: "AI 서비스에 연결할 수 없습니다. 관리자에게 문의하세요.",
                    },
                    { status: 503 }
                );
            }

            // 네트워크 에러 처리
            if (
                errorMessage.includes("fetch") ||
                errorMessage.includes("network")
            ) {
                return NextResponse.json(
                    {
                        error: "AI 서비스에 연결할 수 없습니다. 인터넷 연결을 확인하고 다시 시도해주세요.",
                    },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            {
                error: "AI 퀴즈 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
            },
            { status: 500 }
        );
    }
}
