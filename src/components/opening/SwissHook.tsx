// 无描边瑞士开场（Swiss Hook）
// 节拍：0帧三层黑曜石巨字主卡 + 柔焦概念流 → 光圈分开露出立体陀螺核与主论点 → 建筑拉幕切入双栏等高源码裁决对比
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bgm, Sfx } from "../../kit/fx";
import { MONO } from "../../kit/fonts";
import { prog, snap } from "../../kit/motion";
import {
  BentoCard,
  CurtainStage,
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
  SwissCaptionBar,
  SwissHeaderBar,
  SwissTag,
  SwissTheme,
} from "../../kit/swiss";

export type SwissHookProps = {
  theme: SwissTheme;
  badge: string;
  metaTag: string;
  heroLead: string;
  heroAccent: string;
  heroSteps: string[];
  feedCards: { title: string; sub: string; hot?: boolean }[];
  revealTag: string;
  revealTitle: string;
  compareHeader: string;
  compareCodeTag: string;
  winner: { tag: string; num: string; title: string; sub: string; steps: string[]; footer: string };
  loser: { tag: string; num: string; title: string; sub: string; rows: string[]; footer: string };
  captions: string[];
  music?: boolean;
};

export const SWISS_HOOK_DUR = 240;

export const swissHookDefaults: SwissHookProps = {
  theme: "crimson",
  badge: "架构师实战拆解 · 小白友好",
  metaTag: "agent.py",
  heroLead: "带你从零手搓",
  heroAccent: "最小 Agent",
  heroSteps: ["20 行核心循环", "真实仓库跑通", "拆透五道边界"],
  feedCards: [
    { title: "一文读懂 AI Agent", sub: "概念综述 · 10 分钟速览", hot: true },
    { title: "MCP 协议全解析", sub: "标准接口 · 上下文扩展" },
    { title: "多智能体 Swarm 架构", sub: "角色协同 · 任务分发" },
    { title: "RAG 向量检索进阶", sub: "知识切片 · 相似度召回", hot: true },
    { title: "ReAct 推理论文精读", sub: "思考行动 · 交替循环" },
    { title: "主流 Agent 框架横评", sub: "选型对比 · 抽象封装", hot: true },
    { title: "Function Calling 详解", sub: "结构化参数 · 工具声明", hot: true },
    { title: "长短期记忆图谱", sub: "会话摘要 · 知识沉淀" },
  ],
  revealTag: "底层祛魅",
  revealTitle: "拆穿 Agent 底层真骨架",
  compareHeader: "实操拆解 vs 碎片概念贴",
  compareCodeTag: "几分钟听透真骨架",
  winner: {
    tag: "今天这几分钟",
    num: "1",
    title: "套可跑通源码",
    sub: "从第一行代码看清底层运转",
    steps: ["01 看项目目录", "02 读取目标源码", "03 跑白名单单测", "04 带证据交差"],
    footer: "亲手跑通闭环 · 拆开工程边界",
  },
  loser: {
    tag: "碎片化阅读",
    num: "10",
    title: "篇二手概念贴",
    sub: "名词满天飞，底层依然是黑盒",
    rows: [
      "01 一文看懂全景概念图",
      "02 十大主流框架对比评测",
      "03 协议名词缩写速查表",
      "04 提示词模板与人设合集",
    ],
    footer: "只背架构名词 · 动手依然发懵",
  },
  captions: [
    "聊 Agent 的文章到处都是，",
    "真把底层讲明白的没几篇，",
    "带你跑一套真源码，比翻十篇概念贴都管用。",
  ],
  music: true,
};

