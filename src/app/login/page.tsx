import LoginForm from "@/components/LoginForm";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations();
    return {
        title: t("login.title"),
        description: t("login.description"),
    };
}

export default async function LoginPage() {
    const t = await getTranslations();

    return (
        <div className="max-w-md mx-auto px-4 py-16">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                    {t("login.heading")}
                </h1>
                <LoginForm />
            </div>
        </div>
    );
}
