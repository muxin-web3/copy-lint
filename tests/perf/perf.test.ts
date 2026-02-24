import { describe, expect, it } from 'vitest'
import { lintCopy } from '../../src/engine/lint'

const BASE_PARAGRAPH = `中文 English 混排123测试, punctuation!\n访问 https://example.com/a,b?q=1 并联系 test@example.com\n`;

function buildLongText(targetLength = 5200): string {
  let text = ''
  while (text.length < targetLength) {
    text += BASE_PARAGRAPH
  }
  return text
}

describe('performance baseline', () => {
  it('processes 5k+ text within 60s budget', () => {
    const input = buildLongText()
    const start = performance.now()
    const result = lintCopy(input)
    const durationMs = performance.now() - start
    // Baseline log for README update / CI observability
    console.info(`perf-baseline: length=${input.length}, duration_ms=${durationMs.toFixed(2)}`)

    expect(input.length).toBeGreaterThanOrEqual(5000)
    expect(result.formattedText.length).toBeGreaterThan(0)
    expect(durationMs).toBeLessThan(60_000)
  })
})
