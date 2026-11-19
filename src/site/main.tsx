import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// 组件里的音效走站点子路径（github.io/dayun-motion/）
globalThis.__DM_BASE__ = import.meta.env.BASE_URL;

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
