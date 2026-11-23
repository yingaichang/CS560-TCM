import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { expect, test } from '@playwright/test'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
let syntheticStaffUserId: string | null = null

test.afterAll(async () => {
  await prisma.$disconnect()
})

test.afterEach(async () => {
  if (!syntheticStaffUserId) return
  await prisma.auditLog.deleteMany({ where: { userId: syntheticStaffUserId } })
  await prisma.user.deleteMany({ where: { id: syntheticStaffUserId } })
  syntheticStaffUserId = null
})

test('public routes, Clerk account lifecycle, and protected admin access', async ({ page }, testInfo) => {
  test.setTimeout(120_000)
  await setupClerkTestingToken({ page })

  for (const route of ['/', '/appointments', '/patient-center', '/courses-events', '/kiosk']) {
    await page.goto(route, { waitUntil: 'domcontentloaded' })
    await expect(page.locator('a[href="/admin/development/architecture-status"]')).toHaveCount(0)
  }

  await page.goto('/admin', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/sign-in\?redirect_url=/)
  await page.goto('/admin/audit-logs', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/sign-in\?redirect_url=/)
  await page.goto('/admin/development/architecture-status', { waitUntil: 'domcontentloaded' })
  await expect(page).toHaveURL(/\/sign-in\?redirect_url=/)

  const email = `yingai+clerk_test_${Date.now()}@example.com`
  const password = 'SyntheticClinic!2026'
  const syntheticStaff = await prisma.user.create({
    data: { email, name: 'Synthetic Audit Tester', role: 'clinic_staff', canViewAuditLogs: true },
  })
  syntheticStaffUserId = syntheticStaff.id

  await page.goto('/sign-up', { waitUntil: 'domcontentloaded' })
  const firstName = page.locator('input[name="firstName"]')
  if (await firstName.isVisible()) await firstName.fill('Synthetic')
  const lastName = page.locator('input[name="lastName"]')
  if (await lastName.isVisible()) await lastName.fill('Test')
  await page.locator('input[name="emailAddress"]').fill(email)
  await page.locator('input[name="password"]').fill(password)

  const legalAcceptance = page.locator('input[name="legalAccepted"]')
  if (await legalAcceptance.isVisible()) await legalAcceptance.check()

  await page.getByRole('button', { name: /^(Continue|繼續)$/ }).click()
  await page.waitForResponse((response) => response.url().includes('prepare_verification') && response.status() === 200)
  await page.getByRole('textbox', { name: /Enter verification code|驗證碼/ }).pressSequentially('424242')
  await page.waitForURL('/', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: '登出' })).toBeVisible()

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: '登出' })).toBeVisible()

  await page.getByRole('button', { name: '登出' }).click()
  await expect(page.getByRole('button', { name: '登出' })).toHaveCount(0)
  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('link', { name: '登入' })).toBeVisible()

  await page.goto('/sign-in', { waitUntil: 'domcontentloaded' })
  await page.locator('input[name="identifier"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.getByRole('button', { name: /^(Continue|繼續)$/ }).click()
  await expect(page.getByRole('button', { name: '登出' })).toBeVisible()

  // Signed-in non-admin roles must be denied even when using the direct URL.
  for (const role of ['user', 'patient', 'student', 'customer', 'clinic_staff', 'provider', 'billing_staff']) {
    await prisma.user.update({ where: { email }, data: { role } })
    const response = await page.request.get('/admin/development/architecture-status')
    expect(response.status(), `${role} must not access development status`).toBe(404)
    expect(await response.text()).not.toContain('系統架構狀態總覽')
  }
  await prisma.user.update({ where: { email }, data: { role: 'clinic_staff' } })
  await page.goto('/admin', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: '開發工具', exact: true })).toHaveCount(0)

  await prisma.user.update({ where: { email }, data: { canViewAuditLogs: false } })
  const deniedAuditRequest = await page.request.get('/api/admin/audit-logs')
  expect(deniedAuditRequest.status()).toBe(403)

  await prisma.user.update({ where: { email }, data: { role: 'admin' } })
  await page.goto('/admin/development/architecture-status', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: '系統架構狀態總覽', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '開發工具', exact: true })).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByRole('link', { name: '系統架構狀態', exact: true })).toHaveAttribute('aria-current', 'page')
  await page.screenshot({ path: testInfo.outputPath('architecture-status.png'), fullPage: true })
  await page.getByRole('link', { name: '重新整理快照', exact: true }).click()
  await expect(page.getByRole('heading', { name: '設定狀態快照', exact: true })).toBeVisible()
  const adminAuditRequest = await page.request.get('/api/admin/audit-logs')
  expect(adminAuditRequest.status()).toBe(200)

  await prisma.user.update({ where: { email }, data: { role: 'clinic_staff', canViewAuditLogs: true } })
  const allowedAuditRequest = await page.request.get('/api/admin/audit-logs')
  expect(allowedAuditRequest.status()).toBe(200)
  const dateFilteredAuditRequest = await page.request.get('/api/admin/audit-logs?from=2026-01-01&to=2026-12-31')
  expect(dateFilteredAuditRequest.status()).toBe(200)
  await page.goto('/admin/audit-logs', { waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('heading', { name: '稽核紀錄' })).toBeVisible()

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByRole('button', { name: '登出' })).toBeVisible()
  await page.getByRole('button', { name: '登出' }).click()
  await expect(page.getByRole('button', { name: '登出' })).toHaveCount(0)
  await expect(page.getByRole('link', { name: '登入' })).toBeVisible()
})
