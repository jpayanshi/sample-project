import { test, expect } from '@playwright/test';

test.describe('Product Browsing', () => {

  // TEST 5: Homepage renders the brand hero and featured product cards loaded from the backend
  test('Homepage loads with featured products', async ({ page }) => {
    await page.goto('/');

    // Brand headline
    await expect(page.getByRole('heading', { name: 'Why label?', level: 1 })).toBeVisible();

    // Featured Products section appears once the API responds
    await expect(
      page.getByRole('heading', { name: 'Featured Products' })
    ).toBeVisible({ timeout: 10_000 });

    // At least one ProductCard link (contains an h3 product name) is visible
    const productLinks = page
      .getByRole('link')
      .filter({ has: page.getByRole('heading', { level: 3 }) });
    await expect(productLinks.first()).toBeVisible();

    // Each card shows a price
    await expect(productLinks.first().getByText(/\$\d+\.\d{2}/)).toBeVisible();
  });

  // TEST 6: Clicking the T-Shirts category filter updates the URL and shows only T-Shirt products
  test('Product listing with category filter', async ({ page }) => {
    await page.goto('/shop');

    // Initial product count is visible
    await expect(page.getByText(/\d+ products/)).toBeVisible({ timeout: 10_000 });

    // Click T-Shirts sidebar button
    await page.getByRole('button', { name: 'T-Shirts' }).click();

    // URL must contain the category filter
    await expect(page).toHaveURL(/category=t-shirts/);

    // Wait for filtered results
    await page.waitForLoadState('networkidle');

    // At least one T-Shirt product card is visible
    const tshirtCards = page
      .getByRole('link')
      .filter({ has: page.getByText('T-Shirts') });
    await expect(tshirtCards.first()).toBeVisible();

    // No hoodie cards should appear
    const hoodieCards = page
      .getByRole('link')
      .filter({ has: page.getByText('Hoodies') });
    await expect(hoodieCards).toHaveCount(0);
  });

  // TEST 7: A product detail page shows name, price, size selector, color selector, and CTA
  // Uses the Oversized Cotton Tee which has deterministic variants in the seed.
  test('Product detail page', async ({ page }) => {
    await page.goto('/products/oversized-cotton-tee');
    await page.waitForLoadState('networkidle');

    // Product name (h1) and price (use first() — CartDrawer is always in DOM)
    await expect(page.getByRole('heading', { name: 'Oversized Cotton Tee', level: 1 })).toBeVisible();
    await expect(page.getByText('$24.99').first()).toBeVisible();

    // Size selector with known sizes
    await expect(page.getByRole('heading', { name: 'Size', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'M' })).toBeVisible();

    // Color selector with known colors
    await expect(page.getByRole('heading', { name: 'Color' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Black' })).toBeVisible();

    // CTA button is present (no size/color selected yet)
    await expect(
      page.getByRole('button', { name: /add to cart|select size/i })
    ).toBeVisible();
  });

  // TEST 8: Selecting the guaranteed out-of-stock variant (XS / Black) disables the Add to Cart button
  test('Out of stock variant is disabled', async ({ page }) => {
    // The Oversized Cotton Tee seed has XS + Black at stock:0
    await page.goto('/products/oversized-cotton-tee');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: 'XS' }).click();
    await page.getByRole('button', { name: 'Black' }).click();

    const btn = page.getByRole('button', { name: 'Out of stock' });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });

});
