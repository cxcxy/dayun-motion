import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 部署到 https://cxcxy.github.io/dayun-motion/ ，生产构建用子路径
export default defineConfig(({ command, isPreview }) => ({
  base: command === "build" || isPreview ? "/dayun-motion/" : "/",
  plugins: [react()],
}));
