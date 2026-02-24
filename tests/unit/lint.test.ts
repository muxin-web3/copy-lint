import { describe, expect, it } from 'vitest'
import { lintCopy } from '../../src/engine/lint'

describe('lintCopy', () => {
  it('formats spacing, punctuation, and fullwidth forms', () => {
    const result = lintCopy('你好world,这是１２３test!')
    expect(result.formattedText).toBe('你好 world，这是 123test！')
    expect(result.stats.totalIssues).toBeGreaterThan(0)
    expect(result.stats.byRule['spacing-between-cjk-and-ascii']).toBeGreaterThan(0)
    expect(result.stats.byRule['chinese-punctuation']).toBeGreaterThan(0)
    expect(result.stats.byRule['fullwidth-to-halfwidth']).toBeGreaterThan(0)
  })

  it('keeps url, email and markdown code snippets untouched', () => {
    const text = [
      '访问https://example.com/a,b 或 mail me: foo_bar@example.com',
      '```js',
      'const n=１２３, value="中文,english"',
      '```',
      '`inline,code`',
    ].join('\n')

    const result = lintCopy(text)
    expect(result.formattedText).toContain('https://example.com/a,b')
    expect(result.formattedText).toContain('foo_bar@example.com')
    expect(result.formattedText).toContain('const n=１２３, value="中文,english"')
    expect(result.formattedText).toContain('`inline,code`')
  })

  it('handles empty and whitespace-only input', () => {
    expect(lintCopy('').formattedText).toBe('')
    expect(lintCopy('   \n\n').formattedText).toBe('')
    expect(lintCopy('   \n\n').stats.totalIssues).toBe(0)
  })

  it('normalizes punctuation in chinese context with embedded english', () => {
    const result = lintCopy('这是 OpenAI!')
    expect(result.formattedText).toBe('这是 OpenAI！')
  })

  it('preserves multi-line structure', () => {
    const result = lintCopy('第一行test\n第二行,hello\n第三行１２３')
    expect(result.formattedText.split('\n')).toHaveLength(3)
  })
})
