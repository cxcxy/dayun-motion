# dayun-motion · 视频动效组件库

做视频用的动效积木：开头、内容、卡片、文字、动效五类 Remotion 组件。每个组件都能在网页里实时播放、改参数，再一条命令渲染成 1920×1080 视频。

**在线预览：<https://cxcxy.github.io/dayun-motion/>**

## 组件分类

| 分类 | 目录 | 是什么 | 现有组件 |
|---|---|---|---|
| 开头组件 | `src/components/opening/` | 7–8 秒完整开场，节奏卡拍，自带音效 | 无描边瑞士开场 · 砸落集结 · 插线汇聚 · 容器溢出 |
| 内容组件 | `src/components/content/` | 正文里讲机制用的整段画面 | 源码透镜聚焦 · 核心变形护甲 · 管道注入与门禁 · 容器溢出（无标题）· 中心辐射连接 |
| 卡片组件 | `src/components/card/` | 词块、图标卡、信息面板 | 双栏等高裁决卡 · 立体分层四宫格 · 果冻词块 · 波普图标卡 · 要点面板 · 矩阵面板 |
| 文字组件 | `src/components/text/` | 标题、字幕、特效字 | 首屏巨字立体主卡 · 逐字砸字 · 字幕胶囊 · 错位标题 |
| 动效组件 | `src/components/motion/` | 单个动作 | 建筑拉幕零闪转场 · 下落冲击 · 速度线冲入 · 漫画爆炸星 · 3D 甩入 · 镜头猛拉远 |

完整清单、id 和默认参数都在 [`src/registry.ts`](src/registry.ts)。

## 本地使用

```bash
npm install
npm run dev        # 本地预览网站（和 github.io 上一样）
npm run studio     # Remotion Studio，逐帧调动画
```

渲染某个组件：

```bash
npm run render -- hub-plug out/hub-plug.mp4                                # 默认参数
npm run render -- hub-plug out/hub-plug.mp4 --props=props/hub-plug.json   # 自定义参数
npm run still -- hub-plug out/hub-plug.png --frame=118                    # 单帧
```

参数就是网页详情页右侧那段 JSON，调好后复制存成 `props/<id>.json`。

## 目录结构

```
src/
  kit/            共用原子：节拍、下落挤压、抖动、镜头、弹簧（motion.ts），
                  冲击环、放射线、速度线、字幕胶囊、砸字、3D 甩入、爆炸星、音效（fx.tsx）
  components/     五类组件
  registry.ts     组件总目录：网页、Remotion、skill 都从这里读
  remotion/       Remotion 渲染入口
  site/           预览网站（Vite + @remotion/player）
public/
  sfx/  bgm/      音效和背景鼓点
tools/
  make_sfx.py     原创音效合成脚本
  make_beat.py    原创 120 BPM 鼓点合成脚本
```

## 新增一个组件

1. 在对应分类目录写组件：导出 `XxxProps` 类型、默认参数和组件本身。所有文字都从 props 来，条数和字数变化时要自动缩放，不能撑破画面。
2. 动作尽量用 `src/kit/` 里现成的原子，不够再往 kit 里加。所有运动都由当前帧计算，不用 CSS 动画和定时器。
3. 在 `src/registry.ts` 登记一行（id、分类、名字、说明、时长、缩略图帧）。
4. `npm run dev` 看效果，`npm run build` 确认能构建；推到 `main` 后 GitHub Actions 会自动更新预览站。

统一规格：1920×1080、30fps、120 BPM（一拍 = 15 帧，第 0 帧是第一拍）。

## 字体

Mac 上优先用苹方和 SF Compact Rounded，这样本地渲染和设计稿一致；其他系统的网页预览会回退到 Noto Sans SC、Nunito、JetBrains Mono（Google Fonts），字形会略有不同。

## 素材授权

- `public/sfx/` 里 Kenney Interface Sounds 和 `pop.mp3`、`whoosh.mp3` 为 CC0（许可证见同目录）。
- 其余音效（`hit` / `land` / `snap` / `whoosh-short` / `whoosh-long` / `pop_1–4` / `tick-crisp`）和 `public/bgm/beat.wav` 由 `tools/` 里的脚本从噪声和正弦波合成，没有使用采样。
- 组件基于 [Remotion](https://www.remotion.dev)。Remotion 对个人和小团队免费，公司使用请先看它的[许可证](https://www.remotion.dev/license)。
