// 动效组件：下落冲击、速度线冲入、漫画爆炸星、3D 甩入、镜头猛拉远
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BurstTicks, Camera, ImpactRing, SpeedLines, Sfx, Starburst, Swoop3D } from "../../kit/fx";
import { FONT, LATIN } from "../../kit/fonts";
import { clamp, drop, rand, shake, snap } from "../../kit/motion";

const paper = "#f4f1ea";
const ink = "#1b1b1b";

const Ball: React.FC<{ color: string; label: string; size?: number; style?: React.CSSProperties }> = ({ color, label, size = 220, style }) => (
  <div
    style={{
      position: "absolute",
      width: size,
      height: size,
      borderRadius: "50%",
      background: `radial-gradient(circle at 32% 26%, #ffffff 0%, ${color} 32%, ${color} 60%, #00000055 140%)`,
      boxShadow: `inset 0 -18px 30px #00000033, 0 30px 40px -16px #00000055`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
      fontFamily: LATIN,
      fontWeight: 900,
      fontSize: size * 0.26,
      textShadow: "0 3px 0 #00000033",
      ...style,
    }}
  >
    {label}
  </div>
);

// ——— 下落冲击 ———
export type ImpactDropProps = { label: string; color: string; height: number };
export const impactDropDefaults: ImpactDropProps = { label: "砰", color: "#ff6f2c", height: 760 };
export const ImpactDrop: React.FC<ImpactDropProps> = ({ label, color, height }) => {
  const f = useCurrentFrame();
  const at = 18;
  const d = drop(f, at, 14, height);
  const sh = shake(f, at, 26);
  const k = 1 - Math.min(1, Math.abs(d.y) / height);
  return (
    <AbsoluteFill style={{ background: paper, transform: `translate(${sh.x}px, ${sh.y}px)` }}>
      <div style={{ position: "absolute", left: 960 - 170 * (0.4 + 0.6 * k), top: 735, width: 340 * (0.4 + 0.6 * k), height: 26, borderRadius: "50%", background: "#000", filter: "blur(8px)", opacity: 0.1 + 0.2 * k }} />
      <Ball color={color} label={label} size={320} style={{ left: 800, top: 420 + d.y, transform: `scale(${1 + (d.sx - 1) * 1.6}, ${1 + (d.sy - 1) * 1.6})`, transformOrigin: "50% 100%" }} />
      <ImpactRing at={at} x={960} y={745} w={440} color={ink} thick={6} />
      <BurstTicks at={at} x={960} y={580} r={250} color={ink} count={12} len={64} width={8} rot={0.13} />
      <Sfx at={at - 1} src="hit_1.wav" vol={1} />
      <Sfx at={at} src="land_1.wav" vol={0.7} />
    </AbsoluteFill>
  );
};

// ——— 速度线冲入 ———
export type SpeedDashProps = { left: string; right: string };
export const speedDashDefaults: SpeedDashProps = { left: "嗖", right: "唰" };
export const SpeedDash: React.FC<SpeedDashProps> = ({ left, right }) => {
  const f = useCurrentFrame();
  const card = (txt: string, at: number, side: 1 | -1, x: number, color: string) => {
    if (f < at) return null;
    const p = snap(f, at, { damping: 12, stiffness: 240, mass: 0.6 });
    return (
      <>
        <div
          style={{
            position: "absolute",
            left: x - 140 + side * (1 - p) * 1500,
            top: 400,
            width: 280,
            height: 280,
            borderRadius: 48,
            background: color,
            color: "#fff",
            fontFamily: FONT,
            fontWeight: 600,
            fontSize: 150,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: `skewX(${side * (1 - p) * 24}deg) scale(${1 + Math.max(0, p - 1) * 0.8}, ${1 - Math.max(0, p - 1) * 0.8})`,
            boxShadow: "0 30px 40px -16px #00000055",
          }}
        >
          {txt}
        </div>
        <SpeedLines at={at + 4} x={x + side * 150} y={540} dir={side} color={ink} spread={140} />
      </>
    );
  };
  return (
    <AbsoluteFill style={{ background: paper }}>
      {card(right, 12, 1, 1160, "#2f6bff")}
      {card(left, 30, -1, 760, "#ff3b2f")}
      <Sfx at={12} src="whoosh-short_1.wav" vol={0.7} />
      <Sfx at={17} src="snap_1.wav" vol={0.8} />
      <Sfx at={30} src="whoosh-short_2.wav" vol={0.7} />
      <Sfx at={35} src="snap_2.wav" vol={0.8} />
    </AbsoluteFill>
  );
};

