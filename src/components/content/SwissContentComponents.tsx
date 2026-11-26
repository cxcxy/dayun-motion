// 瑞士无描边内容机制组件：源码透镜聚焦（CodeLens）、核心变形与三层护甲（ArmorMorph）、管道注入与门禁锁（ConduitLocks）
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { Sfx } from "../../kit/fx";
import { MONO } from "../../kit/fonts";
import { clamp, prog, snap } from "../../kit/motion";
import {
  BentoCard,
  easeBack,
  easeExpo,
  easeInOut,
  fitFont,
  floatY,
  getSwissPalette,
  PulseRings,
  StudioCanvas,
  SWISS_BASE,
  SWISS_HEAVY,
  SWISS_METRIC,
  SWISS_SH,
  SwissHeaderBar,
  SwissTag,
  SwissTheme,
} from "../../kit/swiss";

// ============================================================================
// 1. 源码透镜聚焦（CodeLens）— 窗口静止零跳动 + 逐字键入 + 行内大白话胶囊透镜
// ============================================================================
export type CodeLensProps = {
  theme: SwissTheme;
  fileBadge: string;
  windowTitle: string;
  statusLabel: string;
  startLineNumber: number;
  lines: string[];
  typeRange: [number, number];
  highlights: { from: number; to: number; at: number }[];
  lenses: { row: number; text: string; at: number }[];
};

export const codeLensDefaults: CodeLensProps = {
  theme: "green",
  fileBadge: "agent.py",
  windowTitle: "划定范围：硬上限常量与只读命令白名单",
  statusLabel: "VS Code · 真实源码",
  startLineNumber: 18,
  lines: [
    'WORKSPACE = Path(os.environ.get("AGENT_WORKSPACE", "./sample_repo")).resolve()',
    "MAX_STEPS = 8",
    "MAX_TOOL_CALLS = 16",
    "MAX_FILE_BYTES = 100_000",
    "COMMAND_TIMEOUT_SECONDS = 10",
    "",
    "# 白名单映射到精确 argv 列表，杜绝 shell=True 注入",
    "COMMAND_WHITELIST: dict[str, list[str]] = {",
    '    "python3 -m unittest": [sys.executable, "-m", "unittest"],',
    '    "python3 -m unittest -v": [sys.executable, "-m", "unittest", "-v"],',
    '    "git status": ["git", "status"],',
    "}",
  ],
  typeRange: [0, 4],
  highlights: [
    { from: 1, to: 1, at: 56 },
    { from: 7, to: 11, at: 84 },
  ],
  lenses: [
    { row: 1, text: "克制范围：最多跑 8 步", at: 58 },
    { row: 7, text: "只许执行这 3 条白名单命令", at: 86 },
  ],
};

const renderSyntax = (line: string, kwColor: string) => {
  if (line.trimStart().startsWith("#")) {
    return <span style={{ color: "#6A9955" }}>{line}</span>;
  }
  const tokens = line.split(/(".*?"|\b(?:def|for|in|if|not|return|import|from|dict|list|str|int)\b|\b\d[\d_]*\b)/g);
  return tokens.map((tok, idx) => {
    if (!tok) return null;
    if (tok.startsWith('"')) return <span key={idx} style={{ color: "#CE9178" }}>{tok}</span>;
    if (/^(def|for|in|if|not|return|import|from)$/.test(tok))
      return <span key={idx} style={{ color: kwColor, fontWeight: 700 }}>{tok}</span>;
    if (/^(dict|list|str|int)$/.test(tok)) return <span key={idx} style={{ color: "#4EC9B0" }}>{tok}</span>;
    if (/^\d[\d_]*$/.test(tok)) return <span key={idx} style={{ color: "#B5CEA8" }}>{tok}</span>;
    return <span key={idx} style={{ color: "#D4D4D4" }}>{tok}</span>;
  });
};

