import type { TextRange } from './types'

const URL_RE = /https?:\/\/[^\s)\]}]+|www\.[^\s)\]}]+/g
const EMAIL_RE = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g
const FENCED_CODE_RE = /```[\s\S]*?```/g
const INLINE_CODE_RE = /`[^`\n]+`/g

const RANGE_PATTERNS = [FENCED_CODE_RE, INLINE_CODE_RE, URL_RE, EMAIL_RE]

export function getProtectedRanges(text: string): TextRange[] {
  const ranges: TextRange[] = []

  for (const pattern of RANGE_PATTERNS) {
    for (const match of text.matchAll(pattern)) {
      const start = match.index ?? -1
      if (start < 0) {
        continue
      }
      ranges.push({ start, end: start + match[0].length })
    }
  }

  return mergeRanges(ranges)
}

function mergeRanges(ranges: TextRange[]): TextRange[] {
  if (ranges.length === 0) {
    return []
  }

  const sorted = [...ranges].sort((a, b) => a.start - b.start)
  const merged: TextRange[] = [sorted[0]]

  for (let i = 1; i < sorted.length; i += 1) {
    const current = sorted[i]
    const last = merged[merged.length - 1]

    if (current.start <= last.end) {
      last.end = Math.max(last.end, current.end)
      continue
    }

    merged.push({ ...current })
  }

  return merged
}

export function overlapsProtectedRange(
  start: number,
  end: number,
  ranges: TextRange[],
): boolean {
  return ranges.some((range) => start < range.end && end > range.start)
}
