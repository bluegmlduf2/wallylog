import { getAllPosts } from "@/lib/posts";
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const posts = getAllPosts();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const postUrls = posts.map((post) => {
        // 날짜 검증 및 fallback
        let lastModified: Date;
        try {
            const postDate = new Date(post.date);
            // 유효한 날짜인지 확인
            if (isNaN(postDate.getTime())) {
                throw new Error("Invalid date");
            }
            lastModified = postDate;
        } catch {
            // 날짜가 잘못된 경우 현재 날짜 사용
            console.warn(`Invalid date for post ${post.slug}: ${post.date}`);
            lastModified = new Date();
        }

        return {
            url: `${baseUrl}/posts/${post.slug}`,
            lastModified,
            changeFrequency: "weekly" as const,
            priority: 0.8,
        };
    });

    const staticUrls: MetadataRoute.Sitemap = [
        {
            url: `${baseUrl}/pattern`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
        },
        {
            url: `${baseUrl}/news`,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 0.6,
        },
    ];

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: "daily",
            priority: 1,
        },
        ...staticUrls,
        ...postUrls,
    ];
}
