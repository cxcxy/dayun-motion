// 03 容器溢出 · 蓝图工程
// 蓝图底 + 白色线稿 + 尺寸标注，溢出用橙色报警
// 节拍：容器框描出 → 条目越来越快地顶进来 → 装满、最早的条目被挤出去碎掉 → 容器 3D 甩到右侧 + 错位砸字标题
// 适合「上限 / 容量 / 过载 / 被挤掉 / 成本爆表」这类讲限制和痛点的选题。
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Bgm, Camera, CaptionPill, SlamText, Sfx } from "../../kit/fx";
import { FONT, MONO } from "../../kit/fonts";
import { clamp, prog, rand, smooth, snap } from "../../kit/motion";

export type Msg = { ai: boolean; t: string; at: number };
export type OverflowProps = {
  /** 容器左上角的标签 */
  containerLabel: string;
  /** 7–14 条；超过 6 条开始溢出。side: right 实线框（提问方），left 虚线框（回答方） */
  messages: { text: string; side: "left" | "right" }[];
  /** 右侧容量条的满格数值 */
  meterMax: number;
  /** 标题上方的小字 */
  tag: string;
  /** 两行标题 */
  titleLines: [string, string];
  /** 标题里要做错位效果的一个字（在第二行里找，找不到就在第一行找） */
  glitchChar?: string;
  /** 最多 3 条：装入 / 溢出 / 结尾钩子 */
  captions: { text: string; accent?: string }[];
  drawingNo?: string;
  music?: boolean;
};

export const OVERFLOW_DUR = 210;

export const overflowDefaults: OverflowProps = {
  containerLabel: "上下文窗口 · CONTEXT WINDOW",
  messages: [
    { side: "right", text: "帮我写一份周报" },
    { side: "left", text: "好的，这是本周周报……" },
    { side: "right", text: "语气正式一点" },
    { side: "left", text: "已改成正式语气" },
    { side: "right", text: "加上项目数据" },
    { side: "left", text: "已补充三项数据" },
    { side: "right", text: "再缩短到 300 字" },
    { side: "left", text: "已压缩" },
    { side: "right", text: "标题换一个" },
    { side: "left", text: "换好了" },
    { side: "right", text: "最开始让你写的是什么？" },
    { side: "left", text: "抱歉，我不太确定……" },
  ],
  meterMax: 8192,
  tag: "CONTEXT OVERFLOW",
  titleLines: ["AI 为什么", "越聊越忘事"],
  glitchChar: "忘",
  captions: [
    { text: "你和 AI 聊得越来越久", accent: "越来越久" },
    { text: "窗口一满，最早的话就被挤出去", accent: "挤出去" },
    { text: "它不是忘了，是根本看不见了", accent: "看不见" },
  ],
  drawingNo: "CTX-001",
  music: true,
};

const ARRIVE = [15, 30, 45, 52, 60, 67, 74, 78, 82, 86, 89, 92, 95, 98];
export const buildMsgs = (list: OverflowProps["messages"]): Msg[] =>
  list.slice(0, ARRIVE.length).map((m, i) => ({ ai: m.side === "left", t: m.text, at: ARRIVE[i] }));

export const C = {
  bg: "#0d4aa8",
  cyan: "#ffffff",
  text: "#ffffff",
  mute: "#9fbbe8",
  red: "#ff8a2a",
  user: "rgba(255,255,255,0.10)",
  ai: "rgba(255,255,255,0.03)",
};

const BX = 960;
const BW = 720;
const BH = 760;
export const BTOP = 130;
export const BBOT = BTOP + BH;
const BH_ = 92; // 气泡高度
const STEP = 110;
const CAP = 6; // 窗口能放下的条数

const T_SWING = 102;
const T_TITLE = 108;
const T_HOOK = 150;

const lostAt = (msgs: Msg[], i: number) => (msgs[i + CAP] ? msgs[i + CAP].at + 1 : Infinity);

