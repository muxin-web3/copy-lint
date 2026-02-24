import type { RuleDefinition, RuleMatch, TextRange } from '../engine/types'
import { overlapsProtectedRange } from '../engine/protectedRanges'
import { isAsciiWord, isCjk } from './utils'

function findMatches(text: string, protectedRanges: TextRange[]): RuleMatch[] {
  const matches: RuleMatch[] = []

  for (let i = 0; i < text.length - 1; i += 1) {
    const a = text[i]
    const b = text[i + 1]

    const needSpace =
      (isCjk(a) && isAsciiWord(b)) || (isAsciiWord(a) && isCjk(b))

    if (!needSpace || overlapsProtectedRange(i, i + 2, protectedRanges)) {
      continue
    }

    matches.push({
      start: i + 1,
      end: i + 1,
      replacement: ' ',
      message: '中英文与数字混排时建议保留空格。',
    })
  }

  return matches
}

export const spacingRule: RuleDefinition = {
  id: 'spacing-between-cjk-and-ascii',
  name: '中英文/数字间空格',
  description: '中文与英文、数字相邻时需要空格分隔。',
  findMatches,
}
