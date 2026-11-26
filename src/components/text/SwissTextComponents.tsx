// 瑞士无描边文字组件：首屏 0 帧巨字立体主卡（HeroPlaque）
import React from "react";
import { useCurrentFrame } from "remotion";
import { Sfx } from "../../kit/fx";
import { MONO } from "../../kit/fonts";
import { snap } from "../../kit/motion";
import {
  fitFont,
  getSwissPalette,
  StudioCanvas,
  SWISS_BASE,
  SWISS_HEAVY,
  SWISS_SH,
  SwissTheme,
} from "../../kit/swiss";

export type HeroPlaqueProps = {
  theme: SwissTheme;
  badge: string;
  metaTag: string;
  leadText: string;
  accentText: string;
  steps: string[];
  bgCards: { title: string; sub: string; hot?: boolean }[];
};

export const heroPlaqueDefaults: HeroPlaqueProps = {
  theme: "green",
  badge: "架构师实战拆解 · 小白友好",
  metaTag: "agent.py",
  leadText: "带你从零手搓",
  accentText: "最小 Agent",
  steps: ["20 行核心循环", "真实仓库跑通", "拆透五道边界"],
  bgCards: [
    { title: "一文读懂 AI Agent", sub: "概念综述 · 10 分钟速览", hot: true },
    { title: "MCP 协议全解析", sub: "标准接口 · 上下文扩展" },
    { title: "多智能体 Swarm 架构", sub: "角色协同 · 任务分发" },
    { title: "RAG 向量检索进阶", sub: "知识切片 · 相似度召回", hot: true },
    { title: "ReAct 推理论文精读", sub: "思考行动 · 交替循环" },
    { title: "Function Calling 详解", sub: "结构化参数 · 工具声明", hot: true },
  ],
};

export const HeroPlaque: React.FC<HeroPlaqueProps> = ({
  theme = "green",
  badge,
  metaTag,
  leadText,
  accentText,
  steps,
  bgCards,
}) => {
  const f = useCurrentFrame();
  const pal = getSwissPalette(theme);
  const inSpring = 0.94 + 0.06 * snap(f + 2, 0, { damping: 14, stiffness: 240 });
  const fs = fitFont(`${leadText} ${accentText}`, 92, 1000, 48);
  const pool = bgCards.length ? bgCards : heroPlaqueDefaults.bgCards;

  return (
    <StudioCanvas>
      {/* 柔焦漂移背景墙 */}
      {[0, 1, 2].map((row) => {
        const dir = row === 1 ? -1 : 1;
        const drift = f * (4.2 + row * 0.6) * dir;
        const unit = 444;
        return (
          <div key={row} style={{ position: "absolute", left: 0, right: 0, top: 108 + row * 252, height: 214 }}>
            {Array.from({ length: 6 }).map((_, cIdx) => {
              const item = pool[(row * 2 + cIdx) % pool.length];
              const rawX = (((cIdx * unit + drift) % (unit * 6)) + unit * 6) % (unit * 6) - unit;
              return (
                <div
                  key={cIdx}
                  style={{
                    position: "absolute",
                    left: rawX,
                    top: 0,
                    width: 416,
                    height: 204,
                    borderRadius: 24,
                    background: SWISS_BASE.cardSurf,
                    boxShadow: SWISS_SH.card,
                    padding: "26px 30px",
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    opacity: 0.42,
                    filter: "blur(1.8px)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ width: 36, height: 6, borderRadius: 3, backgroundColor: item.hot ? pal.accent : SWISS_BASE.line }} />
                    <span style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.hot ? pal.accent : "#CFD4DF" }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: SWISS_HEAVY, fontWeight: 900, fontSize: 30, color: "#3A3E4A", whiteSpace: "nowrap" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: SWISS_BASE.muted, marginTop: 6 }}>{item.sub}</div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* 柔和日光衬底 */}
      <div
        style={{
          position: "absolute",
          left: 240,
          top: 230,
          width: 1440,
          height: 540,
          borderRadius: "50%",
          background: "radial-gradient(closest-side, rgba(242,244,249,0.94) 0%, rgba(242,244,249,0.74) 55%, rgba(242,244,249,0) 100%)",
          pointerEvents: "none",
        }}
      />

      {/* 第 0 帧即清晰呈现的三层无描边黑曜石立体主卡 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${inSpring.toFixed(3)})`,
        }}
      >
        <div
          style={{
            width: 1160,
            padding: "46px 62px 42px",
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
              marginTop: 30,
              fontFamily: SWISS_HEAVY,
              fontWeight: 900,
              fontSize: fs,
              lineHeight: 1.08,
              letterSpacing: "-0.025em",
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "baseline",
              gap: 20,
            }}
          >
            <span style={{ color: "#FFFFFF" }}>{leadText}</span>
            <span style={{ color: pal.accentOnDark }}>{accentText}</span>
          </div>

          <div
            style={{
              marginTop: 34,
              paddingTop: 24,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            {steps.slice(0, 3).map((st, idx) => {
              const activeStep = f < 24 ? 0 : f < 48 ? 1 : 2;
              const isCur = idx <= activeStep;
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: 54,
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
                    }}
                  />
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: fitFont(st, 23, 260, 17),
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

      <Sfx at={24} src="tick-crisp_1.wav" vol={0.55} />
      <Sfx at={48} src="tick-crisp_1.wav" vol={0.55} />
    </StudioCanvas>
  );
};
