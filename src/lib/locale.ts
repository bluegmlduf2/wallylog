export type Locale = "ko" | "en" | "ja";
export type LocaleArray = ["ko", "en", "ja"];
export type FLAGS = Record<Locale, { emoji: string; label: string }>;
