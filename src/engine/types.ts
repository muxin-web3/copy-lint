export type RuleId =
  | 'spacing-between-cjk-and-ascii'
  | 'chinese-punctuation'
  | 'fullwidth-to-halfwidth'

export interface RuleMeta {
  id: RuleId
  name: string
  description: string
}

export interface RuleMatch {
  start: number
  end: number
  replacement: string
  message?: string
}

export interface RuleDefinition extends RuleMeta {
  findMatches: (text: string, protectedRanges: TextRange[]) => RuleMatch[]
}

export interface TextRange {
  start: number
  end: number
}

export interface Diagnostic {
  id: string
  ruleId: RuleId
  ruleName: string
  ruleDescription: string
  sourceStart: number
  sourceEnd: number
  outputStart: number
  outputEnd: number
  original: string
  replacement: string
}

export interface Segment {
  text: string
  changed: boolean
  diagnosticId?: string
}

export interface LintResult {
  originalText: string
  formattedText: string
  diagnostics: Diagnostic[]
  segments: Segment[]
  stats: {
    totalIssues: number
    byRule: Record<RuleId, number>
  }
}
