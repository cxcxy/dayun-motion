// 卡片组件：果冻词块、波普图标卡、要点面板、矩阵面板
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { ImpactRing, SpeedLines, Sfx, Swoop3D } from "../../kit/fx";
import { FONT } from "../../kit/fonts";
import { drop, snap } from "../../kit/motion";
import { C as SOFT, Panel, SENT_PAL, TH, Token } from "../opening/DropGather";
import { C as POP, Icon } from "../opening/HubPlug";

const softBg = "radial-gradient(70% 70% at 50% 42%, #faf8ff 0%, #ece8fb 60%, #ddd6f7 100%)";
const textW = (t: string) => Array.from(t).reduce((w, ch) => w + (/[\x00-\x7f]/.test(ch) ? 37 : 64), 0) + 86;

// ——— 果冻词块 ———
export type JellyTokensProps = { words: string[] };
export const jellyTokensDefaults: JellyTokensProps = { words: ["果冻", "词块", "会弹", "！"] };
export const JellyTokens: React.FC<JellyTokensProps> = ({ words }) => {
  const f = useCurrentFrame();
  const list = words.slice(0, 6);
  const ws = list.map(textW);
  const total = ws.reduce((a, w) => a + w, 0) + 28 * (list.length - 1);
  const s = Math.min(1.5, 1700 / total);
  let x = 960 - (total * s) / 2;
  return (
    <AbsoluteFill style={{ background: softBg, fontFamily: FONT }}>
      <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "50% 50%" }}>
        {list.map((w, i) => {
          const at = 14 + i * 9;
          const d = drop(f, at, 12, 700);
          const left = 960 + (x - 960) / s;
          x += (ws[i] + 28) * s;
          return (
            <React.Fragment key={i}>
              <Token
                text={w}
                w={ws[i]}
                pal={SENT_PAL[i % 4]}
                eyes
                blink={f > 60 + i * 4 && f < 64 + i * 4}
                style={{
                  left,
                  top: 540 - TH / 2 + d.y,
                  transform: `scale(${1 + (d.sx - 1) * 1.5}, ${1 + (d.sy - 1) * 1.5})`,
                  transformOrigin: "50% 100%",
                }}
              />
              <ImpactRing at={at} x={left + ws[i] / 2} y={540 + TH / 2 + 26} w={ws[i] * 1.2} color={SOFT.ink} />
              <Sfx at={at - 1} src={i % 2 ? "land_2.wav" : "land_1.wav"} vol={0.7} />
            </React.Fragment>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ——— 波普图标卡 ———
export type PopCardsProps = { items: { name: string; icon: string }[] };
export const popCardsDefaults: PopCardsProps = {
  items: [
    { name: "浏览器", icon: "globe" },
    { name: "邮件", icon: "mail" },
    { name: "终端", icon: "terminal" },
    { name: "图片", icon: "image" },
  ],
};
export const PopCards: React.FC<PopCardsProps> = ({ items }) => {
  const f = useCurrentFrame();
  const list = items.slice(0, 6);
  const gap = 260;
  const x0 = 960 - ((list.length - 1) * gap) / 2;
  return (
    <AbsoluteFill
      style={{
        background: POP.y1,
        backgroundImage: `radial-gradient(${POP.ink}26 3px, transparent 3.6px)`,
        backgroundSize: "22px 22px",
        fontFamily: FONT,
      }}
    >
      {list.map((it, i) => {
        const side = i % 2 ? 1 : -1;
        const at = 10 + i * 8;
        const p = snap(f, at, { damping: 11, stiffness: 230, mass: 0.6 });
        const cx = x0 + i * gap;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: cx - 88 + side * (1 - p) * 1400,
                top: 540 - 120,
                width: 176,
                height: 176,
                borderRadius: 26,
                background: "#fff",
                border: `9px solid ${POP.ink}`,
                boxShadow: `${side * -12}px 12px 0 ${f >= at + 8 ? POP.red : POP.ink}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transform: `skewX(${side * (1 - p) * 24}deg) rotate(${side * (1 - p) * 14 + side * -3}deg)`,
                boxSizing: "border-box",
                opacity: f >= at ? 1 : 0,
              }}
            >
              <Icon kind={it.icon} />
            </div>
            <div style={{ position: "absolute", left: cx - 100 + side * (1 - p) * 1400, width: 200, top: 540 + 80, display: "flex", justifyContent: "center", opacity: f >= at ? 1 : 0 }}>
              <div style={{ background: POP.ink, color: "#fff", fontSize: 34, fontWeight: 600, padding: "4px 18px", transform: `rotate(${side * 2}deg)` }}>{it.name}</div>
            </div>
            <SpeedLines at={at + 3} x={cx + side * 100} y={540 - 32} dir={side as 1 | -1} color={POP.ink} spread={100} />
            <Sfx at={at} src={i % 2 ? "whoosh-short_1.wav" : "whoosh-short_2.wav"} vol={0.5} />
            <Sfx at={at + 6} src={i % 2 ? "snap_2.wav" : "snap_1.wav"} vol={0.8} />
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ——— 要点面板 / 矩阵面板（3D 甩入）———
// Panel 内部按开场时间轴（第 150 帧甩入）编排，这里整体平移 140 帧让它第 10 帧出场
export type PointsPanelProps = { title: string; tag?: string; note?: string; points: string[] };
export const pointsPanelDefaults: PointsPanelProps = { title: "三个要点", tag: "Key points", points: ["先把问题说清楚", "再给一个具体例子", "最后落到怎么做"] };
export const PointsPanel: React.FC<PointsPanelProps> = (p) => (
  <AbsoluteFill style={{ background: softBg }}>
    <Sequence from={-140} layout="none">
      <Swoop3D at={150} from={{ rx: 62, ry: -14, rz: -12, y: 760, s: 0.8 }}>
        <Panel panel={{ kind: "points", ...p }} words={[]} />
      </Swoop3D>
    </Sequence>
    <Sfx at={6} src="whoosh.mp3" vol={0.7} />
    <Sfx at={18} src="maximize_002.wav" vol={0.5} />
  </AbsoluteFill>
);

export type MatrixPanelProps = { title: string; tag?: string; note?: string; words: string[]; values?: number[][] };
export const matrixPanelDefaults: MatrixPanelProps = {
  title: "关系矩阵",
  tag: "Matrix",
  note: "颜色越深，关系越强（示意）",
  words: ["猫", "坐在", "垫子", "上"],
  values: [
    [0.7, 0.15, 0.1, 0.05],
    [0.3, 0.4, 0.2, 0.1],
    [0.1, 0.2, 0.5, 0.2],
    [0.05, 0.15, 0.45, 0.35],
  ],
};
export const MatrixPanel: React.FC<MatrixPanelProps> = ({ words, ...rest }) => (
  <AbsoluteFill style={{ background: softBg }}>
    <Sequence from={-140} layout="none">
      <Swoop3D at={150} from={{ rx: 62, ry: -14, rz: -12, y: 760, s: 0.8 }}>
        <Panel panel={{ kind: "matrix", ...rest }} words={words.slice(0, 5)} />
      </Swoop3D>
    </Sequence>
    <Sfx at={6} src="whoosh.mp3" vol={0.7} />
    <Sfx at={20} src="tick-crisp_1.wav" vol={0.6} />
  </AbsoluteFill>
);
