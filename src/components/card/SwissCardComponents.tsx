// 瑞士无描边卡片组件：双栏等高裁决卡（VerdictSplit）、立体分层四宫格（BentoQuad）
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Sfx } from "../../kit/fx";
import { MONO } from "../../kit/fonts";
import { clamp, prog, snap } from "../../kit/motion";
import {
  BentoCard,
  easeBack,
  easeInOut,
  fitFont,
  floatY,
  getSwissPalette,
  PulseRings,
  StudioCanvas,
  SWISS_BASE,
  SWISS_HEAVY,
  SWISS_METRIC,
  SwissHeaderBar,
  SwissTag,
  SwissTheme,
} from "../../kit/swiss";

// ============================================================================
// 1. 双栏等高裁决卡（VerdictSplit）
// ============================================================================
export type VerdictSplitProps = {
  theme: SwissTheme;
  header: string;
  codeTag: string;
  verdictSymbol: string;
  left: { tag: string; num: string; title: string; sub: string; items: string[]; footer: string };
  right: { tag: string; num: string; title: string; sub: string; items: string[]; footer: string };
};

export const verdictSplitDefaults: VerdictSplitProps = {
  theme: "crimson",
  header: "实操跑通 vs 碎片概念贴",
  codeTag: "VERDICT SPLIT",
  verdictSymbol: ">",
  left: {
    tag: "高留存实操法",
    num: "1",
    title: "套可跑通最小源码",
    sub: "从第一行代码亲眼看清闭环运转",
    items: ["01 看清目录结构", "02 读取核心实现", "03 跑通白名单单测", "04 带证据交差"],
    footer: "认知彻底落地 · 随时可改可扩展",
  },
  right: {
    tag: "低效囤积法",
    num: "10",
    title: "篇二手概念盘点",
    sub: "收藏夹吃灰，遇到真项目照样发懵",
    items: ["01 全景架构名词图", "02 十大框架横评表", "03 协议概念速查卡", "04 万能提示词合集"],
    footer: "只背流行术语 · 黑盒依旧没拆开",
  },
};

