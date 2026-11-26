// 无描边瑞士卡片（Swiss Bento）共用原子：双色板令牌、三层漫射阴影卡片、瑞士顶栏、拉幕零闪切与单行字幕。
import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { FONT, LATIN, MONO } from "./fonts";
import { clamp, prog } from "./motion";

export type SwissTheme = "crimson" | "green";

export const SWISS_HEAVY = `"Source Han Sans SC Heavy", "PingFang SC", ${FONT}`;
export const SWISS_METRIC = `"League Gothic", "Archivo Black", "SF Compact Rounded", ${LATIN}`;

export const SWISS_BASE = {
  bg: "#EAECEF",
  studioRadial: "radial-gradient(circle at 50% 44%, #FFFFFF 0%, #EFF1F6 58%, #E4E7F0 100%)",
  ink: "#141417",
  muted: "#717682",
  mutedOnDark: "#9DA5B6",
  line: "#D4D7DD",
  cardSurf: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFD 100%)",
  darkSurf: "linear-gradient(165deg, #21242E 0%, #14161D 100%)",
} as const;

export const SWISS_SH = {
  hero: "0 6px 16px rgba(10, 12, 20, 0.10), 0 28px 64px -12px rgba(10, 12, 20, 0.28), 0 56px 110px -24px rgba(10, 12, 20, 0.34)",
  card: "0 2px 6px rgba(15, 18, 28, 0.04), 0 14px 34px -8px rgba(15, 18, 28, 0.09), 0 30px 64px -16px rgba(15, 18, 28, 0.06)",
  dark: "0 6px 16px rgba(10, 12, 20, 0.14), 0 24px 54px -12px rgba(10, 12, 20, 0.30), 0 42px 84px -20px rgba(10, 12, 20, 0.20)",
  pill: "0 2px 6px rgba(15, 18, 28, 0.06), 0 12px 26px -6px rgba(15, 18, 28, 0.10)",
  pillDark: "0 4px 12px rgba(10, 12, 20, 0.16), 0 16px 32px -8px rgba(10, 12, 20, 0.26)",
  window: "0 36px 86px -16px rgba(10, 12, 20, 0.38), 0 14px 34px -8px rgba(10, 12, 20, 0.20)",
  caption: "0 14px 34px -8px rgba(10, 12, 20, 0.28)",
} as const;

export type SwissPalette = {
  accent: string;
  accentSurf: string;
  accentOnDark: string;
  accentSoftOnDark: string;
  accentPale: string;
  tintLight: string;
  tintMid: string;
  tintDark: string;
  shCardActive: string;
  shDarkActive: string;
  shSolid: string;
  shPill: string;
};

const CRIMSON: SwissPalette = {
  accent: "#D53740",
  accentSurf: "linear-gradient(135deg, #E33E47 0%, #C62B34 100%)",
  accentOnDark: "#FF545E",
  accentSoftOnDark: "#FF8088",
  accentPale: "#FFE8EA",
  tintLight: "rgba(213, 55, 64, 0.10)",
  tintMid: "rgba(213, 55, 64, 0.18)",
  tintDark: "rgba(227, 62, 71, 0.16)",
  shCardActive: "0 4px 12px rgba(15, 18, 28, 0.05), 0 18px 42px -10px rgba(213, 55, 64, 0.16), 0 32px 68px -16px rgba(15, 18, 28, 0.08)",
  shDarkActive: "0 8px 20px rgba(10, 12, 20, 0.16), 0 26px 58px -12px rgba(10, 12, 20, 0.34), 0 38px 80px -18px rgba(213, 55, 64, 0.18)",
  shSolid: "0 6px 16px rgba(213, 55, 64, 0.22), 0 20px 44px -10px rgba(213, 55, 64, 0.32)",
  shPill: "0 4px 12px rgba(213, 55, 64, 0.24), 0 14px 30px -6px rgba(213, 55, 64, 0.32)",
};

