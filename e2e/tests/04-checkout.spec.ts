import { test, expect, type Page } from '@playwright/test';
import { loginAsCustomer } from '../helpers/auth';

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

// Clears every item from the logged-in user's DB cart via the backend API
async function clearCart(page: Page): Promise<void> {
  const res = await page.request.get('http://localhost:4000/api/cart');
  const { cart } = await res.json();
  for (const item of cart?.items ?? []) {
    await page.request.delete(`http://localhost:4000/api/cart/items/${item.id}`);
  }
}

test.describe('Checkout', () => {

  // TEST 12: An unauthenticated visitor navigating to /checkout is redirected to login
  test('Guest checkout redirects to login', async ({ page }) => {
    // Add item as guest (no login)
    await page.goto('/products/oversized-cotton-tee');
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'M' }).click();
    await page.getByRole('button', { name: 'Black' }).click();
    await page.getByRole('button', { name: 'Add to Cart' }).click();

    // Navigate to checkout
    await page.goto('/checkout');

    // Auth guard in CheckoutPage redirects guests to login
    await page.waitForURL('/auth/login', { timeout: 10_000 });
    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
  });

  // TEST 13: A logged-in customer sees the address form, payment placeholder, and order summary
  test('Logged-in user can reach checkout', async ({ page }) => {
    await loginAsCustomer(page);
    await clearCart(page);
    await addTestItemToCart(page);

    await page.goto('/checkout');
    await expect(
      page.getByRole('heading', { name: 'Checkout', level: 1 })
    ).toBeVisible({ timeout: 10_000 });

    // Address form
    await expect(page.getByRole('heading', { name: 'Shipping Address' })).toBeVisible();
    await expect(page.getByLabel('Address Line 1')).toBeVisible();

    // Stripe placeholder
    await expect(page.getByText('Payment Element goes here')).toBeVisible();

    // Order summary shows the item we added
    // Scope to main — CartDrawer is always in DOM and also renders the product name
    await expect(page.getByRole('heading', { name: 'Order Summary' })).toBeVisible();
    await expect(page.getByRole('main').getByText('Oversized Cotton Tee').first()).toBeVisible();
  });

  // TEST 14: Submitting with blank address fields triggers inline Zod validation errors
  test('Checkout form validation', async ({ page }) => {
    await loginAsCustomer(page);
    await clearCart(page);
    await addTestItemToCart(page);

    await page.goto('/checkout');
    await expect(
      page.getByRole('heading', { name: 'Checkout', level: 1 })
    ).toBeVisible({ timeout: 10_000 });

    // Submit without filling any fields
    await page.getByRole('button', { name: /Place Order/i }).click();

    // Zod error messages from react-hook-form
    await expect(page.getByText('Address line 1 is required')).toBeVisible();
    await expect(page.getByText('City is required')).toBeVisible();
    await expect(page.getByText('Postcode is required')).toBeVisible();

    // User stays on /checkout
    await expect(page).toHaveURL('/checkout');
  });

});
