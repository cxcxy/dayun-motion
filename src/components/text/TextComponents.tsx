// 文字组件：逐字砸字、字幕胶囊、错位标题
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BurstTicks, CaptionPill, SlamText, Sfx } from "../../kit/fx";
import { FONT, LATIN, MONO } from "../../kit/fonts";
import { prog } from "../../kit/motion";
import { C as BP, TitleLine } from "../opening/Overflow";

// ——— 逐字砸字 ———
export type SlamTitleProps = {
  text: string;
  accent?: string;
  /** 圆体粗字（适合英文 / 数字） */
  rounded?: boolean;
  bg: string;
  color: string;
  accentColor: string;
  stagger?: number;
};
export const slamTitleDefaults: SlamTitleProps = {
  text: "一句话砸进画面",
  accent: "砸进",
  rounded: false,
  bg: "#ece8fb",
  color: "#2b2366",
  accentColor: "#ff6f4f",
  stagger: 2,
};
export const SlamTitle: React.FC<SlamTitleProps> = ({ text, accent, rounded, bg, color, accentColor, stagger = 2 }) => {
  const f = useCurrentFrame();
  const n = Math.max(1, Array.from(text).length);
  const size = Math.min(rounded ? 240 : 170, Math.floor(1600 / n));
  const half = (n * size) / 2;
  return (
    <AbsoluteFill style={{ background: bg, justifyContent: "center", fontFamily: FONT }}>
      <SlamText
        at={8}
        text={text}
        size={size}
        color={color}
        accent={accent ? { chars: accent, color: accentColor } : undefined}
        stagger={stagger}
        font={rounded ? LATIN : FONT}
        weight={rounded ? 900 : 600}
      />
      <BurstTicks at={8 + n * stagger} x={960 - half - 60} y={540} r={60} color={accentColor} count={7} rot={2.2} len={44} />
      <BurstTicks at={10 + n * stagger} x={960 + half + 60} y={540} r={60} color={accentColor} count={7} rot={-0.6} len={44} />
      {f >= 0 && <Sfx at={8} src="hit_2.wav" vol={0.9} />}
    </AbsoluteFill>
  );
};

// ——— 字幕胶囊 ———
export type CaptionStyle = "dark" | "light" | "comic" | "blueprint";
export type CaptionsProps = {
  items: { text: string; accent?: string }[];
  look: CaptionStyle;
};
export const captionsDefaults: CaptionsProps = {
  items: [
    { text: "一次只出现一条字幕", accent: "一条" },
    { text: "切换时旧的上浮、新的弹入", accent: "弹入" },
    { text: "关键词自动换颜色", accent: "关键词" },
  ],
  look: "dark",
};
const LOOKS: Record<CaptionStyle, { page: string; bg: string; fg: string; accent: string; box?: React.CSSProperties }> = {
  dark: { page: "#ece8fb", bg: "#2b2366", fg: "#fff", accent: "#ffc0ab" },
  light: { page: "#0d4aa8", bg: "#ffffff", fg: "#0d4aa8", accent: "#f06a00", box: { borderRadius: 4 } },
  comic: {
    page: "#ffd60a",
    bg: "#ffffff",
    fg: "#111",
    accent: "#ff3b2f",
    box: { border: "6px solid #111", borderRadius: 6, boxShadow: "8px 8px 0 #111", transform: "rotate(-1.5deg)" },
  },
  blueprint: { page: "#0d4aa8", bg: "rgba(255,255,255,0.08)", fg: "#fff", accent: "#ff8a2a", box: { border: "2px solid #ffffffaa", borderRadius: 4, fontFamily: MONO } },
};
export const Captions: React.FC<CaptionsProps> = ({ items, look }) => {
  const L = LOOKS[look] ?? LOOKS.dark;
  const step = Math.floor(140 / Math.max(1, items.length));
  return (
    <AbsoluteFill style={{ background: L.page, fontFamily: FONT }}>
      <CaptionPill
        y={480}
        size={56}
        bg={L.bg}
        fg={L.fg}
        accent={L.accent}
        boxStyle={L.box}
        items={items.map((c, i) => ({ ...c, at: 6 + i * step, until: i === items.length - 1 ? 150 : undefined }))}
      />
      {items.map((_, i) => (
        <Sfx key={i} at={6 + i * step} src={`pop_${(i % 4) + 1}.wav`} vol={0.5} />
      ))}
    </AbsoluteFill>
  );
};

// ——— 错位标题（蓝图） ———
export type GlitchTitleProps = { tag: string; lines: [string, string]; glitchChar: string };
export const glitchTitleDefaults: GlitchTitleProps = { tag: "SYSTEM ERROR", lines: ["这个字", "正在错位"], glitchChar: "错" };
export const GlitchTitle: React.FC<GlitchTitleProps> = ({ tag, lines, glitchChar }) => {
  const f = useCurrentFrame();
  const split = (l: string) => {
    const k = glitchChar ? l.indexOf(glitchChar) : -1;
    return k < 0 ? { pre: l, ch: "", post: "" } : { pre: l.slice(0, k), ch: glitchChar, post: l.slice(k + glitchChar.length) };
  };
  const inL2 = lines[1].includes(glitchChar);
  const L1 = inL2 ? { pre: lines[0], ch: "", post: "" } : split(lines[0]);
  const L2 = inL2 ? split(lines[1]) : { pre: lines[1], ch: "", post: "" };
  const size = Math.min(150, Math.floor(1500 / Math.max(...lines.map((l) => Array.from(l).length), 1)));
  return (
    <AbsoluteFill
      style={{
        background: BP.bg,
        backgroundImage:
          "linear-gradient(#ffffff2e 2px, transparent 2px), linear-gradient(90deg, #ffffff2e 2px, transparent 2px), linear-gradient(#ffffff12 1px, transparent 1px), linear-gradient(90deg, #ffffff12 1px, transparent 1px)",
        backgroundSize: "200px 200px, 200px 200px, 40px 40px, 40px 40px",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: FONT,
      }}
    >
      <div>
        <div style={{ fontFamily: MONO, fontSize: 32, color: "#fff", letterSpacing: 6, marginBottom: 18, opacity: prog(f, 18, 6) }}>{tag}</div>
        <TitleLine at={8} parts={L1} size={size} />
        <TitleLine at={16} parts={L2} size={size} />
      </div>
      <Sfx at={8} src="hit_1.wav" vol={0.9} />
      <Sfx at={22} src="error_004.wav" vol={0.6} />
    </AbsoluteFill>
  );
};
