import { ExternalLink, Newspaper } from "lucide-react";
import { NewsSource, Language } from "@/app/api/generate-news/route";

interface NewsCardProps {
    news: NewsSource;
    language: Language;
    index: number;
}

export default function NewsCard({ news, language, index }: NewsCardProps) {
    return (
        // <div>{JSON.stringify(news)}</div>
        <div className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
            {/* Background gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="z-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white">
                            <Newspaper className="w-5 h-5" />
                        </div>
                        <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">
                            #{index + 1}
                        </span>
                    </div>
                </div>

                {/* Title */}
                <h3 className="mb-4 text-gray-900 group-hover:text-blue-600 transition-colors">
                    {news.title[language]}
                </h3>

                {/* Summary */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                    {news.summary[language]}
                </p>

                {/* Footer */}
                <a
                    href={news.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-5 inline-flex items-center gap-2 text-blue-600 hover:gap-3 transition-all duration-300"
                >
                    <span>Read original article</span>
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}
