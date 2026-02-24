import { useMemo, useRef, useState } from 'react'
import { lintCopy } from './engine/lint'
import type { Diagnostic } from './engine/types'
import { HighlightedOutput } from './components/HighlightedOutput'
import './App.css'

const SAMPLE = `这是test文案,包含１２３数字和English标点!\n访问 https://example.com/test?x=1,y=2 或 mail me: user@example.com\n代码块:\n\`\`\`js\nconst x=1,y=2\n\`\`\``

function applySingleFix(source: string, issue: Diagnostic): string {
  return `${source.slice(0, issue.sourceStart)}${issue.replacement}${source.slice(issue.sourceEnd)}`
}

function App() {
  const [inputText, setInputText] = useState(SAMPLE)
  const [autoCheck, setAutoCheck] = useState(true)
  const [manualText, setManualText] = useState(SAMPLE)
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const runText = autoCheck ? inputText : manualText
  const result = useMemo(() => lintCopy(runText), [runText])

  const activeIssueId = result.diagnostics.some((item) => item.id === selectedIssueId)
    ? selectedIssueId
    : null

  const selectedIssue = result.diagnostics.find(
    (diagnostic) => diagnostic.id === activeIssueId,
  )

  const isWhitespaceOnly = runText.trim().length === 0
  const noIssues = result.stats.totalIssues === 0 && !isWhitespaceOnly

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
            onChange={(event) => setInputText(event.target.value)}
            placeholder="请输入待检查的中文文案"
          />
        </article>

        <article className="panel">
          <h2>格式化输出</h2>
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

      <section className="issues">
        <h2>问题明细</h2>
        {result.diagnostics.length === 0 ? (
          <p className="placeholder">当前没有可修复的问题</p>
        ) : (
          <ul>
            {result.diagnostics.map((diagnostic) => (
              <li
                key={diagnostic.id}
                className={activeIssueId === diagnostic.id ? 'selected-issue' : ''}
              >
                <button
                  type="button"
                  className="issue-label"
                  onClick={() => locateIssue(diagnostic)}
                  title={diagnostic.ruleDescription}
                >
                  {diagnostic.ruleName}：
                  <code>{diagnostic.original}</code> → <code>{diagnostic.replacement}</code>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const nextText = applySingleFix(runText, diagnostic)
                    setInputText(nextText)
                    setManualText(nextText)
                    setSelectedIssueId(null)
                  }}
                >
                  点击修复
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedIssue ? (
          <p className="rule-detail">
            已定位：{selectedIssue.ruleName} - {selectedIssue.ruleDescription}
          </p>
        ) : null}
      </section>
    </main>
  )
}

export default App
