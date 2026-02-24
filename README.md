# Chinese Copy Lint

一个基于 React + TypeScript 的中文文案排版工具，依据《中文文案排版指北》提供检查、可视化高亮和自动修复能力。

## Features

- 双栏布局：左侧输入，右侧输出。
- 规则覆盖：
  - 中文与英文/数字间空格。
  - 中文语境标点规范化。
  - 全角/半角字符统一。
- 规则可追溯：每个高亮片段可查看规则说明。
- 交互能力：实时检查、手动检查、单条修复、一键修复。
- 统计信息：总问题数与按规则分类计数。
- 保护区跳过：URL、邮箱、Markdown 代码块和行内代码。

## Scripts

- `npm run dev`: 本地开发。
- `npm run lint`: ESLint 检查。
- `npm run test`: Vitest（单元 + 集成）。
- `npm run build`: TypeScript + Vite 构建。
- `npm run test:e2e`: Playwright E2E。
- `npm run test:perf`: 5k+ 文案性能基线测试。

## Performance Baseline

- 基线输入：`>= 5,000` 字符。
- 验收阈值：`< 60s`（单次 lint 处理）。
- 复现实验命令：`npm run test:perf`。