export const VerdictSplit: React.FC<VerdictSplitProps> = ({
  theme = "crimson",
  header,
  codeTag,
  verdictSymbol = ">",
  left,
  right,
}) => {
  const f = useCurrentFrame();
  const pal = getSwissPalette(theme);
  const leftIn = snap(f, 4, { damping: 15, stiffness: 220 });
  const rightIn = snap(f, 26, { damping: 15, stiffness: 220 });
  const sealIn = snap(f, 28, { damping: 12, stiffness: 250 });
  const dimRight = prog(f, 52, 18, easeInOut);

  return (
    <StudioCanvas>
      <SwissHeaderBar title={header} codeTag={codeTag} theme={theme} enter={prog(f, 0, 10)} />

      {/* 左胜出黑曜石大卡 */}
      <BentoCard
        x={110}
        y={168}
        w={806}
        h={680}
        variant="dark"
        active
        theme={theme}
        radius={24}
        style={{
          padding: "44px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          opacity: prog(f, 4, 8),
          transform: `translateY(${(1 - leftIn) * 36}px) scale(${0.94 + 0.06 * leftIn})`,
        }}
      >
        <div>
          <SwissTag text={left.tag} variant="accent" theme={theme} size={24} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 22 }}>
            <span style={{ fontFamily: SWISS_METRIC, fontWeight: 900, fontSize: 146, lineHeight: 0.86, color: "#FFFFFF" }}>
              {left.num}
            </span>
            <div>
              <div style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: fitFont(left.title, 48, 520, 30), color: "#FFFFFF" }}>
                {left.title}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: SWISS_BASE.mutedOnDark, marginTop: 8 }}>{left.sub}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {left.items.slice(0, 4).map((st, idx) => {
            const sp = prog(f, 12 + idx * 5, 11, easeBack);
            const hot = idx === left.items.slice(0, 4).length - 1;
            return (
              <div
                key={idx}
                style={{
                  height: 72,
                  borderRadius: 14,
                  padding: "0 20px",
                  backgroundColor: hot ? pal.tintDark : "rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  opacity: Math.min(1, sp),
                  transform: `translateY(${(1 - sp) * 16}px)`,
                }}
              >
                <span style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: fitFont(st, 24, 280, 18), color: "#FFFFFF" }}>
                  {st}
                </span>
                <span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: hot ? pal.accentOnDark : "#FFFFFF" }} />
              </div>
            );
          })}
        </div>

        <div
          style={{
            paddingTop: 20,
            borderTop: "1px solid rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: SWISS_HEAVY,
            fontWeight: 900,
            fontSize: 26,
            color: pal.accentOnDark,
          }}
        >
          <span>{left.footer}</span>
          <span>100%</span>
        </div>
      </BentoCard>

      {/* 右退让灰白对照卡 */}
      {f >= 24 && (
        <BentoCard
          x={1004}
          y={168}
          w={806}
          h={680}
          radius={24}
          style={{
            padding: "44px 48px",
            background: "linear-gradient(180deg, #F8F9FB 0%, #EBEEF4 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: prog(f, 25, 8) * (1 - dimRight * 0.24),
            transform: `translateX(${(1 - rightIn) * 48}px) scale(${0.95 + 0.05 * rightIn - dimRight * 0.02})`,
          }}
        >
          <div>
            <SwissTag text={right.tag} size={24} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 22 }}>
              <span style={{ fontFamily: SWISS_METRIC, fontWeight: 900, fontSize: 146, lineHeight: 0.86, color: "#7A808E" }}>
                {right.num}
              </span>
              <div>
                <div style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: fitFont(right.title, 48, 480, 30), color: "#494E5B" }}>
                  {right.title}
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: SWISS_BASE.muted, marginTop: 8 }}>{right.sub}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {right.items.slice(0, 4).map((rowTxt, idx) => (
              <div
                key={idx}
                style={{
                  height: 52,
                  borderRadius: 12,
                  padding: "0 20px",
                  backgroundColor: "rgba(255,255,255,0.80)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontWeight: 700,
                  fontSize: 22,
                  color: "#767C8A",
                  opacity: 1 - dimRight * 0.3,
                }}
              >
                <span>{rowTxt}</span>
                <span style={{ fontFamily: MONO, fontSize: 18, color: "#9BA1B0" }}>···</span>
              </div>
            ))}
          </div>

          <div
            style={{
              paddingTop: 20,
              borderTop: "1px solid rgba(20,20,23,0.09)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: SWISS_HEAVY,
              fontWeight: 900,
              fontSize: 26,
              color: SWISS_BASE.muted,
            }}
          >
            <span>{right.footer}</span>
            <span>×</span>
          </div>
        </BentoCard>
      )}

      {/* 中轴圆形裁决章 */}
      {f >= 26 && (
        <div
          style={{
            position: "absolute",
            left: 960 - 48,
            top: 508 - 48,
            width: 96,
            height: 96,
            borderRadius: 48,
            background: pal.accentSurf,
            boxShadow: pal.shSolid,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: SWISS_METRIC,
            fontWeight: 900,
            fontSize: 56,
            color: "#FFFFFF",
            transform: `scale(${sealIn})`,
            zIndex: 10,
          }}
        >
          {verdictSymbol}
        </div>
      )}

      <Sfx at={4} src="whoosh-short_1.wav" vol={0.55} />
      <Sfx at={28} src="snap_1.wav" vol={0.75} />
      <Sfx at={52} src="bong_001.wav" vol={0.55} />
    </StudioCanvas>
  );
};

// ============================================================================
// 2. 立体分层四宫格（BentoQuad）— 左等轴测四层立体叠装引擎 + 右严格对齐 2×2 无描边矩阵
// ============================================================================
export type BentoQuadProps = {
  theme: SwissTheme;
  header: string;
  codeTag: string;
  stageCaption: string;
  stageReadyLabel: string;
  cards: { code: string; title: string; desc: string }[];
};

export const bentoQuadDefaults: BentoQuadProps = {
  theme: "green",
  header: "技术架构师 · 零黑盒拆解四大模块",
  codeTag: "4-MODULE BENTO",
  stageCaption: "最小闭环立体结构",
  stageReadyLabel: "● 四大模块闭环运转",
  cards: [
    { code: "LLM", title: "大模型", desc: "负责推理判断与下一步决策" },
    { code: "TOOLS", title: "工具箱", desc: "看目录、读文件、跑白名单命令" },
    { code: "LOOP", title: "核心循环", desc: "二十行主干持续推进多轮闭环" },
    { code: "MEMORY", title: "记忆层", desc: "留住当前上下文与长期项目事实" },
  ],
};

