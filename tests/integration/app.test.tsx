import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../../src/App'

function mockClipboardWriteText(
  implementation: (text: string) => Promise<void> = () => Promise.resolve(),
) {
  const writeText = vi.fn(implementation)
  Object.defineProperty(window.navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  })
  return writeText
}

describe('App', () => {
  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('supports manual check and full fix interactions', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByLabelText('input-text')
    await user.clear(input)
    await user.type(input, '你好world,这是123')

    await user.click(screen.getByLabelText('实时检查'))
    await user.click(screen.getByRole('button', { name: '立即检查' }))

    expect(screen.getByLabelText('formatted-output')).toHaveTextContent(
      '你好 world，这是 123',
    )

    await user.click(screen.getByRole('button', { name: '一键修复全部' }))
    expect(input).toHaveValue('你好 world，这是 123')
  })

  it('does not render issue detail section', () => {
    render(<App />)

    expect(screen.queryByRole('heading', { name: '问题明细' })).not.toBeInTheDocument()
  })

  it('shows tooltip detail when hovering highlighted fragments', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByLabelText('input-text')
    await user.clear(input)
    await user.type(input, '你好world,测试!')

    const output = screen.getByLabelText('formatted-output')
    const [firstHighlight, secondHighlight] = within(output).getAllByRole('button')

    await user.hover(firstHighlight)
    expect(screen.getByText('中英文/数字间空格')).toBeInTheDocument()
    expect(screen.getByText('中英文与数字混排时建议保留空格。')).toBeInTheDocument()

    await user.hover(secondHighlight)
    expect(screen.getByText('中英文标点规范')).toBeInTheDocument()
    expect(screen.getByText('中文语境建议使用中文全角标点。')).toBeInTheDocument()

    expect(screen.queryByText('悬浮高亮片段可查看问题明细')).not.toBeInTheDocument()
  })

  it('locates source position when clicking a highlighted fragment', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByLabelText('input-text') as HTMLTextAreaElement
    await user.clear(input)
    await user.type(input, '你好world,测试!')

    const output = screen.getByLabelText('formatted-output')
    const highlights = within(output).getAllByRole('button')
    await user.click(highlights[1])

    expect(input.selectionStart).toBe(7)
    expect(input.selectionEnd).toBe(8)
  })

  it('copies formatted text successfully', async () => {
    const user = userEvent.setup()
    const writeText = mockClipboardWriteText()
    render(<App />)

    const input = screen.getByLabelText('input-text')
    await user.clear(input)
    await user.type(input, '你好world,测试!')

    await user.click(screen.getByRole('button', { name: '一键复制' }))

    expect(writeText).toHaveBeenCalledWith('你好 world，测试！')
    expect(screen.getByText('复制成功！')).toBeInTheDocument()
  })

  it('hides copy success tooltip after three seconds', async () => {
    const user = userEvent.setup()
    const writeText = mockClipboardWriteText()
    render(<App />)

    const input = screen.getByLabelText('input-text')
    await user.clear(input)
    await user.type(input, '你好world,测试!')

    await user.click(screen.getByRole('button', { name: '一键复制' }))
    expect(writeText).toHaveBeenCalledWith('你好 world，测试！')
    expect(screen.getByText('复制成功！')).toBeInTheDocument()

    await new Promise((resolve) => setTimeout(resolve, 3100))
    expect(screen.queryByText('复制成功！')).not.toBeInTheDocument()
  }, 10000)

  it('shows copy failure feedback when clipboard write fails', async () => {
    const user = userEvent.setup()
    mockClipboardWriteText(() => Promise.reject(new Error('denied')))
    render(<App />)

    const input = screen.getByLabelText('input-text')
    await user.clear(input)
    await user.type(input, '你好world,测试!')

    const outputBefore = screen.getByLabelText('formatted-output').textContent
    const statsBefore = screen.getByText(/^总问题数：/).textContent

    await user.click(screen.getByRole('button', { name: '一键复制' }))

    expect(screen.getByText('复制失败，请检查剪贴板权限后重试')).toBeInTheDocument()
    expect(screen.getByLabelText('input-text')).toHaveValue('你好world,测试!')
    expect(screen.getByLabelText('formatted-output').textContent).toBe(outputBefore)
    expect(screen.getByText(/^总问题数：/).textContent).toBe(statsBefore)
  })

  it('disables copy action when output is empty', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByLabelText('input-text')
    await user.clear(input)
    await user.type(input, '   ')

    const copyButton = screen.getByRole('button', { name: '一键复制' })
    expect(copyButton).toBeDisabled()

    await user.click(copyButton)
    expect(screen.queryByText('复制成功！')).not.toBeInTheDocument()
  })
})
