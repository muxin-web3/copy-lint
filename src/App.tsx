import { useMemo, useRef, useState } from 'react'
import { lintCopy } from './engine/lint'
import type { Diagnostic } from './engine/types'
import { HighlightedOutput } from './components/HighlightedOutput'
import './App.css'

const SAMPLE = `这是test文案,包含１２３数字和English标点!\n访问 https://example.com/test?x=1,y=2 或 mail me: user@example.com\n代码块:\n\`\`\`js\nconst x=1,y=2\n\`\`\``

type CopyState =
  | { kind: 'idle'; message: '' }
  | { kind: 'success'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'unavailable'; message: string }

const COPY_UNAVAILABLE_MESSAGE = '当前输出为空，暂无可复制内容'

function App() {
  const [inputText, setInputText] = useState(SAMPLE)
  const [autoCheck, setAutoCheck] = useState(true)
  const [manualText, setManualText] = useState(SAMPLE)
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<CopyState>({ kind: 'idle', message: '' })
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const runText = autoCheck ? inputText : manualText
  const result = useMemo(() => lintCopy(runText), [runText])

  const activeIssueId = result.diagnostics.some((item) => item.id === selectedIssueId)
    ? selectedIssueId
    : null

  const isWhitespaceOnly = runText.trim().length === 0
  const noIssues = result.stats.totalIssues === 0 && !isWhitespaceOnly
  const canCopyFormattedText = result.formattedText.length > 0

  function locateIssue(issue: Diagnostic) {
    setSelectedIssueId(issue.id)
    const input = inputRef.current
    if (!input) {
      return
    }

    const start = Math.min(issue.sourceStart, input.value.length)
    const end = Math.min(Math.max(issue.sourceEnd, start), input.value.length)
    input.focus()
    input.setSelectionRange(start, end)
    input.scrollIntoView?.({ block: 'center', behavior: 'smooth' })
  }

  async function handleCopyFormattedText() {
    if (!canCopyFormattedText) {
      setCopyState({ kind: 'unavailable', message: COPY_UNAVAILABLE_MESSAGE })
      return
    }

    if (!navigator.clipboard?.writeText) {
      setCopyState({ kind: 'error', message: '浏览器不支持复制，请手动复制输出内容' })
      return
    }

    try {
      await navigator.clipboard.writeText(result.formattedText)
      setCopyState({ kind: 'success', message: '已复制格式化输出' })
    } catch {
      setCopyState({ kind: 'error', message: '复制失败，请检查剪贴板权限后重试' })
    }
  }

  return (
    <main className="page">
      <header className="header">
        <h1>中文文案排版检查工具</h1>
        <p>
          基于《中文文案排版指北》，支持实时检查、单条修复、全量修复和规则追溯。
        </p>
      </header>

      <section className="toolbar">
        <label className="switch">
          <input
            type="checkbox"
            checked={autoCheck}
            onChange={(event) => setAutoCheck(event.target.checked)}
          />
          实时检查
        </label>
        <button type="button" onClick={() => setManualText(inputText)}>
          立即检查
        </button>
        <button
          type="button"
          onClick={() => {
            setInputText(result.formattedText)
            setManualText(result.formattedText)
          }}
          disabled={result.diagnostics.length === 0}
        >
          一键修复全部
        </button>
      </section>

      <section className="stats" aria-live="polite">
        <strong>总问题数：{result.stats.totalIssues}</strong>
        <span>空格规则：{result.stats.byRule['spacing-between-cjk-and-ascii']}</span>
        <span>标点规则：{result.stats.byRule['chinese-punctuation']}</span>
        <span>全/半角规则：{result.stats.byRule['fullwidth-to-halfwidth']}</span>
      </section>

      <section className="columns">
        <article className="panel">
          <h2>输入文案</h2>
          <textarea
            aria-label="input-text"
            ref={inputRef}
            value={inputText}
            onChange={(event) => {
              setInputText(event.target.value)
              setCopyState({ kind: 'idle', message: '' })
            }}
            placeholder="请输入待检查的中文文案"
          />
        </article>

        <article className="panel">
          <div className="panel-header">
            <h2>格式化输出</h2>
            <button type="button" onClick={handleCopyFormattedText} disabled={!canCopyFormattedText}>
              一键复制
            </button>
          </div>
          {copyState.message ? (
            <p className={`copy-feedback ${copyState.kind}`} role="status" aria-live="polite">
              {copyState.message}
            </p>
          ) : null}
          {isWhitespaceOnly ? (
            <p className="placeholder">输入为空或仅空白字符</p>
          ) : noIssues ? (
            <p className="ok-state">无排版问题</p>
          ) : null}
          <HighlightedOutput
            segments={result.segments}
            diagnostics={result.diagnostics}
            selectedDiagnosticId={activeIssueId}
            onSelectDiagnostic={locateIssue}
          />
        </article>
      </section>
    </main>
  )
}

export default App
