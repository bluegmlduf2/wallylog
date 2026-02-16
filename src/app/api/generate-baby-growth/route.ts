import { NextResponse, NextRequest } from "next/server";
import { uploadJsonToGitHub } from "@/lib/github";
import { generatePatternWithFallback } from "@/lib/ai";

interface BabyInfo {
    changes: string[];
    cautions: string[];
    tips: string[];
    upcoming: string[];
    hospitalSigns: string[];
}

export interface TranslatedBabyInfo {
    ko: BabyInfo;
    ja: BabyInfo;
    en: BabyInfo;
}

const babyData: TranslatedBabyInfo = {
    ko: {
        changes: [
            "하루 대부분을 잠으로 보냅니다 (16-20시간)",
            "반사 행동이 주를 이룹니다 (빨기, 움켜쥐기)",
            "탯줄이 마르고 떨어집니다",
            "생리적 황달이 나타날 수 있습니다",
        ],
        cautions: [
            "탯줄 부위를 청결하고 건조하게 유지하세요",
            "황달 증상을 관찰하세요",
            "모유/분유 수유 패턴을 확립하세요",
            "충분한 기저귀 교환 (하루 6-8회 이상)",
        ],
        tips: [
            "자주 안아주고 피부 접촉을 많이 해주세요",
            "울음에 민감하게 반응해주세요",
            "2-3시간마다 수유하세요",
            "방의 온도를 20-22도로 유지하세요",
        ],
        upcoming: [
            "점차 깨어있는 시간이 늘어납니다",
            "엄마 목소리에 반응하기 시작합니다",
            "눈 맞춤이 조금씩 늘어납니다",
        ],
        hospitalSigns: [
            "38도 이상의 발열",
            "수유 거부나 극심한 보챔",
            "호흡 곤란이나 피부색 변화",
            "탯줄 부위의 심한 발적이나 분비물",
        ],
    },
    ja: {
        changes: [
            "一日のほとんどを睡眠で過ごします（16-20時間）",
            "反射行動が主です（吸う、握る）",
            "へその緒が乾燥して取れます",
            "生理的黄疸が現れることがあります",
        ],
        cautions: [
            "へその緒の部分を清潔で乾燥した状態に保ってください",
            "黄疸の症状を観察してください",
            "母乳/ミルクの授乳パターンを確立してください",
            "十分なおむつ交換（1日6-8回以上）",
        ],
        tips: [
            "頻繁に抱っこして肌の触れ合いを多くしてください",
            "泣き声に敏感に反応してください",
            "2-3時間ごとに授乳してください",
            "室温を20-22度に保ってください",
        ],
        upcoming: [
            "徐々に起きている時間が増えます",
            "お母さんの声に反応し始めます",
            "アイコンタクトが少しずつ増えます",
        ],
        hospitalSigns: [
            "38度以上の発熱",
            "授乳拒否や激しいぐずり",
            "呼吸困難や皮膚色の変化",
            "へその緒部分のひどい発赤や分泌物",
        ],
    },
    en: {
        changes: [
            "Sleeps most of the day (16-20 hours)",
            "Primarily reflexive behaviors (sucking, grasping)",
            "Umbilical cord dries and falls off",
            "Physiological jaundice may appear",
        ],
        cautions: [
            "Keep umbilical cord area clean and dry",
            "Monitor for jaundice symptoms",
            "Establish breast/bottle feeding pattern",
            "Ensure adequate diaper changes (6-8+ times daily)",
        ],
        tips: [
            "Hold baby frequently with lots of skin-to-skin contact",
            "Respond sensitively to crying",
            "Feed every 2-3 hours",
            "Maintain room temperature at 20-22°C",
        ],
        upcoming: [
            "Awake periods will gradually increase",
            "Will start responding to mother's voice",
            "Eye contact will gradually increase",
        ],
        hospitalSigns: [
            "Fever above 38°C",
            "Refusing feeds or excessive fussiness",
            "Breathing difficulty or skin color changes",
            "Severe redness or discharge from umbilical area",
        ],
    },
};

export async function GET() {
    try {
        return NextResponse.json(babyData);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: "Failed to fetch baby growth data" },
            { status: 500 },
        );
    }
}

