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
  const map = diagnosticMap(diagnostics)

  if (segments.length === 0) {
    return <p className="placeholder">输出为空</p>
  }

  return (
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
  )
}
