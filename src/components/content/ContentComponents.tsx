// 内容组件：正文里用来讲机制的整段画面（从开场里拆出来的场景，不带标题）
import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { BurstTicks, Camera, Sfx, Starburst } from "../../kit/fx";
import { FONT } from "../../kit/fonts";
import { prog } from "../../kit/motion";
import { BBOT, C as BP, Frame, Stack, buildMsgs } from "../opening/Overflow";
import { C as POP, Cables, HX, HY, Robot, ToolCard, buildTools, cable } from "../opening/HubPlug";

// ——— 容器溢出（对话气泡） ———
export type ChatOverflowProps = {
  containerLabel: string;
  messages: { text: string; side: "left" | "right" }[];
  meterMax: number;
};
export const chatOverflowDefaults: ChatOverflowProps = {
  containerLabel: "待办清单 · TODO",
  messages: [
    { side: "right", text: "回复客户邮件" },
    { side: "left", text: "整理周报" },
    { side: "right", text: "改 PPT 第三页" },
    { side: "left", text: "约下周会议" },
    { side: "right", text: "报销发票" },
    { side: "left", text: "看合同" },
    { side: "right", text: "更新官网文案" },
    { side: "left", text: "回群消息" },
    { side: "right", text: "准备面试题" },
    { side: "left", text: "交季度总结" },
  ],
  meterMax: 10,
};
export const ChatOverflow: React.FC<ChatOverflowProps> = ({ containerLabel, messages, meterMax }) => {
  const f = useCurrentFrame();
  const msgs = buildMsgs(messages);
  const full = msgs[6] ? msgs[6].at : Infinity;
  const alarm = f >= full ? 1 : 0;
  return (
    <AbsoluteFill
      style={{
        background: BP.bg,
        backgroundImage:
          "linear-gradient(#ffffff2e 2px, transparent 2px), linear-gradient(90deg, #ffffff2e 2px, transparent 2px), linear-gradient(#ffffff12 1px, transparent 1px), linear-gradient(90deg, #ffffff12 1px, transparent 1px)",
        backgroundSize: "200px 200px, 200px 200px, 40px 40px, 40px 40px",
        backgroundPosition: "-40px -60px",
        fontFamily: FONT,
      }}
    >
      <Camera keys={[{ f: 0, s: 1.04 }, { f: 20, s: 1 }, { f: 100, s: 1.08 }]} hits={msgs.slice(6).map((m) => ({ at: m.at + 1, amp: 10 }))}>
        <Frame alarm={alarm} msgs={msgs} label={containerLabel} MAX_TOK={meterMax} />
        <AbsoluteFill style={{ clipPath: `polygon(-2000px -2000px, 4000px -2000px, 4000px ${BBOT - 4}px, -2000px ${BBOT - 4}px)` }}>
          <Stack alarm={alarm} msgs={msgs} />
        </AbsoluteFill>
      </Camera>
      <AbsoluteFill style={{ background: BP.red, opacity: f < full ? 0 : Math.max(0, 0.3 - (f - full) * 0.05) }} />
      {msgs.map((m, i) => (
        <Sfx key={i} at={m.at} src={`pop_${(i % 4) + 1}.wav`} vol={0.5} />
      ))}
      {Number.isFinite(full) && <Sfx at={full + 1} src="error_004.wav" vol={0.6} />}
    </AbsoluteFill>
  );
};

// ——— 中心辐射连接 ———
export type HubDiagramProps = { hub: string; tools: { name: string; icon: string }[] };
export const hubDiagramDefaults: HubDiagramProps = {
  hub: "Agent",
  tools: [
    { name: "写作", icon: "写" },
    { name: "搜索", icon: "search" },
    { name: "表格", icon: "表" },
    { name: "邮件", icon: "mail" },
    { name: "终端", icon: "terminal" },
    { name: "图片", icon: "image" },
  ],
};
export const HubDiagram: React.FC<HubDiagramProps> = ({ hub, tools: list }) => {
  const f = useCurrentFrame();
  const tools = buildTools(list);
  // 开场里 0–10 帧是机器人砸下，这里从第 12 帧开始播，机器人直接在场
  const OFF = 12;
  return (
    <AbsoluteFill style={{ background: POP.y1, fontFamily: FONT, overflow: "hidden" }}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 3000, height: 3000, flexShrink: 0, background: `repeating-conic-gradient(${POP.y1} 0deg 9deg, ${POP.y2} 9deg 18deg)`, transform: `rotate(${f * 0.5}deg)` }} />
      </AbsoluteFill>
      <Sequence from={-OFF} layout="none">
        <Camera keys={[{ f: 0, s: 0.95 }]}>
          <Cables tools={tools} />
          {tools.map((t, i) => (
            <ToolCard key={i} t={t} />
          ))}
          <Robot tools={tools} hub={hub} />
          {tools.map((t, i) => {
            const k = cable(t);
            return <Starburst key={i} at={t.at + 8} x={k.p3.x + t.side * 40} y={k.p3.y - 70} r={62} fill={i % 2 ? POP.blue : POP.red} stroke={POP.ink} text={i % 2 ? "啪!" : "咔!"} points={9} hold={7} seed={i * 0.7} />;
          })}
          <BurstTicks at={92} x={HX} y={HY} r={250} color={POP.red} count={20} len={90} width={12} rot={0.17} />
        </Camera>
      </Sequence>
      {tools.map((t, i) => (
        <React.Fragment key={i}>
          <Sfx at={t.at - 6 - OFF} src={i % 2 ? "whoosh-short_1.wav" : "whoosh-short_2.wav"} vol={0.5} />
          <Sfx at={t.at + 8 - OFF} src={i % 2 ? "snap_2.wav" : "snap_1.wav"} vol={0.8} />
        </React.Fragment>
      ))}
      <Sfx at={92 - OFF} src="glass_002.wav" vol={0.6} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 60, textAlign: "center", fontSize: 40, fontWeight: 600, color: POP.ink, opacity: prog(f, 90 - OFF, 8) }}>
        全部接通
      </div>
    </AbsoluteFill>
  );
};
