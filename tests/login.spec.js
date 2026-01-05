const { test, expect } = require('@playwright/test');

test.describe('Product Search Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('TC-009: Search for existing product', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.heading-counter')).toBeVisible();
        await expect(page.locator('.product_list')).toBeVisible();

        const productCount = await page.locator('.product-container').count();
        expect(productCount).toBeGreaterThan(0);

        // Verify search results contain search term
        const productNames = await page.locator('.product-name').allTextContents();
        const hasDress = productNames.some(name =>
            name.toLowerCase().includes('dress')
        );
        expect(hasDress).toBeTruthy();
    });

    test('TC-010: Search with no results', async ({ page }) => {
        await page.fill('#search_query_top', 'nonexistentproductxyz123');
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.alert-warning')).toBeVisible();
        await expect(page.locator('.alert-warning')).toContainText('No results were found for your search');
    });

    test('TC-011: Search with empty query', async ({ page }) => {
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.alert-warning')).toBeVisible();
        await expect(page.locator('.alert-warning')).toContainText('Please enter a search keyword');
    });

    test('TC-012: Case-insensitive search', async ({ page }) => {
        await page.fill('#search_query_top', 'DRESS');
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.heading-counter')).toBeVisible();
        const productCount = await page.locator('.product-container').count();
        expect(productCount).toBeGreaterThan(0);
    });

    test('TC-013: Search with special characters', async ({ page }) => {
        await page.fill('#search_query_top', '@#$%^&');
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.alert-warning')).toBeVisible();
    });

    test('TC-014: Partial word search', async ({ page }) => {
        await page.fill('#search_query_top', 'dres');
        await page.click('button[name="submit_search"]');

        // Check if any results appear (might be partial match)
        const hasResults = await page.locator('.product-container').count();
        if (hasResults > 0) {
            await expect(page.locator('.heading-counter')).toBeVisible();
        } else {
            await expect(page.locator('.alert-warning')).toBeVisible();
        }
    });
});