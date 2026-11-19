// 01 砸落集结 · 软糖 3D
// 节拍：主角果冻砸下 → 同伴冲入 / 落下 / 弹出 → 镜头猛拉远露出上千块 → 标题砸字 → 3D 甩入证据面板
// 适合「由很多小单元组成 / 一个变很多 / 规模感」的选题。
import React, { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BurstTicks, Bgm, Camera, CaptionPill, ImpactRing, SlamText, SpeedLines, Sfx, Swoop3D } from "../../kit/fx";
import { FONT } from "../../kit/fonts";
import { clamp, drop, prog, rand, smooth, snap } from "../../kit/motion";

export type Line = { text: string; accent?: string };
export type DropGatherProps = {
  /** 2–5 个词，第一个是主角 */
  words: string[];
  /** 拉远后铺满画面的词池 */
  vocab: string[];
  title: string;
  /** 标题里要变色的字 */
  titleAccent?: string;
  /** 最多 4 条：主角落地 / 同伴加入 / 拉远 / 面板 */
  captions: Line[];
  panel:
    | { kind: "matrix"; title: string; tag?: string; note?: string; values?: number[][] }
    | { kind: "points"; title: string; tag?: string; note?: string; points: string[] };
  music?: boolean;
};

export const DROP_GATHER_DUR = 240;

export const dropGatherDefaults: DropGatherProps = {
  words: ["今天", "天气", "怎么样", "？"],
  vocab: ["的", "模型", "Token", "我", "是", "如何", "学习", "##ing", "你好", "AI", "，", "数据", "向量", "。", "注意力", "the", "预测", "下一个", "词", "GPT", "上下文", "读", "写", "代码", "：", "Trans", "former", "？", "训练", "猫", "跑", "一", "of", "生成"],
  title: "大模型是怎么读字的",
  titleAccent: "读字",
  captions: [
    { text: "AI 读到的，不是字", accent: "不是字" },
    { text: "而是一块块 Token", accent: "Token" },
    { text: "它的词表里，有几万块这样的 Token", accent: "几万块" },
    { text: "每个 Token，都在看别的 Token", accent: "看" },
  ],
  panel: {
    kind: "matrix",
    title: "注意力矩阵",
    tag: "Attention",
    note: "每一行：这个词在看谁",
    values: [
      [0.62, 0.21, 0.12, 0.05],
      [0.18, 0.55, 0.2, 0.07],
      [0.1, 0.36, 0.44, 0.1],
      [0.06, 0.14, 0.48, 0.32],
    ],
  },
  music: true,
};

export const C = { bg: "#ece8fb", ink: "#2b2366", accent: "#ff6f4f", mute: "#8d86b8" };
export type Pal = { base: string; light: string; dark: string; text: string };
export const P: Record<string, Pal> = {
  coral: { base: "#ff6f4f", light: "#ffc0ab", dark: "#d23d27", text: "#fff" },
  violet: { base: "#7c6cff", light: "#c4bcff", dark: "#4b3dd1", text: "#fff" },
  teal: { base: "#20c3a5", light: "#9af2df", dark: "#0c8a72", text: "#fff" },
  lemon: { base: "#ffc63a", light: "#fff0b8", dark: "#d98f00", text: "#5a3a00" },
  milk: { base: "#ffffff", light: "#ffffff", dark: "#d6cff4", text: "#3b3470" },
};
export const SENT_PAL = [P.coral, P.violet, P.teal, P.lemon, P.coral];
const ROW_Y = 470;
export const TH = 132;
const GAP = 28;

const T_HERO = 15;
const JOIN_AT = [T_HERO, 47, 60, 68, 74];
const T_PULL = 80;
const T_TITLE = 110;
const T_PANEL = 150;

const textW = (t: string, size: number) =>
  Array.from(t).reduce((w, ch) => w + (/[\x00-\x7f]/.test(ch) ? size * 0.58 : size), 0);
const tokW = (t: string) => Math.round(textW(t, 64) + 86);

