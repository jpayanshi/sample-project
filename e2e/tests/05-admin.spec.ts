import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/auth';

test.describe('Admin — Order Management', () => {

  // TEST 15: Admin can view the orders table and change an order's status
  test('Admin can view and update an order status to SHIPPED', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/admin/orders');
    await expect(page.getByRole('heading', { name: 'Orders', level: 1 })).toBeVisible();
    await page.waitForLoadState('networkidle');

    // Orders table must have at least one data row (rows that contain a status dropdown)
    await expect(page.getByRole('table')).toBeVisible();
    const orderRows = page
      .getByRole('row')
      .filter({ has: page.getByRole('combobox') });
    await expect(orderRows.first()).toBeVisible();

    // Read the first order's current status badge (6th cell, 0-indexed = 5)
    const firstRow   = orderRows.first();
    const statusCell = firstRow.getByRole('cell').nth(5);
    const initial    = ((await statusCell.textContent()) ?? '').trim();

    // Pick a target that differs from the current status so onChange fires
    const target = initial === 'SHIPPED' ? 'DELIVERED' : 'SHIPPED';

    // Change via the dropdown and wait for the PUT mutation
    await Promise.all([
      firstRow.getByRole('combobox').selectOption(target),
      page.waitForResponse(
        r => r.url().includes('/api/admin/orders') && r.request().method() === 'PUT'
      ),
    ]);

    // After the query re-fetches, the status badge should reflect the new value
    await expect(statusCell).toContainText(target, { timeout: 5_000 });
  });

});
