// 瑞士无描边动效组件：建筑拉幕与单层零闪转场（CurtainGlide）
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Sfx } from "../../kit/fx";
import { MONO } from "../../kit/fonts";
import { prog } from "../../kit/motion";
import {
  BentoCard,
  CurtainStage,
  easeInOut,
  fitFont,
  getSwissPalette,
  StudioCanvas,
  SWISS_BASE,
  SWISS_HEAVY,
  SwissTag,
  SwissTheme,
} from "../../kit/swiss";

export type CurtainGlideProps = {
  theme: SwissTheme;
  scenes: { badge: string; title: string; sub: string }[];
};

export const curtainGlideDefaults: CurtainGlideProps = {
  theme: "crimson",
  scenes: [
    { badge: "SCENE 01 · 初始实底", title: "退场层保持 100% 不透明", sub: "彻底告别双半透明叠化带来的灰闪与脏影" },
    { badge: "SCENE 02 · 建筑拉幕", title: "自下而上拉幕 + 4px 前导亮线", sub: "适合开场前 25 秒的高节奏章节推进" },
    { badge: "SCENE 03 · 单层轻滑", title: "新画布微缩入场覆盖旧层", sub: "适合正文长镜头之间的平滑无感切换" },
  ],
};

const StageSlide: React.FC<{
  item: { badge: string; title: string; sub: string };
  variant: "light" | "dark" | "accent";
  theme: SwissTheme;
}> = ({ item, variant, theme }) => {
  const pal = getSwissPalette(theme);
  return (
    <StudioCanvas>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BentoCard
          w={1240}
          h={520}
          variant={variant}
          active={variant === "light"}
          theme={theme}
          radius={28}
          style={{
            padding: "56px 68px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <SwissTag
              text={item.badge}
              variant={variant === "accent" ? "dark" : "accent"}
              theme={theme}
              size={22}
            />
            <span
              style={{
                fontFamily: MONO,
                fontSize: 20,
                fontWeight: 800,
                color: variant === "light" ? SWISS_BASE.muted : variant === "accent" ? pal.accentPale : "#8D95A8",
              }}
            >
              ZERO-FLASH TRANSITION
            </span>
          </div>
          <div>
            <div
              style={{
                fontFamily: SWISS_HEAVY,
                fontWeight: 900,
                fontSize: fitFont(item.title, 64, 1080, 36),
                color: variant === "light" ? SWISS_BASE.ink : "#FFFFFF",
                letterSpacing: "-0.02em",
              }}
            >
              {item.title}
            </div>
            <div
              style={{
                fontSize: fitFont(item.sub, 30, 1080, 22),
                fontWeight: 700,
                color: variant === "light" ? SWISS_BASE.muted : variant === "accent" ? pal.accentPale : "#A4ACBD",
                marginTop: 18,
              }}
            >
              {item.sub}
            </div>
          </div>
        </BentoCard>
      </div>
    </StudioCanvas>
  );
};

export const CurtainGlide: React.FC<CurtainGlideProps> = ({ theme = "crimson", scenes }) => {
  const f = useCurrentFrame();
  const s0 = scenes[0] ?? curtainGlideDefaults.scenes[0];
  const s1 = scenes[1] ?? curtainGlideDefaults.scenes[1];
  const s2 = scenes[2] ?? curtainGlideDefaults.scenes[2];

  const glide = prog(f, 62, 13, easeInOut);

  return (
    <AbsoluteFill style={{ backgroundColor: SWISS_BASE.bg, overflow: "hidden" }}>
      {/* 第一镜：保持 100% 不透明垫底 */}
      <StageSlide item={s0} variant="light" theme={theme} />

      {/* 第二镜（f=26..40）：建筑拉幕 + 4px 主色亮线 */}
      <CurtainStage f={f} at={26} dur={14} theme={theme}>
        <StageSlide item={s1} variant="dark" theme={theme} />
      </CurtainStage>

      {/* 第三镜（f=62..75）：单层实底微缩滑入（底层保持 100% 不透明，零闪屏） */}
      {f >= 62 && (
        <AbsoluteFill
          style={{
            opacity: glide,
            transform: `scale(${0.985 + 0.015 * glide})`,
            zIndex: 30,
          }}
        >
          <StageSlide item={s2} variant="accent" theme={theme} />
        </AbsoluteFill>
      )}

      <Sfx at={26} src="whoosh-short_1.wav" vol={0.7} />
      <Sfx at={62} src="open_001.wav" vol={0.6} />
    </AbsoluteFill>
  );
};
