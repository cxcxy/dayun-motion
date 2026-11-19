// 02 插线汇聚 · 波普漫画
// 明黄网点底 + 旋转放射光 + 粗黑描边 + 漫画爆炸星
// 节拍：机器人头从镜头前砸下 → 卡片左右交替冲进来、拉线插上（每插一个炸一颗星）→ 全线通电 → 立体砸字 → 红色斜切转场到章节卡
// 适合「一个核心连接很多东西」的选题：工具、插件、接口、多 Agent、工作流。
import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { BurstTicks, Bgm, Camera, CaptionPill, SlamText, SpeedLines, Sfx, Starburst } from "../../kit/fx";
import { FONT, LATIN } from "../../kit/fonts";
import { clamp, prog, snap } from "../../kit/motion";

export type HubPlugProps = {
  /** 中心机器人头下方的名牌 */
  hub: string;
  /** 2–6 个卡片；icon 用内置图标名，或直接写 1–2 个字/emoji */
  tools: { name: string; icon: string }[];
  title: string;
  subtitle: string;
  subtitleAccent?: string;
  /** 最多 2 条：主角登场 / 卡片插入 */
  captions: { text: string; accent?: string }[];
  /** 不填 chapterTitle 就不做斜切转场，停在标题上 */
  chapterTag?: string;
  chapterTitle?: string;
  music?: boolean;
};

export const HUB_PLUG_DUR = 210;
export const HUB_ICONS = ["globe", "folder", "code", "db", "cal", "search", "mail", "chat", "image", "terminal"];

export const hubPlugDefaults: HubPlugProps = {
  hub: "AI",
  tools: [
    { name: "浏览器", icon: "globe" },
    { name: "文件", icon: "folder" },
    { name: "代码库", icon: "code" },
    { name: "数据库", icon: "db" },
    { name: "日历", icon: "cal" },
    { name: "搜索", icon: "search" },
  ],
  title: "MCP",
  subtitle: "给 AI 装一个万能插座",
  subtitleAccent: "万能插座",
  captions: [
    { text: "AI 自己，只会聊天", accent: "只会聊天" },
    { text: "接上 MCP，工具一个个插进来", accent: "MCP" },
  ],
  chapterTag: "PART 01",
  chapterTitle: "它到底插的是什么",
  music: true,
};

export const C = { y1: "#ffd60a", y2: "#ffc300", ink: "#111111", red: "#ff3b2f", blue: "#2f6bff", white: "#ffffff" };
export const HX = 960;
export const HY = 470;
export const HS = 240;
const CARD = 176;
const COLX = 560;
const LINE = 9;

const T_HERO = 10;
const T_POWER = 92;
const T_TITLE = 108;
const T_DIVE = 150;
const T_CARD = 178;

export type Tool = { name: string; side: -1 | 1; row: -1 | 0 | 1; at: number; icon: string; pow: string };
const SLOTS: Array<{ side: -1 | 1; row: -1 | 0 | 1; at: number }> = [
  { side: -1, row: 0, at: 30 },
  { side: 1, row: 0, at: 45 },
  { side: -1, row: -1, at: 60 },
  { side: 1, row: 1, at: 68 },
  { side: -1, row: 1, at: 75 },
  { side: 1, row: -1, at: 82 },
];
export const buildTools = (list: HubPlugProps["tools"]): Tool[] =>
  list.slice(0, 6).map((t, i) => ({ ...SLOTS[i], name: t.name, icon: t.icon, pow: i % 2 ? "啪!" : "咔!" }));
export const cardPos = (t: Tool) => ({ x: HX + t.side * COLX, y: HY + t.row * 270 });

export const cable = (t: Tool) => {
  const c = cardPos(t);
  const p0 = { x: c.x - t.side * (CARD / 2), y: c.y };
  const p3 = { x: HX + t.side * (HS / 2 + 8), y: HY + t.row * 60 };
  const p1 = { x: p0.x - t.side * 150, y: p0.y };
  const p2 = { x: p3.x + t.side * 150, y: p3.y };
  return { p0, p1, p2, p3 };
};
const bez = (k: ReturnType<typeof cable>, t: number) => {
  const u = 1 - t;
  const f = (a: number, b: number, c: number, d: number) => u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
  return { x: f(k.p0.x, k.p1.x, k.p2.x, k.p3.x), y: f(k.p0.y, k.p1.y, k.p2.y, k.p3.y) };
};

