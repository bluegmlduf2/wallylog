import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { uploadJsonToGitHub } from "@/lib/github";
import { generatePatternWithFallback } from "@/lib/ai";

// 퀴즈 문항 하나 구조
// **options** 배열은 4개 항목을 가지며 그 중 하나에 `isCorrect: true`가 표기됩니다.
// 따라서 별도의 `correct` 필드는 삭제되었습니다.
// 카테고리는 한국어/영어/일본어를 모두 지원합니다.
export interface TriviaQuestion {
    qId: string;
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
    options: [
        { ko: string; en: string; ja: string; isCorrect: boolean },
        { ko: string; en: string; ja: string; isCorrect: boolean },
        { ko: string; en: string; ja: string; isCorrect: boolean },
        { ko: string; en: string; ja: string; isCorrect: boolean },
    ];
}

// 하루분 퀴즈 전체
export interface TriviaResponse {
    date: string; // YYYYMMDD
    questions: TriviaQuestion[];
    allDates?: string[];
}

const triviaDirectory = path.join(process.cwd(), "public", "trivia");

// 날짜별로 저장된 퀴즈를 불러오는 GET 핸들러
export async function GET(req: NextRequest) {
    try {
        const fileNames = fs.readdirSync(triviaDirectory);
        if (fileNames.length === 0) {
            return NextResponse.json(
                { error: "No files found in the trivia directory." },
                { status: 404 },
            );
        }

        const { searchParams } = new URL(req.url);
        const paramDate = searchParams.get("date");
        const date = paramDate ? paramDate : null;

        let targetFile: string = "";

        if (date) {
            for (const fileName of fileNames) {
                const fullPath = path.join(triviaDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, "utf8");
                const parsed = JSON.parse(fileContents) as TriviaResponse;

                if (parsed.date === date) {
                    targetFile = fileName;
                    break;
                }
            }
        } else {
            targetFile = fileNames.reduce((a, b) => (a > b ? a : b));
        }

        const fullPath = path.join(triviaDirectory, targetFile);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const data = JSON.parse(fileContents);
        return NextResponse.json({
            ...data,
            allDates: fileNames,
        });
    } catch (err) {
        console.error("GET /api/generate-trivia error:", err);
        return NextResponse.json(
            { error: "Failed to fetch trivia" },
            { status: 500 },
        );
    }
}

/**
 * 테스트용 curl 명령어
 * curl -X POST \
  -H "Authorization: Bearer DAILY_API_KEY" \
  http://localhost:3000/api/generate-trivia
 */

// 하루치 퀴즈를 생성하는 POST 핸들러
export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Authorization header is missing or invalid" },
                { status: 401 },
            );
        }

        const token = authHeader.split(" ")[1];
        if (token !== process.env.DAILY_API_TOKEN) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 403 },
            );
        }

        // 기존에 생성된 퀴즈 목록을 불러옵니다. (질문 영어 텍스트만 추출)
        const existingTriviaSummaries = loadAllTriviaSummaries();
        const existingQuestions = existingTriviaSummaries.flatMap(
            (s) => s.questions,
        );

        // 생성된 퀴즈가 기존 퀴즈와 일부라도 중복되는지 검사합니다.
        const findOverlappingTriviaSummary = (newTrivia: TriviaResponse) => {
            const newQuestions = new Set(
                newTrivia.questions.map((q) =>
                    q.question.en.trim().toLowerCase(),
                ),
            );

            return existingTriviaSummaries.find((existing) =>
                existing.questions.some((q) => newQuestions.has(q)),
            );
        };

        let triviaData;
        let overlappingTriviaSummary;
        let result;
        const maxAttempts = 3;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const prompt = generateTriviaPrompt(existingQuestions);
            result = await generatePatternWithFallback(prompt);

            try {
                const jsonString = extractJsonString(result.text);
                triviaData = JSON.parse(jsonString);

                overlappingTriviaSummary =
                    findOverlappingTriviaSummary(triviaData);
                if (!overlappingTriviaSummary) break;

                console.warn(
                    `Generated trivia overlaps existing trivia (attempt ${attempt}): ${
                        overlappingTriviaSummary.date
                    }`,
                );
            } catch (parseError) {
                console.error("AI 응답 파싱 오류:", parseError);
                console.error("파싱 실패한 데이터:", result.text);
                throw new Error(
                    "AI가 생성한 퀴즈 데이터를 처리할 수 없습니다.",
                );
            }
        }

        if (overlappingTriviaSummary) {
            return NextResponse.json({
                success: true,
                message: "생성된 퀴즈가 기존에 존재하는 퀴즈와 중복됩니다.",
                date: overlappingTriviaSummary.date,
                questions: overlappingTriviaSummary.questions,
            });
        }

        await uploadJsonToGitHub({
            json: triviaData,
            path: { name: "trivia", message: "잡지식 퀴즈" },
        });

        return NextResponse.json({
            success: true,
            message: "퀴즈 생성 완료.",
            trivia: triviaData,
        });
    } catch (error) {
        console.error("API Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            { error: "Internal server error", details: errorMessage },
            { status: 500 },
        );
    }
}

