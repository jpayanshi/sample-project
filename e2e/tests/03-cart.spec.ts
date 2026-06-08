import { test, expect, type Page } from '@playwright/test';

// Adds the guaranteed in-stock variant (M / Black, stock:15) of the Oversized Cotton Tee to the cart
// and waits for the cart drawer to open.
async function addTestItemToCart(page: Page): Promise<void> {
  await page.goto('/products/oversized-cotton-tee');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: 'M' }).click();
  await page.getByRole('button', { name: 'Black' }).click();
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  // Wait until the drawer footer appears — it only renders when items.length > 0
  await expect(
    page.getByRole('link', { name: 'View full cart' })
  ).toBeVisible({ timeout: 10_000 });
}

test.describe('Shopping Cart', () => {

  // TEST 9: Adding a product opens the cart drawer, shows the item name, and increments the badge
  test('Add item to cart', async ({ page }) => {
    await addTestItemToCart(page);

    // Drawer heading confirms 1 item
    await expect(page.getByRole('heading', { name: 'Your Cart (1)' })).toBeVisible();
    // Item name is visible inside the drawer
    await expect(page.getByText('Oversized Cotton Tee').first()).toBeVisible();
    // Nav cart badge shows 1
    await expect(
      page.getByRole('button', { name: 'Open cart' }).getByText('1')
    ).toBeVisible();
  });

  // TEST 10: Incrementing quantity from 1 to 2 doubles the displayed line total
  test('Update cart quantity', async ({ page }) => {
    await addTestItemToCart(page);

    // Use "View full cart" link in drawer — navigates to /cart and closes the drawer
    await page.getByRole('link', { name: 'View full cart' }).click();
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();

    // Initial price for 1 × Oversized Cotton Tee
    // Scope to main — the CartDrawer is always in DOM and also shows prices
    await expect(page.getByRole('main').getByText('$24.99').first()).toBeVisible();

    // Increment quantity
    await Promise.all([
      page.getByRole('main').getByRole('button', { name: '+' }).click(),
      page.waitForResponse(
        r => r.url().includes('/api/cart/items') && r.request().method() === 'PUT'
      ),
    ]);

    // Line total should now be 2 × $24.99 = $49.98
    await expect(page.getByRole('main').getByText('$49.98').first()).toBeVisible();
  });

  // TEST 11: Removing the only cart item shows the empty-cart state
  test('Remove item from cart', async ({ page }) => {
    await addTestItemToCart(page);

    await page.getByRole('link', { name: 'View full cart' }).click();
    await expect(page.getByRole('heading', { name: 'Shopping Cart' })).toBeVisible();

    // Scope Remove to main — CartDrawer's off-screen Remove button is also in the DOM
    await Promise.all([
      page.getByRole('main').getByRole('button', { name: 'Remove' }).click(),
      page.waitForResponse(
        r => r.url().includes('/api/cart/items') && r.request().method() === 'DELETE'
      ),
    ]);

    await expect(page.getByRole('main').getByText('Your cart is empty.')).toBeVisible();
  });

});
