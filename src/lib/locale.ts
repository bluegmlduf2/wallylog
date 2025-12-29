export type Locale = "ko" | "en" | "ja";
export type LocaleArray = ["ko", "en", "ja"];
export type Flags = Record<Locale, { emoji: string; label: string }>;
export type FlagsValue = { value: Locale; label: string };
