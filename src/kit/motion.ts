// 开场动效原子：全部是「帧 → 数值」的纯函数，任意帧 seek 结果一致。
import { Easing, interpolate, spring } from "remotion";

export const FPS = 30;
export const W = 1920;
export const H = 1080;
/** 120 BPM 下一拍 = 15 帧，和默认 BGM 的底鼓对齐 */
export const BEAT = 15;
export const b = (n: number) => Math.round(n * BEAT);

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** start 开始、dur 帧内从 0 走到 1 */
export const prog = (f: number, start: number, dur: number, easing = Easing.out(Easing.cubic)) =>
  interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing });

/** 带回弹的弹簧，未开始时为 0 */
export const snap = (f: number, start: number, cfg: { damping?: number; stiffness?: number; mass?: number } = {}) =>
  f < start
    ? 0
    : spring({ frame: f - start, fps: FPS, config: { damping: 11, stiffness: 190, mass: 0.7, ...cfg } });

/** 不回弹的平滑弹簧 */
export const smooth = (f: number, start: number, damping = 200) =>
  f < start ? 0 : spring({ frame: f - start, fps: FPS, config: { damping } });

/**
 * 重力下落：impact 帧落地。返回 y 偏移（落地时为 0）和挤压缩放。
 * 下落阶段竖向拉长，落地后横向压扁再回弹。
 */
export const drop = (f: number, impact: number, fall = 14, height = 900) => {
  if (f < impact) {
    const t = interpolate(f, [impact - fall, impact], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
    return { y: -height * (1 - t), sx: 0.9, sy: 1.14, landed: false };
  }
  const t = f - impact;
  const k = Math.exp(-t / 5) * Math.cos(t * 0.75);
  const hop = -Math.max(0, Math.sin((t / 9) * Math.PI)) * 46 * (t < 9 ? 1 : 0);
  return { y: hop, sx: 1 + k * 0.26, sy: 1 - k * 0.3, landed: true };
};

/** 冲击后衰减抖动，返回像素偏移 */
export const shake = (f: number, at: number, amp = 18, decay = 4.5) => {
  if (f < at) return { x: 0, y: 0 };
  const t = f - at;
  const e = amp * Math.exp(-t / decay);
  return { x: e * Math.sin(t * 2.3), y: e * Math.cos(t * 3.1) };
};

/** 多个冲击叠加的抖动 */
export const shakes = (f: number, hits: Array<{ at: number; amp?: number }>) =>
  hits.reduce(
    (acc, h) => {
      const s = shake(f, h.at, h.amp ?? 14);
      return { x: acc.x + s.x, y: acc.y + s.y };
    },
    { x: 0, y: 0 },
  );

/** 镜头关键帧：在 keys 之间用 inOut 缓动插值 */
export type CamKey = { f: number; s: number; x?: number; y?: number; r?: number };
export const camera = (f: number, keys: CamKey[], easing = Easing.inOut(Easing.cubic)) => {
  const fs = keys.map((k) => k.f);
  const pick = (sel: (k: CamKey) => number) =>
    keys.length === 1 ? sel(keys[0]) : interpolate(f, fs, keys.map(sel), { ...clamp, easing });
  return { s: pick((k) => k.s), x: pick((k) => k.x ?? 0), y: pick((k) => k.y ?? 0), r: pick((k) => k.r ?? 0) };
};

/** 确定性伪随机 */
export const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