/**
 * 테스트용 curl 명령어
 * curl -X POST \
  -H "Authorization: Bearer BABY_GROWTH_API_KEY" \
  http://localhost:3000/api/generate-baby-growth
 */

// export async function POST(request: NextRequest) {
//     try {
//         // Authorization 헤더 확인
//         const authHeader = request.headers.get("authorization");
//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return NextResponse.json(
//                 { error: "Authorization header is missing or invalid" },
//                 { status: 401 }
//             );
//         }

//         const token = authHeader.split(" ")[1];

//         // 토큰 검증
//         if (token !== process.env.BABY_GROWTH_API_TOKEN) {
//             return NextResponse.json(
//                 { error: "Invalid token" },
//                 { status: 403 }
//             );
//         }

//         // 요청 본문에서 아기 월령 정보 추출
//         const { weekOfPregnancy, weekOfBaby } = await request.json();

//         if (!weekOfBaby && !weekOfPregnancy) {
//             return NextResponse.json(
//                 { error: "weekOfBaby or weekOfPregnancy is required" },
//                 { status: 400 }
//             );
//         }

//         const prompt = generateBabyGrowthPrompt(weekOfBaby, weekOfPregnancy);
//         // AI를 사용해 새로운 아기 성장 정보 생성한 결과
//         const result = await generatePatternWithFallback(prompt);

//         let babyGrowthData;
//         try {
//             // JSON 부분만 추출
//             const jsonMatch = result.text.match(/\{[\s\S]*\}/);
//             const jsonString = jsonMatch ? jsonMatch[0] : result.text;
//             babyGrowthData = JSON.parse(jsonString);

//             await uploadJsonToGitHub({
//                 json: babyGrowthData,
//                 path: {
//                     name: `baby-growth-${weekOfBaby || weekOfPregnancy}`,
//                     message: "아기 성장 정보",
//                 },
//             });

//             return NextResponse.json({
//                 success: true,
//                 message: "아기 성장 정보 생성 완료.",
//                 data: babyGrowthData,
//             });
//         } catch (parseError) {
//             console.error("AI 응답 파싱 오류:", parseError);
//             console.error("파싱 실패한 데이터:", result.text);

//             throw new Error("AI가 생성한 아기 성장 정보를 처리할 수 없습니다.");
//         }
//     } catch (error) {
//         console.error("API Error:", error);
//         const errorMessage =
//             error instanceof Error ? error.message : String(error);

//         return NextResponse.json(
//             { error: "Internal server error", details: errorMessage },
//             { status: 500 }
//         );
//     }
// }

function generateBabyGrowthPrompt(
    weekOfBaby?: number,
    weekOfPregnancy?: number,
) {
    const week = weekOfBaby || weekOfPregnancy;

    return `
Generate JSON data according to the following instructions:

1. Create comprehensive baby growth information for week ${week}.
2. Only include medically accurate, verified information suitable for parents.
3. For each category (changes, cautions, tips, upcoming, hospitalSigns), provide relevant information.
4. Translate all information into Korean (ko), Japanese (ja), and English (en).
5. Follow the JSON structure exactly and do not leave any fields empty.
6. If any field is empty, invalid, or unverified, regenerate that item until all values are correct.
7. Do not escape Unicode characters in Korean translations.
8. Output JSON data only, without unnecessary sentences or explanations.

Example output format:

{
  "ko": {
    "changes": [
      "변화 내용 1",
      "변화 내용 2"
    ],
    "cautions": [
      "주의사항 1",
      "주의사항 2"
    ],
    "tips": [
      "팁 1",
      "팁 2"
    ],
    "upcoming": [
      "예정 사항 1",
      "예정 사항 2"
    ],
    "hospitalSigns": [
      "병원 방문 신호 1",
      "병원 방문 신호 2"
    ]
  },
  "ja": {
    "changes": [...],
    "cautions": [...],
    "tips": [...],
    "upcoming": [...],
    "hospitalSigns": [...]
  },
  "en": {
    "changes": [...],
    "cautions": [...],
    "tips": [...],
    "upcoming": [...],
    "hospitalSigns": [...]
  }
}
`;
}
