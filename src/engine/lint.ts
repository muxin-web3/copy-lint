import { getProtectedRanges } from './protectedRanges'
import type { Diagnostic, LintResult, RuleMatch, Segment } from './types'
import { rules } from '../rules'

interface Candidate {
  ruleIndex: number
  ruleId: Diagnostic['ruleId']
  ruleName: string
  ruleDescription: string
  start: number
  end: number
  original: string
  replacement: string
}

function dedupeAndSort(matches: Candidate[]): Candidate[] {
  const sorted = [...matches].sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start
    }
    if (a.end !== b.end) {
      return a.end - b.end
    }
    return a.ruleIndex - b.ruleIndex
  })

  const accepted: Candidate[] = []
  let lastEnd = -1

  for (const candidate of sorted) {
    if (candidate.start < lastEnd) {
      continue
    }

    accepted.push(candidate)
    lastEnd = candidate.end
  }

  return accepted
}

function buildSegments(formatted: string, diagnostics: Diagnostic[]): Segment[] {
  if (formatted.length === 0) {
    return []
  }

  const sorted = [...diagnostics].sort((a, b) => a.outputStart - b.outputStart)
  const segments: Segment[] = []
  let cursor = 0

  for (const diagnostic of sorted) {
    if (diagnostic.outputStart > cursor) {
      segments.push({
        text: formatted.slice(cursor, diagnostic.outputStart),
        changed: false,
      })
    }

    segments.push({
      text: formatted.slice(diagnostic.outputStart, diagnostic.outputEnd),
      changed: true,
      diagnosticId: diagnostic.id,
    })

    cursor = diagnostic.outputEnd
  }

  if (cursor < formatted.length) {
    segments.push({
      text: formatted.slice(cursor),
      changed: false,
    })
  }

  return segments
}

export function lintCopy(text: string): LintResult {
  if (text.trim().length === 0) {
    return {
      originalText: text,
      formattedText: '',
      diagnostics: [],
      segments: [],
      stats: {
        totalIssues: 0,
        byRule: {
          'spacing-between-cjk-and-ascii': 0,
          'chinese-punctuation': 0,
          'fullwidth-to-halfwidth': 0,
        },
      },
    }
  }

  const protectedRanges = getProtectedRanges(text)
  const candidates: Candidate[] = []

  rules.forEach((rule, ruleIndex) => {
    const matches = rule.findMatches(text, protectedRanges)
    matches.forEach((match: RuleMatch) => {
      if (match.replacement === text.slice(match.start, match.end)) {
        return
      }
      candidates.push({
        ruleIndex,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleDescription: match.message ?? rule.description,
        start: match.start,
        end: match.end,
        original: text.slice(match.start, match.end),
        replacement: match.replacement,
      })
    })
  })

  const accepted = dedupeAndSort(candidates)

  let formatted = ''
  let cursor = 0
  let outputCursor = 0
  const diagnostics: Diagnostic[] = []

  accepted.forEach((candidate, index) => {
    formatted += text.slice(cursor, candidate.start)
    outputCursor += candidate.start - cursor

    const outputStart = outputCursor
    formatted += candidate.replacement
    outputCursor += candidate.replacement.length

    diagnostics.push({
      id: `issue-${index}`,
      ruleId: candidate.ruleId,
      ruleName: candidate.ruleName,
      ruleDescription: candidate.ruleDescription,
      sourceStart: candidate.start,
      sourceEnd: candidate.end,
      outputStart,
      outputEnd: outputCursor,
      original: candidate.original,
      replacement: candidate.replacement,
    })

    cursor = candidate.end
  })

  formatted += text.slice(cursor)

  const byRule: LintResult['stats']['byRule'] = {
    'spacing-between-cjk-and-ascii': 0,
    'chinese-punctuation': 0,
    'fullwidth-to-halfwidth': 0,
  }

  diagnostics.forEach((item) => {
    byRule[item.ruleId] += 1
  })

  return {
    originalText: text,
    formattedText: formatted,
    diagnostics,
    segments: buildSegments(formatted, diagnostics),
    stats: {
      totalIssues: diagnostics.length,
      byRule,
    },
  }
}
