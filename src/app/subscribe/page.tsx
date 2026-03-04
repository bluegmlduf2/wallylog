"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

// options will be built inside component using translations

export default function SubscribePage() {
    const t = useTranslations("subscription");

    const [email, setEmail] = useState("");
    const [items, setItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const toggleItem = (id: string) => {
        setItems((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
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
            setError(t("errors.invalidEmail"));
            return;
        }

        if (items.length === 0) {
            setError(t("errors.noItems"));
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
                setError(json?.error || t("errors.server"));
            } else {
                setMessage(json?.message || t("messages.success"));
                setEmail("");
                setItems([]);
            }
        } catch (err: unknown) {
            console.error(err);
            setError(t("errors.network"));
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
                            {t("title")}
                        </h1>
                    </div>
                    <p className="text-blue-100 whitespace-pre-line">
                        {t("description")}
                    </p>
                    <p className="mt-2">
                        <a
                            href={
                                "https://github.com/bluegmlduf2/wallylog/issues"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-blue-200"
                        >
                            GitHub Issue Page
                        </a>
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
                            <Label htmlFor="email">{t("emailLabel")}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("emailPlaceholder")}
                            />
                        </div>
                        {/* 구독 항목 */}
                        <div className="mt-6">
                            <Label>{t("subscriptionItemsLabel")}</Label>
                            <div className="flex items-center gap-6 mt-3">
                                {[
                                    {
                                        id: "english-pattern",
                                        label: t("options.englishPattern"),
                                    },
                                    {
                                        id: "it-news",
                                        label: t("options.itNews"),
                                    },
                                ].map(({ id, label }) => (
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
                                {loading ? <Spinner /> : null}
                                {loading
                                    ? t("buttons.submitting")
                                    : t("buttons.submit")}
                            </Button>
                            <p className="text-muted-foreground text-sm">
                                {t("sameEmailNotice")}
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
