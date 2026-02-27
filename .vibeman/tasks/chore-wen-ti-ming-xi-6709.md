---
id: chore-wen-ti-ming-xi-6709
title: 问题明细展示优化
type: chore
status: backlog
priority: medium
tags: []
created_at: '2026-02-27T01:51:49.885Z'
---

## Goal

将问题说明与复制操作收拢到“格式化输出”区域，减少用户在多个 section 间来回切换。最终用户可在高亮处直接查看错误明细，并一键复制当前格式化结果。

## Context

`src/App.tsx` 当前仍渲染独立的 `<section className="issues">`，标题为“问题明细”，包含问题列表、单条“点击修复”按钮与已定位说明文案。
`src/components/HighlightedOutput.tsx` 当前用 `<mark className="changed-fragment">` 渲染变更片段，并通过 `title` 展示 `ruleName + ruleDescription`，同时保留点击定位输入框行为。
“格式化输出”面板当前没有复制按钮。
`src/App.css` 里存在 `.issues`、`.issue-label`、`.selected-issue`、`.rule-detail` 等样式。
`tests/integration/app.test.tsx` 的“locates source position when clicking an issue”用例依赖“问题明细”标题与列表按钮查询。

## Requirements

* [ ] 页面不再渲染独立“问题明细”section，DOM 中不存在“问题明细”标题与其列表项交互入口。

* [ ] 在“格式化输出”中，鼠标悬浮任一高亮错误片段时可看到该片段的错误明细 tooltip，内容至少包含规则名与规则说明。

* [ ] tooltip 展示内容与当前悬浮高亮一一对应，不出现错位、串内容或悬浮到非高亮文本时仍显示旧内容。

* [ ] “格式化输出”section 提供“一键复制”入口，触发后复制内容为当前 `formattedText` 纯文本，完整保留换行与空格。

* [ ] 复制操作有可见反馈（成功或失败），失败不会修改输入文本、输出文本或统计数据。

* [ ] 当格式化输出为空（例如仅空白输入）时，复制入口不可用或触发后给出明确不可复制反馈，且无未处理异常。

* [ ] 高亮点击定位输入框的现有能力保持可用（点击高亮后仍可定位到对应 source 区间）。

* [ ] 自动化测试覆盖至少以下场景：无“问题明细”section、悬浮高亮展示明细、复制成功、复制失败/不可用分支。

## Implementation Notes

* 目标文件：

  * `src/App.tsx`

  * `src/components/HighlightedOutput.tsx`

  * `src/App.css`

  * `tests/integration/app.test.tsx`

  * `tests/e2e/app.spec.ts`

* 现有数据契约：`Diagnostic` 已包含 `ruleName`、`ruleDescription`、`original`、`replacement`、source/output 区间；可直接用于 tooltip 与复制前后的定位一致性校验。

* 交互约束：复制内容来源为 `lintCopy` 输出的 `formattedText`，不使用 DOM 提取文本，避免样式节点影响复制结果。

* 边界场景：

  * `runText` 仅空白字符导致输出为空

  * 连续多个高亮片段快速悬浮切换

  * 剪贴板权限拒绝或 API 不可用

  * 多行文本复制与高亮显示

* 主要风险：

  * tooltip 仅依赖原生 `title` 时可测试性与一致性受浏览器实现影响

  * 删除 issues 区域后，原本依赖问题列表的定位入口缺失导致交互回归

  * Clipboard API 在不同浏览器权限策略下行为差异

* 验证命令：

  * `npm run lint`

  * `npm run test`

  * `npm run test:e2e`

* 非目标：

  * 不调整 lint 规则算法与规则集合

  * 不新增“单条点击修复”替代入口（除非产品另行确认）

  * 不重构页面整体布局或视觉主题

## Recommended Steps

* Step 1: 收敛交互契约与状态模型

  * [ ] 定义 tooltip 需展示的错误明细字段与空态行为，明确高亮与明细的一一映射关系。

  * [ ] 定义复制状态模型（idle/success/error/unavailable）与反馈展示位置，覆盖空输出和权限失败分支。

  * [ ] 确认删除“问题明细”后保留的定位入口与无障碍语义（高亮可聚焦、复制按钮可键盘触发）。

* Step 2: 实现输出区能力收拢

  * [ ] 移除 `App.tsx` 中独立 issues section 相关 JSX 与不再使用的状态展示代码。

  * [ ] 在 `HighlightedOutput` 中完善高亮 tooltip 明细呈现，确保悬浮目标与明细内容绑定稳定。

  * [ ] 在“格式化输出”面板加入“一键复制”按钮并接入剪贴板逻辑与成功/失败反馈。

  * [ ] 更新 `App.css`，删除废弃 issues 样式并补充复制入口与反馈样式。

* Step 3: 回归与验收

  * [ ] 重写集成测试中依赖“问题明细”列表的用例，改为基于高亮交互验证定位行为。

  * [ ] 新增/更新测试覆盖 tooltip 展示、复制成功、复制失败或不可用、空输出不可复制。

  * [ ] 执行 lint、单测与 E2E，记录结果并确认无行为回归。

## Open Questions

* Question: tooltip 明细是否需要包含“原文 -> 修复后”差异，还是仅显示规则名与规则说明？

  * Answer: \[Pending]

* Question: 移动端无 hover 场景下，是否需要点击高亮显示同等错误明细？

  * Answer: \[Pending]

* Question: 复制成功反馈的展示时长是否有统一规范（例如 1.5s / 2s）？

  * Answer: \[Pending]

## Implementation Summary

\[Auto-generated after completion: what changed + tests run.]