const bubbleW = (t: string) => Math.min(560, Array.from(t).reduce((w, ch) => w + (/[\x00-\x7f]/.test(ch) ? 21 : 38), 0) + 72);

export const Bubble: React.FC<{ m: Msg; style?: React.CSSProperties; red?: number }> = ({ m, style, red = 0 }) => (
  <div
    style={{
      position: "absolute",
      height: BH_,
      width: bubbleW(m.t),
      borderRadius: 28,
      boxSizing: "border-box",
      display: "flex",
      alignItems: "center",
      padding: "0 36px",
      fontSize: 38,
      fontWeight: 600,
      fontFamily: FONT,
      whiteSpace: "nowrap",
      background: red ? `rgba(255,138,42,${0.2 + red * 0.45})` : m.ai ? C.ai : C.user,
      color: "#fff",
      border: `3px ${m.ai ? "dashed" : "solid"} ${red ? C.red : "#ffffffcc"}`,
      ...style,
    }}
  >
    {m.t}
  </div>
);

export const Stack: React.FC<{ alarm: number; msgs: Msg[] }> = ({ alarm, msgs }) => {
  const f = useCurrentFrame();
  const s = msgs.map((m) => snap(f, m.at, { damping: 13, stiffness: 260, mass: 0.6 }));
  return (
    <>
      {msgs.map((m, i) => {
        if (f < m.at) return null;
        const slot = s.slice(i + 1).reduce((a, v) => a + v, 0);
        const y = BBOT - 24 - BH_ - slot * STEP + (1 - s[i]) * 150;
        const w = bubbleW(m.t);
        const x = m.ai ? BX - BW / 2 + 28 : BX + BW / 2 - 28 - w;
        const lost = lostAt(msgs, i);
        if (f < lost) {
          // 快被挤出时预警变红
          const warn = slot > CAP - 1.05 ? 1 : 0;
          return <Bubble key={i} m={m} red={warn * alarm} style={{ left: x, top: y, opacity: Math.min(1, s[i] * 2) }} />;
        }
        // 碎裂：按竖条切开，各自飞散
        const t = f - lost;
        if (t > 22) return null;
        const yL = BBOT - 24 - BH_ - CAP * STEP;
        return (
          <React.Fragment key={i}>
            {Array.from({ length: 7 }).map((_, k) => {
              const vx = (rand(i * 31 + k) - 0.5) * 34;
              const vy = -10 - rand(i * 17 + k * 3) * 14;
              const rot = (rand(i * 7 + k * 11) - 0.5) * 50;
              const a = (k / 7) * 100;
              const bq = 100 - ((k + 1) / 7) * 100;
              return (
                <Bubble
                  key={k}
                  m={m}
                  red={1}
                  style={{
                    left: x,
                    top: yL,
                    clipPath: `inset(0 ${bq}% 0 ${a}%)`,
                    transform: `translate(${vx * t}px, ${vy * t + 1.1 * t * t}px) rotate(${rot * t * 0.1}deg)`,
                    opacity: 1 - t / 22,
                  }}
                />
              );
            })}
          </React.Fragment>
        );
      })}
    </>
  );
};

