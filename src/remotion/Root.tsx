import React from "react";
import { Composition } from "remotion";
import { FPS, H, W } from "../kit/motion";
import { COMPONENTS } from "../registry";

// 每个组件都注册成一个 composition，id 和网页预览里的一致
export const RemotionRoot: React.FC = () => (
  <>
    {COMPONENTS.map((c) => (
      <Composition key={c.id} id={c.id} component={c.component} durationInFrames={c.dur} fps={FPS} width={W} height={H} defaultProps={c.defaults} />
    ))}
  </>
);