/** 纯 SVG 等轴测四层立体叠装引擎（逐层落位咬合） */
const IsoStackEngineSvg: React.FC<{ f: number; color: string }> = ({ f, color }) => {
  const d1 = prog(f, 8, 16, easeBack);
  const d2 = prog(f, 20, 16, easeBack);
  const d3 = prog(f, 32, 16, easeBack);
  const d4 = prog(f, 44, 16, easeBack);
  const orbit = prog(f, 56, 18, easeInOut);
  const ang = (f / 30) * 1.4;

  const isoSlab = (y: number, w: number, h: number, thick: number, topFill: string, sideFill: string, op: number) => (
    <g transform={`translate(0 ${y})`} opacity={Math.min(1, op)}>
      <polygon points={`0,${h} ${w},0 ${w},${thick} 0,${h + thick}`} fill={sideFill} />
      <polygon points={`0,${h} ${-w},0 ${-w},${thick} 0,${h + thick}`} fill="#101218" opacity={0.85} />
      <polygon points={`0,${-h} ${w},0 0,${h} ${-w},0`} fill={topFill} />
    </g>
  );

  return (
    <svg width={680} height={540} viewBox="-340 -260 680 540" style={{ overflow: "visible" }}>
      {/* 外圈闭环能量轨道 */}
      {orbit > 0 && (
        <g transform={`scale(${orbit}) rotate(${-18 + f * 0.25})`}>
          <ellipse cx={0} cy={0} rx={238} ry={196} fill="none" stroke={color} strokeWidth={6} opacity={0.9} />
        </g>
      )}

      {/* 中轴柱 */}
      <line x1={0} y1={-165} x2={0} y2={165} stroke="#141417" strokeWidth={6} opacity={0.22} />

      {/* Layer 4 (Bottom): 陶瓷白记忆底座 */}
      {d4 > 0 && (
        <g transform={`translate(0 ${interpolate(d4, [0, 1], [195, 118], clamp)})`}>
          {isoSlab(0, 162, 76, 24, "#F6F8FC", "#CFD5E2", d4)}
          {isoSlab(-6, 128, 58, 8, "#181A22", "#101218", d4)}
        </g>
      )}

      {/* Layer 3 (Lower-Mid): 驱动齿轮环 */}
      {d3 > 0 && (
        <g transform={`translate(0 ${interpolate(d3, [0, 1], [120, 42], clamp)}) scale(${d3})`}>
          <ellipse cx={0} cy={0} rx={164} ry={66} fill="none" stroke="#1E212B" strokeWidth={11} />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k * Math.PI) / 3 - ang;
            return (
              <circle
                key={k}
                cx={Math.cos(a) * 164}
                cy={Math.sin(a) * 66}
                r={12}
                fill={k % 2 === 0 ? color : "#141417"}
              />
            );
          })}
        </g>
      )}

      {/* 中心旋转晶核 */}
      <g transform={`translate(0 -6) scale(${prog(f, 2, 14, easeBack)})`}>
        <polygon points="0,-46 -38,0 0,46 38,0" fill={color} />
        <polygon points="0,-46 38,0 0,46" fill="#000000" opacity={0.18} />
      </g>

      {/* Layer 2 (Upper-Mid): 主色工具环 + 四向模块块 */}
      {d2 > 0 && (
        <g transform={`translate(0 ${interpolate(d2, [0, 1], [-115, -44], clamp)}) scale(${d2})`}>
          <ellipse cx={0} cy={0} rx={142} ry={56} fill="none" stroke={color} strokeWidth={9} />
          {[0, 1, 2, 3].map((k) => {
            const a = (k * Math.PI) / 2 + ang * 0.8;
            const px = Math.cos(a) * 142;
            const py = Math.sin(a) * 56;
            return <rect key={k} x={px - 18} y={py - 13} width={36} height={26} rx={6} fill={color} stroke="#FFFFFF" strokeWidth={2} />;
          })}
        </g>
      )}

      {/* Layer 1 (Top): 黑曜石推理顶冠 */}
      {d1 > 0 && (
        <g transform={`translate(0 ${interpolate(d1, [0, 1], [-210, -124], clamp)})`}>
          {isoSlab(0, 142, 64, 22, "#222530", "#14161D", d1)}
          {isoSlab(-10, 76, 34, 8, color, color, d1)}
        </g>
      )}
    </svg>
  );
};

