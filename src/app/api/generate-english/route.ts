import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { uploadJsonToGitHub } from "@/lib/github";
import { generatePatternWithFallback } from "@/lib/ai";

export interface PatternsResponse {
    day: number;
    patterns: PatternItem[];
}

export interface PatternItem {
    pId: string;
    pattern: string;
    meaning: string;
    meaning_ja: string;
    examples: Example[];
}

export interface Example {
    eId: string;
    sentence: string;
    translation: string;
    translation_ja: string;
}

export interface patternListData {
    patternList: string[];
    day: number;
}

export interface Score {
    correct: number;
}

const patternDirectory = path.join(process.cwd(), "public", "pattern");

// 최근 생성된 영어 패턴 파일을 읽어오는 GET 핸들러
export async function GET(req: NextRequest) {
    try {
        const fileNames = fs.readdirSync(patternDirectory);
        if (fileNames.length === 0) {
            return NextResponse.json(
                { error: "No files found in the pattern directory." },
                { status: 404 },
            );
        }

        const { searchParams } = new URL(req.url);
        const paramDay = searchParams.get("day");
        const day = paramDay ? Number(searchParams.get("day")) : null;

        let targetFile: string = "";

        if (day) {
            for (const fileName of fileNames) {
                const fullPath = path.join(patternDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, "utf8");
                const parsed = JSON.parse(fileContents) as PatternsResponse;

                if (parsed.day === day) {
                    targetFile = fileName;
                    break;
                }
            }
        } else {
            // 최신(가장 큰 이름) 파일 선택
            targetFile = fileNames.reduce((a, b) => (a > b ? a : b));
        }

        const fullPath = path.join(patternDirectory, targetFile);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const data = JSON.parse(fileContents);
        return NextResponse.json({
            ...data,
            totalCount: fileNames.length,
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch pattern" },
            { status: 500 },
        );
    }
}

/**
 * 테스트용 curl 명령어
 * curl -X POST \
  -H "Authorization: Bearer DAILY_API_KEY" \
  http://localhost:3000/api/generate-english
 */

// 영어 문장 패턴 생성 POST 핸들러
export async function POST(request: NextRequest) {
    try {
        // Authorization 헤더 확인
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Authorization header is missing or invalid" },
                { status: 401 },
            );
        }

        const token = authHeader.split(" ")[1];

        // 토큰 검증
        if (token !== process.env.DAILY_API_TOKEN) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 403 },
            );
        }

        // 기존 패턴 목록 가져오기
        const existingPatternList = getPatternList();
        // AI를 사용해 새로운 패턴 생성한 결과
        let result;

        /** 빈객체를 타입가드 처리함 */
        if (
            existingPatternList &&
            "patternList" in existingPatternList &&
            "day" in existingPatternList
        ) {
            const prompt = generatePatternPrompt(existingPatternList);
            result = await generatePatternWithFallback(prompt);
        } else {
            return NextResponse.json(
                { error: "패턴을 검색하는데 실패했습니다" },
                { status: 500 },
            );
        }

        let patternData;
        try {
            // JSON 부분만 추출
            const jsonMatch = result.text.match(/\{[\s\S]*\}/); // 중괄호로 감싸진 부분 찾기
            const jsonString = jsonMatch ? jsonMatch[0] : result.text;
            patternData = JSON.parse(jsonString);

            await uploadJsonToGitHub({
                json: patternData,
                path: { name: "pattern", message: "영어 패턴" },
            });

            return NextResponse.json({
                success: true,
                message: "패턴 생성 완료.",
            });
        } catch (parseError) {
            console.error("AI 응답 파싱 오류:", parseError);
            console.error("파싱 실패한 데이터:", result.text);

            // 파싱 실패 시 에러 발생시켜 상위에서 처리하도록 함
            throw new Error("AI가 생성한 퀴즈 데이터를 처리할 수 없습니다.");
        }
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

// 영어 문장 패턴 생성 프롬프트
const generatePatternPrompt = ({
    patternList: avoidPatterns,
    day,
}: patternListData) =>
    `Please generate 2 English sentence patterns.

Conditions:
1. The patterns should be practical and commonly used in daily life.
2. Each pattern must ${
        avoidPatterns.length > 0
            ? "exclude the following patterns: " + avoidPatterns.join(", ")
            : "not duplicate any previously generated patterns."
    }
3. Each pattern must include 2 real-life example sentences.
4. All examples should sound natural and be suitable for everyday situations.

Return the result in the following JSON format:
{
  "day": ${day + 1},
  "patterns": [
    {
      "pId": "1",
      "pattern": "Pattern expression",
      "meaning": "Meaning in Korean",
      "meaning_ja": "Meaning in Japanese",
      "examples": [
        {
          "eId": "1",
          "sentence": "Example sentence",
          "translation": "Korean translation",
          "translation_ja": "Japanese translation"
        },
        // ... 1 more
      ]
    },
    // ... 1 more
  ]
}

Notes:
1. Patterns must be grammatically correct.
2. Meanings should be clear and easy to understand in both Korean and Japanese.
3. Example sentences must be practical and usable in real life.
4. All translations should be natural Korean and Japanese.
5. Generate meaning_ja as a natural Japanese explanation of the pattern.
6. Generate translation_ja as a natural Japanese translation of each example sentence.

You must respond only in JSON format.
All fields must be filled. No field may be empty.
If a pattern, example, or translation fails to generate, regenerate the JSON until all fields contain valid values.
Do not escape Unicode characters in Korean or Japanese translations.
If excluded patterns remove too many options, create new unique patterns.

`;

// 기존에 생성된 패턴 목록을 파일에서 읽어옵니다
function getPatternList(): patternListData | object {
    try {
        const fileNames = fs.readdirSync(patternDirectory);
        if (!fileNames || fileNames.length === 0) {
            return {};
        }

        const patternList: string[] = [];
        let day: number = 0;

        fileNames.forEach((fileName) => {
            const fullPath = path.join(patternDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            try {
                const parsed = JSON.parse(fileContents) as PatternsResponse;
                parsed.patterns.forEach((item: PatternItem) => {
                    if (item && item.pattern) patternList.push(item.pattern);
                });
                // 날짜가 가장 최근인 파일의 패턴을 우선적으로 추가하기 위해 day 변수 사용
                day++;
            } catch (parseErr) {
                console.error(
                    `Failed to parse pattern file ${fileName}:`,
                    parseErr,
                );
                // 파싱 실패한 파일은 건너뜀
            }
        });
        return {
            patternList,
            day,
        };
    } catch (err) {
        console.error("getPatternList error:", err);
        return {};
    }
}
