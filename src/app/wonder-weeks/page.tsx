import type { Metadata } from "next";
import WonderWeeksContainer from "@/components/WonderWeeksContainer";

export const metadata: Metadata = {
    title: "원더윅스 (Wonder Weeks)",
    description:
        "아기의 출생일을 입력하면 현재 어떤 발달 도약기인지 알 수 있습니다. 10가지 도약기의 폭풍 기간, 새로운 능력, 대처 팁을 확인하세요.",
    openGraph: {
        title: "원더윅스 - 아기 발달 도약기 가이드",
        description:
            "출생일 기준으로 아기의 발달 도약기(Wonder Weeks)를 확인하세요. 폭풍 기간과 새로 배우는 능력을 타임라인으로 한눈에 볼 수 있습니다.",
        type: "article",
        url: process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL + "/wonder-weeks"
            : "http://localhost:3000/wonder-weeks",
        locale: "ko_KR",
        tags: ["원더윅스", "육아", "아기", "발달", "도약기"],
    },
    twitter: {
        card: "summary_large_image",
        title: "원더윅스 - 아기 발달 도약기 가이드",
        description: "출생일 기준으로 아기의 발달 도약기를 확인하세요.",
    },
    keywords: ["원더윅스", "wonder weeks", "아기 발달", "도약기", "육아"],
    alternates: {
        canonical: process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL + "/wonder-weeks"
            : "http://localhost:3000/wonder-weeks",
    },
};

export default function WonderWeeksPage() {
    return <WonderWeeksContainer />;
}
