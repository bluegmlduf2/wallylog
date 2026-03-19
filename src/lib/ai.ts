import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

// 해당 모델들을 순차적으로 시도하면서 텍스트 생성
const MODELS = [
    "stepfun/step-3.5-flash:free",
    "nvidia/nemotron-3-super-120b-a12b:freee",
    "arcee-ai/trinity-large-preview:free",
    "z-ai/glm-4.5-air:free",
    "x-ai/grok-4.1-fast",
];

export async function generatePatternWithFallback(
    prompt: string,
    temperature = 0.7,
): Promise<{ text: string }> {
    for (const modelName of MODELS) {
        try {
            console.log(`🧠 Trying model: ${modelName}`);
            const result = await generateText({
                model: openrouter(modelName),
                prompt,
                temperature,
            });
            console.log(`✅ Success with ${modelName}`);
            return result;
        } catch (error) {
            console.error(
                error instanceof Error
                    ? `"모델명: "+${modelName + " 에러내용:" + error.message}`
                    : "AI 생성중 알 수 없는 오류 발생",
            );

            continue; // 다음 모델로 시도
        }
    }

    throw new Error("❌ All models failed to generate text.");
}
