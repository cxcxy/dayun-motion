// 开场动效组件：冲击环、放射线、速度线、字幕胶囊、砸字标题、镜头、3D 甩入、音效。
import React from "react";
import { AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame } from "remotion";
import { asset } from "./asset";
import { Audio } from "@remotion/media";
import { CamKey, camera, clamp, prog, shakes, snap } from "./motion";

/** 落地冲击：地面椭圆环向外扩散并淡出 */
export const ImpactRing: React.FC<{ at: number; x: number; y: number; w: number; color: string; thick?: number }> = ({
  at,
  x,
  y,
  w,
  color,
  thick = 4,
}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 18) return null;
  const p = prog(f, at, 16);
  const rw = w * (0.7 + p * 1.1);
  return (
    <div
      style={{
        position: "absolute",
        left: x - rw / 2,
        top: y - rw * 0.11,
        width: rw,
        height: rw * 0.22,
        borderRadius: "50%",
        border: `${thick * (1 - p * 0.7)}px solid ${color}`,
        opacity: 1 - p,
      }}
    />
  );
};

/** 放射短线：围绕一点向外弹出的「炸开」线 */
export const BurstTicks: React.FC<{
  at: number;
  x: number;
  y: number;
  r: number;
  color: string;
  count?: number;
  len?: number;
  width?: number;
  rot?: number;
  dur?: number;
}> = ({ at, x, y, r, color, count = 10, len = 46, width = 6, rot = 0, dur = 14 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + dur + 1) return null;
  const p = prog(f, at, dur, Easing.out(Easing.quad));
  const inner = r + p * len * 1.6;
  const l = len * (1 - p);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      {Array.from({ length: count }).map((_, i) => {
        const a = rot + (i / count) * Math.PI * 2;
        const c = Math.cos(a);
        const s = Math.sin(a);
        return (
          <line
            key={i}
            x1={x + c * inner}
            y1={y + s * inner}
            x2={x + c * (inner + l)}
            y2={y + s * (inner + l)}
            stroke={color}
            strokeWidth={width}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

/** 速度线：物体冲入时拖在身后的三条横线 */
export const SpeedLines: React.FC<{ at: number; x: number; y: number; dir: 1 | -1; color: string; spread?: number }> = ({
  at,
  x,
  y,
  dir,
  color,
  spread = 70,
}) => {
  const f = useCurrentFrame();
  if (f < at || f > at + 12) return null;
  const p = prog(f, at, 12);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      {[-1, 0, 1].map((k, i) => {
        const len = (220 - i * 50) * (1 - p);
        const sx = x + dir * (20 + p * 40);
        return (
          <line
            key={k}
            x1={sx}
            y1={y + k * spread * 0.5}
            x2={sx + dir * len}
            y2={y + k * spread * 0.5}
            stroke={color}
            strokeWidth={5}
            strokeLinecap="round"
            opacity={1 - p}
          />
        );
      })}
    </svg>
  );
};

/** 底部字幕胶囊：一次只出现一条，切换时旧的上浮淡出、新的弹入 */
export type Cap = { at: number; text: string; accent?: string; until?: number };
export const CaptionPill: React.FC<{
  items: Cap[];
  y?: number;
  bg: string;
  fg: string;
  accent: string;
  size?: number;
  boxStyle?: React.CSSProperties;
}> = ({ items, y = 900, bg, fg, accent, size = 46, boxStyle }) => {
  const f = useCurrentFrame();
  return (
    <>
      {items.map((c, i) => {
        const end = c.until ?? items[i + 1]?.at ?? Infinity;
        if (f < c.at || f > end + 6) return null;
        const pin = snap(f, c.at, { damping: 14, stiffness: 260 });
        const out = Number.isFinite(end) ? prog(f, end, 6) : 0;
        const parts = c.accent ? c.text.split(c.accent) : [c.text];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: y,
              display: "flex",
              justifyContent: "center",
              opacity: Math.min(1, pin * 1.4) * (1 - out),
              transform: `translateY(${(1 - pin) * 24 - out * 20}px) scale(${0.9 + pin * 0.1})`,
            }}
          >
            <div
              style={{
                background: bg,
                color: fg,
                fontSize: size,
                fontWeight: 600,
                padding: `${size * 0.32}px ${size * 0.7}px`,
                borderRadius: size * 0.36,
                letterSpacing: 1,
                whiteSpace: "nowrap",
                ...boxStyle,
              }}
            >
              {parts.map((p, k) => (
                <React.Fragment key={k}>
                  {p}
                  {k < parts.length - 1 && <span style={{ color: accent }}>{c.accent}</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

/** 砸字标题：逐字从放大状态砸下，带轻微旋转 */
export const SlamText: React.FC<{
  at: number;
  text: string;
  size: number;
  color: string;
  accent?: { chars: string; color: string };
  gap?: number;
  stagger?: number;
  font?: string;
  weight?: number;
  style?: React.CSSProperties;
  charStyle?: React.CSSProperties;
}> = ({ at, text, size, color, accent, gap = 0, stagger = 2, font, weight = 600, style, charStyle }) => {
  const f = useCurrentFrame();
  const chars = Array.from(text);
  return (
    <div style={{ display: "flex", justifyContent: "center", gap, ...style }}>
      {chars.map((ch, i) => {
        const st = at + i * stagger;
        const p = snap(f, st, { damping: 13, stiffness: 300, mass: 0.6 });
        const vis = f >= st;
        const hot = accent && accent.chars.includes(ch);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              fontSize: size,
              fontWeight: weight,
              fontFamily: font,
              lineHeight: 1.1,
              color: hot ? accent!.color : color,
              opacity: vis ? Math.min(1, p * 2) : 0,
              transform: `scale(${vis ? 2.4 - p * 1.4 : 2.4}) rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
              whiteSpace: "pre",
              ...charStyle,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/** 镜头：缩放 / 平移 / 旋转 + 冲击抖动，以画面中心为原点 */
export const Camera: React.FC<{
  keys: CamKey[];
  hits?: Array<{ at: number; amp?: number }>;
  children: React.ReactNode;
}> = ({ keys, hits = [], children }) => {
  const f = useCurrentFrame();
  const c = camera(f, keys);
  const sh = shakes(f, hits);
  return (
    <AbsoluteFill
      style={{
        transform: `translate(${c.x + sh.x}px, ${c.y + sh.y}px) scale(${c.s}) rotate(${c.r}deg)`,
        transformOrigin: "50% 50%",
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/** 3D 甩入：面板从透视倾斜状态甩到正面 */
export const Swoop3D: React.FC<{
  at: number;
  from?: { rx?: number; ry?: number; rz?: number; y?: number; x?: number; s?: number };
  children: React.ReactNode;
  perspective?: number;
}> = ({ at, from = {}, children, perspective = 1600 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const p = snap(f, at, { damping: 17, stiffness: 120, mass: 0.9 });
  const q = 1 - p;
  const { rx = 58, ry = -18, rz = -10, y = 700, x = 0, s = 0.9 } = from;
  return (
    <AbsoluteFill style={{ perspective, perspectiveOrigin: "50% 40%" }}>
      <AbsoluteFill
        style={{
          transform: `translate(${x * q}px, ${y * q}px) rotateX(${rx * q}deg) rotateY(${ry * q}deg) rotateZ(${rz * q}deg) scale(${
            s + (1 - s) * p
          })`,
          transformOrigin: "50% 50%",
          opacity: interpolate(f, [at, at + 4], [0, 1], clamp),
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 单条音效 */
export const Sfx: React.FC<{ at: number; src: string; vol?: number }> = ({ at, src, vol = 0.8 }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={asset(`sfx/${src}`)} volume={vol} />
  </Sequence>
);

/** 背景鼓点：tools/make_beat.py 生成的原创 120BPM 鼓点，第 0 帧是第一拍，结尾淡出 */
export const Bgm: React.FC<{ dur: number; vol?: number }> = ({ dur, vol = 0.45 }) => (
  <Audio
    src={asset("bgm/beat.wav")}
    volume={(f) => interpolate(f, [0, 3, dur - 18, dur], [0, vol, vol, 0], clamp)}
  />
);

/** 漫画爆炸星：锯齿星形 + 中间字，弹出后短暂停留再缩回 */
export const Starburst: React.FC<{
  at: number;
  x: number;
  y: number;
  r: number;
  fill: string;
  stroke: string;
  text?: string;
  textColor?: string;
  points?: number;
  hold?: number;
  seed?: number;
}> = ({ at, x, y, r, fill, stroke, text, textColor = "#fff", points = 12, hold = 10, seed = 1 }) => {
  const f = useCurrentFrame();
  if (f < at || f > at + hold + 6) return null;
  const pin = snap(f, at, { damping: 9, stiffness: 320, mass: 0.5 });
  const out = prog(f, at + hold, 6);
  const s = pin * (1 - out);
  const pts = Array.from({ length: points * 2 })
    .map((_, i) => {
      const a = (i / (points * 2)) * Math.PI * 2 + seed;
      const jitter = 0.85 + 0.3 * Math.abs(Math.sin(seed * 9.1 + i * 3.7));
      const rr = i % 2 === 0 ? r * jitter : r * 0.55;
      return `${Math.cos(a) * rr},${Math.sin(a) * rr}`;
    })
    .join(" ");
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `scale(${s}) rotate(${(1 - pin) * -20 + seed * 3}deg)` }}>
      <svg style={{ position: "absolute", overflow: "visible" }} width={1} height={1}>
        <polygon points={pts} fill={fill} stroke={stroke} strokeWidth={Math.max(4, r * 0.06)} strokeLinejoin="round" />
      </svg>
      {text && (
        <div
          style={{
            position: "absolute",
            left: -r,
            width: r * 2,
            top: -r * 0.32,
            textAlign: "center",
            fontSize: r * 0.5,
            lineHeight: 1,
            fontWeight: 900,
            color: textColor,
            WebkitTextStroke: `${Math.max(3, r * 0.04)}px ${stroke}`,
            paintOrder: "stroke fill",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
};
