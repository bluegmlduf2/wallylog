"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Locale, LocaleArray } from "@/lib/locale";

type LocaleContextType = {
    locale: Locale;
    setLocale: (
        loc: Locale,
        options?: { showToast?: boolean; doRefresh?: boolean }
    ) => void;
    availableLocales: LocaleArray;
};

// Context 사용법 정리 (생성,설정,사용 순이므로 3까지 있음)
// 1.Context 생성
const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// 2.Context 설정(Provider생성)
export const LocaleProvider = ({ children }: { children: ReactNode }) => {
    const router = useRouter();
    const availableLocales: LocaleArray = ["ko", "en", "ja"];
    const [locale, setLocaleState] = useState<Locale>("en");

    const setLocale = (
        newLocale: Locale,
        options?: { showToast?: boolean; doRefresh?: boolean }
    ) => {
        const { showToast = true, doRefresh = true } = options || {};
        document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
        setLocaleState(newLocale);
        if (doRefresh) router.refresh();
        if (showToast) {
            const localeMessages: Record<string, string> = {
                ko: `${newLocale.toUpperCase()}로 언어가 변경되었습니다`,
                en: `Language changed to ${newLocale.toUpperCase()}`,
                ja: `${newLocale.toUpperCase()}に言語が変更されました`,
            };
            toast.success(
                localeMessages[newLocale] ??
                    `${newLocale.toUpperCase()}로 언어가 변경되었습니다`
            );
        }
    };

    useEffect(() => {
        const match = document.cookie.match(/(?:^|; )NEXT_LOCALE=([^;]+)/);
        if (match) {
            const loc = match[1] as Locale;
            if (availableLocales.includes(loc)) {
                setLocale(loc, { showToast: false, doRefresh: false });
                return;
            }
        }
        const nav = (navigator.language || "").split("-")[0] as Locale | "en";
        if (nav && availableLocales.includes(nav))
            setLocale(nav, { showToast: false, doRefresh: false });
        else setLocale("en", { showToast: false, doRefresh: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2-1 Provider로 감싸진 자식 컴포넌트들에게 locale 상태와 설정 함수를 제공
    return (
        <LocaleContext.Provider value={{ locale, setLocale, availableLocales }}>
            {children}
        </LocaleContext.Provider>
    );
};

// 3.Context 사용 (1번에서 생성한 Context를 2번에서 설정하고 그 값을 사용)
export const useLocale = () => {
    const ctx = useContext(LocaleContext);
    if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
    return ctx;
};
