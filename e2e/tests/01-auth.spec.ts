import { test, expect } from '@playwright/test';
import { loginAsCustomer } from '../helpers/auth';

// Timestamped email so re-running tests without a re-seed still works
const REGISTER_EMAIL = `newuser+${Date.now()}@test.com`;

test.describe('Authentication', () => {

  // TEST 1: A brand-new visitor can register and land on the account page
  test('User registration', async ({ page }) => {
    await page.goto('/auth/register');

    await page.getByLabel('Full Name').fill('New Test User');
    await page.getByLabel('Email').fill(REGISTER_EMAIL);
    await page.getByLabel('Password').fill('Test1234!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await page.waitForURL('/account', { timeout: 10_000 });
    await expect(page.getByRole('link', { name: 'New Test User' })).toBeVisible();
  });

  // TEST 2: A registered customer can sign in with correct credentials
  test('User login with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel('Email').fill(process.env.CUSTOMER_EMAIL!);
    await page.getByLabel('Password').fill(process.env.CUSTOMER_PASSWORD!);
    await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click();

    await page.waitForURL('/account', { timeout: 10_000 });
    // Navbar shows the customer's seeded name
    await expect(page.getByRole('link', { name: 'James Thornton' })).toBeVisible();
  });

  // TEST 3: Wrong credentials surface an error and keep the user on /auth/login
  test('User login with invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByLabel('Email').fill('wrong@email.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click();

    // Backend returns "Invalid email or password"
    await expect(page.getByText('Invalid email or password')).toBeVisible();
    await expect(page).toHaveURL('/auth/login');
  });

  // TEST 4: A logged-in user can sign out; protected routes then require re-login
  test('Logout', async ({ page }) => {
    await loginAsCustomer(page);

    // Sign out button is on the account page
    await page.getByRole('button', { name: 'Sign out' }).click();
    // queryClient.clear() triggers the account auth guard before the mutation's router.push('/'),
    // so the final URL can be either '/' or '/auth/login' — accept both.
    await page.waitForURL(/\/(auth\/login)?$/, { timeout: 10_000 });

    // /account is protected — after a full page load the fresh me-query returns 401 → must redirect to login
    await page.goto('/account');
    await page.waitForURL('/auth/login', { timeout: 10_000 });
  });

});
