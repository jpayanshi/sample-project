import type { Page } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CUSTOMER_EMAIL  = process.env.CUSTOMER_EMAIL  ?? 'customer1@test.com';
const CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD ?? 'password123';
const ADMIN_EMAIL     = process.env.ADMIN_EMAIL     ?? 'admin@store.com';
const ADMIN_PASSWORD  = process.env.ADMIN_PASSWORD  ?? 'admin123';

/** Logs in as the seeded customer (James Thornton) and lands on /account. */
export async function loginAsCustomer(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(CUSTOMER_EMAIL);
  await page.getByLabel('Password').fill(CUSTOMER_PASSWORD);
  await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/account', { timeout: 10_000 });
}

/** Logs in as the seeded admin (Admin User) and lands on /account. */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/auth/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('main').getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('/account', { timeout: 10_000 });
}
