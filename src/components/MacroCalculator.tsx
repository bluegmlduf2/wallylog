"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useLocale as useLocaleContext } from "@/context/LocaleContext";
import {
    calculateBMR,
    calculateTDEE,
    calculateExerciseCorrection,
    calculateMacros,
    activityFactors,
    fitnessLevelHeartRate,
    defaultMacroRatio,
    chickenBreastProtein,
} from "@/lib/macro-calculator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface MacroCalculatorState {
    gender: "male" | "female";
    age: string;
    height: string;
    weight: string;
    activityFactor: number;
    exerciseExperience: string;
    exerciseFrequency: string;
    fitnessLevel: string;
    carbRatio: number;
    proteinRatio: number;
    fatRatio: number;
    selectedTab: "decrease" | "maintain" | "bulk";
}

export default function MacroCalculator() {
    const { locale } = useLocaleContext();
    const t = useTranslations("macroCalculator");

    const [state, setState] = useState<MacroCalculatorState>({
        gender: "male",
        age: "30",
        height: "170",
        weight: "70",
        activityFactor: 1.375,
        exerciseExperience: "beginner",
        exerciseFrequency: "none",
        fitnessLevel: "average",
        carbRatio: defaultMacroRatio.carbs,
        proteinRatio: defaultMacroRatio.protein,
        fatRatio: defaultMacroRatio.fat,
        selectedTab: "decrease",
    });

    const [calculated, setCalculated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resultKey, setResultKey] = useState(0);

    const calculations = useMemo(() => {
        if (!calculated) return null;

        const bmr = calculateBMR(
            state.gender,
            parseFloat(state.weight) || 0,
            parseFloat(state.height) || 0,
            parseFloat(state.age) || 0,
        );
        const tdee = calculateTDEE(bmr, state.activityFactor);
        const exerciseCorrection = calculateExerciseCorrection(
            state.exerciseExperience,
            state.exerciseFrequency,
        );
        const totalMetabolism = Math.round(tdee * (1 + exerciseCorrection));

        let targetCalories = totalMetabolism;
        if (state.selectedTab === "decrease") {
            targetCalories = totalMetabolism - 500;
        } else if (state.selectedTab === "bulk") {
            targetCalories = totalMetabolism + 300;
        }

        const macros = calculateMacros(
            targetCalories,
            state.carbRatio,
            state.proteinRatio,
            state.fatRatio,
        );

        const chickenBreastCount =
            Math.round((macros.protein / chickenBreastProtein) * 10) / 10;

        return {
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            totalMetabolism,
            targetCalories: Math.round(targetCalories),
            macros,
            chickenBreastCount,
        };
    }, [state, calculated]);

    const handleCalculate = () => {
        setIsLoading(true);
        setCalculated(false);
        setTimeout(() => {
            setCalculated(true);
            setResultKey((prev) => prev + 1);
            setIsLoading(false);
        }, 650);
    };

    const handleRatioChange = (newCarbs: number) => {
        const remainingRatio = 100 - newCarbs;
        const proteinRatio = 30;
        const fatRatio = remainingRatio - proteinRatio;

        if (fatRatio >= 0) {
            setState((prev) => ({
                ...prev,
                carbRatio: newCarbs,
                proteinRatio,
                fatRatio,
            }));
        }
    };

    const activityOptions = Object.entries(
        activityFactors[locale as keyof typeof activityFactors] ||
            activityFactors.ko,
    ).map(([factor, label]) => ({
        value: parseFloat(factor),
        label,
    }));

    const experienceOptions = [
        { value: "beginner", label: t("experiences.beginner") },
        { value: "intermediate1", label: t("experiences.intermediate1") },
        { value: "intermediate2", label: t("experiences.intermediate2") },
        { value: "advanced", label: t("experiences.advanced") },
        { value: "expert", label: t("experiences.expert") },
    ];

    const frequencyOptions = [
        { value: "none", label: t("frequencies.none") },
        { value: "week1", label: t("frequencies.week1") },
        { value: "week2", label: t("frequencies.week2") },
        { value: "week3", label: t("frequencies.week3") },
        { value: "week4", label: t("frequencies.week4") },
        { value: "week5", label: t("frequencies.week5") },
        { value: "week6", label: t("frequencies.week6") },
        { value: "week7", label: t("frequencies.week7") },
    ];

    const fitnessOptions = [
        { value: "veryPoor", label: t("fitnessLevels.veryPoor") },
        { value: "poor", label: t("fitnessLevels.poor") },
        { value: "belowAverage", label: t("fitnessLevels.belowAverage") },
        { value: "average", label: t("fitnessLevels.average") },
        { value: "aboveAverage", label: t("fitnessLevels.aboveAverage") },
        { value: "good", label: t("fitnessLevels.good") },
        { value: "veryGood", label: t("fitnessLevels.veryGood") },
    ];

    const selectedFitnessData =
        fitnessLevelHeartRate[locale as keyof typeof fitnessLevelHeartRate]?.[
            state.fitnessLevel as keyof (typeof fitnessLevelHeartRate)[keyof typeof fitnessLevelHeartRate]
        ] ||
        fitnessLevelHeartRate.ko[
            state.fitnessLevel as keyof typeof fitnessLevelHeartRate.ko
        ];

    const labelClass =
        "block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5";
    const inputClass =
        "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-800 text-sm";
    const cardClass =
        "bg-white rounded-2xl border border-gray-100 shadow-sm p-7";

    return (
        <div className="w-full max-w-3xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {t("title")}
                </h1>
                <p className="text-sm text-gray-400">{t("description")}</p>
            </div>

            {/* 입력 카드 */}
            <div className={`${cardClass} mb-5`}>
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-6">
                    {t("inputs.title")}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* 성별 */}
                    <div>
                        <label className={labelClass}>
                            {t("inputs.gender")}
                        </label>
                        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
                            <button
                                onClick={() =>
                                    setState((prev) => ({
                                        ...prev,
                                        gender: "male",
                                    }))
                                }
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    state.gender === "male"
                                        ? "bg-white text-blue-600 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                {t("inputs.male")}
                            </button>
                            <button
                                onClick={() =>
                                    setState((prev) => ({
                                        ...prev,
                                        gender: "female",
                                    }))
                                }
                                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                                    state.gender === "female"
                                        ? "bg-white text-rose-500 shadow-sm"
                                        : "text-gray-400 hover:text-gray-600"
                                }`}
                            >
                                {t("inputs.female")}
                            </button>
                        </div>
                    </div>

                    {/* 나이 */}
                    <div>
                        <label className={labelClass}>{t("inputs.age")}</label>
                        <input
                            type="number"
                            value={state.age}
                            onFocus={() =>
                                setState((prev) => ({ ...prev, age: "" }))
                            }
                            onChange={(e) =>
                                setState((prev) => ({
                                    ...prev,
                                    age: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>

                    {/* 키 */}
                    <div>
                        <label className={labelClass}>
                            {t("inputs.height")}
                        </label>
                        <input
                            type="number"
                            value={state.height}
                            onFocus={() =>
                                setState((prev) => ({ ...prev, height: "" }))
                            }
                            onChange={(e) =>
                                setState((prev) => ({
                                    ...prev,
                                    height: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>

                    {/* 체중 */}
                    <div>
                        <label className={labelClass}>
                            {t("inputs.weight")}
                        </label>
                        <input
                            type="number"
                            value={state.weight}
                            onFocus={() =>
                                setState((prev) => ({ ...prev, weight: "" }))
                            }
                            onChange={(e) =>
                                setState((prev) => ({
                                    ...prev,
                                    weight: e.target.value,
                                }))
                            }
                            className={inputClass}
                        />
                    </div>

                    {/* 생활습관 */}
                    <div>
                        <label className={labelClass}>
                            {t("inputs.lifestyle")}
                        </label>
                        <Select
                            value={state.activityFactor.toString()}
                            onValueChange={(value) =>
                                setState((prev) => ({
                                    ...prev,
                                    activityFactor: parseFloat(value),
                                }))
                            }
                        >
                            <SelectTrigger className="rounded-xl border-gray-200 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {activityOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value.toString()}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 운동 구력 */}
                    <div>
                        <label className={labelClass}>
                            {t("inputs.experience")}
                        </label>
                        <Select
                            value={state.exerciseExperience}
                            onValueChange={(value) =>
                                setState((prev) => ({
                                    ...prev,
                                    exerciseExperience: value,
                                }))
                            }
                        >
                            <SelectTrigger className="rounded-xl border-gray-200 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {experienceOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 운동 횟수 */}
                    <div>
                        <label className={labelClass}>
                            {t("inputs.frequency")}
                        </label>
                        <Select
                            value={state.exerciseFrequency}
                            onValueChange={(value) =>
                                setState((prev) => ({
                                    ...prev,
                                    exerciseFrequency: value,
                                }))
                            }
                        >
                            <SelectTrigger className="rounded-xl border-gray-200 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {frequencyOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 체력 수준 */}
                    <div>
                        <label className={labelClass}>
                            {t("inputs.fitnessLevel")}
                        </label>
                        <Select
                            value={state.fitnessLevel}
                            onValueChange={(value) =>
                                setState((prev) => ({
                                    ...prev,
                                    fitnessLevel: value,
                                }))
                            }
                        >
                            <SelectTrigger className="rounded-xl border-gray-200 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {fitnessOptions.map((option) => (
                                    <SelectItem
                                        key={option.value}
                                        value={option.value}
                                    >
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* 계산하기 버튼 */}
                <div className="mt-8">
                    <button
                        onClick={handleCalculate}
                        disabled={isLoading}
                        className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 active:scale-[0.98] transition-all shadow-md hover:shadow-lg disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <svg
                                    className="animate-spin h-4 w-4 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                    />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                {t("buttons.calculating")}
                            </>
                        ) : (
                            t("buttons.calculate")
                        )}
                    </button>
                </div>
            </div>

            {/* 결과 — key 변경으로 재마운트 → 애니메이션 재실행 */}
            {calculations && (
                <div key={resultKey} className="space-y-4">
                    {/* 유지 칼로리 */}
                    <div className={`${cardClass} animate-result animate-result-1`}>
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">
                            {t("results.calorieInfo")}
                        </p>
                        <div className="grid grid-cols-3 divide-x divide-gray-100">
                            <div className="text-center pr-4">
                                <p className="text-xs text-gray-400 mb-1">
                                    {t("results.bmr")}
                                </p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {calculations.bmr}
                                </p>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    kcal
                                </p>
                            </div>
                            <div className="text-center px-4">
                                <p className="text-xs text-gray-400 mb-1">
                                    {t("results.tdee")}
                                </p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {calculations.tdee}
                                </p>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    kcal
                                </p>
                            </div>
                            <div className="text-center pl-4">
                                <p className="text-xs text-gray-400 mb-1">
                                    {t("results.totalWithExercise")}
                                </p>
                                <p className="text-2xl font-bold text-indigo-600">
                                    {calculations.totalMetabolism}
                                </p>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    kcal
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 권장 섭취량 */}
                    <div className={`${cardClass} animate-result animate-result-2`}>
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">
                            {t("results.recommendedIntake")}
                        </p>

                        <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl mb-6">
                            {[
                                {
                                    key: "decrease",
                                    label: t("tabs.decrease"),
                                },
                                { key: "maintain", label: t("tabs.maintain") },
                                { key: "bulk", label: t("tabs.bulk") },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() =>
                                        setState((prev) => ({
                                            ...prev,
                                            selectedTab: tab.key as
                                                | "decrease"
                                                | "maintain"
                                                | "bulk",
                                        }))
                                    }
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                                        state.selectedTab === tab.key
                                            ? "bg-white text-blue-600 shadow-sm"
                                            : "text-gray-400 hover:text-gray-600"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="text-center py-3">
                            <p className="text-xs text-gray-400 mb-3">
                                {state.selectedTab === "decrease"
                                    ? t("results.decreaseDescription")
                                    : state.selectedTab === "bulk"
                                      ? t("results.bulkDescription")
                                      : t("results.maintainDescription")}
                            </p>
                            <p className="text-6xl font-black text-gray-900 tracking-tight">
                                {calculations.targetCalories}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">kcal</p>
                        </div>
                    </div>

                    {/* 탄단지 비율 */}
                    <div className={`${cardClass} animate-result animate-result-3`}>
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">
                            {t("results.macroRatio")}
                        </p>

                        {/* 슬라이더 */}
                        <div className="mb-6">
                            <div className="flex justify-between text-xs text-gray-400 mb-2">
                                <span>← {t("labels.fat")}</span>
                                <span>{t("labels.carbs")} →</span>
                            </div>
                            <input
                                type="range"
                                min="20"
                                max="70"
                                step="1"
                                value={state.carbRatio}
                                onChange={(e) =>
                                    handleRatioChange(parseInt(e.target.value))
                                }
                                className="w-full h-2 bg-gradient-to-r from-amber-300 via-rose-300 to-sky-400 rounded-full appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs mt-2.5">
                                <span className="font-semibold text-amber-500">
                                    {t("labels.carbs")} {state.carbRatio}%
                                </span>
                                <span className="font-semibold text-rose-400">
                                    {t("labels.protein")} {state.proteinRatio}%
                                </span>
                                <span className="font-semibold text-yellow-500">
                                    {t("labels.fat")} {state.fatRatio}%
                                </span>
                            </div>
                        </div>

                        {/* 영양소 카드 */}
                        <div className="grid grid-cols-3 gap-3 mb-5">
                            {[
                                {
                                    label: t("labels.carbs"),
                                    value: calculations.macros.carbs,
                                    kcal: Math.round(
                                        calculations.macros.carbs * 4,
                                    ),
                                    color: "text-amber-500",
                                    bg: "bg-amber-50",
                                },
                                {
                                    label: t("labels.protein"),
                                    value: calculations.macros.protein,
                                    kcal: Math.round(
                                        calculations.macros.protein * 4,
                                    ),
                                    color: "text-rose-400",
                                    bg: "bg-rose-50",
                                },
                                {
                                    label: t("labels.fat"),
                                    value: calculations.macros.fat,
                                    kcal: Math.round(
                                        calculations.macros.fat * 9,
                                    ),
                                    color: "text-yellow-500",
                                    bg: "bg-yellow-50",
                                },
                            ].map((m) => (
                                <div
                                    key={m.label}
                                    className={`${m.bg} rounded-xl p-4 text-center`}
                                >
                                    <p className="text-xs text-gray-400 mb-1.5">
                                        {m.label}
                                    </p>
                                    <p
                                        className={`text-2xl font-bold ${m.color}`}
                                    >
                                        {m.value}
                                        <span className="text-sm font-normal ml-0.5">
                                            g
                                        </span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {m.kcal} kcal
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* 닭가슴살 */}
                        <div className="flex items-center gap-4 bg-gray-50 rounded-xl px-5 py-4">
                            <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                                <svg
                                    className="w-5 h-5 text-gray-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">
                                    {t("results.chickenBreastInfo")}
                                </p>
                                <p className="text-lg font-bold text-gray-800">
                                    {locale === "en"
                                        ? `≈ ${calculations.chickenBreastCount} portions`
                                        : locale === "ja"
                                          ? `約 ${calculations.chickenBreastCount}個`
                                          : `약 ${calculations.chickenBreastCount}개`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 권장 심박수 */}
                    <div className={`${cardClass} animate-result animate-result-4`}>
                        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest mb-5">
                            {t("results.recommendedHeartRate")}
                        </p>

                        <p className="text-sm text-gray-500 mb-2">
                            {selectedFitnessData?.name}
                        </p>
                        <p className="text-5xl font-black text-gray-900 tracking-tight mb-6">
                            {selectedFitnessData?.min}
                            <span className="text-2xl font-light text-gray-300 mx-2">
                                –
                            </span>
                            {selectedFitnessData?.max}
                            <span className="text-lg font-normal text-gray-400 ml-2">
                                bpm
                            </span>
                        </p>

                        {/* 심박수 바 */}
                        <div
                            className="relative h-6 rounded-full overflow-hidden"
                            style={{ background: "linear-gradient(to right, #bae6fd, #86efac, #fde047, #f87171)" }}
                        >
                            <div
                                className="absolute top-0 h-full bg-white/40 border-l-2 border-r-2 border-white"
                                style={{
                                    left: `${((selectedFitnessData?.min - 60) / 130) * 100}%`,
                                    width: `${((selectedFitnessData?.max - selectedFitnessData?.min) / 130) * 100}%`,
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-gray-300 mt-1.5 px-0.5">
                            <span>60</span>
                            <span>92</span>
                            <span>125</span>
                            <span>157</span>
                            <span>190</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