export const Icon: React.FC<{ kind: string }> = ({ kind }) => {
  if (!HUB_ICONS.includes(kind)) {
    const txt = Array.from(kind).slice(0, 2).join("");
    return <div style={{ fontSize: txt.length > 1 ? 56 : 76, fontWeight: 900, color: C.ink, fontFamily: FONT, lineHeight: 1 }}>{txt}</div>;
  }
  const s = { stroke: C.ink, strokeWidth: 8, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width={96} height={96} viewBox="0 0 92 92">
      {kind === "globe" && (
        <>
          <circle cx={46} cy={46} r={34} {...s} fill={C.blue} />
          <ellipse cx={46} cy={46} rx={14} ry={34} {...s} />
          <line x1={12} y1={46} x2={80} y2={46} {...s} />
        </>
      )}
      {kind === "folder" && <path d="M10 26 h24 l8 9 h40 v38 h-72 z" {...s} fill={C.y1} />}
      {kind === "code" && (
        <>
          <path d="M30 26 L12 46 L30 66" {...s} />
          <path d="M62 26 L80 46 L62 66" {...s} />
          <path d="M52 20 L40 72" {...s} stroke={C.red} />
        </>
      )}
      {kind === "db" && (
        <>
          <path d="M14 22 v48 c0 8 64 8 64 0 v-48" {...s} fill={C.red} />
          <ellipse cx={46} cy={22} rx={32} ry={9} {...s} fill={C.white} />
          <path d="M14 46 c0 8 64 8 64 0" {...s} />
        </>
      )}
      {kind === "cal" && (
        <>
          <rect x={12} y={18} width={68} height={60} rx={8} {...s} fill={C.white} />
          <rect x={16} y={22} width={60} height={12} fill={C.red} />
          <path d="M12 36 h68" {...s} />
          <circle cx={32} cy={54} r={5} fill={C.ink} />
          <circle cx={48} cy={54} r={5} fill={C.ink} />
          <circle cx={64} cy={54} r={5} fill={C.blue} />
        </>
      )}
      {kind === "mail" && (
        <>
          <rect x={10} y={22} width={72} height={50} rx={8} {...s} fill={C.white} />
          <path d="M12 26 L46 52 L80 26" {...s} stroke={C.red} />
        </>
      )}
      {kind === "chat" && (
        <>
          <path d="M14 20 h64 v40 h-34 l-16 14 v-14 h-14 z" {...s} fill={C.blue} />
          <circle cx={34} cy={40} r={4} fill={C.white} />
          <circle cx={46} cy={40} r={4} fill={C.white} />
          <circle cx={58} cy={40} r={4} fill={C.white} />
        </>
      )}
      {kind === "image" && (
        <>
          <rect x={10} y={16} width={72} height={60} rx={8} {...s} fill={C.white} />
          <path d="M14 70 L36 44 L52 60 L62 50 L80 70" {...s} fill={C.blue} />
          <circle cx={62} cy={32} r={7} fill={C.red} stroke={C.ink} strokeWidth={5} />
        </>
      )}
      {kind === "terminal" && (
        <>
          <rect x={10} y={16} width={72} height={60} rx={8} {...s} fill={C.ink} />
          <path d="M24 36 L36 46 L24 56" {...s} stroke={C.y1} />
          <path d="M44 58 H66" {...s} stroke={C.y1} />
        </>
      )}
      {kind === "search" && (
        <>
          <circle cx={40} cy={40} r={24} {...s} fill={C.y1} />
          <path d="M58 58 L80 80" {...s} strokeWidth={12} />
        </>
      )}
    </svg>
  );
};