const DAYUN_GREEN: SwissPalette = {
  accent: "#117C0D",
  accentSurf: "linear-gradient(135deg, #168F12 0%, #117C0D 100%)",
  accentOnDark: "#36C931",
  accentSoftOnDark: "#6AE365",
  accentPale: "#E2F7E0",
  tintLight: "rgba(17, 124, 13, 0.10)",
  tintMid: "rgba(17, 124, 13, 0.18)",
  tintDark: "rgba(22, 143, 18, 0.18)",
  shCardActive: "0 4px 12px rgba(15, 18, 28, 0.05), 0 18px 42px -10px rgba(17, 124, 13, 0.15), 0 32px 68px -16px rgba(15, 18, 28, 0.08)",
  shDarkActive: "0 8px 20px rgba(10, 12, 20, 0.16), 0 26px 58px -12px rgba(10, 12, 20, 0.34), 0 38px 80px -18px rgba(17, 124, 13, 0.18)",
  shSolid: "0 6px 16px rgba(17, 124, 13, 0.20), 0 20px 44px -10px rgba(17, 124, 13, 0.30)",
  shPill: "0 4px 12px rgba(17, 124, 13, 0.22), 0 14px 30px -6px rgba(17, 124, 13, 0.30)",
};

export const getSwissPalette = (theme: SwissTheme = "crimson"): SwissPalette =>
  theme === "green" ? DAYUN_GREEN : CRIMSON;

export const easeExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);
export const easeBack = Easing.bezier(0.22, 1.28, 0.36, 1);

/** 估算文本等效中文字符数，用于自动缩放字号防止溢出 */
export const cjkUnits = (s: string) =>
  Array.from(s).reduce((n, ch) => n + (/[\x00-\x7f]/.test(ch) ? 0.56 : 1), 0);

export const fitFont = (s: string, maxPx: number, maxWidthPx: number, minPx = 22) =>
  Math.max(minPx, Math.min(maxPx, Math.floor(maxWidthPx / Math.max(1, cjkUnits(s)))));

export const floatY = (f: number, phase = 0, amp = 3.5) => Math.sin((f / 30) * 2.1 + phase) * amp;

/** 浅色建筑工作台画布 + 36px 细点阵 */
export const StudioCanvas: React.FC<{ dots?: boolean; children?: React.ReactNode }> = ({ dots = true, children }) => (
  <AbsoluteFill style={{ background: SWISS_BASE.studioRadial, fontFamily: FONT, overflow: "hidden" }}>
    {dots && (
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(20, 20, 23, 0.075) 1.5px, transparent 1.5px)",
          backgroundSize: "36px 36px",
          opacity: 0.65,
          pointerEvents: "none",
        }}
      />
    )}
    {children}
  </AbsoluteFill>
);

