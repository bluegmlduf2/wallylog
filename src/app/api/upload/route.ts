import { NextRequest, NextResponse } from "next/server";
import { uploadImageToGitHub } from "@/lib/github";
import { isAuthenticated } from "@/lib/auth";

export async function POST(request: NextRequest) {
    if (!isAuthenticated(request)) {
        return NextResponse.json(
            { error: "인증이 필요합니다." },
            { status: 401 }
        );
    }

    try {
        const data = await request.formData();
        const file: File | null = data.get("image") as unknown as File;

        if (!file) {
            return NextResponse.json(
                { error: "파일이 업로드되지 않았습니다." },
                { status: 400 }
            );
        }

        // 파일 확장자 검증
        const validTypes = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/gif",
            "image/webp",
        ];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                {
                    error: "지원되지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 허용)",
                },
                { status: 400 }
            );
        }

        // 파일 크기 검증 (5MB 제한)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: "파일 크기가 너무 큽니다. (최대 5MB)" },
                { status: 400 }
            );
        }

        try {
            const result = await uploadImageToGitHub(file);

            return NextResponse.json({
                success: true,
                url: result.url,
                filename: result.filename,
                githubUrl: result.githubUrl,
            });
        } catch (error) {
            console.error("이미지 업로드 오류:", error);
            return NextResponse.json(
                {
                    error:
                        error instanceof Error
                            ? error.message
                            : "이미지 업로드 실패",
                },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error("이미지 업로드 처리 오류:", error);
        return NextResponse.json(
            { error: "이미지 업로드 중 오류가 발생했습니다." },
            { status: 500 }
        );
    }
}