/** 纯 SVG 立体陀螺晶核（零 WebGL 依赖，网页缩略图秒开） */
const GyroCoreSvg: React.FC<{ f: number; enter: number; color: string }> = ({ f, enter, color }) => {
  if (enter <= 0.01) return null;
  const a1 = f * 1.8;
  const a2 = -f * 1.3;
  const pulse = 0.96 + 0.04 * Math.sin(f * 0.14);
  return (
    <svg
      width={500}
      height={420}
      viewBox="-250 -210 500 420"
      style={{ overflow: "visible", transform: `scale(${enter})` }}
    >
      {/* 外层反向黑曜石轨道环 */}
      <g transform={`rotate(${-26 + f * 0.25})`}>
        <ellipse cx={0} cy={0} rx={182} ry={68} fill="none" stroke="#1E2028" strokeWidth={5.5} opacity={0.85} />
        {[0, 180].map((deg) => {
          const rad = ((deg + a2) * Math.PI) / 180;
          return <circle key={deg} cx={Math.cos(rad) * 182} cy={Math.sin(rad) * 68} r={9} fill="#141417" />;
        })}
      </g>

      {/* 主色陀螺能量轨道环 */}
      <g transform={`rotate(${28 - f * 0.22})`}>
        <ellipse cx={0} cy={0} rx={154} ry={62} fill="none" stroke={color} strokeWidth={7} />
        {[0, 90, 180, 270].map((deg) => {
          const rad = ((deg + a1) * Math.PI) / 180;
          return <circle key={deg} cx={Math.cos(rad) * 154} cy={Math.sin(rad) * 62} r={10} fill="#141417" />;
        })}
      </g>

      {/* 几何测地线外笼 */}
      <g transform={`rotate(${f * 0.55})`} opacity={0.28}>
        <polygon points="0,-116 100,-58 100,58 0,116 -100,58 -100,-58" fill="none" stroke="#141417" strokeWidth={2.5} />
        <line x1={0} y1={-116} x2={0} y2={116} stroke="#141417" strokeWidth={2} />
        <line x1={-100} y1={-58} x2={100} y2={58} stroke="#141417" strokeWidth={2} />
        <line x1={100} y1={-58} x2={-100} y2={58} stroke="#141417" strokeWidth={2} />
      </g>

      {/* 中心立体正八面体晶核 */}
      <g transform={`scale(${pulse}) rotate(${Math.sin(f * 0.06) * 8})`}>
        <polygon points="0,-82 -68,0 0,16" fill={color} />
        <polygon points="0,-82 68,0 0,16" fill={color} opacity={0.82} />
        <polygon points="0,82 -68,0 0,16" fill="#181A22" opacity={0.38} />
        <polygon points="0,82 68,0 0,16" fill={color} opacity={0.64} />
        <polygon points="0,-82 68,0 0,82 -68,0" fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.45} />
      </g>
    </svg>
  );
};

