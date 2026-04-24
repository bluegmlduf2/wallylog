import type { Metadata } from "next";
import MacroCalculator from "@/components/MacroCalculator";

export const metadata: Metadata = {
    title: "칼로리 플래너 (Calorie Planner)",
    description:
        "기초대사량(BMR)과 활동 수준을 기반으로 하루 칼로리와 영양소를 계산해주는 칼로리 플래너입니다.",
    openGraph: {
        title: "칼로리 플래너 — 개인 맞춤형 영양 계획",
        description:
            "기초대사량, 운동량, 체력 수준을 고려하여 개인에게 맞는 하루 칼로리와 탄단지 비율을 계산합니다.",
        type: "website",
        url: process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL + "/calorie-planner"
            : "http://localhost:3000/calorie-planner",
        locale: "ko_KR",
    },
    twitter: {
        card: "summary_large_image",
        title: "칼로리 플래너 — 개인 맞춤형 영양 계획",
        description: "기초대사량과 활동 수준 기반 칼로리 및 영양소 계산",
    },
    keywords: [
        "칼로리 플래너",
        "칼로리 계산기",
        "탄단지 비율",
        "기초대사량",
        "TDEE",
        "칼로리 계산",
        "영양소",
        "다이어트",
        "운동",
        "calorie planner",
        "macro calculator",
        "BMR",
        "nutrition",
    ],
};

export default function CaloriePlannerPage() {
    return (
        <div className="min-h-screen bg-white py-12 px-4">
            <MacroCalculator />
        </div>
    );
}
