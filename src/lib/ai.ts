import { generateText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

// 해당 모델들을 순차적으로 시도하면서 텍스트 생성
const MODELS = [
    "google/gemma-4-26b-a4b-it:free", // 262K
    "nvidia/nemotron-3-ultra-550b-a55b:free", // 1M Context
    "nvidia/nemotron-3.5-super-vl:free", // 1M Context
    "nvidia/nemotron-3.5-lightning:free", // 1M Context
    "google/gemma-4-31b-it:free", // 262K
    "liquid/lfm-3-1.7b:free", // 262K
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", // 256K
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
