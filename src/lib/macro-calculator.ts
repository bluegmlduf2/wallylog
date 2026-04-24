// 기초대사량 계산 (Harris-Benedict 개정판 방정식, 1984)
export function calculateBMR(
    gender: "male" | "female",
    weight: number,
    height: number,
    age: number,
): number {
    if (gender === "male") {
        return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age;
    } else {
        return 447.593 + 9.247 * weight + 3.098 * height - 4.33 * age;
    }
}

// 활동 계수
export const activityFactors = {
    ko: {
        "1.2": "하루 대부분 누워 생활 (요양·회복)",
        "1.3": "소파에서 거의 안 움직임 (집콕)",
        "1.375": "주 1-3일 가볍게 운동함",
        "1.4": "하루 종일 앉아서 일함 (사무직·학생)",
        "1.55": "서서 일하거나 자주 이동 (서비스직)",
        "1.725": "몸을 많이 쓰는 직업 (배달·현장직)",
    },
    en: {
        "1.2": "Mostly in bed (recovering/resting)",
        "1.3": "Almost no movement (couch life)",
        "1.375": "Light exercise 1-3 days/week",
        "1.4": "Sitting all day (desk job / student)",
        "1.55": "On feet often (retail / service)",
        "1.725": "Physically demanding job (delivery / labor)",
    },
    ja: {
        "1.2": "ほぼ寝たきり生活 (療養・回復中)",
        "1.3": "ほとんど動かない (家でゴロゴロ)",
        "1.375": "週1-3日軽く運動する",
        "1.4": "座りっぱなし (デスクワーク・学生)",
        "1.55": "よく歩き回る仕事 (販売・サービス業)",
        "1.725": "体を使う仕事 (配達・現場作業)",
    },
};

// TDEE 계산 (활동계수 적용)
export function calculateTDEE(bmr: number, activityFactor: number): number {
    return bmr * activityFactor;
}

// 운동 보정 계수 계산 (구력 × 횟수 조합, 최대 +15%)
export function calculateExerciseCorrection(
    experience: string,
    frequency: string,
): number {
    const expLevel: Record<string, number> = {
        beginner: 0,
        intermediate1: 1,
        intermediate2: 2,
        advanced: 3,
        expert: 4,
    };
    const freqLevel: Record<string, number> = {
        none: 0,
        week1: 1,
        week2: 2,
        week3: 3,
        week4: 4,
        week5: 5,
        week6: 6,
        week7: 7,
    };

    const exp = expLevel[experience] ?? 0;
    const freq = freqLevel[frequency] ?? 0;

    return (exp / 4) * (freq / 7) * 0.15;
}

// 단백질 권장량 계산 (체중 기반)
export function calculateProteinRequirement(
    weight: number,
    exerciseExperience: string,
): number {
    // 운동 구력에 따른 단백질 배수 (g/kg)
    const proteinMultiplier: Record<string, number> = {
        beginner: 1.6,
        intermediate1: 1.8,
        intermediate2: 2.0,
        advanced: 2.2,
        expert: 2.2,
    };

    const multiplier = proteinMultiplier[exerciseExperience] || 1.6;
    return weight * multiplier;
}

// 체력 수준별 권장 심박수
export const fitnessLevelHeartRate = {
    ko: {
        veryPoor: { name: "계단 한 층도 숨참", min: 90, max: 100 },
        poor: { name: "빠르게 걸으면 숨참", min: 100, max: 110 },
        belowAverage: { name: "30분 걷기가 벅찬 수준", min: 110, max: 120 },
        average: { name: "5km 완주 가능", min: 120, max: 130 },
        aboveAverage: { name: "10km 완주 가능", min: 130, max: 140 },
        good: { name: "하프마라톤 완주 가능", min: 140, max: 150 },
        veryGood: { name: "풀마라톤 완주 가능", min: 150, max: 160 },
    },
    en: {
        veryPoor: { name: "Out of breath on 1 flight of stairs", min: 90, max: 100 },
        poor: { name: "Out of breath walking fast", min: 100, max: 110 },
        belowAverage: { name: "30-min walk is a challenge", min: 110, max: 120 },
        average: { name: "Can run 5km", min: 120, max: 130 },
        aboveAverage: { name: "Can run 10km", min: 130, max: 140 },
        good: { name: "Half marathon finisher", min: 140, max: 150 },
        veryGood: { name: "Full marathon finisher", min: 150, max: 160 },
    },
    ja: {
        veryPoor: { name: "階段1階分で息が上がる", min: 90, max: 100 },
        poor: { name: "早歩きで息が上がる", min: 100, max: 110 },
        belowAverage: { name: "30分歩くのがつらい", min: 110, max: 120 },
        average: { name: "5km完走できる", min: 120, max: 130 },
        aboveAverage: { name: "10km完走できる", min: 130, max: 140 },
        good: { name: "ハーフマラソン完走できる", min: 140, max: 150 },
        veryGood: { name: "フルマラソン完走できる", min: 150, max: 160 },
    },
};

// 탄단지 비율 계산
export function calculateMacros(
    calories: number,
    carbRatio: number,
    proteinRatio: number,
    fatRatio: number,
) {
    const carbs = (calories * carbRatio) / 100 / 4; // 1g = 4kcal
    const protein = (calories * proteinRatio) / 100 / 4; // 1g = 4kcal
    const fat = (calories * fatRatio) / 100 / 9; // 1g = 9kcal

    return {
        carbs: Math.round(carbs * 10) / 10,
        protein: Math.round(protein * 10) / 10,
        fat: Math.round(fat * 10) / 10,
    };
}

// 기본 탄단지 비율 (탄수화물:단백질:지방 = 5:3:2)
export const defaultMacroRatio = {
    carbs: 50,
    protein: 30,
    fat: 20,
};

// 닭가슴살 단백질 함량 (100g 기준 22.9g)
export const chickenBreastProtein = 22.9;
