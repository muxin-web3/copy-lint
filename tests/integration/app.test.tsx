import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import App from '../../src/App'

describe('App', () => {
  afterEach(() => {
    cleanup()
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

  it('locates source position when clicking an issue', async () => {
    const user = userEvent.setup()
    render(<App />)

    const input = screen.getByLabelText('input-text') as HTMLTextAreaElement
    await user.clear(input)
    await user.type(input, '你好world,测试!')

    const issuesPanel = screen.getByRole('heading', { name: '问题明细' }).closest('section')
    const issueButton = within(issuesPanel as HTMLElement).getByRole('button', {
      name: /中英文\/数字间空格/,
    })
    await user.click(issueButton)

    expect(input.selectionStart).toBe(2)
    expect(input.selectionEnd).toBe(2)
  })
})
