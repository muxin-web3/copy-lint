import type { RuleDefinition, RuleMatch, TextRange } from '../engine/types'
import { overlapsProtectedRange } from '../engine/protectedRanges'
import { isCjk } from './utils'

const PUNCTUATION_MAP: Record<string, string> = {
  ',': '，',
  '.': '。',
  '!': '！',
  '?': '？',
  ':': '：',
  ';': '；',
  '(': '（',
  ')': '）',
}

const CONTEXT_BREAK_RE = /[\n\r]/

function hasNearbyCjk(text: string, index: number): boolean {
  for (let i = index - 1; i >= 0; i -= 1) {
    const char = text[i]
    if (CONTEXT_BREAK_RE.test(char)) {
      break
    }
    if (isCjk(char)) {
      return true
    }
  }

  for (let i = index + 1; i < text.length; i += 1) {
    const char = text[i]
    if (CONTEXT_BREAK_RE.test(char)) {
      break
    }
    if (isCjk(char)) {
      return true
    }
  }

  return false
}

function findMatches(text: string, protectedRanges: TextRange[]): RuleMatch[] {
  const matches: RuleMatch[] = []

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const mapped = PUNCTUATION_MAP[char]
    if (!mapped) {
      continue
    }

    const prev = text[i - 1] ?? ''
    const next = text[i + 1] ?? ''
    const cjkContext = isCjk(prev) || isCjk(next) || hasNearbyCjk(text, i)

    if (!cjkContext || overlapsProtectedRange(i, i + 1, protectedRanges)) {
      continue
    }

    if (char === '.' && /\d/.test(prev) && /\d/.test(next)) {
      continue
    }

    matches.push({
      start: i,
      end: i + 1,
      replacement: mapped,
      message: '中文语境建议使用中文全角标点。',
    })
  }

  for (let i = 1; i < text.length; i += 1) {
    const prev = text[i - 1]
    const char = text[i]
    if (!/\s/.test(prev) || !/[，。！？：；）]/.test(char)) {
      continue
    }

    if (overlapsProtectedRange(i - 1, i + 1, protectedRanges)) {
      continue
    }

    matches.push({
      start: i - 1,
      end: i + 1,
      replacement: char,
      message: '中文标点前通常不保留空格。',
    })
  }

  return matches
}

export const punctuationRule: RuleDefinition = {
  id: 'chinese-punctuation',
  name: '中英文标点规范',
  description: '中文上下文优先使用中文标点并移除不必要空格。',
  findMatches,
}
