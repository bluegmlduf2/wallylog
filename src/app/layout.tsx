import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/Header";
import Script from "next/script";
import { Toaster } from "@/components/ui/sonner";
import "@/app/globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: {
        default: "WallyLog",
        template: "%s | WallyLog",
    },
    description: "개발 블로그 및 일상생활 기록을 위한 공간",
    keywords: [
        "Next.js",
        "React",
        "Vue.js",
        "CSS",
        "HTML",
        "Javascript",
        "TypeScript",
        "Tailwind CSS",
        "Lalavel",
        "일본생활",
        "블로그",
        "개발",
    ],
    authors: [{ name: "Wally" }],
    creator: "WallyLog",
    publisher: "WallyLog",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL(
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    ),
    alternates: {
        canonical: "/",
    },
    // 아이콘 설정
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
            { url: "/favicon.svg", sizes: "any", type: "image/svg+xml" },
            { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
            { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
        ],
        apple: [
            {
                url: "/apple-touch-icon.svg",
                sizes: "180x180",
                type: "image/svg+xml",
            },
        ],
        other: [
            {
                rel: "mask-icon",
                url: "/favicon.svg",
                color: "#3B82F6",
            },
        ],
    },
    // PWA 설정
    manifest: "/manifest.json",
    openGraph: {
        type: "website",
        locale: "ko_KR",
        url: "/",
        title: "WallyLog",
        description: "개발 블로그 및 일상생활 기록을 위한 공간",
        siteName: "WallyLog",
    },
    twitter: {
        card: "summary_large_image",
        title: "WallyLog",
        description: "개발 블로그 및 일상생활 기록을 위한 공간",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // 서버 사이드에서 쿠키를 읽어 사용자의 로케일을 결정합니다 (기본: ko).
    const store = await cookies();
    const locale = store.get("NEXT_LOCALE")?.value || "ko";
    return (
        <html lang={locale}>
            <head>
                {/* RSS Feed */}
                <link
                    rel="alternate"
                    type="application/rss+xml"
                    title="WallyLog RSS Feed"
                    href="/feed"
                />
                {/* 브라우저별 최적화 */}
                <meta name="msapplication-TileColor" content="#3B82F6" />
                <meta
                    name="msapplication-config"
                    content="/browserconfig.xml"
                />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="default"
                />
                <meta name="apple-mobile-web-app-title" content="WallyLog" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#3B82F6" />
                {/* 리캡챠 v3*/}
                <Script
                    src={`https://www.google.com/recaptcha/api.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`}
                    strategy="afterInteractive"
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <NextIntlClientProvider>
                    <div className="min-h-screen bg-gray-50">
                        <Header />
                        {children}
                        <Toaster position="top-center" richColors />
                    </div>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
