import { test, expect } from '@playwright/test';

test.describe('Planificador', () => {
  test('should redirect unauthenticated user to sign in', async ({ page }) => {
    await page.goto('/planificador');
    await expect(page).toHaveURL(/api\/auth\/signin/);
  });
});