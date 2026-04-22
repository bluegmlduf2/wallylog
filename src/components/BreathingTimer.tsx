"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";

type Phase = "inhale" | "hold1" | "exhale" | "hold2";
type PatternKey = "box" | "478" | "555" | "custom";
type SessionMinutes = 5 | 10 | 0;

interface Pattern {
    inhale: number;
    hold1: number;
    exhale: number;
    hold2: number;
}

const PRESETS: Record<string, Pattern> = {
    box: { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
    "478": { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
    "555": { inhale: 5, hold1: 5, exhale: 5, hold2: 0 },
};

const PHASE_ORDER: Phase[] = ["inhale", "hold1", "exhale", "hold2"];

const PHASE_COLORS: Record<Phase, { color: string; glow: string }> = {
    inhale: { color: "#3B82F6", glow: "rgba(59, 130, 246, 0.22)" },
    hold1: { color: "#8B5CF6", glow: "rgba(139, 92, 246, 0.22)" },
    exhale: { color: "#10B981", glow: "rgba(16, 185, 129, 0.22)" },
    hold2: { color: "#6366F1", glow: "rgba(99, 102, 241, 0.22)" },
};

function getNextPhase(phase: Phase, pattern: Pattern): Phase {
    const idx = PHASE_ORDER.indexOf(phase);
    for (let i = 1; i <= 4; i++) {
        const next = PHASE_ORDER[(idx + i) % 4];
        if (pattern[next] > 0) return next;
    }
    return phase;
}

function getFirstPhase(pattern: Pattern): Phase {
    return (PHASE_ORDER.find((p) => pattern[p] > 0) as Phase) ?? "inhale";
}

function easeInOutSine(t: number): number {
    return (1 - Math.cos(t * Math.PI)) / 2;
}

export default function BreathingTimer() {
    const t = useTranslations("breathing");

    const PATTERN_LABEL: Record<PatternKey, string> = {
        box: t("box"),
        "478": t("p478"),
        "555": t("p555"),
        custom: t("custom"),
    };

    const PHASE_LABEL: Record<Phase, string> = {
        inhale: t("inhale"),
        hold1: t("hold1"),
        exhale: t("exhale"),
        hold2: t("hold2"),
    };

    const PHASE_INPUT_LABEL: Record<Phase, string> = {
        inhale: t("inhaleLabel"),
        hold1: t("hold1Label"),
        exhale: t("exhaleLabel"),
        hold2: t("hold2Label"),
    };

    const [patternKey, setPatternKey] = useState<PatternKey>("box");
    const [customPattern, setCustomPattern] = useState<Pattern>({
        inhale: 4,
        hold1: 4,
        exhale: 4,
        hold2: 0,
    });
    const [sessionDuration, setSessionDuration] = useState<SessionMinutes>(0);
    const [soundEnabled, setSoundEnabled] = useState(true);

    const [isRunning, setIsRunning] = useState(false);
    const [phase, setPhase] = useState<Phase>("inhale");
    const [countdown, setCountdown] = useState(4);
    const [laps, setLaps] = useState(0);
    const [sessionElapsed, setSessionElapsed] = useState(0);
    const [sessionEnded, setSessionEnded] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const orbRef = useRef<HTMLDivElement>(null);
    const glowRef = useRef<HTMLDivElement>(null);
    const animFrameRef = useRef<number>(0);
    const phaseStartMsRef = useRef<number>(0);
    const pauseStartMsRef = useRef<number>(0);
    const isRunningAnimRef = useRef(false);

    const phaseRef = useRef<Phase>("inhale");
    const patternKeyRef = useRef<PatternKey>("box");
    const customPatternRef = useRef<Pattern>({
        inhale: 4,
        hold1: 4,
        exhale: 4,
        hold2: 0,
    });
    const soundEnabledRef = useRef(true);
    const sessionDurationRef = useRef<SessionMinutes>(0);
    const sessionElapsedRef = useRef(0);
    const countdownRef = useRef(4);

    phaseRef.current = phase;
    patternKeyRef.current = patternKey;
    customPatternRef.current = customPattern;
    soundEnabledRef.current = soundEnabled;
    sessionDurationRef.current = sessionDuration;
    sessionElapsedRef.current = sessionElapsed;
    countdownRef.current = countdown;

    const getPattern = useCallback((): Pattern => {
        return patternKeyRef.current === "custom"
            ? customPatternRef.current
            : PRESETS[patternKeyRef.current];
    }, []);

    const audioCtxRef = useRef<AudioContext | null>(null);

    const playSound = useCallback((p: Phase) => {
        if (!soundEnabledRef.current) return;
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (
                    window.AudioContext ||
                    (
                        window as unknown as {
                            webkitAudioContext: typeof AudioContext;
                        }
                    ).webkitAudioContext
                )();
            }
            const ctx = audioCtxRef.current;
            if (ctx.state === "suspended") ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const freqs: Record<Phase, number> = {
                inhale: 528,
                hold1: 432,
                exhale: 384,
                hold2: 320,
            };

            osc.type = "sine";
            osc.frequency.value = freqs[p];
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.07, ctx.currentTime + 0.12);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.85);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.9);
        } catch {
            // Audio not available
        }
    }, []);

    const animateOrb = useCallback(() => {
        if (!isRunningAnimRef.current) return;

        const p = phaseRef.current;
        const pattern = getPattern();
        const durationMs = pattern[p] * 1000;
        const elapsed = Date.now() - phaseStartMsRef.current;
        const progress = easeInOutSine(Math.min(elapsed / durationMs, 1));

        const minScale = 0.38;
        const maxScale = 1.0;
        let scale: number;

        if (p === "inhale") {
            scale = minScale + (maxScale - minScale) * progress;
        } else if (p === "hold1") {
            scale = maxScale;
        } else if (p === "exhale") {
            scale = maxScale - (maxScale - minScale) * progress;
        } else {
            scale = minScale;
        }

        const { color, glow } = PHASE_COLORS[p];
        const glowIntensity = 0.35 + 0.45 * scale;

        if (orbRef.current) {
            orbRef.current.style.transform = `scale(${scale.toFixed(4)})`;
            orbRef.current.style.background = `radial-gradient(circle at 35% 35%, ${color}ee, ${color}55)`;
            orbRef.current.style.boxShadow = `0 0 ${Math.round(55 * scale)}px ${glow}, 0 0 ${Math.round(110 * scale)}px ${glow}`;
        }
        if (glowRef.current) {
            glowRef.current.style.opacity = `${glowIntensity.toFixed(3)}`;
            glowRef.current.style.background = `radial-gradient(circle, ${glow} 0%, transparent 65%)`;
        }

        animFrameRef.current = requestAnimationFrame(animateOrb);
    }, [getPattern]);

    const startAnim = useCallback(() => {
        phaseStartMsRef.current = Date.now();
        isRunningAnimRef.current = true;
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = requestAnimationFrame(animateOrb);
    }, [animateOrb]);

    const resetOrbDOM = useCallback((p: Phase) => {
        const { color, glow } = PHASE_COLORS[p];
        if (orbRef.current) {
            orbRef.current.style.transform = "scale(0.38)";
            orbRef.current.style.background = `radial-gradient(circle at 35% 35%, ${color}ee, ${color}55)`;
            orbRef.current.style.boxShadow = `0 0 20px ${glow}`;
        }
        if (glowRef.current) {
            glowRef.current.style.opacity = "0.3";
            glowRef.current.style.background = `radial-gradient(circle, ${glow} 0%, transparent 65%)`;
        }
    }, []);

    const tickRef = useRef<() => void>(() => {});
    tickRef.current = () => {
        const pattern = getPattern();
        const currentPhase = phaseRef.current;
        const currentCountdown = countdownRef.current;

        const newElapsed = sessionElapsedRef.current + 1;
        setSessionElapsed(newElapsed);

        if (
            sessionDurationRef.current > 0 &&
            newElapsed >= sessionDurationRef.current * 60
        ) {
            setIsRunning(false);
            isRunningAnimRef.current = false;
            cancelAnimationFrame(animFrameRef.current);
            setSessionEnded(true);
            return;
        }

        if (currentCountdown <= 1) {
            const nextPhase = getNextPhase(currentPhase, pattern);
            const isNewCycle =
                nextPhase === "inhale" && currentPhase !== "inhale";

            if (isNewCycle) setLaps((l) => l + 1);

            phaseRef.current = nextPhase;
            setPhase(nextPhase);
            setCountdown(pattern[nextPhase]);
            playSound(nextPhase);
            startAnim();
        } else {
            setCountdown((c) => c - 1);
        }
    };

    useEffect(() => {
        if (!isRunning) return;
        const id = setInterval(() => tickRef.current(), 1000);
        return () => clearInterval(id);
    }, [isRunning]);

    const handleStart = useCallback(() => {
        const pattern = getPattern();

        if (!hasStarted || sessionEnded) {
            const firstPhase = getFirstPhase(pattern);
            phaseRef.current = firstPhase;
            setPhase(firstPhase);
            setCountdown(pattern[firstPhase]);
            setLaps(0);
            setSessionElapsed(0);
            setSessionEnded(false);
            setHasStarted(true);
            playSound(firstPhase);
            startAnim();
        } else {
            const pauseDuration = Date.now() - pauseStartMsRef.current;
            phaseStartMsRef.current += pauseDuration;
            isRunningAnimRef.current = true;
            animFrameRef.current = requestAnimationFrame(animateOrb);
        }

        setIsRunning(true);
    }, [
        hasStarted,
        sessionEnded,
        getPattern,
        playSound,
        startAnim,
        animateOrb,
    ]);

    const handlePause = useCallback(() => {
        setIsRunning(false);
        isRunningAnimRef.current = false;
        cancelAnimationFrame(animFrameRef.current);
        pauseStartMsRef.current = Date.now();
    }, []);

    const handleReset = useCallback(() => {
        setIsRunning(false);
        isRunningAnimRef.current = false;
        cancelAnimationFrame(animFrameRef.current);

        const pattern = getPattern();
        const firstPhase = getFirstPhase(pattern);

        phaseRef.current = firstPhase;
        setPhase(firstPhase);
        setCountdown(pattern[firstPhase]);
        setLaps(0);
        setSessionElapsed(0);
        setSessionEnded(false);
        setHasStarted(false);

        resetOrbDOM(firstPhase);
    }, [getPattern, resetOrbDOM]);

    const handlePatternChange = useCallback(
        (key: PatternKey) => {
            if (isRunning) return;
            patternKeyRef.current = key;
            setPatternKey(key);

            isRunningAnimRef.current = false;
            cancelAnimationFrame(animFrameRef.current);

            const pattern =
                key === "custom" ? customPatternRef.current : PRESETS[key];
            const firstPhase = getFirstPhase(pattern);

            phaseRef.current = firstPhase;
            setPhase(firstPhase);
            setCountdown(pattern[firstPhase]);
            setLaps(0);
            setSessionElapsed(0);
            setSessionEnded(false);
            setHasStarted(false);

            resetOrbDOM(firstPhase);
        },
        [isRunning, resetOrbDOM],
    );

    useEffect(() => {
        return () => cancelAnimationFrame(animFrameRef.current);
    }, []);

    useEffect(() => {
        resetOrbDOM("inhale");
    }, [resetOrbDOM]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const pattern =
        patternKey === "custom" ? customPattern : PRESETS[patternKey];
    const phaseColor = PHASE_COLORS[phase];

    return (
        <div
            className="flex flex-col items-center justify-center px-4 py-6"
            style={{
                minHeight: "calc(100vh - 64px)",
                background: "linear-gradient(160deg, #f0f4ff 0%, #f8f5ff 100%)",
            }}
        >
            {/* Title */}
            <div className="text-center mb-5">
                <h1
                    className="text-3xl font-semibold uppercase"
                    style={{ letterSpacing: "0.18em", color: "#1e1b4b" }}
                >
                    {t("title")}
                </h1>
                <p className="font-normal mt-2 text-gray-500">
                    {t("subtitle")}
                </p>
            </div>

            {/* Orb — click to start/pause */}
            <div
                className="relative flex items-center justify-center mb-3 cursor-pointer"
                style={{ width: 300, height: 300 }}
                onClick={() => (isRunning ? handlePause() : handleStart())}
                role="button"
                aria-label={isRunning ? t("pause") : t("start")}
            >
                <div
                    ref={glowRef}
                    className="absolute inset-0 rounded-full"
                    style={{ opacity: 0.5 }}
                />
                <div
                    ref={orbRef}
                    className="absolute rounded-full"
                    style={{ width: 240, height: 240 }}
                />
            </div>

            {/* Phase text — below orb, fixed height to prevent layout shift */}
            <div
                className="flex flex-col items-center justify-start text-center select-none mb-6"
                style={{ height: 136 }}
            >
                {hasStarted && !sessionEnded ? (
                    <>
                        <div
                            className="text-xl font-semibold uppercase mb-2 transition-colors duration-700"
                            style={{
                                color: phaseColor.color,
                                letterSpacing: "0.25em",
                            }}
                        >
                            {PHASE_LABEL[phase]}
                        </div>
                        <div
                            className="text-8xl font-thin tabular-nums"
                            style={{ lineHeight: 1, color: "#1e1b4b" }}
                        >
                            {countdown}
                        </div>
                    </>
                ) : sessionEnded ? (
                    <div
                        className="text-xl font-medium"
                        style={{ color: "#059669" }}
                    >
                        {t("sessionEnd")}
                    </div>
                ) : (
                    <div className="text-base text-gray-400">{t("ready")}</div>
                )}
            </div>

            {/* Stats */}
            <div className="flex gap-12 mb-6">
                <div className="text-center">
                    <div
                        className="text-4xl font-thin tabular-nums"
                        style={{ color: "#1e1b4b" }}
                    >
                        {laps}
                    </div>
                    <div className="text-sm mt-1.5 text-gray-500">
                        {t("laps")}
                    </div>
                </div>
                {sessionDuration > 0 && (
                    <div className="text-center">
                        <div
                            className="text-4xl font-thin tabular-nums"
                            style={{ color: "#1e1b4b" }}
                        >
                            {formatTime(sessionElapsed)}
                        </div>
                        <div className="text-sm mt-1.5 text-gray-500">
                            {t("session")}
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex gap-4 mb-6">
                {!isRunning ? (
                    <button
                        onClick={handleStart}
                        className="px-10 py-3.5 rounded-full text-base font-medium text-white transition-all duration-300 shadow-lg"
                        style={{
                            letterSpacing: "0.1em",
                            background: phaseColor.color,
                            boxShadow: `0 8px 24px ${phaseColor.glow.replace("0.22", "0.45")}`,
                        }}
                    >
                        {t("start")}
                    </button>
                ) : (
                    <button
                        onClick={handlePause}
                        className="px-10 py-3.5 rounded-full text-base font-medium transition-all duration-300"
                        style={{
                            letterSpacing: "0.1em",
                            border: `2px solid ${phaseColor.color}`,
                            color: phaseColor.color,
                            background: `${phaseColor.color}0d`,
                        }}
                    >
                        {t("pause")}
                    </button>
                )}
                <button
                    onClick={handleReset}
                    className="px-8 py-3.5 rounded-full text-base font-light text-gray-500 transition-all duration-300 bg-white border border-gray-200 hover:border-gray-400 hover:text-gray-700"
                    style={{ letterSpacing: "0.1em" }}
                >
                    {t("reset")}
                </button>
            </div>

            {/* Pattern Selector */}
            <div className="flex gap-2 mt-2 mb-4 flex-wrap justify-center">
                {(["box", "478", "555", "custom"] as PatternKey[]).map(
                    (key) => (
                        <button
                            key={key}
                            onClick={() => handlePatternChange(key)}
                            disabled={isRunning}
                            className="px-5 py-2 rounded-full text-sm font-light transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
                            style={{
                                letterSpacing: "0.08em",
                                border: `1.5px solid ${patternKey === key ? phaseColor.color : "#d1d5db"}`,
                                color:
                                    patternKey === key
                                        ? phaseColor.color
                                        : "#6b7280",
                                background:
                                    patternKey === key
                                        ? `${phaseColor.color}14`
                                        : "white",
                            }}
                        >
                            {PATTERN_LABEL[key]}
                        </button>
                    ),
                )}
            </div>

            {/* Custom Pattern Inputs */}
            {patternKey === "custom" && (
                <div className="flex gap-4 mb-4 flex-wrap justify-center">
                    {(["inhale", "hold1", "exhale", "hold2"] as Phase[]).map(
                        (p) => (
                            <div
                                key={p}
                                className="flex flex-col items-center gap-2"
                            >
                                <label
                                    className="text-xs font-medium"
                                    style={{ color: PHASE_COLORS[p].color }}
                                >
                                    {PHASE_INPUT_LABEL[p]}
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={30}
                                    value={customPattern[p]}
                                    onChange={(e) =>
                                        setCustomPattern((prev) => ({
                                            ...prev,
                                            [p]: Math.max(
                                                0,
                                                Math.min(
                                                    30,
                                                    parseInt(e.target.value) ||
                                                        0,
                                                ),
                                            ),
                                        }))
                                    }
                                    disabled={isRunning}
                                    className="w-16 text-center rounded-lg py-2 text-gray-800 text-sm disabled:opacity-40 focus:outline-none bg-white"
                                    style={{ border: "1.5px solid #d1d5db" }}
                                />
                            </div>
                        ),
                    )}
                </div>
            )}

            {/* Settings */}
            <div className="flex gap-8 items-center flex-wrap justify-center mb-5">
                {/* Sound toggle */}
                <button
                    onClick={() => setSoundEnabled((prev) => !prev)}
                    className="text-sm flex items-center gap-2 transition-colors duration-200"
                    style={{ color: soundEnabled ? "#6366f1" : "#9ca3af" }}
                >
                    <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {soundEnabled ? (
                            <>
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                            </>
                        ) : (
                            <>
                                <path d="M11 5L6 9H2v6h4l5 4V5z" />
                                <line x1="23" y1="9" x2="17" y2="15" />
                                <line x1="17" y1="9" x2="23" y2="15" />
                            </>
                        )}
                    </svg>
                    <span>{soundEnabled ? t("soundOn") : t("soundOff")}</span>
                </button>

                {/* Session duration */}
                <div className="flex gap-2">
                    {([0, 5, 10] as SessionMinutes[]).map((dur) => (
                        <button
                            key={dur}
                            onClick={() => {
                                if (!isRunning) setSessionDuration(dur);
                            }}
                            disabled={isRunning}
                            className="text-sm px-4 py-1.5 rounded-full transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-white"
                            style={{
                                border: `1.5px solid ${sessionDuration === dur ? phaseColor.color : "#e5e7eb"}`,
                                color:
                                    sessionDuration === dur
                                        ? phaseColor.color
                                        : "#6b7280",
                                fontWeight: sessionDuration === dur ? 500 : 400,
                            }}
                        >
                            {dur === 0
                                ? t("unlimited")
                                : dur === 5
                                  ? t("min5")
                                  : t("min10")}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pattern info */}
            <div className="flex gap-5 text-sm">
                {PHASE_ORDER.filter((p) => pattern[p] > 0).map((p) => (
                    <span
                        key={p}
                        className="font-medium"
                        style={{ color: PHASE_COLORS[p].color }}
                    >
                        {PHASE_LABEL[p]} {pattern[p]}
                    </span>
                ))}
            </div>
        </div>
    );
}