export const CodeLens: React.FC<CodeLensProps> = ({
  theme = "green",
  fileBadge,
  windowTitle,
  statusLabel,
  startLineNumber = 1,
  lines,
  typeRange = [0, 3],
  highlights,
  lenses,
}) => {
  const f = useCurrentFrame();
  const pal = getSwissPalette(theme);
  const enter = snap(f, 0, { damping: 16, stiffness: 200 });
  const visibleLines = lines.slice(0, 14);
  const lh = Math.min(54, Math.floor(740 / Math.max(8, visibleLines.length)));

  // 逐字打字进度（帧 10..52）
  const [tFrom, tTo] = typeRange;
  const typedTotal = visibleLines
    .slice(tFrom, tTo + 1)
    .reduce((acc, s) => acc + Math.max(1, s.length), 0);
  let budget = interpolate(f, [10, 52], [0, typedTotal], clamp);

  let cursorRow = -1;
  let cursorChars = 0;
  const shownLines = visibleLines.map((raw, idx) => {
    if (idx < tFrom || idx > tTo || f >= 52) return raw;
    if (f < 10) return "";
    const len = Math.max(1, raw.length);
    if (budget <= 0) return "";
    if (budget < len) {
      const n = Math.floor(budget);
      if (cursorRow < 0) {
        cursorRow = idx;
        cursorChars = n;
      }
      budget = 0;
      return raw.slice(0, n);
    }
    budget -= len;
    return raw;
  });

  const livePulse = 0.45 + 0.55 * Math.pow(Math.sin(f * 0.14), 2);

  return (
    <StudioCanvas>
      <div
        style={{
          position: "absolute",
          left: 88,
          top: 86,
          width: 1744,
          height: 908,
          borderRadius: 26,
          backgroundColor: "#1E1F24",
          boxShadow: SWISS_SH.window,
          overflow: "hidden",
          transform: `translateY(${(1 - enter) * 24}px) scale(${0.97 + 0.03 * enter})`,
        }}
      >
        {/* 顶栏 */}
        <div
          style={{
            height: 64,
            background: "linear-gradient(180deg, #262830 0%, #1A1B20 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            padding: "0 28px",
            gap: 11,
          }}
        >
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c }} />
          ))}
          <span
            style={{
              marginLeft: 16,
              padding: "4px 16px",
              borderRadius: 999,
              background: pal.accentSurf,
              boxShadow: pal.shPill,
              fontFamily: MONO,
              fontWeight: 800,
              fontSize: 21,
              color: "#FFFFFF",
            }}
          >
            {fileBadge}
          </span>
          <span
            style={{
              marginLeft: 8,
              fontFamily: SWISS_HEAVY,
              fontWeight: 900,
              fontSize: fitFont(windowTitle, 30, 960, 20),
              color: "#F4F5F7",
              whiteSpace: "nowrap",
            }}
          >
            {windowTitle}
          </span>
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 18px",
              borderRadius: 999,
              backgroundColor: "rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#28C840",
                opacity: livePulse,
                boxShadow: "0 0 10px rgba(40,200,64,0.7)",
              }}
            />
            <span style={{ fontFamily: MONO, fontSize: 19, color: "#A5AAB5" }}>{statusLabel}</span>
          </div>
        </div>

        {/* 代码区 */}
        <div style={{ position: "relative", padding: "26px 34px", fontFamily: MONO }}>
          {/* 行级呼吸高亮带 */}
          {highlights.map((hl, i) => {
            const a = prog(f, hl.at, 10, easeExpo);
            if (a <= 0) return null;
            const breathe = 0.9 + 0.1 * Math.sin(f * 0.16 + i);
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 16,
                  right: 16,
                  top: 26 + hl.from * lh - 2,
                  height: (hl.to - hl.from + 1) * lh + 4,
                  borderRadius: 10,
                  backgroundColor: theme === "green" ? `rgba(17,124,13,${0.28 * a * breathe})` : `rgba(213,55,64,${0.26 * a * breathe})`,
                  borderLeft: `6px solid ${pal.accentOnDark}`,
                  opacity: a,
                }}
              />
            );
          })}

          {shownLines.map((ln, idx) => (
            <div
              key={idx}
              style={{
                position: "relative",
                height: lh,
                display: "flex",
                alignItems: "center",
                fontSize: 25,
                whiteSpace: "pre",
              }}
            >
              <span style={{ width: 58, color: "#656C7C", fontSize: 21, userSelect: "none", flexShrink: 0 }}>
                {startLineNumber + idx}
              </span>
              <span>{renderSyntax(ln, pal.accentOnDark)}</span>
              {cursorRow === idx && (
                <span
                  style={{
                    display: "inline-block",
                    width: 5,
                    height: lh - 14,
                    marginLeft: 3 + cursorChars * 0,
                    borderRadius: 3,
                    backgroundColor: pal.accentOnDark,
                    boxShadow: `0 0 12px ${pal.accentOnDark}`,
                  }}
                />
              )}
            </div>
          ))}

          {/* 行内胶囊透镜（Inline Callout Lenses） */}
          {lenses.map((ln, i) => {
            if (f < ln.at || ln.row < 0 || ln.row >= visibleLines.length) return null;
            const pop = snap(f, ln.at, { damping: 13, stiffness: 230 });
            const codeCols = (visibleLines[ln.row] ?? "").length;
            const leftPx = Math.min(1160, Math.max(440, 96 + codeCols * 15.2 + 32));
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: leftPx,
                  top: 26 + ln.row * lh + 3,
                  height: lh - 6,
                  padding: "0 22px 0 16px",
                  borderRadius: 12,
                  background: pal.accentSurf,
                  boxShadow: pal.shPill,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "#FFFFFF",
                  fontFamily: SWISS_HEAVY,
                  fontWeight: 900,
                  fontSize: fitFont(ln.text, 30, 520, 20),
                  whiteSpace: "nowrap",
                  opacity: Math.min(1, pop * 1.4),
                  transform: `translateX(${(1 - pop) * 22}px) scale(${0.9 + 0.1 * pop})`,
                  transformOrigin: "0% 50%",
                }}
              >
                <span style={{ fontFamily: MONO, fontSize: 20, opacity: 0.92 }}>◀</span>
                <span>{ln.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Sfx at={10} src="tick-crisp_1.wav" vol={0.45} />
      {lenses.map((ln, i) => (
        <Sfx key={i} at={ln.at} src={i % 2 ? "pop_2.wav" : "snap_1.wav"} vol={0.65} />
      ))}
    </StudioCanvas>
  );
};

