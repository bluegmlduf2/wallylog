import type { Metadata } from "next";
import TriviaContainer from "@/components/TriviaContainer";

export const metadata: Metadata = {
    title: "잡지식 퀴즈",
    description: "AI가 매일 생성하는 잡지식 퀴즈 10문제를 풀어보세요.",
    openGraph: {
        title: "잡지식 퀴즈",
        description: "AI가 매일 생성하는 잡지식 퀴즈 10문제를 풀어보세요.",
        type: "article",
        url: process.env.NEXT_PUBLIC_SITE_URL
            ? process.env.NEXT_PUBLIC_SITE_URL + "/quiz"
            : "http://localhost:3000/quiz",
    },
    twitter: {
        card: "summary_large_image",
        title: "잡지식 퀴즈",
        description: "AI가 매일 생성하는 잡지식 퀴즈 10문제를 풀어보세요.",
    },
    keywords: ["퀴즈", "잡지식", "AI"],
};

export default function QuizPage() {
    return <TriviaContainer />;
}