// ——— 漫画爆炸星 ———
export type BurstsProps = { words: string[] };
export const burstsDefaults: BurstsProps = { words: ["砰!", "咔!", "啪!", "哇!"] };
export const Bursts: React.FC<BurstsProps> = ({ words }) => {
  const pos = [
    [620, 420, 170],
    [1300, 380, 140],
    [900, 700, 150],
    [1450, 760, 120],
    [400, 760, 120],
  ];
  const fills = ["#ff3b2f", "#2f6bff", "#ffffff", "#ff3b2f", "#2f6bff"];
  return (
    <AbsoluteFill style={{ background: "#ffd60a", backgroundImage: "radial-gradient(#11111126 3px, transparent 3.6px)", backgroundSize: "22px 22px", fontFamily: FONT }}>
      {words.slice(0, 5).map((w, i) => (
        <React.Fragment key={i}>
          <Starburst
            at={8 + i * 10}
            x={pos[i][0]}
            y={pos[i][1]}
            r={pos[i][2]}
            fill={fills[i]}
            stroke="#111"
            text={w}
            textColor={fills[i] === "#ffffff" ? "#ff3b2f" : "#fff"}
            points={10 + (i % 3)}
            hold={60}
            seed={i * 0.9 + 0.3}
          />
          <Sfx at={8 + i * 10} src={i % 2 ? "pop_3.wav" : "hit_2.wav"} vol={0.7} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

// ——— 3D 甩入 ———
export type SwoopCardProps = { title: string; body: string; rx: number; ry: number; rz: number };
export const swoopCardDefaults: SwoopCardProps = { title: "3D 甩入", body: "从透视倾斜甩到正面，带弹簧回弹", rx: 62, ry: -14, rz: -12 };
export const SwoopCard: React.FC<SwoopCardProps> = ({ title, body, rx, ry, rz }) => (
  <AbsoluteFill style={{ background: "#1d1f24" }}>
    <Swoop3D at={10} from={{ rx, ry, rz, y: 760, s: 0.8 }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1100, padding: "70px 80px", borderRadius: 48, background: "#fff", boxShadow: "0 60px 100px -30px #000", fontFamily: FONT }}>
          <div style={{ fontSize: 96, fontWeight: 600, color: "#111" }}>{title}</div>
          <div style={{ fontSize: 48, color: "#666", marginTop: 20 }}>{body}</div>
        </div>
      </AbsoluteFill>
    </Swoop3D>
    <Sfx at={6} src="whoosh.mp3" vol={0.7} />
    <Sfx at={16} src="maximize_002.wav" vol={0.5} />
  </AbsoluteFill>
);

// ——— 镜头猛拉远 ———
export type CameraPullProps = { center: string; crowd: string[] };
export const cameraPullDefaults: CameraPullProps = { center: "一个", crowd: ["很多", "成千", "上万", "无数", "一群", "海量"] };
export const CameraPull: React.FC<CameraPullProps> = ({ center, crowd }) => {
  const f = useCurrentFrame();
  const tiles: { x: number; y: number; t: string; d: number; c: string }[] = [];
  const colors = ["#ff6f4f", "#7c6cff", "#20c3a5", "#ffc63a"];
  for (let r = -9; r <= 9; r++)
    for (let c = -14; c <= 14; c++) {
      if (r === 0 && c === 0) continue;
      const x = 960 + c * 300 + (r % 2 ? 150 : 0);
      const y = 540 + r * 190;
      tiles.push({ x, y, t: crowd[Math.floor(rand(r * 31 + c) * crowd.length)] ?? "·", d: Math.hypot(c * 300, r * 190), c: rand(r * 7 + c * 3) < 0.15 ? colors[Math.abs(r + c) % 4] : "#ffffff" });
    }
  const maxD = Math.max(...tiles.map((t) => t.d));
  const tile = (t: string, bg: string, style: React.CSSProperties) => (
    <div
      style={{
        position: "absolute",
        width: 260,
        height: 140,
        borderRadius: 70,
        background: bg,
        color: bg === "#ffffff" ? "#2b2366" : "#fff",
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "inset 0 -10px 16px #0000001f, 0 20px 30px -12px rgba(60,40,150,0.3)",
        ...style,
      }}
    >
      {t}
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "#ece8fb" }}>
      <Camera keys={[{ f: 0, s: 1.8 }, { f: 22, s: 1.8 }, { f: 46, s: 0.28 }, { f: 90, s: 0.3 }]}>
        {tiles.map((t, i) => {
          const st = 24 + (t.d / maxD) * 20;
          const p = interpolate(f, [st, st + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
          return p > 0 ? <React.Fragment key={i}>{tile(t.t, t.c, { left: t.x - 130, top: t.y - 70, transform: `scale(${p})` })}</React.Fragment> : null;
        })}
        {tile(center, "#ff6f4f", { left: 830, top: 470, transform: `scale(${snap(f, 4)})` })}
      </Camera>
      <Sfx at={4} src="pop_2.wav" vol={0.7} />
      <Sfx at={22} src="whoosh-long_1.wav" vol={0.8} />
      <Sfx at={30} src="glass_002.wav" vol={0.5} />
    </AbsoluteFill>
  );
};