// ============================================================================
// 2. 核心变形与三层护甲（ArmorMorph）— 双栏指标收缩为雷达核 + 右侧弹出三层工程护甲卡
// ============================================================================
export type ArmorMorphProps = {
  theme: SwissTheme;
  headerBefore: string;
  headerAfter: string;
  codeTagBefore: string;
  codeTagAfter: string;
  metricTag: string;
  metricNumber: number;
  metricUnit: string;
  metricSteps: string[];
  metricConclusion: string;
  codePreview: string[];
  hubLabel: string;
  hubCaption: string;
  barriers: { num: string; title: string; sub: string }[];
};

export const armorMorphDefaults: ArmorMorphProps = {
  theme: "green",
  headerBefore: "别被玄学吓住 · 核心循环其实极简",
  headerAfter: "真要干活 · 难点根本不在循环",
  codeTagBefore: "几十行跑通闭环",
  codeTagAfter: "三道工程硬门槛",
  metricTag: "极简核心主干",
  metricNumber: 21,
  metricUnit: "行代码",
  metricSteps: ["读任务", "调工具", "塞回历史"],
  metricConclusion: "就能跑通最小闭环",
  codePreview: [
    "def run_agent(task: str) -> str:",
    "    messages = build_context(task, MEMORY)",
    "    for step in range(1, MAX_STEPS + 1):",
    "        msg = call_llm(messages, TOOLS)",
    "        if not msg.tool_calls: return msg.content",
    "        for call in msg.tool_calls:",
    "            out = run_tool(call.name, call.args)",
    "            messages.append(tool_result(out))",
  ],
  hubLabel: "LOOP",
  hubCaption: "循环本身很简单 · 真正难在外面三层",
  barriers: [
    { num: "01", title: "工具怎么控", sub: "参数写清边界，越界与敏感路径直接拦截" },
    { num: "02", title: "报错怎么兜底", sub: "最多跑 8 轮硬刹车，超长日志自动裁剪" },
    { num: "03", title: "权限和结果怎么验收", sub: "高危命令白名单锁死，交差只看测试证据" },
  ],
};

