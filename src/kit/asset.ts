// 资源路径：Remotion 渲染时用 staticFile；网页预览时用站点 base（github.io 子路径）。
import { staticFile } from "remotion";

declare global {
  // eslint-disable-next-line no-var
  var __DM_BASE__: string | undefined;
}

export const asset = (p: string) => (globalThis.__DM_BASE__ !== undefined ? globalThis.__DM_BASE__ + p : staticFile(p));
