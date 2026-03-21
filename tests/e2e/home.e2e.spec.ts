import { test, expect, type Page } from '@playwright/test'
import { testPlayer } from '../helpers/credentials'

// React Native Web renders Pressable as <div aria-disabled> not <button>.
// Use getByText for the Sign in element; tabs render as <a role="tab">.

async function signIn(page: Page) {
  await page.goto('/')
  await page.getByPlaceholder('player@example.com').fill(testPlayer.email)
  await page.getByPlaceholder('••••••••').fill(testPlayer.password)
  await page.getByText('Sign in').click()
  await expect(page.getByText(/welcome back/i)).toBeVisible({ timeout: 10_000 })
}

test.describe('Auth › unauthenticated', () => {
  test('login form renders with email, password fields and sign in element', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByPlaceholder('player@example.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByText('Sign in')).toBeVisible()
  })

  test('sign in element is aria-disabled when fields are empty', async ({ page }) => {
    await page.goto('/')

    // Outer Pressable div gets aria-disabled="true" when disabled prop is set
    const signInContainer = page.locator('[aria-disabled="true"]').filter({ hasText: 'Sign in' })
    await expect(signInContainer).toBeVisible()
  })
})

test.describe('Auth › login flow', () => {
  test('can sign in and see welcome message', async ({ page }) => {
    await signIn(page)
    await expect(page.getByText(/welcome back/i)).toBeVisible()
  })

  test('after sign in, tabs are visible: Play, World, Lore, Messages', async ({ page }) => {
    await signIn(page)

    await expect(page.getByRole('tab', { name: /play/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /world/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /lore/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /messages/i })).toBeVisible()
  })
})

test.describe('Home › authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page)
  })

  test('stats section is visible with health and energy', async ({ page }) => {
    await expect(page.getByText('Health', { exact: true })).toBeVisible()
    await expect(page.getByText('Energy', { exact: true })).toBeVisible()
  })

  test('missions section shows live missions from API', async ({ page }) => {
    // Live missions from GET /api/missions — "Missions" heading always present
    await expect(page.getByText('Missions', { exact: true })).toBeVisible()
    // "Loading missions…" shows until API responds; wait for it to be replaced
    await expect(page.getByText('Loading missions…')).not.toBeVisible({ timeout: 12_000 })
    // At least one mission card should now be visible (seeded: "Beg for Credits", etc.)
    await expect(page.getByText(/beg for credits|escort run|patrol the wastes|salvage run/i).first()).toBeVisible()
  })

  test('can navigate to World tab', async ({ page }) => {
    await page.getByRole('tab', { name: /world/i }).click()
    await expect(page).toHaveURL(/explore/)
  })

  test('can navigate to Lore tab', async ({ page }) => {
    await page.getByRole('tab', { name: /lore/i }).click()
    await expect(page).toHaveURL(/lore/)
  })

  test('can navigate to Messages tab', async ({ page }) => {
    await page.getByRole('tab', { name: /messages/i }).click()
    await expect(page).toHaveURL(/messages/)
    await expect(page.getByText('Messages', { exact: true }).first()).toBeVisible()
  })
})
