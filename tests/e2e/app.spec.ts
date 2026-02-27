import { expect, test } from '@playwright/test'

test('formats copy, removes issue section and supports copy button state', async ({ page }) => {
  await page.goto('/')

  const input = page.getByLabel('input-text')
  await input.fill('你好world,这是１２３test!')

  await expect(page.getByLabel('formatted-output')).toContainText('你好 world，这是 123test！')
  await expect(page.getByText('总问题数：')).toBeVisible()
  await expect(page.getByRole('heading', { name: '问题明细' })).toHaveCount(0)

  const firstHighlight = page.getByLabel('formatted-output').getByRole('button').first()
  await firstHighlight.hover()
  await expect(page.getByText('中英文/数字间空格')).toBeVisible()
  await expect(page.getByText('中英文与数字混排时建议保留空格。')).toBeVisible()

  await page.getByRole('button', { name: '一键修复全部' }).click()
  await expect(input).toHaveValue('你好 world，这是 123test！')

  await input.fill('   ')
  await expect(page.getByRole('button', { name: '一键复制' })).toBeDisabled()
})
