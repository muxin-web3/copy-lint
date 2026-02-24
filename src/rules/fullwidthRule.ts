import type { RuleDefinition, RuleMatch, TextRange } from '../engine/types'
import { overlapsProtectedRange } from '../engine/protectedRanges'

const KEEP_FULLWIDTH = new Set(['，', '。', '！', '？', '：', '；', '（', '）', '、', '“', '”', '‘', '’'])

function toHalfwidth(char: string): string {
  const code = char.charCodeAt(0)
  if (code === 0x3000) {
    return ' '
  }
  if (code >= 0xff01 && code <= 0xff5e) {
    return String.fromCharCode(code - 0xfee0)
  }
  return char
}

function findMatches(text: string, protectedRanges: TextRange[]): RuleMatch[] {
  const matches: RuleMatch[] = []

  for (let i = 0; i < text.length; i += 1) {
    const original = text[i]
    if (KEEP_FULLWIDTH.has(original)) {
      continue
    }

    const converted = toHalfwidth(original)
    if (converted === original) {
      continue
    }

    if (overlapsProtectedRange(i, i + 1, protectedRanges)) {
      continue
    }

    matches.push({
      start: i,
      end: i + 1,
      replacement: converted,
      message: '英文与数字建议统一使用半角字符。',
    })
  }

  return matches
}

export const fullwidthRule: RuleDefinition = {
  id: 'fullwidth-to-halfwidth',
  name: '全角半角统一',
  description: '英文/数字字符统一为半角，避免混用。',
  findMatches,
}
