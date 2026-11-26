// 组件总目录：网页预览、Remotion 渲染、skill 都从这里读。
// 新增组件：写好组件文件后在这里登记一行即可。
import React from "react";
import { DropGather, DROP_GATHER_DUR, dropGatherDefaults } from "./components/opening/DropGather";
import { HubPlug, HUB_PLUG_DUR, hubPlugDefaults } from "./components/opening/HubPlug";
import { Overflow, OVERFLOW_DUR, overflowDefaults } from "./components/opening/Overflow";
import { SwissHook, SWISS_HOOK_DUR, swissHookDefaults } from "./components/opening/SwissHook";
import { ChatOverflow, chatOverflowDefaults, HubDiagram, hubDiagramDefaults } from "./components/content/ContentComponents";
import {
  ArmorMorph,
  armorMorphDefaults,
  CodeLens,
  codeLensDefaults,
  ConduitLocks,
  conduitLocksDefaults,
} from "./components/content/SwissContentComponents";
import {
  JellyTokens,
  jellyTokensDefaults,
  MatrixPanel,
  matrixPanelDefaults,
  PointsPanel,
  pointsPanelDefaults,
  PopCards,
  popCardsDefaults,
} from "./components/card/CardComponents";
import { BentoQuad, bentoQuadDefaults, VerdictSplit, verdictSplitDefaults } from "./components/card/SwissCardComponents";
import { Captions, captionsDefaults, GlitchTitle, glitchTitleDefaults, SlamTitle, slamTitleDefaults } from "./components/text/TextComponents";
import { HeroPlaque, heroPlaqueDefaults } from "./components/text/SwissTextComponents";
import {
  Bursts,
  burstsDefaults,
  CameraPull,
  cameraPullDefaults,
  ImpactDrop,
  impactDropDefaults,
  SpeedDash,
  speedDashDefaults,
  SwoopCard,
  swoopCardDefaults,
} from "./components/motion/MotionComponents";
import { CurtainGlide, curtainGlideDefaults } from "./components/motion/SwissMotionComponents";

export type Category = "opening" | "content" | "card" | "text" | "motion";

export const CATEGORIES: { id: Category; name: string; desc: string }[] = [
  { id: "opening", name: "开头组件", desc: "7–8 秒完整开场，节奏卡拍，自带音效" },
  { id: "content", name: "内容组件", desc: "正文里讲机制用的整段画面" },
  { id: "card", name: "卡片组件", desc: "词块、图标卡、信息面板" },
  { id: "text", name: "文字组件", desc: "标题、字幕、特效字" },
  { id: "motion", name: "动效组件", desc: "冲击、冲入、爆炸、甩入、运镜等单个动作" },
];

export type ComponentEntry = {
  id: string;
  category: Category;
  name: string;
  summary: string;
  /** 适合什么场景 */
  useFor: string;
  dur: number;
  /** 缩略图取哪一帧 */
  poster: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: React.FC<any>;
  defaults: Record<string, unknown>;
};