export const SwissHook: React.FC<SwissHookProps> = (props) => {
  const {
    theme = "crimson",
    badge,
    metaTag,
    heroLead,
    heroAccent,
    heroSteps,
    feedCards,
    revealTag,
    revealTitle,
    compareHeader,
    compareCodeTag,
    winner,
    loser,
    captions,
    music = true,
  } = props;

  const f = useCurrentFrame();
  const pal = getSwissPalette(theme);
  const feed = feedCards.length ? feedCards : swissHookDefaults.feedCards;

  // Beat A (0..66): 首屏巨字主卡；Beat B (65..136): 光圈推开露出晶核；Beat C (132..240): 建筑拉幕双栏裁决
  const part = prog(f, 64, 20, easeExpo);
  const shock = prog(f, 65, 24, easeExpo);
  const coreIn = snap(f, 65, { damping: 14, stiffness: 210 });
  const titleIn = snap(f, 68, { damping: 15, stiffness: 220 });

  const heroOut = prog(f, 58, 8, easeInOut);
  const heroAlive = 1 - heroOut;
  const heroSpring = 0.94 + 0.06 * snap(f + 2, 0, { damping: 14, stiffness: 240 });
  const heroFs = fitFont(`${heroLead} ${heroAccent}`, 90, 980, 48);

  const leftIn = snap(f, 136, { damping: 15, stiffness: 220 });
  const rightIn = snap(f, 162, { damping: 15, stiffness: 220 });
  const gtIn = snap(f, 160, { damping: 13, stiffness: 250 });
  const dimRight = prog(f, 182, 18, easeInOut);

  const revealFs = fitFont(revealTitle, 86, 1360, 46);

  return (
    <StudioCanvas>
      {/* ================= ACT I-A & I-B (0–146f): 柔焦概念墙 → 0帧立体主卡 → 陀螺晶核 ================= */}
      {f < 148 && (
        <AbsoluteFill>
          {/* 3×4 透视漂移柔焦背景流 */}
          <div style={{ position: "absolute", inset: 0, perspective: 1400, perspectiveOrigin: "50% 46%" }}>
            <div
              style={{
                position: "absolute",
                inset: 0,
                transform: `rotateX(${(8 * (1 - part)).toFixed(2)}deg) scale(${(1.04 - part * 0.04).toFixed(3)})`,
                transformOrigin: "50% 46%",
              }}
            >
              {[0, 1, 2].map((row) => {
                const dir = row === 1 ? -1 : 1;
                const speed = (4.5 + row * 0.6) * dir;
                const drift = f < 65 ? f * speed : 65 * speed + (f - 65) * speed * 0.12;
                const cardW = 416;
                const unit = cardW + 28;
                return (
                  <div key={row} style={{ position: "absolute", left: 0, right: 0, top: 96 + row * 244, height: 210 }}>
                    {Array.from({ length: 6 }).map((_, cIdx) => {
                      const item = feed[(row * 3 + cIdx) % feed.length];
                      const rawX = (((cIdx * unit + drift) % (unit * 6)) + unit * 6) % (unit * 6) - unit;
                      const pushX = (rawX + cardW * 0.5 >= 960 ? 1 : -1) * part * 560;
                      const pushY = (row - 1) * part * 110;
                      return (
                        <div
                          key={cIdx}
                          style={{
                            position: "absolute",
                            left: rawX,
                            top: 0,
                            width: cardW,
                            height: 200,
                            borderRadius: 24,
                            background: SWISS_BASE.cardSurf,
                            boxShadow: SWISS_SH.card,
                            padding: "26px 30px",
                            boxSizing: "border-box",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            opacity: (1 - part * 0.68) * 0.42,
                            filter: `blur(${(1.6 + part * 3.0).toFixed(1)}px)`,
                            transform: `translate(${pushX.toFixed(1)}px, ${pushY.toFixed(1)}px) scale(${(1 - part * 0.12).toFixed(3)})`,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span
                              style={{
                                width: 36,
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: item.hot ? pal.accent : SWISS_BASE.line,
                              }}
                            />
                            <span
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: item.hot ? pal.accent : "#CFD4DF",
                              }}
                            />
                          </div>
                          <div>
                            <div style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: 30, color: "#3A3E4A", whiteSpace: "nowrap" }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 700, color: SWISS_BASE.muted, marginTop: 6, whiteSpace: "nowrap" }}>
                              {item.sub}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 0–66f：第 0 帧即清晰可见的无描边黑曜石三层立体主卡 */}
          {f < 68 && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 240,
                  top: 186,
                  width: 1440,
                  height: 520,
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(242,244,249,0.94) 0%, rgba(242,244,249,0.74) 55%, rgba(242,244,249,0) 100%)",
                  opacity: heroAlive,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 258,
                  display: "flex",
                  justifyContent: "center",
                  opacity: heroAlive,
                  transform: `scale(${(heroSpring * (1 + heroOut * 0.04)).toFixed(3)}) translateY(${(-heroOut * 18).toFixed(1)}px)`,
                }}
              >
                <div
                  style={{
                    width: 1140,
                    padding: "44px 60px 40px",
                    borderRadius: 34,
                    background: SWISS_BASE.darkSurf,
                    boxShadow: SWISS_SH.hero,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "8px 20px",
                        borderRadius: 999,
                        backgroundColor: pal.tintDark,
                      }}
                    >
                      <span style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: pal.accentOnDark }} />
                      <span style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: 22, color: pal.accentSoftOnDark }}>
                        {badge}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: "7px 18px",
                        borderRadius: 999,
                        backgroundColor: "rgba(255,255,255,0.07)",
                        fontFamily: MONO,
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#8D95A8",
                      }}
                    >
                      {metaTag}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 28,
                      fontFamily: SWISS_HEAVY,
                      fontWeight: 900,
                      fontSize: heroFs,
                      lineHeight: 1.08,
                      letterSpacing: "-0.025em",
                      whiteSpace: "nowrap",
                      display: "flex",
                      alignItems: "baseline",
                      gap: 20,
                    }}
                  >
                    <span style={{ color: "#FFFFFF" }}>{heroLead}</span>
                    <span style={{ color: pal.accentOnDark }}>{heroAccent}</span>
                  </div>

                  <div
                    style={{
                      marginTop: 32,
                      paddingTop: 24,
                      borderTop: "1px solid rgba(255,255,255,0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    {heroSteps.slice(0, 3).map((st, idx) => {
                      const activeStep = f < 20 ? 0 : f < 40 ? 1 : 2;
                      const isCur = idx <= activeStep;
                      return (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            height: 52,
                            borderRadius: 14,
                            padding: "0 20px",
                            backgroundColor: isCur ? "rgba(255,255,255,0.095)" : "rgba(255,255,255,0.035)",
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: isCur ? pal.accentOnDark : "#555C6E",
                              flexShrink: 0,
                            }}
                          />
                          <span
                            style={{
                              fontWeight: 700,
                              fontSize: fitFont(st, 23, 250, 17),
                              color: isCur ? "#EEF1F7" : "#7D8597",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 65f+：中心光圈展开 → 立体晶核 + 主论点 */}
          {f >= 64 && (
            <>
              <div
                style={{
                  position: "absolute",
                  left: 960 - 180,
                  top: 496,
                  width: 360,
                  height: 40,
                  borderRadius: "50%",
                  background: "radial-gradient(closest-side, rgba(20,20,23,0.16), transparent)",
                  opacity: coreIn,
                }}
              />
              {shock > 0 && (
                <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                  <circle
                    cx={960}
                    cy={310}
                    r={90 + shock * 560}
                    fill="none"
                    stroke={pal.accent}
                    strokeWidth={10 * (1 - shock)}
                    opacity={(1 - shock) * 0.52}
                  />
                </svg>
              )}
              <PulseRings cx={960} cy={310} r={145} f={f} color={pal.accent} />

              <div
                style={{
                  position: "absolute",
                  left: 960 - 250,
                  top: 96 + floatY(f, 0, 5),
                  width: 500,
                  height: 420,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GyroCoreSvg f={f} enter={coreIn} color={pal.accent} />
              </div>

              <div
                style={{
                  position: "absolute",
                  left: 160,
                  right: 160,
                  top: 562,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: prog(f, 67, 8),
                  transform: `translateY(${(1 - titleIn) * 32}px) scale(${0.92 + 0.08 * titleIn})`,
                }}
              >
                <SwissTag text={revealTag} variant="accent" theme={theme} size={26} />
                <div
                  style={{
                    fontFamily: SWISS_HEAVY,
                    fontWeight: 900,
                    fontSize: revealFs,
                    color: SWISS_BASE.ink,
                    marginTop: 18,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.08,
                    whiteSpace: "nowrap",
                  }}
                >
                  {revealTitle}
                </div>
                <div
                  style={{
                    marginTop: 20,
                    width: 320 * prog(f, 74, 15, easeExpo),
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: pal.accent,
                  }}
                />
              </div>
            </>
          )}
        </AbsoluteFill>
      )}

      {/* ================= ACT II (132–240f): 建筑拉幕 → 双栏等高裁决对比 ================= */}
      <CurtainStage f={f} at={132} dur={14} theme={theme}>
        <StudioCanvas>
          <SwissHeaderBar title={compareHeader} codeTag={compareCodeTag} theme={theme} enter={prog(f, 138, 10)} />

          {/* 左主卡：黑曜石实操闭环 */}
          <BentoCard
            x={110}
            y={168}
            w={806}
            h={648}
            variant="dark"
            active
            theme={theme}
            radius={24}
            style={{
              padding: "42px 46px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              opacity: prog(f, 136, 8),
              transform: `translateY(${(1 - leftIn) * 38}px) scale(${0.94 + 0.06 * leftIn})`,
            }}
          >
            <div>
              <SwissTag text={winner.tag} variant="accent" theme={theme} size={24} />
              <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 20 }}>
                <span style={{ fontFamily: SWISS_METRIC, fontWeight: 900, fontSize: 138, lineHeight: 0.88, color: "#FFFFFF" }}>
                  {winner.num}
                </span>
                <div>
                  <div style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: fitFont(winner.title, 48, 520, 32), color: "#FFFFFF" }}>
                    {winner.title}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: SWISS_BASE.mutedOnDark, marginTop: 8 }}>{winner.sub}</div>
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {winner.steps.slice(0, 4).map((st, idx) => {
                const sp = prog(f, 145 + idx * 5, 11, easeBack);
                const hot = idx === winner.steps.slice(0, 4).length - 1;
                return (
                  <div
                    key={idx}
                    style={{
                      height: 70,
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
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: hot ? pal.accentOnDark : "#FFFFFF",
                        flexShrink: 0,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div
              style={{
                paddingTop: 18,
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
              <span>{winner.footer}</span>
              <span>100%</span>
            </div>
          </BentoCard>

          {/* 右对照卡：浅灰冗余概念贴 */}
          {f >= 160 && (
            <BentoCard
              x={1004}
              y={168}
              w={806}
              h={648}
              radius={24}
              style={{
                padding: "42px 46px",
                background: "linear-gradient(180deg, #F8F9FB 0%, #EBEEF4 100%)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: prog(f, 161, 8) * (1 - dimRight * 0.22),
                transform: `translateX(${(1 - rightIn) * 48}px) scale(${0.95 + 0.05 * rightIn - dimRight * 0.02})`,
              }}
            >
              <div>
                <SwissTag text={loser.tag} size={24} />
                <div style={{ display: "flex", alignItems: "baseline", gap: 18, marginTop: 20 }}>
                  <span style={{ fontFamily: SWISS_METRIC, fontWeight: 900, fontSize: 138, lineHeight: 0.88, color: "#7A808E" }}>
                    {loser.num}
                  </span>
                  <div>
                    <div style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: fitFont(loser.title, 48, 480, 32), color: "#494E5B" }}>
                      {loser.title}
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: SWISS_BASE.muted, marginTop: 8 }}>{loser.sub}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {loser.rows.slice(0, 4).map((rowTxt, idx) => (
                  <div
                    key={idx}
                    style={{
                      height: 50,
                      borderRadius: 12,
                      padding: "0 20px",
                      backgroundColor: "rgba(255,255,255,0.78)",
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
                  paddingTop: 18,
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
                <span>{loser.footer}</span>
                <span>×</span>
              </div>
            </BentoCard>
          )}

          {/* 中轴圆形裁决章 */}
          {f >= 160 && (
            <div
              style={{
                position: "absolute",
                left: 960 - 48,
                top: 492 - 48,
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
                fontSize: 64,
                color: "#FFFFFF",
                transform: `scale(${gtIn})`,
                zIndex: 12,
              }}
            >
              &gt;
            </div>
          )}
        </StudioCanvas>
      </CurtainStage>

      <SwissCaptionBar
        f={f}
        items={[
          { at: 4, until: 65, text: captions[0] ?? "" },
          { at: 67, until: 132, text: captions[1] ?? "" },
          { at: 136, until: 236, text: captions[2] ?? "" },
        ].filter((c) => c.text)}
      />

      {music && <Bgm dur={SWISS_HOOK_DUR} vol={0.32} />}
      <Sfx at={18} src="tick-crisp_1.wav" vol={0.5} />
      <Sfx at={38} src="tick-crisp_1.wav" vol={0.5} />
      <Sfx at={65} src="hit_1.wav" vol={0.75} />
      <Sfx at={67} src="maximize_002.wav" vol={0.6} />
      <Sfx at={132} src="whoosh-short_1.wav" vol={0.7} />
      <Sfx at={161} src="snap_1.wav" vol={0.75} />
      <Sfx at={182} src="bong_001.wav" vol={0.55} />
    </StudioCanvas>
  );
};