export const ToolCard: React.FC<{ t: Tool }> = ({ t }) => {
  const f = useCurrentFrame();
  if (f < t.at - 6) return null;
  const p = snap(f, t.at - 6, { damping: 11, stiffness: 230, mass: 0.6 });
  const c = cardPos(t);
  const lit = f >= t.at + 8;
  const dx = t.side * (1 - p) * 1300;
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: c.x - CARD / 2 + dx,
          top: c.y - CARD / 2,
          width: CARD,
          height: CARD,
          borderRadius: 26,
          background: C.white,
          border: `${LINE}px solid ${C.ink}`,
          boxShadow: `${t.side * -12}px 12px 0 ${lit ? C.red : C.ink}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `skewX(${t.side * (1 - p) * 24}deg) rotate(${t.side * (1 - p) * 14 + t.side * -3}deg)`,
          boxSizing: "border-box",
        }}
      >
        <Icon kind={t.icon} />
      </div>
      <div
        style={{
          position: "absolute",
          left: c.x - 100 + dx,
          width: 200,
          top: c.y + CARD / 2 + 22,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            background: C.ink,
            color: C.white,
            fontSize: 34,
            fontWeight: 600,
            fontFamily: FONT,
            padding: "4px 18px",
            transform: `rotate(${t.side * 2}deg)`,
          }}
        >
          {t.name}
        </div>
      </div>
      <SpeedLines at={t.at - 2} x={c.x + t.side * CARD * 0.55} y={c.y} dir={t.side} color={C.ink} spread={100} />
    </>
  );
};

export const Cables: React.FC<{ tools: Tool[] }> = ({ tools }) => {
  const f = useCurrentFrame();
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
      {tools.map((t, i) => {
        const k = cable(t);
        const p = prog(f, t.at + 1, 7, Easing.inOut(Easing.cubic));
        if (p <= 0) return null;
        const d = `M${k.p0.x} ${k.p0.y} C${k.p1.x} ${k.p1.y} ${k.p2.x} ${k.p2.y} ${k.p3.x} ${k.p3.y}`;
        const lit = f >= t.at + 8;
        const pulses = f >= T_POWER ? [0, 0.5].map((o) => ((f - T_POWER) / 12 + o + i * 0.13) % 1) : [];
        const dash = { pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - p, strokeLinecap: "round" as const, fill: "none" };
        return (
          <g key={i}>
            <path d={d} stroke={C.ink} strokeWidth={22} {...dash} />
            <path d={d} stroke={lit ? C.red : C.white} strokeWidth={8} {...dash} />
            {lit && <rect x={k.p3.x - 16} y={k.p3.y - 16} width={32} height={32} rx={6} fill={C.white} stroke={C.ink} strokeWidth={7} />}
            {pulses.map((q, j) => {
              const pt = bez(k, q);
              return <circle key={j} cx={pt.x} cy={pt.y} r={13} fill={C.y1} stroke={C.ink} strokeWidth={6} />;
            })}
          </g>
        );
      })}
    </svg>
  );
};

/** 机器人头 */
export const Robot: React.FC<{ tools: Tool[]; hub: string }> = ({ tools, hub }) => {
  const f = useCurrentFrame();
  const inP = interpolate(f, [0, T_HERO], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const t = f - T_HERO;
  const k = t >= 0 ? Math.exp(-t / 5) * Math.cos(t * 0.8) : 0;
  let sx = t < 0 ? 3.6 - 2.6 * inP : 1 + k * 0.18;
  let sy = t < 0 ? sx : 1 - k * 0.18;
  for (const tool of tools) {
    const tt = f - (tool.at + 8);
    if (tt >= 0 && tt < 12) {
      const w = 0.09 * Math.exp(-tt / 3) * Math.cos(tt * 0.9);
      sx += w;
      sy -= w;
    }
  }
  const power = prog(f, T_POWER, 8);
  const blink = (f > 52 && f < 56) || (f > 128 && f < 132);
  const eyeH = blink ? 10 : 56 + power * 16;
  return (
    <div
      style={{
        position: "absolute",
        left: HX - HS / 2,
        top: HY - HS / 2,
        width: HS,
        height: HS,
        transform: `scale(${sx}, ${sy})`,
        transformOrigin: "50% 80%",
      }}
    >
      {/* 名牌 */}
      <div style={{ position: "absolute", left: -100, width: HS + 200, top: HS + 34, display: "flex", justifyContent: "center" }}>
        <div style={{ background: C.ink, color: C.y1, fontSize: 40, fontWeight: 900, fontFamily: LATIN, padding: "2px 22px", transform: "rotate(-2deg)", whiteSpace: "nowrap" }}>
          {hub}
        </div>
      </div>
      {/* 天线 */}
      <div style={{ position: "absolute", left: HS / 2 - 5, top: -64, width: 10, height: 60, background: C.ink }} />
      <div
        style={{
          position: "absolute",
          left: HS / 2 - 22,
          top: -96,
          width: 44,
          height: 44,
          borderRadius: 22,
          background: power > 0 && Math.floor(f / 3) % 2 ? C.y1 : C.red,
          border: `${LINE}px solid ${C.ink}`,
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 54,
          background: C.white,
          border: `${LINE + 2}px solid ${C.ink}`,
          boxShadow: `14px 16px 0 ${C.ink}`,
          boxSizing: "border-box",
        }}
      >
        {[-1, 1].map((d) => (
          <div
            key={d}
            style={{
              position: "absolute",
              left: HS / 2 + d * 50 - 22,
              top: 70 + (56 - eyeH) / 2,
              width: 44,
              height: eyeH,
              borderRadius: 22,
              background: C.ink,
            }}
          >
            {!blink && <div style={{ position: "absolute", left: 9, top: 9, width: 14, height: 14, borderRadius: 7, background: C.white }} />}
          </div>
        ))}
        {/* 腮红 + 嘴 */}
        {[-1, 1].map((d) => (
          <div
            key={d}
            style={{ position: "absolute", left: HS / 2 + d * 82 - 20, top: 140, width: 40, height: 22, borderRadius: 11, background: C.red, opacity: 0.35 + power * 0.65 }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: HS / 2 - 34,
            top: 154,
            width: 68,
            height: 20 + power * 18,
            borderRadius: "0 0 40px 40px",
            background: C.ink,
          }}
        />
      </div>
    </div>
  );
};

export const HubPlug: React.FC<HubPlugProps> = (props) => {
  const { hub, title, subtitle, subtitleAccent, captions, chapterTag, chapterTitle, music = true } = props;
  const tools = buildTools(props.tools);
  const f = useCurrentFrame();
  const latin = /^[\x00-\x7f]+$/.test(title);
  const tLen = Array.from(title).length;
  const titleSize = latin ? Math.min(260, Math.floor(2600 / Math.max(3, tLen))) : Math.min(190, Math.floor(1500 / Math.max(1, tLen)));
  const subParts = subtitleAccent && subtitle.includes(subtitleAccent) ? subtitle.split(subtitleAccent) : [subtitle];
  const hasCard = !!chapterTitle;
  const titleOut = hasCard ? interpolate(f, [T_DIVE, T_DIVE + 8], [1, 0], clamp) : 1;
  // 斜切擦除：一条红色斜带从左扫到右盖满画面
  const wipe = prog(f, T_CARD - 10, 11, Easing.inOut(Easing.cubic));
  const wx = -100 + wipe * 2800;
  const spin = f * (f >= T_POWER ? 1.4 : 0.35);
  return (
    <AbsoluteFill style={{ background: C.y1, fontFamily: FONT, overflow: "hidden" }}>
      {/* 旋转放射光 + 网点 */}
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 3000,
            height: 3000,
            flexShrink: 0,
            background: `repeating-conic-gradient(${C.y1} 0deg 9deg, ${C.y2} 9deg 18deg)`,
            transform: `rotate(${spin}deg)`,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${C.ink}26 3px, transparent 3.6px)`,
          backgroundSize: "22px 22px",
          WebkitMaskImage: "radial-gradient(circle at 50% 45%, transparent 25%, #000 85%)",
        }}
      />

      <Camera
        keys={[
          { f: 0, s: 1.3 },
          { f: 24, s: 1.3 },
          { f: 88, s: 0.94 },
          { f: T_TITLE - 4, s: 0.94 },
          { f: T_TITLE + 8, s: 0.64, y: 170 },
          { f: T_DIVE, s: 0.68, y: 170, r: -2 },
        ]}
        hits={[{ at: T_HERO, amp: 30 }, ...tools.map((t) => ({ at: t.at + 8, amp: 9 })), { at: T_POWER, amp: 14 }, { at: T_TITLE, amp: 18 }]}
      >
        <Starburst at={T_HERO} x={HX} y={HY} r={330} fill={C.white} stroke={C.ink} points={14} hold={8} seed={0.4} />
        <Cables tools={tools} />
        {tools.map((t) => (
          <ToolCard key={t.name} t={t} />
        ))}
        <BurstTicks at={T_HERO} x={HX} y={HY} r={260} color={C.ink} count={16} len={80} width={12} />
        <Robot tools={tools} hub={hub} />
        <Starburst at={T_HERO + 1} x={HX + 230} y={HY - 210} r={95} fill={C.red} stroke={C.ink} text="砰!" points={10} hold={14} seed={1.3} />
        {tools.map((t, i) => {
          const k = cable(t);
          return (
            <Starburst
              key={t.name}
              at={t.at + 8}
              x={k.p3.x + t.side * 40}
              y={k.p3.y - 70}
              r={62}
              fill={i % 2 ? C.blue : C.red}
              stroke={C.ink}
              text={t.pow}
              points={9}
              hold={7}
              seed={i * 0.7}
            />
          );
        })}
        <BurstTicks at={T_POWER} x={HX} y={HY} r={250} color={C.red} count={20} len={90} width={12} rot={0.17} />
      </Camera>

      {/* 立体砸字标题 */}
      {f >= T_TITLE && (
        <AbsoluteFill style={{ opacity: titleOut, alignItems: "center", paddingTop: 40 }}>
          <SlamText
            at={T_TITLE}
            text={title}
            size={titleSize}
            color={C.white}
            font={latin ? LATIN : FONT}
            weight={latin ? 900 : 600}
            stagger={3}
            gap={14}
            charStyle={{
              WebkitTextStroke: `12px ${C.ink}`,
              paintOrder: "stroke fill",
              textShadow: Array.from({ length: 14 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${i > 10 ? C.ink : C.red}`).join(","),
            }}
          />
          <div
            style={{
              marginTop: 8,
              background: C.ink,
              color: C.white,
              fontSize: 66,
              fontWeight: 600,
              padding: "8px 34px",
              transform: `rotate(-2.5deg) scaleX(${snap(f, T_TITLE + 12, { damping: 14 })})`,
            }}
          >
            {subParts.map((p, k) => (
              <React.Fragment key={k}>
                {p}
                {k < subParts.length - 1 && <span style={{ color: C.y1 }}>{subtitleAccent}</span>}
              </React.Fragment>
            ))}
          </div>
        </AbsoluteFill>
      )}

      {/* 红色斜切转场 → 章节卡 */}
      {hasCard && wipe > 0 && (
        <AbsoluteFill
          style={{
            background: C.red,
            clipPath: `polygon(-100px 0, ${wx}px 0, ${wx - 700}px 1080px, -100px 1080px)`,
          }}
        >
          <AbsoluteFill
            style={{
              backgroundImage: `radial-gradient(${C.ink}30 3px, transparent 3.6px)`,
              backgroundSize: "22px 22px",
            }}
          />
          {f >= T_CARD && (
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
              <div
                style={{
                  background: C.y1,
                  border: `${LINE}px solid ${C.ink}`,
                  fontSize: 40,
                  fontWeight: 900,
                  fontFamily: LATIN,
                  padding: "4px 24px",
                  marginBottom: 28,
                  transform: `rotate(-3deg) scale(${snap(f, T_CARD + 4)})`,
                }}
              >
                {chapterTag ?? "PART 01"}
              </div>
              <SlamText
                at={T_CARD}
                text={chapterTitle ?? ""}
                size={124}
                color={C.white}
                stagger={1.5}
                charStyle={{ WebkitTextStroke: `10px ${C.ink}`, paintOrder: "stroke fill", textShadow: `8px 8px 0 ${C.ink}` }}
              />
            </AbsoluteFill>
          )}
        </AbsoluteFill>
      )}

      <CaptionPill
        y={950}
        bg={C.white}
        fg={C.ink}
        accent={C.red}
        boxStyle={{ border: `6px solid ${C.ink}`, borderRadius: 6, boxShadow: `8px 8px 0 ${C.ink}`, transform: "rotate(-1.5deg)" }}
        items={[
          ...captions.slice(0, 2).map((c, i) => (i === 0 ? { ...c, at: 13 } : { ...c, at: 31, until: T_TITLE - 4 })),
        ]}
      />

      {music && <Bgm dur={HUB_PLUG_DUR} />}
      <Sfx at={0} src="whoosh-short_2.wav" vol={0.7} />
      <Sfx at={T_HERO - 1} src="hit_1.wav" vol={1} />
      <Sfx at={T_HERO} src="land_1.wav" vol={0.7} />
      {tools.map((t, i) => (
        <React.Fragment key={t.name}>
          <Sfx at={t.at - 6} src={i % 2 ? "whoosh-short_1.wav" : "whoosh-short_2.wav"} vol={0.55} />
          <Sfx at={t.at + 8} src={i % 2 ? "snap_2.wav" : "snap_1.wav"} vol={0.85} />
        </React.Fragment>
      ))}
      <Sfx at={T_POWER} src="glass_002.wav" vol={0.7} />
      <Sfx at={T_TITLE} src="hit_2.wav" vol={1} />
      <Sfx at={T_TITLE + 3} src="pop_1.wav" vol={0.6} />
      <Sfx at={T_TITLE + 6} src="pop_3.wav" vol={0.6} />
      <Sfx at={T_TITLE + 12} src="bong_001.wav" vol={0.5} />
      {hasCard && <Sfx at={T_CARD - 10} src="whoosh-long_1.wav" vol={0.8} />}
      {hasCard && <Sfx at={T_CARD} src="hit_1.wav" vol={0.9} />}
    </AbsoluteFill>
  );
};