export const Frame: React.FC<{ alarm: number; msgs: Msg[]; label: string; MAX_TOK: number }> = ({ alarm, msgs, label, MAX_TOK }) => {
  const f = useCurrentFrame();
  const arm = prog(f, 0, 9) * 70;
  const line = prog(f, 6, 10, Easing.inOut(Easing.cubic));
  const col = alarm > 0 && Math.floor(f / 3) % 2 === 0 ? C.red : alarm > 0 ? "#ffc08a" : C.cyan;
  const corners = [
    [BX - BW / 2, BTOP, 1, 1],
    [BX + BW / 2, BTOP, -1, 1],
    [BX - BW / 2, BBOT, 1, -1],
    [BX + BW / 2, BBOT, -1, -1],
  ];
  const tok = Math.min(
    MAX_TOK,
    msgs.reduce((a, m) => a + smooth(f, m.at, 30) * (MAX_TOK / CAP), 0),
  );
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
        <rect
          x={BX - BW / 2}
          y={BTOP}
          width={BW}
          height={BH}
          rx={6}
          fill={`rgba(255,255,255,${0.03 + alarm * 0.03})`}
          stroke={col}
          strokeOpacity={0.45}
          strokeWidth={3}
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - line}
        />
        {corners.map(([x, y, dx, dy], i) => (
          <path key={i} d={`M${x} ${y + dy * arm} L${x} ${y} L${x + dx * arm} ${y}`} stroke={col} strokeWidth={8} fill="none" strokeLinecap="square" />
        ))}
        {/* 右侧容量条 */}
        <rect x={BX + BW / 2 + 44} y={BTOP} width={16} height={BH} fill="none" stroke="#ffffff88" strokeWidth={2} opacity={line} />
        {/* 左侧尺寸标注线 */}
        <g opacity={line} stroke="#ffffffaa" strokeWidth={2}>
          <line x1={BX - BW / 2 - 60} y1={BTOP} x2={BX - BW / 2 - 60} y2={BTOP + BH * line} />
          <line x1={BX - BW / 2 - 76} y1={BTOP} x2={BX - BW / 2 - 44} y2={BTOP} />
          <line x1={BX - BW / 2 - 76} y1={BBOT} x2={BX - BW / 2 - 44} y2={BBOT} />
          <line x1={BX - BW / 2 - 24} y1={BTOP} x2={BX - BW / 2 - 8} y2={BTOP} />
          <line x1={BX - BW / 2 - 24} y1={BBOT} x2={BX - BW / 2 - 8} y2={BBOT} />
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={BX - BW / 2 - 66} y1={BTOP + (BH * i) / 8} x2={BX - BW / 2 - 54} y2={BTOP + (BH * i) / 8} />
          ))}
        </g>
        <rect x={BX + BW / 2 + 44} y={BBOT - (BH * tok) / MAX_TOK} width={16} height={(BH * tok) / MAX_TOK} fill={alarm ? C.red : C.cyan} />
      </svg>
      <div style={{ position: "absolute", left: BX - BW / 2, top: BTOP - 58, fontFamily: MONO, fontSize: 28, color: C.mute, letterSpacing: 3, opacity: line }}>
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          left: BX + BW / 2 + 84,
          top: BBOT - 44,
          fontFamily: MONO,
          fontSize: 30,
          fontWeight: 700,
          color: alarm ? C.red : C.cyan,
          opacity: line,
          whiteSpace: "nowrap",
        }}
      >
        {Math.round(tok).toLocaleString("en-US")}
        <span style={{ color: C.mute }}> / {MAX_TOK.toLocaleString("en-US")}</span>
      </div>
    </>
  );
};

/** 故障字：三层错位叠加，随帧抖动后收敛 */
export const GlitchChar: React.FC<{ ch: string; at: number; size: number }> = ({ ch, at, size }) => {
  const f = useCurrentFrame();
  const t = f - at;
  const amp = t < 0 ? 0 : t < 14 ? 14 : 3 + (Math.floor(f / 4) % 6 === 0 ? 8 : 0);
  const j = (k: number) => (rand(Math.floor(f / 2) * 3.3 + k) - 0.5) * 2 * amp;
  return (
    <span style={{ position: "relative", display: "inline-block", color: C.red }}>
      <span style={{ position: "absolute", left: j(1), top: j(2), color: "transparent", WebkitTextStroke: "3px #ffffff" }}>{ch}</span>
      <span style={{ position: "absolute", left: j(3), top: j(4), color: "transparent", WebkitTextStroke: "2px #ffffff88" }}>{ch}</span>
      <span style={{ position: "relative", fontSize: size }}>{ch}</span>
    </span>
  );
};

