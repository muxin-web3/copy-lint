import { expect, test } from '@playwright/test'

test('formats chinese copy and shows issue stats', async ({ page }) => {
  await page.goto('/')

  const input = page.getByLabel('input-text')
  await input.fill('你好world,这是１２３test!')

  await expect(page.getByLabel('formatted-output')).toContainText('你好 world，这是 123test！')
  await expect(page.getByText('总问题数：')).toBeVisible()

  await page.getByRole('button', { name: '一键修复全部' }).click()
  await expect(input).toHaveValue('你好 world，这是 123test！')
})