export const BentoQuad: React.FC<BentoQuadProps> = ({
  theme = "green",
  header,
  codeTag,
  stageCaption,
  stageReadyLabel,
  cards,
}) => {
  const f = useCurrentFrame();
  const pal = getSwissPalette(theme);
  const ready = f >= 58;

  return (
    <StudioCanvas>
      <SwissHeaderBar title={header} codeTag={codeTag} theme={theme} enter={prog(f, 0, 10)} />

      {/* 左侧立体结构舞台（x=110, w=748, h=660，与右侧 2×2 严丝合缝等高） */}
      <BentoCard
        x={110}
        y={168}
        w={748}
        h={660}
        radius={24}
        style={{
          background: "linear-gradient(180deg, #FFFFFF 0%, #F2F4F9 100%)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(20,20,23,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,20,23,0.04) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <PulseRings cx={374} cy={306} r={135} f={f} color={pal.accent} />
        <div style={{ position: "absolute", left: 34, top: 28, width: 680, height: 540 }}>
          <IsoStackEngineSvg f={f} color={pal.accent} />
        </div>
        <div
          style={{
            position: "absolute",
            left: 36,
            right: 36,
            bottom: 26,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: SWISS_HEAVY,
            fontWeight: 900,
            fontSize: 24,
            color: SWISS_BASE.muted,
          }}
        >
          <span>{stageCaption}</span>
          <span style={{ color: ready ? pal.accent : SWISS_BASE.muted }}>{ready ? stageReadyLabel : "● 逐层组装中"}</span>
        </div>
      </BentoCard>

      {/* 右侧严格对齐 2×2 无描边卡片矩阵（x=894..1810, y=168..828） */}
      {cards.slice(0, 4).map((c, idx) => {
        const at = 8 + idx * 12;
        if (f < at) return null;
        const sp = snap(f, at, { damping: 15, stiffness: 220 });
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const cardW = 442;
        const cardH = 314;
        const variant = idx === 0 ? "dark" : idx === 1 ? "accent" : "light";
        return (
          <BentoCard
            key={idx}
            x={894 + col * (cardW + 32)}
            y={168 + row * (cardH + 32) + floatY(f, idx * 1.1, 2.5)}
            w={cardW}
            h={cardH}
            variant={variant}
            active={ready && variant === "light"}
            theme={theme}
            radius={24}
            style={{
              padding: "34px 38px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              opacity: Math.min(1, sp * 1.4),
              transform: `translateY(${(1 - sp) * 32}px) scale(${0.92 + 0.08 * sp})`,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span
                  style={{
                    fontFamily: MONO,
                    fontSize: 22,
                    fontWeight: 800,
                    color: variant === "accent" ? pal.accentPale : variant === "dark" ? pal.accentOnDark : pal.accent,
                    letterSpacing: "0.06em",
                  }}
                >
                  {`0${idx + 1} · ${c.code}`}
                </span>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: variant === "accent" ? "#FFFFFF" : pal.accent,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: SWISS_HEAVY,
                  fontWeight: 900,
                  fontSize: fitFont(c.title, 46, 360, 30),
                  color: variant === "light" ? SWISS_BASE.ink : "#FFFFFF",
                  marginTop: 18,
                }}
              >
                {c.title}
              </div>
            </div>

            <div
              style={{
                paddingTop: 18,
                borderTop:
                  variant === "accent"
                    ? "1px solid rgba(255,255,255,0.24)"
                    : variant === "dark"
                      ? "1px solid rgba(255,255,255,0.12)"
                      : "1px solid rgba(20,20,23,0.08)",
                fontWeight: 700,
                fontSize: fitFont(c.desc, 24, 360, 18),
                color: variant === "accent" ? pal.accentPale : variant === "dark" ? "#A4ACBD" : SWISS_BASE.muted,
                lineHeight: 1.35,
              }}
            >
              {c.desc}
            </div>
          </BentoCard>
        );
      })}

      <Sfx at={8} src="pop_1.wav" vol={0.55} />
      <Sfx at={20} src="pop_2.wav" vol={0.55} />
      <Sfx at={32} src="pop_3.wav" vol={0.55} />
      <Sfx at={44} src="pop_4.wav" vol={0.55} />
      <Sfx at={58} src="maximize_002.wav" vol={0.55} />
    </StudioCanvas>
  );
};