function extractJsonString(raw: string) {
    // AI 응답 텍스트에서 JSON 객체 형태를 찾아 추출합니다.
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    let jsonString =
        start !== -1 && end !== -1 ? raw.slice(start, end + 1) : raw;

    // 단일 인용부호로 감싸진 문자열을 JSON 규격에 맞춰 변환
    jsonString = jsonString.replace(/'([^']*)'/g, (_match, grp) => {
        return JSON.stringify(grp);
    });

    // JSON 내에 불필요한 쉼표(트레일링 콤마)가 있을 경우 제거
    jsonString = jsonString.replace(/,\s*([}\]])/g, "$1");

    return jsonString;
}

interface TriviaSummary {
    date: string;
    questions: string[];
}

function loadAllTriviaSummaries(): TriviaSummary[] {
    try {
        const fileNames = fs.readdirSync(triviaDirectory);
        return fileNames
            .map((fileName) => {
                const fullPath = path.join(triviaDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, "utf8");
                const parsed = JSON.parse(fileContents) as TriviaResponse;

                return {
                    date: parsed.date,
                    questions: parsed.questions.map((q) =>
                        q.question.en.trim().toLowerCase(),
                    ),
                };
            })
            .filter(Boolean);
    } catch (err) {
        console.error("loadAllTriviaSummaries error:", err);
        return [];
    }
}

function generateTriviaPrompt(existingQuestions: string[] = []) {
    const today = new Date();
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, "0");
    const DD = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${YYYY}${MM}${DD}`;

    const uniqueQuestions = Array.from(
        new Set(existingQuestions.map((q) => q.trim().toLowerCase())),
    );
    const maxShown = 50;
    const shownQuestions = uniqueQuestions.slice(0, maxShown);

    const avoidListText = shownQuestions.length
        ? `\n\nDo not include or repeat any previously generated trivia questions. Here are some existing questions (English) to avoid:\n${shownQuestions
              .map((q, i) => `${i + 1}. ${q}`)
              .join("\n")}${
              uniqueQuestions.length > maxShown
                  ? `\n... and ${uniqueQuestions.length - maxShown} more existing questions`
                  : ""
          }\n\n`
        : "";

    return `Generate JSON data containing 3 miscellaneous trivia questions.\n\nEach question must specify a multilingual category (ko/en/ja), a question text, and four options. Three options should be incorrect and one correct; mark the correct one with isCorrect: true.\nSupport Korean (ko), English (en), and Japanese (ja) for every text field. Do not escape Unicode characters in Korean or Japanese.${avoidListText}Return the following structure exactly (use the date field for the ${formattedDate}):\n\n{
  "date": "${formattedDate}",
  "questions": [
    {
      "qId": "unique_id_1",
      "category": {"ko": "카테고리명", "en": "category name", "ja": "カテゴリー名"},
      "question": {"ko": "...", "en": "...", "ja": "..."},
      "options": [
        {"ko": "오답", "en": "wrong", "ja": "間違い", "isCorrect": false},
        {"ko": "오답", "en": "wrong", "ja": "間違い", "isCorrect": false},
        {"ko": "오답", "en": "wrong", "ja": "間違い", "isCorrect": false},
        {"ko": "정답", "en": "correct", "ja": "正解", "isCorrect": true}
      ],
    }
    // … 총 3개 항목
  ]
}
\nMake sure every field is filled and the JSON is valid. Output only JSON. No extra text.`;
}