export const COMPONENTS: ComponentEntry[] = [
  // ——— 开头 ———
  { id: "swiss-hook", category: "opening", name: "无描边瑞士开场", summary: "浅色建筑画布：0帧黑曜石巨字主卡 → 光圈分开露出陀螺晶核 → 建筑拉幕切双栏源码裁决（支持红 / 大昀绿双主题）", useFor: "硬核拆解、从零手搓、打破概念焦虑的知识开场", dur: SWISS_HOOK_DUR, poster: 98, component: SwissHook, defaults: swissHookDefaults },
  { id: "drop-gather", category: "opening", name: "砸落集结", summary: "软糖 3D：一个词砸下，同伴加入，镜头拉远变成上千个，标题砸字，面板甩入", useFor: "由很多小单元组成、要规模感的选题", dur: DROP_GATHER_DUR, poster: 125, component: DropGather, defaults: dropGatherDefaults },
  { id: "hub-plug", category: "opening", name: "插线汇聚", summary: "波普漫画：机器人砸下，卡片冲进来插线爆星，通电，立体砸字，斜切转场", useFor: "一个核心连接很多东西：工具、插件、多 Agent", dur: HUB_PLUG_DUR, poster: 118, component: HubPlug, defaults: hubPlugDefaults },
  { id: "overflow", category: "opening", name: "容器溢出", summary: "蓝图工程：条目越塞越快，装满后最早的被挤出碎裂，容器甩开，错位标题", useFor: "上限、过载、被挤掉、成本爆表", dur: OVERFLOW_DUR, poster: 140, component: Overflow, defaults: overflowDefaults },
  // ——— 内容 ———
  { id: "code-lens", category: "content", name: "源码透镜聚焦", summary: "无描边编辑器稳态不动：逐行键入 + 呼吸高亮带 + 行尾弹出大白话胶囊透镜", useFor: "真实源码、配置文件、命令参数的人话拆解", dur: 150, poster: 112, component: CodeLens, defaults: codeLensDefaults },
  { id: "armor-morph", category: "content", name: "核心变形护甲", summary: "双栏代码与数字卡片平滑收缩为圆形中心核，绘出三层护甲环并弹出等距无描边卡片", useFor: "先讲核心主干极简，再拆外层三道工程门槛", dur: 165, poster: 132, component: ArmorMorph, defaults: armorMorphDefaults },
  { id: "conduit-locks", category: "content", name: "管道注入与门禁", summary: "三条输入脉冲汇入内核，下方落入白名单工具卡，右侧高危操作逐一落锁划除", useFor: "系统输入输出、最小权限、安全白名单与护栏边界", dur: 150, poster: 124, component: ConduitLocks, defaults: conduitLocksDefaults },
  { id: "chat-overflow", category: "content", name: "容器溢出（无标题）", summary: "条目一条条顶进容器，装满后最早的被挤出碎掉，容量条报警", useFor: "讲清楚“上限”和“被挤掉”的机制", dur: 120, poster: 96, component: ChatOverflow, defaults: chatOverflowDefaults },
  { id: "hub-diagram", category: "content", name: "中心辐射连接", summary: "中心机器人，卡片左右冲入拉线插上，最后全线通电", useFor: "讲一个系统连接 / 调度多个部件", dur: 110, poster: 100, component: HubDiagram, defaults: hubDiagramDefaults },
  // ——— 卡片 ———
  { id: "verdict-split", category: "card", name: "双栏等高裁决卡", summary: "瑞士网格严格等高：左侧深色高密度闭环卡 vs 右侧退让概念卡，中轴盖下裁决章", useFor: "新旧方案、实操与空谈、高收益与低效率对比", dur: 110, poster: 78, component: VerdictSplit, defaults: verdictSplitDefaults },
  { id: "bento-quad", category: "card", name: "立体分层四宫格", summary: "左侧等轴测四层立体结构逐层咬合，右侧 2×2 无描边卡片同步落位点亮", useFor: "四大核心模块、四层系统架构的全景拆解", dur: 110, poster: 84, component: BentoQuad, defaults: bentoQuadDefaults },
  { id: "jelly-tokens", category: "card", name: "果冻词块", summary: "带眼睛的果冻胶囊，依次砸落挤压回弹", useFor: "关键词、分词、标签", dur: 90, poster: 70, component: JellyTokens, defaults: jellyTokensDefaults },
  { id: "pop-cards", category: "card", name: "波普图标卡", summary: "粗描边硬投影图标卡，左右交替冲入", useFor: "工具、功能、步骤列举", dur: 80, poster: 70, component: PopCards, defaults: popCardsDefaults },
  { id: "points-panel", category: "card", name: "要点面板", summary: "白色柔光面板 3D 甩入，要点逐条弹出", useFor: "总结 2–4 个要点", dur: 75, poster: 60, component: PointsPanel, defaults: pointsPanelDefaults },
  { id: "matrix-panel", category: "card", name: "矩阵面板", summary: "热力格子面板 3D 甩入，格子波浪式弹出", useFor: "关系、对比、注意力这类二维数据", dur: 75, poster: 60, component: MatrixPanel, defaults: matrixPanelDefaults },
  // ——— 文字 ———
  { id: "hero-plaque", category: "text", name: "首屏巨字立体主卡", summary: "第 0 帧即清晰可读：柔焦漂移背景墙之上悬浮三层无描边黑曜石主卡，底槽依次点亮", useFor: "视频前 2 秒静音抓人首屏、章节核心价值宣告", dur: 90, poster: 54, component: HeroPlaque, defaults: heroPlaqueDefaults },
  { id: "slam-title", category: "text", name: "逐字砸字", summary: "每个字从放大状态砸下，关键词变色，两侧放射线", useFor: "标题、金句、转场大字", dur: 60, poster: 45, component: SlamTitle, defaults: slamTitleDefaults },
  { id: "captions", category: "text", name: "字幕胶囊", summary: "一次一条，旧的上浮新的弹入，关键词变色；四种外观", useFor: "画面里的短字幕、提示语", dur: 160, poster: 60, component: Captions, defaults: captionsDefaults },
  { id: "glitch-title", category: "text", name: "错位标题", summary: "两行砸字，其中一个字描边错位抖动", useFor: "讲错误、故障、遗忘这类“出问题”的标题", dur: 80, poster: 50, component: GlitchTitle, defaults: glitchTitleDefaults },
  // ——— 动效 ———
  { id: "curtain-glide", category: "motion", name: "建筑拉幕零闪转场", summary: "退场保持 100% 不透明：自下而上拉幕带 4px 主色亮线 + 单层实底微缩滑入，零灰闪", useFor: "浅底章节利落推进与长镜头之间的零闪屏衔接", dur: 96, poster: 34, component: CurtainGlide, defaults: curtainGlideDefaults },
  { id: "impact-drop", category: "motion", name: "下落冲击", summary: "重力下落 + 落地压扁回弹 + 冲击环 + 放射线 + 镜头抖动", useFor: "主角登场、重点落地", dur: 60, poster: 22, component: ImpactDrop, defaults: impactDropDefaults },
  { id: "speed-dash", category: "motion", name: "速度线冲入", summary: "从屏幕外冲入，弹簧急停，带速度线和斜切", useFor: "新元素加入、左右对比", dur: 60, poster: 40, component: SpeedDash, defaults: speedDashDefaults },
  { id: "bursts", category: "motion", name: "漫画爆炸星", summary: "锯齿爆炸星弹出，中间带拟声字", useFor: "强调、连接成功、搞笑反差", dur: 70, poster: 50, component: Bursts, defaults: burstsDefaults },
  { id: "swoop-card", category: "motion", name: "3D 甩入", summary: "面板从透视倾斜甩到正面，弹簧回弹", useFor: "从概念切到真实界面 / 证据", dur: 60, poster: 40, component: SwoopCard, defaults: swoopCardDefaults },
  { id: "camera-pull", category: "motion", name: "镜头猛拉远", summary: "先特写一个，镜头 0.8 秒拉远，四周按距离依次弹出一大片", useFor: "从一个到一大群的规模感", dur: 90, poster: 60, component: CameraPull, defaults: cameraPullDefaults },
];
