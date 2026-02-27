import { useState } from 'react'
import type { Diagnostic, Segment } from '../engine/types'

interface HighlightedOutputProps {
  segments: Segment[]
  diagnostics: Diagnostic[]
  selectedDiagnosticId: string | null
  onSelectDiagnostic: (diagnostic: Diagnostic) => void
}

const diagnosticMap = (diagnostics: Diagnostic[]) =>
  Object.fromEntries(diagnostics.map((item) => [item.id, item]))

export function HighlightedOutput({
  segments,
  diagnostics,
  selectedDiagnosticId,
  onSelectDiagnostic,
}: HighlightedOutputProps) {
  const [hoveredDiagnosticId, setHoveredDiagnosticId] = useState<string | null>(null)
  const map = diagnosticMap(diagnostics)
  const hoveredDiagnostic = hoveredDiagnosticId ? map[hoveredDiagnosticId] : undefined

  if (segments.length === 0) {
    return <p className="placeholder">输出为空</p>
  }

  return (
    <div className="output-wrapper" onMouseLeave={() => setHoveredDiagnosticId(null)}>
      {hoveredDiagnostic ? (
        <p className="tooltip-detail" role="status" aria-live="polite">
          <strong>{hoveredDiagnostic.ruleName}</strong>
          <span>{hoveredDiagnostic.ruleDescription}</span>
        </p>
      ) : (
        <p className="tooltip-placeholder">悬浮高亮片段可查看问题明细</p>
      )}
      <pre className="output-text" aria-label="formatted-output">
        {segments.map((segment, index) => {
          if (!segment.changed || !segment.diagnosticId) {
            return <span key={`segment-${index}`}>{segment.text}</span>
          }

          const diagnostic = map[segment.diagnosticId]
          const selected = selectedDiagnosticId === segment.diagnosticId

          return (
            <mark
              key={`segment-${index}`}
              className={`changed-fragment ${selected ? 'selected' : ''}`}
              title={`${diagnostic.ruleName}: ${diagnostic.ruleDescription}`}
              onMouseEnter={() => setHoveredDiagnosticId(segment.diagnosticId ?? null)}
              onMouseLeave={() => setHoveredDiagnosticId(null)}
              onFocus={() => setHoveredDiagnosticId(segment.diagnosticId ?? null)}
              onBlur={() => setHoveredDiagnosticId(null)}
              onClick={() => onSelectDiagnostic(diagnostic)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onSelectDiagnostic(diagnostic)
                }
              }}
            >
              {segment.text}
            </mark>
          )
        })}
      </pre>
    </div>
  )
}