export const ArmorMorph: React.FC<ArmorMorphProps> = ({
  theme = "green",
  headerBefore,
  headerAfter,
  codeTagBefore,
  codeTagAfter,
  metricTag,
  metricNumber,
  metricUnit,
  metricSteps,
  metricConclusion,
  codePreview,
  hubLabel,
  hubCaption,
  barriers,
}) => {
  const f = useCurrentFrame();
  const pal = getSwissPalette(theme);

  const inSpring = snap(f, 0, { damping: 15, stiffness: 210 });
  const morph = prog(f, 58, 22, easeInOut);
  const count = Math.max(1, Math.round(interpolate(f, [4, 28], [1, metricNumber], clamp)));

  const hubCx = 412;
  const hubCy = 486;

  return (
    <StudioCanvas>
      <SwissHeaderBar
        title={f < 68 ? headerBefore : headerAfter}
        codeTag={f < 68 ? codeTagBefore : codeTagAfter}
        theme={theme}
        enter={prog(f, 0, 10)}
      />

      {/* 变形后左侧纯白建筑底台 */}
      {morph > 0.35 && (
        <BentoCard
          x={110}
          y={184}
          w={604}
          h={620}
          radius={24}
          style={{ opacity: Math.min(1, (morph - 0.35) / 0.45) }}
        />
      )}

      {morph >= 0.75 && <PulseRings cx={hubCx} cy={hubCy} r={96} f={f} color={pal.accent} />}

      {/* 三道同心护甲环 + 右向连接曲线 */}
      {morph >= 0.65 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
          {barriers.slice(0, 3).map((b, i) => {
            const at = 80 + i * 16;
            const p = prog(f, at, 16, easeInOut);
            if (p <= 0) return null;
            const r = 128 + i * 48;
            const circ = 2 * Math.PI * r;
            const cardY = 184 + i * 216 + 94;
            const startY = hubCy + (i - 1) * 80;
            const dy = startY - hubCy;
            const startX = hubCx + Math.sqrt(Math.max(300, r * r - dy * dy));
            const linkD = `M ${startX.toFixed(1)} ${startY} C ${startX + 85} ${startY}, 680 ${cardY}, 762 ${cardY}`;
            const oa = (f / 30) * (i % 2 ? -0.75 : 0.85) + i * 2.1;
            const hot = i === 0;
            return (
              <g key={b.num}>
                <circle
                  cx={hubCx}
                  cy={hubCy}
                  r={r}
                  fill="none"
                  stroke={hot ? pal.accent : "rgba(20,20,23,0.22)"}
                  strokeWidth={hot ? 5.5 : 3.5}
                  strokeDasharray={circ}
                  strokeDashoffset={circ * (1 - p)}
                />
                {p >= 1 && (
                  <circle cx={hubCx + Math.cos(oa) * r} cy={hubCy + Math.sin(oa) * r} r={6.5} fill={hot ? pal.accent : SWISS_BASE.ink} />
                )}
                <path
                  d={linkD}
                  fill="none"
                  stroke={hot ? pal.accent : "rgba(20,20,23,0.22)"}
                  strokeWidth={hot ? 4 : 2.5}
                  strokeDasharray={360}
                  strokeDashoffset={360 * (1 - p)}
                />
              </g>
            );
          })}
        </svg>
      )}

      {/* 左侧代码卡片平滑收缩为圆形 LOOP 中心核 */}
      <div
        style={{
          position: "absolute",
          left: interpolate(morph, [0, 1], [110, hubCx - 92], clamp),
          top: interpolate(morph, [0, 1], [184, hubCy - 92], clamp),
          width: interpolate(morph, [0, 1], [932, 184], clamp),
          height: interpolate(morph, [0, 1], [620, 184], clamp),
          borderRadius: interpolate(morph, [0, 1], [24, 92], clamp),
          background: SWISS_BASE.darkSurf,
          boxShadow: morph < 0.5 ? SWISS_SH.dark : SWISS_SH.pillDark,
          overflow: "hidden",
          transform: morph < 0.05 ? `scale(${0.92 + 0.08 * inSpring})` : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {morph < 0.55 ? (
          <div style={{ position: "absolute", inset: 0, opacity: Math.max(0, 1 - morph * 1.85) }}>
            <div
              style={{
                height: 52,
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {["#FF5F56", "#FFBD2E", "#27C93F"].map((c) => (
                <span key={c} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c }} />
              ))}
              <span style={{ marginLeft: 12, fontFamily: MONO, fontSize: 18, fontWeight: 700, color: "#9DA5B4" }}>agent.py</span>
            </div>
            <div style={{ padding: "22px 26px", display: "flex", flexDirection: "column", gap: 8 }}>
              {codePreview.slice(0, 8).map((ln, idx) => {
                const hi = idx === 2 || idx === 3 || idx === 6 || idx === 7;
                const lp = prog(f, 3 + idx * 2, 8);
                return (
                  <div
                    key={idx}
                    style={{
                      height: 52,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 14px",
                      borderRadius: 10,
                      backgroundColor: hi ? pal.tintDark : "transparent",
                      borderLeft: hi ? `3.5px solid ${pal.accentOnDark}` : "3.5px solid transparent",
                      opacity: lp,
                      fontFamily: MONO,
                      fontSize: 21,
                      color: hi ? "#FFFFFF" : "#A9B1C2",
                      whiteSpace: "pre",
                    }}
                  >
                    <span style={{ width: 38, color: "#646B7A", fontSize: 17 }}>{String(idx * 2 + 1).padStart(2, "0")}</span>
                    <span>{ln}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div
            style={{
              width: 116,
              height: 116,
              borderRadius: 58,
              backgroundColor: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: MONO,
              fontWeight: 900,
              fontSize: 28,
              color: SWISS_BASE.ink,
              boxShadow: "0 6px 18px rgba(0,0,0,0.22)",
            }}
          >
            {hubLabel}
          </div>
        )}
      </div>

      {/* 前半段右侧大数字卡片 */}
      {morph < 0.62 && (
        <BentoCard
          x={1078}
          y={184}
          w={732}
          h={620}
          radius={24}
          style={{
            padding: "46px 52px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: prog(f, 3, 8) * Math.max(0, 1 - morph * 1.65),
            transform: `translateX(${morph * 60}px) scale(${0.94 + 0.06 * inSpring})`,
          }}
        >
          <div>
            <SwissTag text={metricTag} variant="accent" theme={theme} size={24} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginTop: 26 }}>
              <span style={{ fontFamily: SWISS_METRIC, fontWeight: 900, fontSize: 210, lineHeight: 0.84, color: SWISS_BASE.ink }}>
                {count}
              </span>
              <span style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: 50, color: pal.accent }}>{metricUnit}</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {metricSteps.slice(0, 3).map((stepLbl, sIdx) => (
              <React.Fragment key={sIdx}>
                <div
                  style={{
                    padding: "10px 20px",
                    borderRadius: 12,
                    backgroundColor: sIdx === 1 ? pal.tintLight : "#F1F3F8",
                    fontFamily: SWISS_HEAVY,
                    fontWeight: 900,
                    fontSize: 23,
                    color: sIdx === 1 ? pal.accent : SWISS_BASE.ink,
                  }}
                >
                  {stepLbl}
                </div>
                {sIdx < 2 && <span style={{ fontFamily: MONO, fontSize: 22, fontWeight: 800, color: SWISS_BASE.muted }}>→</span>}
              </React.Fragment>
            ))}
          </div>

          <div style={{ paddingTop: 22, borderTop: "1px solid rgba(20,20,23,0.09)" }}>
            <div style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: fitFont(metricConclusion, 42, 620, 28), color: SWISS_BASE.ink }}>
              {metricConclusion}
            </div>
          </div>
        </BentoCard>
      )}

      {morph >= 0.82 && (
        <div
          style={{
            position: "absolute",
            left: 110,
            width: 604,
            top: 734,
            textAlign: "center",
            fontFamily: SWISS_HEAVY,
            fontWeight: 900,
            fontSize: 26,
            color: SWISS_BASE.muted,
            opacity: prog(f, 76, 12),
          }}
        >
          {hubCaption}
        </div>
      )}

      {/* 后半段右侧三张等距无描边护甲卡 */}
      {barriers.slice(0, 3).map((b, i) => {
        const at = 80 + i * 16;
        if (f < at) return null;
        const sp = snap(f, at, { damping: 15, stiffness: 220 });
        const variant = i === 0 ? "accent" : i === 1 ? "dark" : "light";
        return (
          <BentoCard
            key={b.num}
            x={762}
            y={184 + i * 216 + floatY(f, i * 1.2, 2.5)}
            w={1048}
            h={188}
            variant={variant}
            active={i === 2}
            theme={theme}
            radius={24}
            style={{
              padding: "0 42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              opacity: Math.min(1, sp * 1.4),
              transform: `translateX(${(1 - sp) * 86}px) scale(${0.94 + 0.06 * sp})`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <div
                style={{
                  width: 76,
                  height: 76,
                  borderRadius: 18,
                  backgroundColor: i === 0 ? "rgba(0,0,0,0.20)" : i === 1 ? pal.tintMid : pal.tintLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SWISS_METRIC,
                  fontWeight: 900,
                  fontSize: 48,
                  color: i === 0 ? "#FFFFFF" : i === 1 ? pal.accentOnDark : pal.accent,
                  flexShrink: 0,
                }}
              >
                {b.num}
              </div>
              <div>
                <div
                  style={{
                    fontFamily: SWISS_HEAVY,
                    fontWeight: 900,
                    fontSize: fitFont(b.title, 42, 760, 28),
                    color: i === 2 ? SWISS_BASE.ink : "#FFFFFF",
                  }}
                >
                  {b.title}
                </div>
                <div
                  style={{
                    fontSize: fitFont(b.sub, 26, 780, 19),
                    fontWeight: 700,
                    color: i === 0 ? pal.accentPale : i === 1 ? "#A6AEBF" : SWISS_BASE.muted,
                    marginTop: 8,
                  }}
                >
                  {b.sub}
                </div>
              </div>
            </div>
          </BentoCard>
        );
      })}

      <Sfx at={4} src="pop_1.wav" vol={0.5} />
      <Sfx at={58} src="whoosh-short_1.wav" vol={0.65} />
      <Sfx at={80} src="bong_001.wav" vol={0.55} />
      <Sfx at={96} src="bong_001.wav" vol={0.55} />
      <Sfx at={112} src="bong_001.wav" vol={0.6} />
    </StudioCanvas>
  );
};

// ============================================================================
// 3. 管道注入与门禁锁（ConduitLocks）— 输入脉冲汇入核心 + 允许槽落位 + 高危动作落锁划除
// ============================================================================
export type ConduitLocksProps = {
  theme: SwissTheme;
  header: string;
  codeTag: string;
  inputs: string[];
  hubTitle: string;
  hubSub: string;
  allowedTools: { code: string; name: string }[];
  lockedActions: { code: string; name: string }[];
};

export const conduitLocksDefaults: ConduitLocksProps = {
  theme: "green",
  header: "最小 Agent 的安全边界",
  codeTag: "3 INPUTS · 3 TOOLS · 3 LOCKS",
  inputs: ["任务", "对话历史", "工具列表"],
  hubTitle: "AGENT",
  hubSub: "最小只读内核",
  allowedTools: [
    { code: "ls", name: "看目录" },
    { code: "read", name: "读文件" },
    { code: "run", name: "白名单命令" },
  ],
  lockedActions: [
    { code: "write_file", name: "写文件 · LOCKED" },
    { code: "delete", name: "删文件 · LOCKED" },
    { code: "network", name: "连外网 · LOCKED" },
  ],
};

const PIPE_COORDS = [
  { y0: 332, y1: 472 },
  { y0: 500, y1: 500 },
  { y0: 668, y1: 528 },
];

const cubicPt = (t: number, x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) => {
  const u = 1 - t;
  return {
    x: u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3,
    y: u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3,
  };
};

export const ConduitLocks: React.FC<ConduitLocksProps> = ({
  theme = "green",
  header,
  codeTag,
  inputs,
  hubTitle,
  hubSub,
  allowedTools,
  lockedActions,
}) => {
  const f = useCurrentFrame();
  const pal = getSwissPalette(theme);

  return (
    <StudioCanvas>
      <SwissHeaderBar title={header} codeTag={codeTag} theme={theme} enter={prog(f, 0, 10)} />
      <PulseRings cx={925} cy={500} r={120} f={f} color={pal.accent} />

      {/* 三条贝塞尔输入管道 + 流动信号球 */}
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {PIPE_COORDS.map((c, i) => {
          const at = 6 + i * 8;
          const p = prog(f, at, 16, easeInOut);
          const d = `M 330 ${c.y0} C 520 ${c.y0}, 560 ${c.y1}, 760 ${c.y1}`;
          const cyc = ((((f - at) / 36 + i * 0.33) % 1) + 1) % 1;
          const pt = cubicPt(cyc, 330, c.y0, 520, c.y0, 560, c.y1, 760, c.y1);
          return (
            <g key={i}>
              <path
                d={d}
                fill="none"
                stroke="rgba(20,20,23,0.16)"
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={480}
                strokeDashoffset={480 * (1 - p)}
              />
              {p >= 1 && (
                <>
                  <path
                    d={d}
                    fill="none"
                    stroke={pal.accent}
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeDasharray="12 26"
                    strokeDashoffset={-f * 2.8}
                  />
                  <circle cx={pt.x} cy={pt.y} r={12} fill={pal.accent} stroke="#FFFFFF" strokeWidth={4} />
                </>
              )}
            </g>
          );
        })}
      </svg>

      {/* 左侧 3 个输入胶囊 */}
      {inputs.slice(0, 3).map((lbl, i) => {
        const p = prog(f, 4 + i * 8, 12, easeExpo);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 110,
              top: [300, 468, 636][i] + floatY(f, i, 3),
              opacity: p,
              transform: `translateY(${(1 - p) * 20}px)`,
            }}
          >
            <SwissTag text={lbl} variant="dark" size={32} />
          </div>
        );
      })}

      {/* 中心黑曜石内核 */}
      <BentoCard
        x={760}
        y={400 + floatY(f, 0.5, 4)}
        w={330}
        h={200}
        variant="dark"
        active
        theme={theme}
        radius={24}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        <span style={{ fontFamily: MONO, fontWeight: 900, fontSize: 44, letterSpacing: "0.05em" }}>{hubTitle}</span>
        <span style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: 28, color: pal.accentOnDark, marginTop: 8 }}>
          {hubSub}
        </span>
      </BentoCard>

      {/* 底部 3 个允许工具卡槽 */}
      <div style={{ position: "absolute", left: 390, top: 684, display: "flex", gap: 24 }}>
        {allowedTools.slice(0, 3).map((tl, i) => {
          const at = 36 + i * 10;
          const p = prog(f, at, 14, easeBack);
          const hot = i === allowedTools.slice(0, 3).length - 1;
          return (
            <div
              key={i}
              style={{
                width: 276,
                height: 144,
                borderRadius: 18,
                border: "2px dashed rgba(20,20,23,0.20)",
                backgroundColor: "rgba(255,255,255,0.35)",
                position: "relative",
              }}
            >
              {f >= at && (
                <BentoCard
                  active={hot}
                  theme={theme}
                  radius={14}
                  style={{
                    position: "absolute",
                    inset: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "0 18px",
                    opacity: Math.min(1, p),
                    transform: `translateY(${(1 - p) * -52}px) scale(${0.92 + 0.08 * p})`,
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: 27,
                      background: hot ? pal.accentSurf : SWISS_BASE.darkSurf,
                      color: "#FFFFFF",
                      fontFamily: MONO,
                      fontWeight: 800,
                      fontSize: 17,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {tl.code}
                  </div>
                  <span style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: fitFont(tl.name, 28, 165, 20), whiteSpace: "nowrap" }}>
                    {tl.name}
                  </span>
                </BentoCard>
              )}
            </div>
          );
        })}
      </div>

      {/* 右侧 3 个高危动作挂锁拦截卡 */}
      {lockedActions.slice(0, 3).map((lk, i) => {
        const at = 74 + i * 14;
        if (f < at) return null;
        const p = prog(f, at, 12, easeExpo);
        const lock = prog(f, at + 8, 10, easeInOut);
        return (
          <BentoCard
            key={i}
            x={1300}
            y={238 + i * 172}
            w={510}
            h={138}
            active={lock > 0.5}
            theme={theme}
            radius={18}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 28px",
              gap: 22,
              opacity: p,
              transform: `translateX(${(1 - p) * 90}px)`,
            }}
          >
            <svg width={62} height={76} style={{ flexShrink: 0 }}>
              <path
                d={`M 16 ${36 - (1 - lock) * 15} L 16 21 A 15 15 0 0 1 46 21 L 46 36`}
                fill="none"
                stroke={pal.accent}
                strokeWidth={6.5}
                strokeLinecap="round"
              />
              <rect x={6} y={34} width={50} height={38} rx={10} fill={pal.accent} />
              <circle cx={31} cy={53} r={4.5} fill="#FFFFFF" />
            </svg>
            <div>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 27,
                  fontWeight: 800,
                  color: SWISS_BASE.ink,
                  textDecoration: lock >= 1 ? "line-through" : "none",
                  textDecorationColor: pal.accent,
                  textDecorationThickness: 4,
                }}
              >
                {lk.code}
              </div>
              <div style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: 26, color: pal.accent, marginTop: 4 }}>
                {lk.name}
              </div>
            </div>
          </BentoCard>
        );
      })}

      <Sfx at={36} src="pop_1.wav" vol={0.5} />
      <Sfx at={46} src="pop_2.wav" vol={0.5} />
      <Sfx at={56} src="pop_3.wav" vol={0.55} />
      <Sfx at={82} src="snap_1.wav" vol={0.7} />
      <Sfx at={96} src="snap_2.wav" vol={0.7} />
      <Sfx at={110} src="snap_1.wav" vol={0.75} />
    </StudioCanvas>
  );
};
