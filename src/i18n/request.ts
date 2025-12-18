import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

// Use NEXT_LOCALE cookie which is the convention used by next-intl middleware
export default getRequestConfig(async () => {
    const store = await cookies();
    const locale = store.get("NEXT_LOCALE")?.value || "ko";

    return {
        locale,
        messages: (await import(`@/locales/${locale}.json`)).default,
    };
});
