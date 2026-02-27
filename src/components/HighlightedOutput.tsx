import { useRef, useState } from 'react'
import type { Diagnostic, Segment } from '../engine/types'

interface HighlightedOutputProps {
  segments: Segment[]
  diagnostics: Diagnostic[]
  selectedDiagnosticId: string | null
  onSelectDiagnostic: (diagnostic: Diagnostic) => void
}

const diagnosticMap = (diagnostics: Diagnostic[]) =>
  Object.fromEntries(diagnostics.map((item) => [item.id, item]))

interface TooltipState {
  left: number
  top: number
  ruleName: string
  ruleDescription: string
}

export function HighlightedOutput({
  segments,
  diagnostics,
  selectedDiagnosticId,
  onSelectDiagnostic,
}: HighlightedOutputProps) {
  const map = diagnosticMap(diagnostics)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)

  function showTooltip(target: HTMLElement, diagnostic: Diagnostic) {
    const wrapperRect = wrapperRef.current?.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    if (!wrapperRect) {
      return
    }

    setTooltip({
      left: targetRect.left - wrapperRect.left + targetRect.width / 2,
      top: targetRect.top - wrapperRect.top - 8,
      ruleName: diagnostic.ruleName,
      ruleDescription: diagnostic.ruleDescription,
    })
  }

  function hideTooltip() {
    setTooltip(null)
  }

  if (segments.length === 0) {
    return <p className="placeholder">输出为空</p>
  }

  return (
    <div className="output-wrapper" ref={wrapperRef}>
      {tooltip ? (
        <p
          className="output-tooltip"
          role="status"
          aria-live="polite"
          style={{ left: `${tooltip.left}px`, top: `${tooltip.top}px` }}
        >
          <strong>{tooltip.ruleName}</strong>
          <span>{tooltip.ruleDescription}</span>
        </p>
      ) : null}
      <pre className="output-text custom-scrollbar" aria-label="formatted-output">
        {segments.map((segment, index) => {
          if (!segment.changed || !segment.diagnosticId) {
            return <span key={`segment-${index}`}>{segment.text}</span>
          }

          const diagnostic = map[segment.diagnosticId]
          const selected = selectedDiagnosticId === segment.diagnosticId

          return (
            <mark
              key={`segment-${index}`}
              className={`highlight-mark changed-fragment ${selected ? 'selected' : ''}`}
              aria-label={`${diagnostic.ruleName}: ${diagnostic.ruleDescription}`}
              onMouseEnter={(event) => showTooltip(event.currentTarget, diagnostic)}
              onMouseLeave={hideTooltip}
              onFocus={(event) => showTooltip(event.currentTarget, diagnostic)}
              onBlur={hideTooltip}
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
