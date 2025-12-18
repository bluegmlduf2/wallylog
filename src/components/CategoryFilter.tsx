"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface CategoryFilterProps {
    categories: string[];
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
    postCounts?: Record<string, number>;
    isMobile?: boolean;
}

export default function CategoryFilter({
    categories,
    selectedCategory,
    onCategoryChange,
    postCounts,
    isMobile = false,
}: CategoryFilterProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const t = useTranslations();

    if (isMobile) {
        return (
            <div className="bg-white rounded-lg shadow-md mb-6 lg:hidden">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between"
                >
                    <h3 className="text-lg font-semibold text-gray-900">
                        {t("categories.view")}
                    </h3>
                    <svg
                        className={`w-5 h-5 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>

                {isExpanded && (
                    <div className="px-6 pb-6">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => onCategoryChange("all")}
                                className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                                    selectedCategory === "all"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                            >
                                {t("categories.all")}
                                {postCounts?.all && (
                                    <span className="ml-1 text-xs opacity-75">
                                        ({postCounts.all})
                                    </span>
                                )}
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    onClick={() => onCategoryChange(category)}
                                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
                                        selectedCategory === category
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {category}
                                    {postCounts?.[category] && (
                                        <span className="ml-1 text-xs opacity-75">
                                            ({postCounts[category]})
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // PC 버전 (사이드바용)
    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("categories.categories")}
            </h3>
            <div className="space-y-2">
                <button
                    onClick={() => onCategoryChange("all")}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        selectedCategory === "all"
                            ? "bg-blue-100 text-blue-800 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    <div className="flex justify-between items-center">
                        <span>{t("categories.all")}</span>
                        {postCounts?.all && (
                            <span className="text-xs opacity-75">
                                {postCounts.all}
                            </span>
                        )}
                    </div>
                </button>
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => onCategoryChange(category)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                            selectedCategory === category
                                ? "bg-blue-100 text-blue-800 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                        }`}
                    >
                        <div className="flex justify-between items-center">
                            <span>{category}</span>
                            {postCounts?.[category] && (
                                <span className="text-xs opacity-75">
                                    {postCounts[category]}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