/** 果冻 Token：渐变 + 顶部高光 + 底部内阴影，可选一对会眨的眼睛 */
export const Token: React.FC<{ text: string; pal: Pal; w: number; style?: React.CSSProperties; eyes?: boolean; blink?: boolean }> = ({
  text,
  pal,
  w,
  style,
  eyes,
  blink,
}) => (
  <div
    style={{
      position: "absolute",
      width: w,
      height: TH,
      borderRadius: TH / 2,
      background: `radial-gradient(130% 150% at 32% 18%, ${pal.light} 0%, ${pal.base} 46%, ${pal.dark} 100%)`,
      color: pal.text,
      boxShadow: `inset 0 -12px 20px ${pal.dark}88, inset 0 6px 10px #ffffff55, 0 26px 34px -10px rgba(60,40,150,0.35)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 64,
      fontWeight: 600,
      fontFamily: FONT,
      textShadow: pal.text === "#fff" ? `0 3px 0 ${pal.dark}` : "none",
      boxSizing: "border-box",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    <div style={{ position: "absolute", left: "14%", top: 12, width: "38%", height: 22, borderRadius: 20, background: "linear-gradient(#ffffffcc, #ffffff00)" }} />
    {eyes &&
      [-1, 1].map((d) => (
        <div
          key={d}
          style={{
            position: "absolute",
            left: w / 2 + d * 30 - 15,
            top: -24,
            width: 30,
            height: blink ? 6 : 36,
            marginTop: blink ? 16 : 0,
            borderRadius: 15,
            background: "#fff",
            boxShadow: `0 0 0 4px ${pal.dark}`,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: 7, top: 12, width: 16, height: 18, borderRadius: 9, background: "#1d1640" }} />
        </div>
      ))}
    {text}
  </div>
);

type FieldTok = { x: number; y: number; w: number; t: string; kind: number; d: number; pal: number };
const buildField = (vocab: string[], rowL: number, rowR: number): FieldTok[] => {
  const out: FieldTok[] = [];
  const cx = 960;
  const pool = vocab.length ? vocab : ["·"];
  for (let k = -12; k <= 12; k++) {
    const y = ROW_Y + k * 168;
    const place = (from: number, to: number, dir: 1 | -1, seed: number) => {
      let x = from;
      let i = 0;
      while (dir > 0 ? x < to : x > to) {
        const t = pool[Math.floor(rand(seed + i * 7.3) * pool.length)];
        const w = tokW(t);
        const left = dir > 0 ? x : x - w;
        const kind = rand(seed + i * 3.1 + 5) < 0.1 ? 2 : rand(seed + i * 5.7 + 2) < 0.16 ? 1 : 0;
        out.push({ x: left, y, w, t, kind, d: Math.hypot(left + w / 2 - cx, y - ROW_Y), pal: i % 4 });
        x += dir * (w + GAP);
        i++;
      }
    };
    if (k === 0) {
      place(rowR, cx + 3400, 1, 900);
      place(rowL, cx - 3400, -1, 700);
    } else {
      place(cx - 3400 - rand(k * 13.7) * 260, cx + 3400, 1, k * 101 + 17);
    }
  }
  return out;
};

export const Panel: React.FC<{ panel: DropGatherProps["panel"]; words: string[] }> = ({ panel, words }) => {
  const f = useCurrentFrame();
  const head = (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 26, gap: 30 }}>
      <div style={{ fontSize: 52, fontWeight: 600, color: C.ink, whiteSpace: "nowrap" }}>
        {panel.title} {panel.tag && <span style={{ color: P.violet.base, fontSize: 40 }}>{panel.tag}</span>}
      </div>
      {panel.note && <div style={{ fontSize: 30, color: C.mute, whiteSpace: "nowrap" }}>{panel.note}</div>}
    </div>
  );
  const pop = (st: number) => interpolate(f, [st, st + 7], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) });
  let body: React.ReactNode;
  if (panel.kind === "matrix") {
    const n = words.length;
    const vals =
      panel.values ??
      words.map((_, i) => words.map((__, j) => (i === j ? 0.5 : 0.08 + 0.3 * rand(i * 7 + j * 3))));
    const cw = Math.min(168, 760 / n);
    body = (
      <div style={{ display: "grid", gridTemplateColumns: `150px repeat(${n}, ${cw}px)`, gap: 10, justifyContent: "center" }}>
        <div />
        {words.map((w, j) => (
          <div key={j} style={{ fontSize: 34, fontWeight: 600, textAlign: "center", color: C.ink }}>
            {w}
          </div>
        ))}
        {words.map((w, i) => (
          <React.Fragment key={i}>
            <div style={{ fontSize: 34, fontWeight: 600, color: C.ink, alignSelf: "center", textAlign: "right", paddingRight: 16 }}>{w}</div>
            {words.map((_, j) => {
              const v = vals[i]?.[j] ?? 0;
              return (
                <div
                  key={j}
                  style={{
                    height: 104,
                    background: `radial-gradient(120% 140% at 30% 20%, rgba(196,188,255,${0.3 + v}) 0%, rgba(124,108,255,${0.12 + v * 1.4}) 60%)`,
                    borderRadius: 26,
                    boxShadow: v > 0.3 ? "inset 0 -6px 10px rgba(75,61,209,0.5)" : "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 34,
                    fontWeight: 600,
                    color: v > 0.3 ? "#fff" : C.ink,
                    transform: `scale(${pop(T_PANEL + 14 + (i + j) * 3)})`,
                  }}
                >
                  {v.toFixed(2)}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    );
  } else {
    body = (
      <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
        {panel.points.slice(0, 4).map((pt, i) => {
          const p = pop(T_PANEL + 14 + i * 5);
          const pal = SENT_PAL[i % 4];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, transform: `translateX(${(1 - p) * 60}px)`, opacity: p }}>
              <div
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 42,
                  flexShrink: 0,
                  background: `radial-gradient(130% 150% at 32% 18%, ${pal.light} 0%, ${pal.base} 46%, ${pal.dark} 100%)`,
                  color: pal.text,
                  fontSize: 44,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transform: `scale(${p})`,
                }}
              >
                {i + 1}
              </div>
              <div style={{ fontSize: 50, fontWeight: 600, color: C.ink }}>{pt}</div>
            </div>
          );
        })}
      </div>
    );
  }
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", paddingBottom: 90 }}>
      <div
        style={{
          minWidth: 1000,
          maxWidth: 1500,
          padding: "44px 60px 52px",
          background: "linear-gradient(160deg, #ffffff 0%, #f6f3ff 100%)",
          borderRadius: 56,
          boxShadow: "0 50px 90px -20px rgba(60,40,150,0.35), inset 0 2px 0 #fff",
          fontFamily: FONT,
          boxSizing: "border-box",
        }}
      >
        {head}
        {body}
      </div>
    </AbsoluteFill>
  );
};

export const DropGather: React.FC<DropGatherProps> = (props) => {
  const { title, titleAccent, captions, panel, music = true } = props;
  const words = props.words.slice(0, 5);
  const f = useCurrentFrame();

  const L = useMemo(() => {
    const widths = words.map(tokW);
    const total = widths.reduce((a, w) => a + w, 0) + GAP * (words.length - 1);
    const lefts = widths.map((_, i) => -total / 2 + widths.slice(0, i).reduce((a, w) => a + w + GAP, 0));
    const groupCenter = (n: number) => (lefts[0] + lefts[n] + widths[n]) / 2;
    const last = words.length - 1;
    const field = buildField(props.vocab, 960 + lefts[0] - GAP, 960 + lefts[last] + widths[last] + GAP);
    const maxD = Math.max(1, ...field.map((t) => t.d));
    return { widths, total, lefts, groupCenter, field, maxD };
  }, [words.join("|"), props.vocab.join("|")]);
  const { widths, lefts, groupCenter, field, maxD } = L;

  const heroS = Math.min(1.65, 900 / widths[0]);
  const rowS = Math.min(1.25, 1680 / L.total);
  const heroH = Math.max(160, -70 + 540 / heroS);

  let offset = -groupCenter(0);
  for (let k = 1; k < words.length; k++) offset -= (groupCenter(k) - groupCenter(k - 1)) * smooth(f, JOIN_AT[k] - 2, 22);
  const pos = (i: number) => 960 + offset + lefts[i];

  const sceneOut = interpolate(f, [T_PANEL - 8, T_PANEL], [1, 0], clamp);
  const dim = interpolate(f, [T_TITLE - 4, T_TITLE + 4], [0, 0.8], clamp);
  const titleSize = Math.min(150, Math.floor(1640 / Math.max(1, Array.from(title).length)));

  const renderWord = (i: number) => {
    const at = JOIN_AT[i];
    const pal = SENT_PAL[i];
    const w = widths[i];
    const base: React.CSSProperties = { left: pos(i), top: ROW_Y - TH / 2 };
    const blink = (f > 34 + i * 17 && f < 38 + i * 17) || (f > 128 + i * 5 && f < 132 + i * 5);
    if (i === 0) {
      const d = drop(f, at, 15, heroH);
      return (
        <React.Fragment key={i}>
          <Shadow x={pos(i)} w={w} k={1 - Math.min(1, Math.abs(d.y) / heroH)} />
          <Token
            text={words[i]}
            pal={pal}
            eyes
            blink={blink}
            w={w}
            style={{ ...base, top: ROW_Y - TH / 2 + d.y, transform: `scale(${1 + (d.sx - 1) * 1.5}, ${1 + (d.sy - 1) * 1.5})`, transformOrigin: "50% 100%" }}
          />
          <ImpactRing at={at} x={pos(i) + w / 2} y={ROW_Y + TH / 2 + 26} w={w * 1.3} color={C.ink} />
          <BurstTicks at={at} x={pos(i) + w / 2} y={ROW_Y} r={Math.max(150, w * 0.65)} color={P.coral.base} count={12} rot={0.13} width={8} />
        </React.Fragment>
      );
    }
    const mode = i % 3; // 1 冲入  2 落下  0 弹出
    if (mode === 1) {
      if (f < at - 5) return null;
      const dash = snap(f, at - 5, { damping: 12, stiffness: 240, mass: 0.6 });
      return (
        <React.Fragment key={i}>
          <Token
            text={words[i]}
            pal={pal}
            eyes
            blink={blink}
            w={w}
            style={{
              ...base,
              left: pos(i) + (1 - dash) * 1500,
              transform: `skewX(${(1 - dash) * 22}deg) scale(${1 + (dash - 1) * 0.6 + Math.max(0, dash - 1) * 1.2}, ${1 - (dash - 1) * 0.6})`,
              transformOrigin: "0% 100%",
            }}
          />
          <SpeedLines at={at - 1} x={pos(i) + w} y={ROW_Y} dir={1} color={C.ink} />
        </React.Fragment>
      );
    }
    if (mode === 2) {
      if (f < at - 9) return null;
      const d = drop(f, at, 9, 760);
      return (
        <React.Fragment key={i}>
          <Shadow x={pos(i)} w={w} k={1 - Math.min(1, Math.abs(d.y) / 760)} />
          <Token
            text={words[i]}
            pal={pal}
            eyes
            blink={blink}
            w={w}
            style={{ ...base, top: ROW_Y - TH / 2 + d.y, transform: `scale(${1 + (d.sx - 1) * 1.5}, ${1 + (d.sy - 1) * 1.5})`, transformOrigin: "50% 100%" }}
          />
          <ImpactRing at={at} x={pos(i) + w / 2} y={ROW_Y + TH / 2 + 26} w={w * 1.2} color={C.ink} />
        </React.Fragment>
      );
    }
    if (f < at) return null;
    const q = snap(f, at, { damping: 9, stiffness: 260, mass: 0.5 });
    return (
      <React.Fragment key={i}>
        <Token text={words[i]} pal={pal} eyes w={w} style={{ ...base, transform: `scale(${q}) rotate(${(1 - q) * 90}deg)` }} />
        <BurstTicks at={at} x={pos(i) + w / 2} y={ROW_Y} r={Math.max(100, w * 0.6)} color={P.coral.base} count={8} len={34} />
      </React.Fragment>
    );
  };

  const capTimes = [
    { at: 18 },
    { at: 46 },
    { at: T_PULL + 4, until: T_TITLE - 2 },
    { at: T_PANEL + 10 },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(70% 70% at 50% 42%, #faf8ff 0%, #ece8fb 60%, #ddd6f7 100%)" }} />

      <AbsoluteFill style={{ opacity: sceneOut }}>
        <Camera
          keys={[
            { f: 0, s: heroS },
            { f: T_HERO + 10, s: heroS * 0.97 },
            { f: 74, s: rowS },
            { f: T_PULL, s: rowS },
            { f: T_PULL + 24, s: 0.3 },
            { f: T_PANEL, s: 0.34 },
          ]}
          hits={JOIN_AT.slice(0, words.length).map((at, i) => ({ at, amp: i === 0 ? 24 : i % 3 === 2 ? 16 : 8 }))}
        >
          {f >= T_PULL &&
            field.map((t, i) => {
              const st = T_PULL + 2 + (t.d / maxD) * 20;
              const p = interpolate(f, [st, st + 6], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2.2)) });
              if (p <= 0) return null;
              return (
                <Token
                  key={i}
                  text={t.t}
                  w={t.w}
                  pal={t.kind === 2 ? SENT_PAL[t.pal] : t.kind === 1 ? P.violet : P.milk}
                  style={{ left: t.x, top: t.y - TH / 2, transform: `scale(${p}, ${p * (2 - p)})` }}
                />
              );
            })}
          {words.map((_, i) => renderWord(i))}
        </Camera>

        <AbsoluteFill style={{ background: C.bg, opacity: dim }} />
        {f >= T_TITLE && (
          <AbsoluteFill style={{ justifyContent: "center", paddingBottom: 120 }}>
            <SlamText at={T_TITLE} text={title} size={titleSize} color={C.ink} accent={titleAccent ? { chars: titleAccent, color: C.accent } : undefined} stagger={1.6} />
            <div
              style={{
                margin: "34px auto 0",
                height: 12,
                borderRadius: 6,
                background: C.accent,
                width: Array.from(title).length * titleSize * 0.92 * prog(f, T_TITLE + 14, 10),
              }}
            />
          </AbsoluteFill>
        )}
        <BurstTicks at={T_TITLE + 14} x={960 - Array.from(title).length * titleSize * 0.5 - 50} y={400} r={60} color={C.accent} count={7} rot={2.2} len={40} />
        <BurstTicks at={T_TITLE + 16} x={960 + Array.from(title).length * titleSize * 0.5 + 50} y={400} r={60} color={C.accent} count={7} rot={-0.6} len={40} />
      </AbsoluteFill>

      <Swoop3D at={T_PANEL} from={{ rx: 62, ry: -14, rz: -12, y: 760, s: 0.8 }}>
        <Panel panel={panel} words={words} />
      </Swoop3D>

      <CaptionPill
        bg={C.ink}
        fg="#fff"
        accent="#ffc0ab"
        items={captions.slice(0, 4).map((c, i) => ({ ...c, ...capTimes[i] }))}
      />

      {music && <Bgm dur={DROP_GATHER_DUR} />}
      <Sfx at={T_HERO - 1} src="hit_1.wav" vol={1} />
      <Sfx at={T_HERO} src="land_1.wav" vol={0.8} />
      {words.slice(1).map((_, k) => {
        const i = k + 1;
        const at = JOIN_AT[i];
        const mode = i % 3;
        return (
          <React.Fragment key={i}>
            {mode === 1 && <Sfx at={at - 6} src="whoosh-short_1.wav" vol={0.7} />}
            <Sfx at={mode === 2 ? at - 1 : at} src={mode === 1 ? "snap_1.wav" : mode === 2 ? "land_2.wav" : "pop_2.wav"} vol={0.85} />
          </React.Fragment>
        );
      })}
      <Sfx at={T_PULL} src="whoosh-long_1.wav" vol={0.8} />
      <Sfx at={T_PULL + 8} src="glass_002.wav" vol={0.5} />
      <Sfx at={T_TITLE} src="hit_2.wav" vol={1} />
      <Sfx at={T_TITLE + 14} src="bong_001.wav" vol={0.55} />
      <Sfx at={T_PANEL - 4} src="whoosh.mp3" vol={0.7} />
      <Sfx at={T_PANEL + 8} src="maximize_002.wav" vol={0.55} />
      <Sfx at={T_PANEL + 16} src="tick-crisp_1.wav" vol={0.6} />
    </AbsoluteFill>
  );
};

const Shadow: React.FC<{ x: number; w: number; k: number }> = ({ x, w, k }) => {
  const sw = w * 0.84 * (0.4 + 0.6 * k);
  return (
    <div
      style={{
        position: "absolute",
        left: x + (w - sw) / 2,
        top: ROW_Y + TH / 2 + 18,
        width: sw,
        height: 26,
        borderRadius: "50%",
        background: "#5a46c8",
        filter: "blur(8px)",
        opacity: 0.18 + 0.2 * k,
      }}
    />
  );
};
