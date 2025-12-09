"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const SUBSCRIPTION_OPTIONS = [
    { id: "english-pattern", label: "영어 패턴" },
    { id: "it-news", label: "IT 뉴스" },
];

export default function SubscribePage() {
    const [email, setEmail] = useState("");
    const [items, setItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };

    const validateEmail = (value: string) => {
        return /\S+@\S+\.\S+/.test(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);

        if (!validateEmail(email)) {
            setError("올바른 이메일 주소를 입력해주세요.");
            return;
        }

        if (items.length === 0) {
            setError("구독 항목을 하나 이상 선택해주세요.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("/api/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, items }),
            });

            const json = await response.json();
            if (!response.ok) {
                setError(
                    json?.error || "구독 요청 처리 중 오류가 발생했습니다."
                );
            } else {
                setMessage(
                    json?.message ||
                        "구독 요청이 접수되었습니다. 관리자 승인을 기다려주세요."
                );
                setEmail("");
                setItems([]);
            }
        } catch (err: unknown) {
            console.error(err);
            setError("네트워크 오류가 발생했습니다. 나중에 다시 시도해주세요.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-black to-gray-700 text-white">
                <div className="max-w-lg mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-white text-2xl font-bold">
                            이메일 구독 신청
                        </h1>
                    </div>
                    <p className="text-blue-100">
                        폼을 제출하면 관리자가 검토 후 GitHub Issue로 등록되며
                        <br />
                        승인 대기 상태가 됩니다. <br />
                        승인되면 매일 오전 9시에 자동으로 이메일이 발송됩니다.
                    </p>
                </div>
            </div>

            {/* Content */}
            <form
                className="max-w-lg md:max-w-xl mx-auto mt-4"
                onSubmit={handleSubmit}
            >
                <div className="px-6 pb-6">
                    <div className="overflow-hidden rounded-2xl shadow-2xl bg-white p-6">
                        {/* 이메일 입력 */}
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="email">이메일주소</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                            />
                        </div>
                        {/* 구독 항목 */}
                        <div className="mt-6">
                            <Label>구독 항목 (하나 이상 선택)</Label>
                            <div className="flex items-center gap-6 mt-3">
                                {SUBSCRIPTION_OPTIONS.map(({ id, label }) => (
                                    <div
                                        key={id}
                                        className="flex items-center gap-2"
                                    >
                                        <Checkbox
                                            id={id}
                                            checked={items.includes(id)}
                                            onCheckedChange={() =>
                                                toggleItem(id)
                                            }
                                        />
                                        <Label htmlFor={id}>{label}</Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        {/* 버튼 + 안내문구 */}
                        <div className="flex justify-between items-center mt-6">
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner /> : ""}
                                {loading ? "전송 중..." : "구독 신청"}
                            </Button>
                            <p className="text-muted-foreground text-sm">
                                ※ 같은 이메일은 연속 등록 불가
                            </p>
                        </div>
                        <div className="mt-4">
                            {message && (
                                <div className="mt-2 text-sm text-green-700">
                                    {message}
                                </div>
                            )}
                            {error && (
                                <div className="mt-2 text-sm text-red-700">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