/** 瑞士网格顶栏（严格对齐 x=110..1810，无描边胶囊状态标签） */
export const SwissHeaderBar: React.FC<{
  title: string;
  codeTag?: string;
  theme?: SwissTheme;
  enter?: number;
}> = ({ title, codeTag, theme = "crimson", enter = 1 }) => {
  const pal = getSwissPalette(theme);
  const titleFs = fitFont(title, 50, 1260, 32);
  return (
    <div
      style={{
        position: "absolute",
        left: 110,
        right: 110,
        top: 50,
        opacity: enter,
        transform: `translateX(${(1 - enter) * -28}px)`,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, minWidth: 0 }}>
          <div style={{ width: 10, height: 44, borderRadius: 999, background: pal.accentSurf, boxShadow: pal.shPill, flexShrink: 0 }} />
          <span
            style={{
              fontFamily: SWISS_HEAVY,
              fontWeight: 900,
              fontSize: titleFs,
              color: SWISS_BASE.ink,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>
        </div>
        {codeTag && (
          <span
            style={{
              padding: "8px 22px",
              borderRadius: 999,
              backgroundColor: pal.tintLight,
              fontFamily: MONO,
              fontSize: 22,
              fontWeight: 800,
              color: pal.accent,
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {codeTag}
          </span>
        )}
      </div>
      <div
        style={{
          height: 2,
          borderRadius: 2,
          background: "linear-gradient(90deg, rgba(20,20,23,0.18) 0%, rgba(20,20,23,0.04) 100%)",
          width: `${Math.max(0, Math.min(1, enter)) * 100}%`,
        }}
      />
    </div>
  );
};

/** 零外描边 · 纯三层漫射环境阴影 Bento 卡片 */
export const BentoCard: React.FC<{
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  variant?: "light" | "dark" | "accent";
  active?: boolean;
  theme?: SwissTheme;
  radius?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ x, y, w, h, variant = "light", active = false, theme = "crimson", radius = 24, style, children }) => {
  const pal = getSwissPalette(theme);
  const bg = variant === "accent" ? pal.accentSurf : variant === "dark" ? SWISS_BASE.darkSurf : SWISS_BASE.cardSurf;
  const sh =
    variant === "accent"
      ? pal.shSolid
      : variant === "dark"
        ? active
          ? pal.shDarkActive
          : SWISS_SH.dark
        : active
          ? pal.shCardActive
          : SWISS_SH.card;
  return (
    <div
      style={{
        position: x !== undefined || y !== undefined ? "absolute" : "relative",
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: radius,
        background: bg,
        color: variant === "light" ? SWISS_BASE.ink : "#FFFFFF",
        boxShadow: sh,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** 无描边胶囊标签 */
export const SwissTag: React.FC<{
  text: string;
  variant?: "light" | "dark" | "accent";
  theme?: SwissTheme;
  size?: number;
  style?: React.CSSProperties;
}> = ({ text, variant = "light", theme = "crimson", size = 26, style }) => {
  const pal = getSwissPalette(theme);
  const isAscii = /^[\x00-\x7F]+$/.test(text);
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: `${Math.round(size * 0.28)}px ${Math.round(size * 0.68)}px`,
        borderRadius: 14,
        background: variant === "accent" ? pal.accentSurf : variant === "dark" ? SWISS_BASE.darkSurf : SWISS_BASE.cardSurf,
        color: variant === "light" ? SWISS_BASE.ink : "#FFFFFF",
        boxShadow: variant === "accent" ? pal.shPill : variant === "dark" ? SWISS_SH.pillDark : SWISS_SH.pill,
        fontFamily: isAscii ? MONO : SWISS_HEAVY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

/** 柔和环境脉冲圆环 */
export const PulseRings: React.FC<{ cx: number; cy: number; r: number; f: number; color: string; rings?: number }> = ({
  cx,
  cy,
  r,
  f,
  color,
  rings = 2,
}) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "visible" }}>
    {Array.from({ length: rings }).map((_, i) => {
      const ph = (((f / 30) * 0.55 + i / rings) % 1 + 1) % 1;
      return (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r + ph * r * 0.58}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          opacity={(1 - ph) * 0.32}
        />
      );
    })}
  </svg>
);

/** 自下而上建筑拉幕转场 + 4px 主色前导亮线（零半透明叠化灰闪） */
export const CurtainStage: React.FC<{
  f: number;
  at: number;
  dur?: number;
  theme?: SwissTheme;
  children: React.ReactNode;
}> = ({ f, at, dur = 14, theme = "crimson", children }) => {
  if (f < at) return null;
  const pal = getSwissPalette(theme);
  const p = prog(f, at, dur, easeInOut);
  const wiping = f < at + dur;
  const y = (1 - p) * 1080;
  return (
    <>
      <AbsoluteFill style={{ clipPath: wiping ? `inset(${((1 - p) * 100).toFixed(2)}% 0 0 0)` : undefined }}>
        {children}
      </AbsoluteFill>
      {wiping && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: y - 2,
            height: 4,
            background: `linear-gradient(90deg, transparent 0%, ${pal.accent} 18%, ${pal.accent} 82%, transparent 100%)`,
            opacity: Math.sin(p * Math.PI) * 0.88,
            pointerEvents: "none",
            zIndex: 40,
          }}
        />
      )}
    </>
  );
};

/** 顶层无描边单行悬浮字幕条（bottom: 52px） */
export const SwissCaptionBar: React.FC<{
  items: { at: number; until: number; text: string }[];
  f: number;
}> = ({ items, f }) => {
  const active = items.find((c) => f >= c.at && f < c.until);
  if (!active) return null;
  const pop = interpolate(f, [active.at, active.at + 3], [0, 1], clamp);
  const out = interpolate(f, [Math.max(active.at + 3, active.until - 3), active.until], [1, 0], clamp);
  const alpha = Math.min(pop, out);
  const fs = fitFont(active.text, 48, 1460, 32);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 48,
        display: "flex",
        justifyContent: "center",
        opacity: alpha,
        transform: `translateY(${(1 - pop) * 8}px)`,
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      <span
        style={{
          display: "block",
          maxWidth: 1560,
          padding: "10px 32px 13px",
          borderRadius: 18,
          backgroundColor: "rgba(18, 20, 26, 0.80)",
          boxShadow: SWISS_SH.caption,
          whiteSpace: "nowrap",
          fontFamily: SWISS_HEAVY,
          fontWeight: 900,
          fontSize: fs,
          lineHeight: 1.24,
          color: "#FFFFFF",
          letterSpacing: "0.02em",
        }}
      >
        {active.text}
      </span>
    </div>
  );
};