export const Overflow: React.FC<OverflowProps> = (props) => {
  const { containerLabel, meterMax, tag, titleLines, glitchChar, captions, drawingNo = "CTX-001", music = true } = props;
  const MSGS = buildMsgs(props.messages);
  const T_FULL = MSGS[CAP] ? MSGS[CAP].at : Infinity;
  const f = useCurrentFrame();
  // 标题：在第二行（或第一行）里找要错位的字
  const inL2 = !!glitchChar && titleLines[1].includes(glitchChar);
  const inL1 = !inL2 && !!glitchChar && titleLines[0].includes(glitchChar);
  const splitAt = (line: string, on: boolean) => {
    if (!on || !glitchChar) return { pre: line, ch: "", post: "" };
    const k = line.indexOf(glitchChar);
    return { pre: line.slice(0, k), ch: glitchChar, post: line.slice(k + glitchChar.length) };
  };
  const L1 = splitAt(titleLines[0], inL1);
  const L2 = splitAt(titleLines[1], inL2);
  const maxLen = Math.max(...titleLines.map((l) => Array.from(l).length));
  const TS = Math.min(128, Math.floor(880 / Math.max(1, maxLen)));
  const alarm = f >= T_FULL ? 1 : 0;
  const sw = smooth(f, T_SWING, 16);
  const flash = f < T_FULL ? 0 : interpolate(f - T_FULL, [0, 6], [0.35, 0], clamp);
  const hits = MSGS.slice(CAP).map((m) => ({ at: m.at + 1, amp: 10 }));
  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(#ffffff2e 2px, transparent 2px), linear-gradient(90deg, #ffffff2e 2px, transparent 2px), linear-gradient(#ffffff12 1px, transparent 1px), linear-gradient(90deg, #ffffff12 1px, transparent 1px)",
          backgroundSize: "200px 200px, 200px 200px, 40px 40px, 40px 40px",
          backgroundPosition: "-40px -60px",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 40%, #062a6699 100%)" }} />
      {/* 图纸标题栏 */}
      <div
        style={{
          position: "absolute",
          right: 40,
          bottom: 36,
          border: "2px solid #ffffffaa",
          fontFamily: MONO,
          fontSize: 20,
          color: "#ffffffcc",
          display: "grid",
          gridTemplateColumns: "auto auto",
          opacity: prog(f, 4, 10),
        }}
      >
        {[["DWG", drawingNo], ["SCALE", "1 : 1"], ["STATUS", f >= T_FULL ? "OVERFLOW" : "OK"]].map(([k, v]) => (
          <React.Fragment key={k}>
            <div style={{ padding: "4px 12px", borderRight: "2px solid #ffffff66", borderTop: k === "DWG" ? "none" : "2px solid #ffffff66" }}>{k}</div>
            <div style={{ padding: "4px 12px", borderTop: k === "DWG" ? "none" : "2px solid #ffffff66", color: v === "OVERFLOW" ? C.red : "#fff" }}>{v}</div>
          </React.Fragment>
        ))}
      </div>

      <Camera
        keys={[
          { f: 0, s: 1.04 },
          { f: 20, s: 1.0 },
          { f: 96, s: 1.1 },
          { f: T_SWING + 10, s: 1.0 },
        ]}
        hits={hits}
      >
        {/* 窗口整体：标题出现时 3D 甩到右侧 */}
        <AbsoluteFill style={{ perspective: 1500 }}>
          <AbsoluteFill
            style={{
              transform: `translateX(${sw * 400}px) rotateY(${-sw * 30}deg) scale(${1 - sw * 0.14})`,
              transformOrigin: "50% 50%",
              opacity: 1 - sw * 0.25,
            }}
          >
            <Frame alarm={alarm} msgs={MSGS} label={containerLabel} MAX_TOK={meterMax} />
            {/* 新气泡从窗口底边下面顶上来：底边以下裁掉，上方留给碎片飞散 */}
            <AbsoluteFill style={{ clipPath: `polygon(-2000px -2000px, 4000px -2000px, 4000px ${BBOT - 4}px, -2000px ${BBOT - 4}px)` }}>
              <Stack alarm={alarm} msgs={MSGS} />
            </AbsoluteFill>
          </AbsoluteFill>
        </AbsoluteFill>
      </Camera>

      <AbsoluteFill style={{ background: C.red, opacity: flash * 0.8 }} />

      {f >= T_TITLE && (
        <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 130, paddingBottom: 60 }}>
          <div style={{ fontFamily: MONO, fontSize: 30, color: C.cyan, letterSpacing: 6, marginBottom: 18, opacity: prog(f, T_TITLE + 10, 6) }}>
            {tag}
          </div>
          <TitleLine at={T_TITLE} parts={L1} size={TS} />
          <TitleLine at={T_TITLE + 8} parts={L2} size={TS} />
        </AbsoluteFill>
      )}

      <CaptionPill
        y={960}
        bg="#ffffff"
        fg="#0d4aa8"
        accent="#f06a00"
        boxStyle={{ borderRadius: 4, fontFamily: '"PingFang SC", sans-serif' }}
        items={[
          ...captions.slice(0, 3).map((c, i) =>
            i === 0
              ? { ...c, at: 18, until: Math.min(T_FULL, T_SWING) - 2 }
              : i === 1
                ? { ...c, at: Number.isFinite(T_FULL) ? T_FULL : T_SWING - 30, until: T_SWING }
                : { ...c, at: T_HOOK },
          ),
        ]}
      />

      {music && <Bgm dur={OVERFLOW_DUR} vol={0.42} />}
      <Sfx at={0} src="tick-crisp_1.wav" vol={0.6} />
      <Sfx at={6} src="open_001.wav" vol={0.5} />
      {MSGS.map((m, i) => (
        <Sfx key={i} at={m.at} src={`pop_${(i % 4) + 1}.wav`} vol={0.5} />
      ))}
      {Number.isFinite(T_FULL) && <Sfx at={T_FULL + 1} src="error_004.wav" vol={0.6} />}
      {MSGS.slice(CAP + 1).map((m, i) => (
        <Sfx key={`l${i}`} at={m.at + 1} src="hit_2.wav" vol={0.35} />
      ))}
      <Sfx at={T_SWING} src="whoosh-long_1.wav" vol={0.7} />
      <Sfx at={T_TITLE} src="hit_1.wav" vol={0.9} />
      <Sfx at={T_TITLE + 16} src="land_2.wav" vol={0.8} />
      <Sfx at={T_HOOK} src="bong_001.wav" vol={0.5} />
    </AbsoluteFill>
  );
};

/** 一行标题：前段砸字 → 错位字 → 后段砸字 */
export const TitleLine: React.FC<{ at: number; parts: { pre: string; ch: string; post: string }; size: number }> = ({ at, parts, size }) => {
  const f = useCurrentFrame();
  const t1 = at + Array.from(parts.pre).length * 2;
  const t2 = t1 + 4;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {parts.pre && <SlamText at={at} text={parts.pre} size={size} color={C.text} stagger={2} />}
      {parts.ch && f >= t1 && (
        <span
          style={{
            fontSize: size,
            fontWeight: 600,
            lineHeight: 1.1,
            display: "inline-block",
            transform: `scale(${2.6 - 1.6 * snap(f, t1, { damping: 10, stiffness: 320 })})`,
          }}
        >
          <GlitchChar ch={parts.ch} at={t1} size={size} />
        </span>
      )}
      {parts.post && <SlamText at={parts.ch ? t2 : at + Array.from(parts.pre).length * 2} text={parts.post} size={size} color={C.text} stagger={2} />}
    </div>
  );
};
