import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { uploadJsonToGitHub } from "@/lib/github";
import { generatePatternWithFallback } from "@/lib/ai";

export interface NewsSource {
    id: number;
    title: NewsSummary;
    url: string;
    summary: NewsSummary;
}

export interface NewsSummary {
    original: string;
    ko: string;
    ja: string;
    en: string;
}

export interface NewsResponse {
    date: string;
    sources: NewsSource[];
    allDates: string[];
}

export type Language = "original" | "ko" | "ja" | "en";

const newsDirectory = path.join(process.cwd(), "public", "news");

// 최근 생성된 뉴스 파일을 읽어오는 GET 핸들러
export async function GET(req: NextRequest) {
    try {
        const fileNames = fs.readdirSync(newsDirectory);
        if (fileNames.length === 0) {
            return NextResponse.json(
                { error: "No files found in the news directory." },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(req.url);
        const paramDate = searchParams.get("date");
        const date = paramDate ? searchParams.get("date") : null;

        let targetFile: string = "";

        if (date) {
            for (const fileName of fileNames) {
                const fullPath = path.join(newsDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, "utf8");
                const parsed = JSON.parse(fileContents);

                if (parsed.date === date) {
                    targetFile = fileName;
                    break;
                }
            }
        } else {
            // 최신(가장 큰 이름) 파일 선택
            targetFile = fileNames.reduce((a, b) => (a > b ? a : b));
        }

        const fullPath = path.join(newsDirectory, targetFile);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const data = JSON.parse(fileContents);
        return NextResponse.json({
            ...data,
            allDates: fileNames,
        });
    } catch {
        return NextResponse.json(
            { error: "Failed to fetch news" },
            { status: 500 }
        );
    }
}

/**
 * 테스트용 curl 명령어
 * curl -X POST \
  -H "Authorization: Bearer DAILY_API_KEY" \
  http://localhost:3000/api/generate-news
 */

// 뉴스 생성 POST 핸들러
export async function POST(request: NextRequest) {
    try {
        // Authorization 헤더 확인
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                { error: "Authorization header is missing or invalid" },
                { status: 401 }
            );
        }

        const token = authHeader.split(" ")[1];

        // 토큰 검증
        if (token !== process.env.DAILY_API_TOKEN) {
            return NextResponse.json(
                { error: "Invalid token" },
                { status: 403 }
            );
        }

        const prompt = generateNewsPrompt();
        // AI를 사용해 새로운 뉴스 생성한 결과
        const result = await generatePatternWithFallback(prompt);

        let newsData;
        try {
            // JSON 부분만 추출
            const jsonMatch = result.text.match(/\{[\s\S]*\}/); // 중괄호로 감싸진 부분 찾기
            const jsonString = jsonMatch ? jsonMatch[0] : result.text;
            newsData = JSON.parse(jsonString);

            await uploadJsonToGitHub({
                json: newsData,
                path: { name: "news", message: "뉴스" },
            });

            return NextResponse.json({
                success: true,
                message: "뉴스 생성 완료.",
            });
        } catch (parseError) {
            console.error("AI 응답 파싱 오류:", parseError);
            console.error("파싱 실패한 데이터:", result.text);

            // 파싱 실패 시 에러 발생시켜 상위에서 처리하도록 함
            throw new Error("AI가 생성한 뉴스 데이터를 처리할 수 없습니다.");
        }
    } catch (error) {
        console.error("API Error:", error);
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        return NextResponse.json(
            { error: "Internal server error", details: errorMessage },
            { status: 500 }
        );
    }
}

// 영어 문장 뉴스 생성 프롬프트
function generateNewsPrompt() {
    const today = new Date();
    const YYYY = today.getFullYear();
    const MM = String(today.getMonth() + 1).padStart(2, "0");
    const DD = String(today.getDate()).padStart(2, "0");
    const formattedDate = `${YYYY}${MM}${DD}`; // YYYYMMDD

    return `
Generate JSON data according to the following instructions:

1. Fetch 3 trustworthy IT news articles for ${formattedDate}.
2. Only include news from verified, reputable sources (e.g., major IT media websites).
3. Include the original title and URL for each news article.
4. Put an AI-generated summary in 'summary.original', but do NOT fabricate facts. Summarize only what is confirmed in the original article.
5. Translate both the title and summary into Korean (ko), Japanese (ja), and English (en).
6. Generate a random unique ID for each news item.
7. Follow the JSON structure exactly and do not leave any fields empty.
8. If any field is empty, invalid, or contains unverified information, repeat until correct and factual values are generated.
9. Do not escape Unicode characters in Korean translations.
10. Output JSON data only, without unnecessary sentences or explanations.

Example output format:

{
  "date": "${formattedDate}",
  "sources": [
    {
      "id": "random_unique_id_1",
      "title": {
        "original": "Original news title",
        "ko": "Korean translation",
        "ja": "Japanese translation",
        "en": "English translation"
      },
      "url": "https://example.com/news",
      "summary": {
        "original": "AI-generated news summary (factual only)",
        "ko": "Korean translation of summary",
        "ja": "Japanese translation of summary",
        "en": "English summary"
      }
    }
    // Total of 3 news articles, each with a unique random ID
  ]
}
`;
}
