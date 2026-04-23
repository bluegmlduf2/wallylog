"use client";

import { useState, useMemo, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "@/context/LocaleContext";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
    Calendar as CalendarIcon,
    ChevronDownIcon,
    ChevronLeft,
    ChevronRight,
    Baby,
    CloudRain,
    Zap,
    Info,
} from "lucide-react";

interface LeapData {
    number: number;
    fussyWeek: number; // 폭풍(보채기) 시작 주차
    leapWeek: number; // 도약(맑은 시기) 시작 주차
    name: { ko: string; en: string; ja: string };
    description: { ko: string; en: string; ja: string };
    summary: { ko: string; en: string; ja: string };
    skills: { ko: string[]; en: string[]; ja: string[] };
    signs: { ko: string[]; en: string[]; ja: string[] };
    strategy: { ko: string; en: string; ja: string };
}

const LEAPS: LeapData[] = [
    {
        number: 1,
        fussyWeek: 5,
        leapWeek: 6,
        name: {
            ko: "감각의 세계",
            en: "World of Sensations",
            ja: "感覚の世界",
        },
        description: {
            ko: "더욱 또렷한 감각으로 세상을 새롭게 인식하기 시작합니다.",
            en: "Baby begins experiencing sharper senses and perceives the world in a whole new way.",
            ja: "より鮮明な感覚で世界を新たに認識し始めます。",
        },
        skills: {
            ko: [
                "밝은 빛과 색상을 더 잘 인지",
                "소리에 더 민감하게 반응",
                "시선을 움직이는 물체에 고정",
            ],
            en: [
                "Better recognition of lights and colors",
                "More sensitive to sounds",
                "Tracks moving objects with eyes",
            ],
            ja: [
                "明るい光と色をより認識",
                "音により敏感に反応",
                "動く物体を目で追う",
            ],
        },
        signs: {
            ko: ["울음 증가", "감각 과민 반응", "클러스터 수유"],
            en: [
                "Increased crying",
                "Sensory oversensitivity",
                "Cluster feeding",
            ],
            ja: ["泣きが増加", "感覚過敏", "クラスター授乳"],
        },
        summary: {
            ko: "감각의 변화: 오감이 발달하여 외부 자극을 예민하게 느끼기 시작함",
            en: "Sensory Change: Senses develop; baby becomes more sensitive to external stimuli",
            ja: "感覚の変化：五感が発達し、外部刺激に敏感になり始める",
        },
        strategy: {
            ko: "전환을 짧고 같은 절차로",
            en: "Keep transitions short and consistent",
            ja: "移行は短く同じ手順で",
        },
    },
    {
        number: 2,
        fussyWeek: 8,
        leapWeek: 10,
        name: {
            ko: "패턴의 세계",
            en: "World of Patterns",
            ja: "パターンの世界",
        },
        description: {
            ko: "반복적인 패턴을 인식하고 규칙성을 이해하기 시작합니다.",
            en: "Baby starts recognizing repetitive patterns and understanding regularity.",
            ja: "繰り返しのパターンを認識し、規則性を理解し始めます。",
        },
        skills: {
            ko: [
                "반복적인 소리와 모양 인식",
                "첫 번째 진짜 미소",
                "눈으로 물체를 부드럽게 따라가기",
            ],
            en: [
                "Recognizes repetitive sounds and shapes",
                "First real smiles",
                "Smoothly follows objects with eyes",
            ],
            ja: [
                "繰り返しの音と形の認識",
                "初めての本当の笑顔",
                "目で物を滑らかに追う",
            ],
        },
        signs: {
            ko: ["손-시선 패턴 주시", "각성 창 변화"],
            en: ["Fixating hand-eye patterns", "Changes in awake windows"],
            ja: ["手と視線のパターンを注視", "覚醒ウィンドウの変化"],
        },
        summary: {
            ko: "패턴의 세계: 고정된 패턴을 인지하고 자신의 손발을 발견하여 관찰함",
            en: "World of Patterns: Recognizes fixed patterns and discovers their own hands and feet",
            ja: "パターンの世界：固定パターンを認識し、自分の手足を発見して観察する",
        },
        strategy: {
            ko: "낮은 강도의 반복 놀이",
            en: "Low-intensity repetitive play",
            ja: "低強度の繰り返し遊び",
        },
    },
    {
        number: 3,
        fussyWeek: 12,
        leapWeek: 13,
        name: {
            ko: "전이의 세계",
            en: "World of Smooth Transitions",
            ja: "移行の世界",
        },
        description: {
            ko: "부드러운 변화를 인지하고 몸의 움직임을 더 잘 조절합니다.",
            en: "Baby perceives smooth transitions and gains better control of body movements.",
            ja: "滑らかな移行を認識し、体の動きをより上手くコントロールします。",
        },
        skills: {
            ko: [
                "팔다리를 더 유연하게 움직임",
                "소리의 강약 구별",
                "물건 쥐고 잡는 동작 시작",
            ],
            en: [
                "Moves limbs more fluidly",
                "Distinguishes loud and soft sounds",
                "Begins grasping objects",
            ],
            ja: [
                "手足をより滑らかに動かす",
                "音の強弱を区別",
                "物をつかむ動作が始まる",
            ],
        },
        signs: {
            ko: ["장면 전환에 민감", "낮잠 패턴 흔들림"],
            en: ["Sensitive to scene changes", "Disrupted nap patterns"],
            ja: ["場面転換に敏感", "昼寝パターンの乱れ"],
        },
        summary: {
            ko: "부드러운 전이: 목 가누기 등 움직임이 부드러워지고 소리의 고저를 구분함",
            en: "Smooth Transitions: Movements become smoother; begins to distinguish high and low sounds",
            ja: "滑らかな移行：首がすわるなど動きが滑らかになり、音の高低を区別する",
        },
        strategy: {
            ko: "예고 → 실행 → 마무리 절차 고정",
            en: "Announce → Do → Finish routine",
            ja: "予告→実行→終了の手順を固定",
        },
    },
    {
        number: 4,
        fussyWeek: 15,
        leapWeek: 20,
        name: { ko: "사건의 세계", en: "World of Events", ja: "出来事の世界" },
        description: {
            ko: "원인과 결과를 이해하고 일련의 사건들을 인식합니다.",
            en: "Baby understands cause and effect and recognizes sequences of events.",
            ja: "原因と結果を理解し、一連の出来事を認識します。",
        },
        skills: {
            ko: [
                "원인과 결과 이해",
                "의도적으로 물건 떨어뜨리기",
                "발차기로 장난감 작동",
                "목소리로 의사소통 시도",
            ],
            en: [
                "Understanding cause and effect",
                "Intentionally dropping objects",
                "Kicking toys to activate them",
                "Attempting vocal communication",
            ],
            ja: [
                "因果関係の理解",
                "意図的に物を落とす",
                "足でおもちゃを動かす",
                "声でコミュニケーションを試みる",
            ],
        },
        signs: {
            ko: ["이벤트 추적 행동", "낮밤 패턴 변동"],
            en: ["Tracking sequences of events", "Day/night pattern shifts"],
            ja: ["出来事の追跡", "昼夜パターンの変動"],
        },
        summary: {
            ko: "주변 환경의 변화: 사건의 인과관계를 파악하며 본격적인 '잠퇴행'이 나타남",
            en: "World of Events: Understands cause and effect; sleep regression begins in earnest",
            ja: "出来事の世界：因果関係を把握し、本格的な「睡眠退行」が現れる",
        },
        strategy: {
            ko: "낮엔 탐색 늘리고, 저녁은 빛·소음 줄이기",
            en: "More exploration in day, dim/quiet evenings",
            ja: "昼は探索を増やし、夜は光と音を減らす",
        },
    },
    {
        number: 5,
        fussyWeek: 23,
        leapWeek: 27,
        name: {
            ko: "관계의 세계",
            en: "World of Relationships",
            ja: "関係の世界",
        },
        description: {
            ko: "공간적 관계와 물체들 사이의 관계를 이해하기 시작합니다.",
            en: "Baby begins understanding spatial relationships and connections between objects.",
            ja: "空間的な関係や物体同士の関係を理解し始めます。",
        },
        skills: {
            ko: [
                "안/밖, 위/아래 개념 이해",
                "도움 없이 앉기 시도",
                "목적을 가지고 물건 잡기",
                "낯선 사람 경계 시작",
            ],
            en: [
                "Understanding in/out, up/down",
                "Attempting to sit without support",
                "Grasping objects with purpose",
                "Beginning stranger anxiety",
            ],
            ja: [
                "中/外、上/下の概念を理解",
                "支えなしで座ろうとする",
                "目的を持って物をつかむ",
                "人見知りが始まる",
            ],
        },
        signs: {
            ko: ["분리 불안 전조", "사람 선호 증가"],
            en: [
                "Signs of separation anxiety",
                "Increased preference for familiar people",
            ],
            ja: ["分離不安の前兆", "人への好み増加"],
        },
        summary: {
            ko: "관계의 세계: 사물 간의 거리를 인식하고 부모와 떨어질 때 분리불안을 느낌",
            en: "World of Relationships: Perceives distances between objects; separation anxiety begins",
            ja: "関係の世界：物の間の距離を認識し、親と離れる際に分離不安を感じる",
        },
        strategy: {
            ko: "짧은 분리-재회 연습",
            en: "Short separation-reunion practice",
            ja: "短い分離と再会の練習",
        },
    },
    {
        number: 6,
        fussyWeek: 34,
        leapWeek: 38,
        name: {
            ko: "범주의 세계",
            en: "World of Categories",
            ja: "カテゴリーの世界",
        },
        description: {
            ko: "비슷한 것들을 그룹으로 묶어 이해하고 분류합니다.",
            en: "Baby can group similar things together and categorize their world.",
            ja: "似たものをグループにまとめて理解し、分類できるようになります。",
        },
        skills: {
            ko: [
                "비슷한 것들을 같은 종류로 이해",
                "손 흔들기, 박수치기",
                "가구 잡고 서기",
                "간단한 게임 이해",
            ],
            en: [
                "Groups similar things as same category",
                "Waves bye-bye, claps hands",
                "Pulls to stand on furniture",
                "Understands simple games",
            ],
            ja: [
                "似たものを同じ種類として理解",
                "バイバイ、手をたたく",
                "家具につかまって立つ",
                "簡単なゲームを理解",
            ],
        },
        signs: {
            ko: ["넣고-빼기 집착", "물건 분류 시도"],
            en: [
                "Obsessed with putting in and taking out",
                "Attempting to sort objects",
            ],
            ja: ["入れ出しへの執着", "物の分類を試みる"],
        },
        summary: {
            ko: "분류의 세계: 사물들의 공통점과 차이점을 구분하여 카테고리화함",
            en: "World of Categories: Distinguishes similarities and differences to categorize objects",
            ja: "カテゴリーの世界：物の共通点・相違点を区別してカテゴリー化する",
        },
        strategy: {
            ko: "기준은 한 번에 하나씩",
            en: "One sorting rule at a time",
            ja: "基準は一度に一つ",
        },
    },
    {
        number: 7,
        fussyWeek: 42,
        leapWeek: 47,
        name: {
            ko: "연속과 순서의 세계",
            en: "World of Sequences",
            ja: "連続と順序の世界",
        },
        description: {
            ko: "여러 단계로 이루어진 과정을 이해하고 따라할 수 있습니다.",
            en: "Baby understands and can follow multi-step processes.",
            ja: "複数のステップからなるプロセスを理解し、真似できるようになります。",
        },
        skills: {
            ko: [
                "물건 넣고 꺼내기 반복",
                "원하는 것 손가락으로 가리키기",
                "간단한 말 이해",
                "장난감 쌓기",
            ],
            en: [
                "Putting things in and out of containers",
                "Pointing to desired objects",
                "Understanding simple words",
                "Stacking toys",
            ],
            ja: [
                "物の出し入れを繰り返す",
                "欲しいものを指差す",
                "簡単な言葉を理解",
                "おもちゃを積み重ねる",
            ],
        },
        signs: {
            ko: ["멀티스텝 행동", "모방 증가"],
            en: ["Multi-step behaviors", "Increased imitation"],
            ja: ["マルチステップ行動", "模倣が増える"],
        },
        summary: {
            ko: "순서의 세계: 목표를 이루기 위한 일련의 순서와 과정(선후 관계)을 이해함",
            en: "World of Sequences: Understands sequences and processes needed to achieve goals",
            ja: "順序の世界：目標を達成するための一連の順序とプロセスを理解する",
        },
        strategy: {
            ko: "먼저-다음(First→Then) 언어 사용",
            en: "Use First→Then language",
            ja: "まず→次(First→Then)の言語を使う",
        },
    },
    {
        number: 8,
        fussyWeek: 51,
        leapWeek: 56,
        name: {
            ko: "프로그램의 세계",
            en: "World of Programs",
            ja: "プログラムの世界",
        },
        description: {
            ko: "일상적인 루틴과 복잡한 과정들을 이해하고 수행합니다.",
            en: "Baby understands and performs everyday routines and complex processes.",
            ja: "日常のルーティンや複雑なプロセスを理解し、実行します。",
        },
        skills: {
            ko: [
                "혼자 걷기 시도",
                "숟가락으로 먹기 시도",
                "옷 입기/벗기 흉내",
                "역할놀이 시작",
            ],
            en: [
                "Attempting to walk independently",
                "Trying to eat with a spoon",
                "Imitating dressing/undressing",
                "Beginning role play",
            ],
            ja: [
                "一人で歩こうとする",
                "スプーンで食べようとする",
                "着替えの真似",
                "ごっこ遊びが始まる",
            ],
        },
        signs: {
            ko: ["계획·수정 행동", "'내가!' 자율성 증가"],
            en: [
                "Planning and modifying behavior",
                "Rising 'Me do it!' autonomy",
            ],
            ja: ["計画・修正行動", "「自分で！」自律性の増加"],
        },
        summary: {
            ko: "프로그램의 세계: '만약 ~하면 ~된다'는 논리적인 행동과 결과를 연결함",
            en: "World of Programs: Connects logical actions and outcomes ('if... then...')",
            ja: "プログラムの世界：「もし〜すれば〜になる」という行動と結果を結びつける",
        },
        strategy: {
            ko: "실패 시 한 가지만 수정",
            en: "Change only one thing when failing",
            ja: "失敗時は一つだけ修正",
        },
    },
    {
        number: 9,
        fussyWeek: 60,
        leapWeek: 65,
        name: {
            ko: "원리의 세계",
            en: "World of Principles",
            ja: "原則の世界",
        },
        description: {
            ko: "규칙과 원리를 이해하고 적용하기 시작합니다.",
            en: "Baby begins understanding and applying rules and principles.",
            ja: "ルールや原則を理解し、適用し始めます。",
        },
        skills: {
            ko: [
                "경계 테스트하기",
                "물건을 모양/색으로 분류",
                "독립적인 놀이 증가",
                "두 단어 연결 시도",
            ],
            en: [
                "Testing rules and limits",
                "Sorting objects by shape/color",
                "Increased independent play",
                "Attempting two-word combinations",
            ],
            ja: [
                "ルールを試す",
                "形や色で物を分類",
                "一人遊びが増える",
                "2語をつなごうとする",
            ],
        },
        signs: {
            ko: ["비교·추론 행동", "규칙과 예외 실험"],
            en: ["Comparing and reasoning", "Testing rules and exceptions"],
            ja: ["比較・推論行動", "ルールと例外の実験"],
        },
        summary: {
            ko: "원칙의 세계: 자신의 의사를 전략적으로 표현하며 규칙과 원칙을 배우기 시작함",
            en: "World of Principles: Expresses intentions strategically; begins learning rules and principles",
            ja: "原則の世界：意思を戦略的に表現し、ルールと原則を学び始める",
        },
        strategy: {
            ko: "규칙 1문장, 예외 1개",
            en: "One rule, one exception",
            ja: "ルール1文、例外1つ",
        },
    },
    {
        number: 10,
        fussyWeek: 71,
        leapWeek: 76,
        name: { ko: "체계의 세계", en: "World of Systems", ja: "体系の世界" },
        description: {
            ko: "복잡한 체계를 이해하고 감정과 사회적 관계를 발달시킵니다.",
            en: "Baby understands complex systems and develops emotions and social relationships.",
            ja: "複雑な体系を理解し、感情と社会的関係を発達させます。",
        },
        skills: {
            ko: [
                "상상 놀이 발달",
                "공감 능력 발달",
                "첫 단어/짧은 문장 말하기",
                "다른 아이들과 놀기",
            ],
            en: [
                "Development of imaginative play",
                "Development of empathy",
                "Speaking first words/short sentences",
                "Playing with other children",
            ],
            ja: [
                "想像遊びの発達",
                "共感能力の発達",
                "初めての言葉/短い文を話す",
                "他の子どもと遊ぶ",
            ],
        },
        signs: {
            ko: ["규칙 결합", "역할놀이 심화"],
            en: ["Combining rules", "Deepening role play"],
            ja: ["ルールの組み合わせ", "ごっこ遊びの深化"],
        },
        summary: {
            ko: "체계의 세계: 자아 정체성이 형성되며 시스템과 도덕적 가치관의 기초가 생김",
            en: "World of Systems: Self-identity forms; foundation of systems and moral values emerges",
            ja: "体系の世界：自己アイデンティティが形成され、システムと道徳的価値観の基礎ができる",
        },
        strategy: {
            ko: "If/When-Then으로 체계화",
            en: "Systemize with If/When-Then",
            ja: "If/When-Thenで体系化",
        },
    },
];

