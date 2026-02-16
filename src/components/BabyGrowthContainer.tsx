"use client"; // 해당 페이지는 서버사이드 렌더링하지 않을 생각이다. 그렇기 때문에 바로 클라이언트 렌더링용 use client 선언

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/context/LocaleContext";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    Baby,
    AlertCircle,
    Heart,
    TrendingUp,
    Stethoscope,
    ChevronDownIcon,
} from "lucide-react";
import { TranslatedBabyInfo } from "@/app/api/generate-baby-growth/route";

export default function BabyGrowthContainer() {
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [ageInDays, setAgeInDays] = useState<number | null>(null);
    const [babyData, setBabyData] = useState<TranslatedBabyInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslations();
    const { locale: selectedLocale } = useLocale();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const fetchBabyData = async () => {
            try {
                const response = await fetch("/api/generate-baby-growth");
                if (!response.ok) {
                    throw new Error("Failed to fetch baby growth data");
                }
                const data = await response.json();
                setBabyData(data);
            } catch (error) {
                console.error("Error fetching baby data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBabyData();
    }, []);

    useEffect(() => {
        if (birthDate) {
            const birth = birthDate;
            const today = new Date();
            const diffTime = today.getTime() - birth.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            setAgeInDays(diffDays >= 0 ? diffDays : null);
        } else {
            setAgeInDays(null);
        }
    }, [birthDate]);

    const sections = babyData
        ? [
              {
                  title: t("babyGrowth.sections.changes"),
                  items: babyData[selectedLocale].changes,
                  icon: <Baby className="size-5" />,
                  color: "bg-blue-50 border-blue-200",
              },
              {
                  title: t("babyGrowth.sections.cautions"),
                  items: babyData[selectedLocale].cautions,
                  icon: <AlertCircle className="size-5" />,
                  color: "bg-amber-50 border-amber-200",
              },
              {
                  title: t("babyGrowth.sections.tips"),
                  items: babyData[selectedLocale].tips,
                  icon: <Heart className="size-5" />,
                  color: "bg-pink-50 border-pink-200",
              },
              {
                  title: t("babyGrowth.sections.upcoming"),
                  items: babyData[selectedLocale].upcoming,
                  icon: <TrendingUp className="size-5" />,
                  color: "bg-purple-50 border-purple-200",
              },
              {
                  title: t("babyGrowth.sections.hospitalSigns"),
                  items: babyData[selectedLocale].hospitalSigns,
                  icon: <Stethoscope className="size-5" />,
                  color: "bg-red-50 border-red-200",
              },
          ]
        : [];

    function formatAge(days: number): string {
        return `${days}${t("babyGrowth.days")}`;
    }

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header - Minimalist */}
                <div className="mb-5 md:mb-10 inline-block">
                    <h1 className="text-4xl md:text-6xl text-blue-600 mb-2 tracking-tight">
                        {t("babyGrowth.title")}
                    </h1>
                    <div className="h-1.5 bg-gradient-to-r from-blue-600 to-purple-100 rounded-full"></div>
                </div>

                {/* Controls - Inline Minimalist Design */}
                <div className="mb-6 md:mb-12 max-sm:space-y-6">
                    {/* Birth Date */}
                    <div className="md:grid gap-4 grid-cols-2">
                        <div className="flex items-center gap-6 pb-4 md:pb-6 border-b-2 border-gray-100 max-sm:mb-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                <CalendarIcon className="size-6 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm text-gray-500 mb-2">
                                    {t("babyGrowth.birthDate")}
                                </label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-fit justify-between text-2xl font-medium text-gray-800 border-none outline-none !bg-transparent !shadow-none !pl-0"
                                        >
                                            {birthDate
                                                ? birthDate.toLocaleDateString(
                                                      selectedLocale
                                                  )
                                                : t("babyGrowth.selectDate")}
                                            <ChevronDownIcon />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent
                                        className="w-auto overflow-hidden p-0"
                                        align="start"
                                    >
                                        <Calendar
                                            mode="single"
                                            selected={birthDate ?? undefined}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                setBirthDate(date ?? null);
                                                setOpen(false);
                                            }}
                                            disabled={{ after: new Date() }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    {/* Age Display - Minimalist */}
                    {ageInDays !== null &&
                        ageInDays >= 0 &&
                        ageInDays <= 30 && (
                            <div className="flex items-center gap-6 py-6 bg-gradient-to-r from-blue-50 to-indigo-50 -mx-4 px-10 rounded-2xl">
                                <Baby className="size-12 text-blue-600 shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 mb-1">
                                        {t("babyGrowth.babyAge")}
                                    </p>
                                    <p className="text-5xl font-black text-blue-600">
                                        {formatAge(ageInDays)}
                                    </p>
                                </div>
                            </div>
                        )}

                    {ageInDays !== null && ageInDays > 30 && (
                        <div className="flex items-center gap-4 py-4 px-6 bg-gray-50 rounded-2xl">
                            <AlertCircle className="size-6 text-gray-400" />
                            <p className="text-gray-600">
                                {selectedLocale === "ko" &&
                                    "30일 이후의 정보는 아직 제공되지 않습니다."}
                                {selectedLocale === "ja" &&
                                    "30日以降の情報はまだ提供されていません。"}
                                {selectedLocale === "en" &&
                                    "Information for after 30 days is not yet available."}
                            </p>
                        </div>
                    )}
                </div>

                {/* Baby Info Cards */}
                {!loading &&
                    babyData &&
                    ageInDays !== null &&
                    ageInDays <= 30 && (
                        <>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {sections.map((section, idx) => (
                                    <div
                                        key={idx}
                                        className={`rounded-lg border-2 p-4 ${section.color}`}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            {section.icon}
                                            <h3 className="font-semibold">
                                                {section.title}
                                            </h3>
                                        </div>
                                        <ul className="space-y-2">
                                            {section.items.map(
                                                (
                                                    item: any,
                                                    itemIdx: number
                                                ) => (
                                                    <li
                                                        key={itemIdx}
                                                        className="text-sm flex gap-2"
                                                    >
                                                        <span className="text-gray-600">
                                                            •
                                                        </span>
                                                        <span>{item}</span>
                                                    </li>
                                                )
                                            )}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Disclaimer moved to bottom */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 bg-yellow-100 border border-yellow-300 rounded-lg p-3 inline-block">
                                    ⚠️ {t("babyGrowth.disclaimer")}
                                </p>
                            </div>
                        </>
                    )}

                {!birthDate && (
                    <div className="text-center p-12 bg-white rounded-xl shadow-lg">
                        <CalendarIcon className="size-16 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">
                            {selectedLocale === "ko" &&
                                "아기의 출생일자를 입력해주세요"}
                            {selectedLocale === "ja" &&
                                "赤ちゃんの生年月日を入力してください"}
                            {selectedLocale === "en" &&
                                "Please enter your baby's birth date"}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
