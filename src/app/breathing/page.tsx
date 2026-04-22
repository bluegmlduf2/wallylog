import type { Metadata } from "next";
import BreathingTimer from "@/components/BreathingTimer";

export const metadata: Metadata = {
    title: "명상 심호흡 타이머 (Meditation Breathing Timer)",
    description:
        "박스 호흡, 4-7-8, 5-5-5 등 다양한 호흡 패턴으로 마음을 고요하게 만들어주는 명상 심호흡 가이드 타이머입니다.",
    openGraph: {
        title: "명상 심호흡 타이머 — 마음을 고요하게",
        description:
            "박스 호흡, 4-7-8, 5-5-5 등 다양한 호흡 패턴을 안내하는 미니멀 명상 심호흡 타이머입니다.",
        type: "website",
        url: process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL + "/breathing"
            : "http://localhost:3000/breathing",
        locale: "ko_KR",
    },
    twitter: {
        card: "summary_large_image",
        title: "명상 심호흡 타이머 — 마음을 고요하게",
        description: "박스 호흡, 4-7-8, 5-5-5 등 호흡 패턴 가이드 타이머",
    },
    keywords: [
        "호흡 타이머",
        "박스 호흡",
        "4-7-8 호흡",
        "명상",
        "스트레스 해소",
        "breathing timer",
        "box breathing",
        "呼吸タイマー",
    ],
    alternates: {
        canonical: process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL + "/breathing"
            : "http://localhost:3000/breathing",
    },
};

export default function BreathingPage() {
    return <BreathingTimer />;
}