function stormyEndWeek(leap: LeapData): number {
    return leap.leapWeek;
}

// stormy 기간의 날짜인지 반환
function getLeapForDate(
    birthDate: Date,
    date: Date,
): { leap: LeapData } | null {
    const daysSince =
        (date.getTime() - birthDate.getTime()) / (24 * 60 * 60 * 1000);
    if (daysSince < 0) return null;
    const w = daysSince / 7;

    for (const leap of LEAPS) {
        if (w >= leap.fussyWeek && w < stormyEndWeek(leap)) {
            return { leap };
        }
    }
    return null;
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

const DOW: Record<"ko" | "en" | "ja", string[]> = {
    ko: ["일", "월", "화", "수", "목", "금", "토"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ja: ["日", "月", "火", "水", "木", "金", "土"],
};

export default function WonderWeeksContainer() {
    const [babyName, setBabyName] = useState("");
    const [birthDate, setBirthDate] = useState<Date | null>(null);
    const [open, setOpen] = useState(false);
    const [calendarOffset, setCalendarOffset] = useState(0);
    const [showAbout, setShowAbout] = useState(false);
    const t = useTranslations();
    const { locale } = useLocale();

    const L = (locale as "ko" | "en" | "ja") || "ko";

    const tr = (obj: { ko: string; en: string; ja: string }) =>
        obj[L] ?? obj.ko;
    const trArr = (obj: { ko: string[]; en: string[]; ja: string[] }) =>
        obj[L] ?? obj.ko;

    // localStorage에서 불러오기
    useEffect(() => {
        const savedName = localStorage.getItem("wonderWeeks_babyName");
        const savedDate = localStorage.getItem("wonderWeeks_birthDate");
        if (savedName) setBabyName(savedName);
        if (savedDate) {
            const d = new Date(savedDate);
            if (!isNaN(d.getTime())) setBirthDate(d);
        }
    }, []);

    const handleNameChange = (name: string) => {
        setBabyName(name);
        localStorage.setItem("wonderWeeks_babyName", name);
    };

    const handleBirthDateChange = (date: Date | null) => {
        setBirthDate(date);
        setCalendarOffset(0);
        if (date)
            localStorage.setItem("wonderWeeks_birthDate", date.toISOString());
        else localStorage.removeItem("wonderWeeks_birthDate");
    };

    const weeks = useMemo(() => {
        if (!birthDate) return null;
        return (Date.now() - birthDate.getTime()) / (7 * 24 * 60 * 60 * 1000);
    }, [birthDate]);

    const stormyLeap = useMemo(() => {
        if (weeks === null) return null;
        return (
            LEAPS.find(
                (leap) =>
                    weeks >= leap.fussyWeek && weeks < stormyEndWeek(leap),
            ) ?? null
        );
    }, [weeks]);

    const referenceMonth = useMemo(() => {
        if (birthDate && weeks !== null && weeks < 0) {
            return new Date(birthDate.getFullYear(), birthDate.getMonth(), 1);
        }
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }, [birthDate, weeks]);

    const calendarData = useMemo(() => {
        const d = new Date(
            referenceMonth.getFullYear(),
            referenceMonth.getMonth() + calendarOffset,
            1,
        );
        const month = d.getMonth();
        const year = d.getFullYear();
        const startDate = new Date(year, month, 1 - d.getDay());
        return {
            firstDay: d,
            days: Array.from({ length: 42 }, (_, i) => {
                const date = new Date(startDate.getTime() + i * 86400000);
                return {
                    date,
                    isCurrentMonth: date.getMonth() === month,
                    isToday: isSameDay(date, new Date()),
                    isBirthDay: birthDate ? isSameDay(date, birthDate) : false,
                    leapInfo: birthDate
                        ? getLeapForDate(birthDate, date)
                        : null,
                };
            }),
        };
    }, [referenceMonth, birthDate, calendarOffset]);

    const totalWeeks = Math.floor(weeks ?? 0);
    const remainingDays = Math.floor(((weeks ?? 0) % 1) * 7);

    function weekRangeLabel(leap: LeapData) {
        const start = Math.round(leap.fussyWeek);
        const end = Math.ceil(stormyEndWeek(leap)) - 1;
        if (start === end) {
            if (L === "ko") return `${start}주차`;
            if (L === "ja") return `${start}週`;
            return `Wk ${start}`;
        }
        if (L === "ko") return `${start}~${end}주차`;
        if (L === "ja") return `${start}~${end}週`;
        return `Wk ${start}–${end}`;
    }

    return (
        <div className="min-h-screen bg-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8 inline-flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-4xl md:text-5xl text-purple-600 tracking-tight">
                            {t("wonderWeeks.title")}
                        </h1>
                        <button
                            onClick={() => setShowAbout((v) => !v)}
                            className={`p-1.5 rounded-full transition-colors ${showAbout ? "bg-purple-200 text-purple-700" : "bg-purple-100 text-purple-400 hover:bg-purple-200 hover:text-purple-600"}`}
                            aria-label="원더윅스란?"
                        >
                            <Info className="size-5" />
                        </button>
                    </div>
                    <div className="h-1.5 bg-gradient-to-r from-purple-600 to-pink-200 rounded-full" />
                </div>

                {/* 원더윅스 소개 (토글) */}
                {showAbout && (
                    <div className="mb-8 p-4 bg-purple-50 border border-purple-100 rounded-xl text-sm text-gray-600 leading-relaxed space-y-3">
                        <p className="font-semibold text-purple-700">
                            {t("wonderWeeks.description")}
                        </p>
                        <p>{t("wonderWeeks.about")}</p>
                        <div className="border-t border-purple-100 pt-3">
                            <div className="space-y-1.5">
                                {LEAPS.map((leap) => (
                                    <div
                                        key={leap.number}
                                        className="flex gap-2 text-xs"
                                    >
                                        <span className="text-purple-500 font-semibold shrink-0">
                                            {leap.number}
                                            {L === "ko"
                                                ? "회"
                                                : L === "ja"
                                                  ? "回"
                                                  : "th"}{" "}
                                            ({weekRangeLabel(leap)})
                                        </span>
                                        <span className="text-gray-500">
                                            {tr(leap.summary)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* 입력 영역: 아기 이름 + 출생일 */}
                <div className="mb-8 pb-4 border-b-2 border-gray-100 space-y-4">
                    {/* 아기 이름 */}
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                            <Baby className="size-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-gray-500 mb-1">
                                {t("wonderWeeks.babyName")}
                            </label>
                            <input
                                type="text"
                                value={babyName}
                                onChange={(e) =>
                                    handleNameChange(e.target.value)
                                }
                                placeholder={t(
                                    "wonderWeeks.babyNamePlaceholder",
                                )}
                                className="text-2xl font-medium text-gray-800 bg-transparent border-none outline-none w-full placeholder:text-gray-300"
                            />
                        </div>
                    </div>

                    {/* 출생일 */}
                    <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                            <CalendarIcon className="size-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm text-gray-500 mb-1">
                                {t("wonderWeeks.birthDate")}
                            </label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-fit justify-between text-2xl font-medium text-gray-800 border-none outline-none !bg-transparent !shadow-none !pl-0"
                                    >
                                        {birthDate
                                            ? birthDate.toLocaleDateString(
                                                  locale,
                                              )
                                            : t("wonderWeeks.selectDate")}
                                        <ChevronDownIcon />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                    className="w-auto overflow-hidden p-0"
                                    align="start"
                                >
                                    <Calendar
                                        mode="single"
                                        selected={birthDate ?? undefined}
                                        captionLayout="dropdown"
                                        onSelect={(date) => {
                                            handleBirthDateChange(date ?? null);
                                            setOpen(false);
                                        }}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>

                {/* 출생일 입력 후 콘텐츠 */}
                {weeks !== null && (
                    <>
                        {/* 현재 나이 / D-day */}
                        <div className="mb-6 flex items-center gap-2 px-4 py-3 bg-purple-50 rounded-xl flex-wrap">
                            <Baby className="size-5 text-purple-500 shrink-0" />
                            {babyName && (
                                <span className="font-semibold text-purple-700">
                                    {babyName}
                                </span>
                            )}
                            {weeks < 0 ? (
                                <>
                                    <span className="text-gray-500 text-sm">
                                        {L === "ko"
                                            ? "출생예정일까지"
                                            : L === "ja"
                                              ? "出産予定日まで"
                                              : "Until due date"}
                                    </span>
                                    <span className="text-xl font-bold text-purple-600 ml-auto">
                                        D-{Math.ceil(-weeks * 7)}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-gray-500 text-sm">
                                        {t("wonderWeeks.currentAge")}
                                    </span>
                                    <span className="text-xl font-bold text-purple-600 ml-auto">
                                        {totalWeeks}
                                        {t("wonderWeeks.weeks")} {remainingDays}
                                        {t("wonderWeeks.days")}
                                    </span>
                                </>
                            )}
                        </div>

                        {/* 원더윅스 배너 (폭풍 기간에만 표시) */}
                        {stormyLeap && (
                            <div className="mb-8 p-5 rounded-2xl border-2 bg-purple-50 border-purple-200">
                                <div className="flex items-start gap-3">
                                    <CloudRain className="size-7 text-purple-500 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-bold text-purple-600 mb-1">
                                            {t("wonderWeeks.stormy")}
                                        </p>
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {weekRangeLabel(stormyLeap)} —{" "}
                                            {tr(stormyLeap.name)}
                                        </h2>
                                        <p className="text-gray-600 text-sm mt-2">
                                            {tr(stormyLeap.description)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 달력 */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                    {t("wonderWeeks.calendar")}
                                </h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() =>
                                            setCalendarOffset((o) => o - 1)
                                        }
                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                    >
                                        <ChevronLeft className="size-4" />
                                    </button>
                                    <button
                                        onClick={() => setCalendarOffset(0)}
                                        className="px-2 py-1 text-xs rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                    >
                                        {L === "ko"
                                            ? "현재"
                                            : L === "ja"
                                              ? "現在"
                                              : "Today"}
                                    </button>
                                    <button
                                        onClick={() =>
                                            setCalendarOffset((o) => o + 1)
                                        }
                                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                    >
                                        <ChevronRight className="size-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div className="text-center text-sm font-semibold text-gray-700 mb-2">
                                    {calendarData.firstDay.toLocaleDateString(
                                        locale,
                                        { year: "numeric", month: "long" },
                                    )}
                                </div>
                                <div className="grid grid-cols-7 mb-1">
                                    {DOW[L].map((d) => (
                                        <div
                                            key={d}
                                            className="text-center text-xs font-medium text-gray-400 py-1"
                                        >
                                            {d}
                                        </div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-0.5">
                                    {calendarData.days.map(
                                        (
                                            {
                                                date,
                                                isCurrentMonth,
                                                isToday,
                                                isBirthDay,
                                                leapInfo,
                                            },
                                            i,
                                        ) => {
                                            const isStormy = leapInfo !== null;
                                            return (
                                                <div
                                                    key={i}
                                                    className={[
                                                        "relative min-h-[36px] p-1 rounded-lg border text-left",
                                                        isCurrentMonth
                                                            ? ""
                                                            : "opacity-30",
                                                        isStormy
                                                            ? "bg-red-100"
                                                            : "bg-white",
                                                        isToday
                                                            ? "ring-2 ring-purple-400 ring-offset-1 border-transparent"
                                                            : "border-gray-100",
                                                    ]
                                                        .filter(Boolean)
                                                        .join(" ")}
                                                >
                                                    <span
                                                        className={`text-xs font-medium leading-none ${isToday ? "text-purple-600 font-bold" : "text-gray-600"}`}
                                                    >
                                                        {date.getDate()}
                                                    </span>
                                                    {isBirthDay && (
                                                        <span className="absolute top-0.5 right-0.5 text-[9px]">
                                                            👶
                                                        </span>
                                                    )}
                                                    {isStormy && leapInfo && (
                                                        <span className="absolute bottom-0.5 right-0.5 text-[9px] font-bold rounded px-0.5 leading-tight bg-red-500 text-white">
                                                            {
                                                                leapInfo.leap
                                                                    .number
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
                                <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" />
                                {t("wonderWeeks.stormy")}
                            </div>
                        </div>

                        {/* 이번 주 발달 정보 카드 (폭풍 기간에만 표시) */}
                        {stormyLeap && weeks !== null && weeks >= 0 && (
                            <div className="mb-8 border border-gray-200 rounded-2xl overflow-hidden">
                                {/* 카드 헤더 */}
                                <div className="px-5 py-4 border-b border-gray-200 bg-purple-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                            {t("wonderWeeks.weeklyInfo")}
                                        </span>
                                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-500 text-white">
                                            {t("wonderWeeks.stormy")}
                                        </span>
                                    </div>
                                    <h2 className="text-lg font-bold text-purple-700">
                                        {weekRangeLabel(stormyLeap)} —{" "}
                                        {tr(stormyLeap.name)}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {tr(stormyLeap.description)}
                                    </p>
                                </div>

                                {/* 카드 본문 */}
                                <div className="p-5 grid gap-6 md:grid-cols-2">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <Zap className="size-4 text-yellow-500" />
                                            {t("wonderWeeks.newSkills")}
                                        </h4>
                                        <ul className="space-y-2">
                                            {trArr(stormyLeap.skills).map(
                                                (skill, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm text-gray-600 flex gap-2"
                                                    >
                                                        <span className="text-purple-400 shrink-0">
                                                            •
                                                        </span>
                                                        {skill}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            <CloudRain className="size-4 text-purple-500" />
                                            {t("wonderWeeks.stormySigns")}
                                        </h4>
                                        <ul className="space-y-2">
                                            {trArr(stormyLeap.signs).map(
                                                (sign, i) => (
                                                    <li
                                                        key={i}
                                                        className="text-sm text-gray-600 flex gap-2"
                                                    >
                                                        <span className="text-purple-400 shrink-0">
                                                            •
                                                        </span>
                                                        {sign}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 면책 조항 */}
                        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-gray-600 space-y-1">
                            <p>⚠️ {t("wonderWeeks.disclaimer")}</p>
                            <p className="text-xs text-gray-400">
                                {t("wonderWeeks.aboutDateNote")}
                            </p>
                        </div>
                    </>
                )}

                {/* 빈 상태 */}
                {!birthDate && (
                    <div className="text-center p-12 bg-white rounded-xl border border-gray-100">
                        <Baby className="size-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-400">
                            {t("wonderWeeks.enterBirthDate")}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
