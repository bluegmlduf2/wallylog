import { NextResponse } from "next/server";
import { fetchOpenIssues, createIssue } from "@/lib/github";

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as {
            email?: string;
            items?: string[];
        };
        const email = (body?.email || "").trim();
        const items = Array.isArray(body?.items) ? body.items : [];
        const label = "pending";

        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            return NextResponse.json(
                { error: "부적절한 이메일형식" },
                { status: 400 }
            );
        }

        if (!items.length) {
            return NextResponse.json(
                { error: "구독할 항목이 선택되지 않았습니다" },
                { status: 400 }
            );
        }

        // 깃허브 이슈 가져오기
        const openIssues = await fetchOpenIssues();

        const emailLower = email.toLowerCase();
        const found = openIssues.some((issue) => {
            const textSearch = `${issue.title}\n${issue.body}`.toLowerCase();
            return textSearch.includes(emailLower);
        });
        if (found) {
            return NextResponse.json(
                { error: "이미 동일 이메일로 등록된 요청이 있습니다." },
                { status: 409 }
            );
        }

        const now = new Date().toISOString();
        const title = `구독 신청 — ${email}`;
        const issueBody = `### 새 구독 신청\n\n- 이메일: ${email}\n- 구독 항목: ${items.join(
            ", "
        )}\n- 라벨: ${label}\n- 신청시각: ${now}\n\n(자동 생성된 요청 — 관리자가 승인하면 라벨을 'approved'로 변경해 주세요. GitHub Actions는 'approved' 라벨을 기준으로 발송합니다.)`;

        await createIssue(title, issueBody, [label]);

        return NextResponse.json(
            {
                message: "구독 요청이 정상적으로 접수되었습니다.",
            },
            { status: 201 }
        );
    } catch (err: unknown) {
        console.error("subscribe api error:", err);
        return NextResponse.json(
            { error: "서버 처리 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
