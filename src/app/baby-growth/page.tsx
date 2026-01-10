import type { Metadata } from "next";
import BabyGrowthContainer from "@/components/BabyGrowthContainer";

export const metadata: Metadata = {
    title: "아기 성장 기록 (출생일 기준 안내)",
    description:
        "아기의 출생일을 기준으로 일 단위로 제공되는 성장 안내입니다. 제공 정보: 1) 아기에게 일어나는 변화, 2) 이 시기에 주의할 점, 3) 이렇게 해주면 좋아요, 4) 곧 다가올 변화, 5) 병원 신호.",
    openGraph: {
        title: "아기 성장 기록 (출생일 기준 안내)",
        description:
            "출생일을 기준으로 아기의 성장과 발달을 일 단위로 안내합니다. 각 날짜별로 변화, 주의사항, 권장 돌봄, 예측 변화, 병원 신호 등을 제공합니다.",
        type: "article",
        url: process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL + "/baby-growth"
            : "http://localhost:3000/baby-growth",
        locale: "ko_KR",
        tags: ["출생일", "육아", "아기", "성장", "발달"],
    },
    twitter: {
        card: "summary_large_image",
        title: "아기 성장 가이드 (출생일 기준)",
        description:
            "출생일 기준으로 아기의 변화와 주의사항, 권장 돌봄, 곧 다가올 변화 및 병원 신호를 안내합니다.",
    },
    keywords: ["아기 성장", "출생일", "육아", "발달 체크리스트", "병원 신호"],
    alternates: {
        canonical: process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL + "/baby-growth"
            : "http://localhost:3000/baby-growth",
    },
};

export default function BabyGrowthPage() {
    return <BabyGrowthContainer />; // 클라이언트 로직 컴포넌트 렌더링
}
