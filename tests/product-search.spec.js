const { test, expect } = require('@playwright/test');

test.describe('Product Search Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('TC-009: Search for existing product', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');

        // Verification
        await expect(page.locator('.product-count')).toBeVisible();
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
        await page.fill('#search_query_top', 'nonexistentproductxyz');
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.alert-warning')).toBeVisible();
        await expect(page.locator('.alert-warning')).toContainText('No results were found');
    });

    test('TC-011: Search with empty query', async ({ page }) => {
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.alert-warning')).toBeVisible();
        await expect(page.locator('.alert-warning')).toContainText('Please enter a search keyword');
    });

    test('TC-012: Advanced search with filters', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');

        // Apply category filter
        await page.click('text=Casual Dresses');
        await expect(page.locator('.cat-name')).toContainText('Casual Dresses');

        // Apply size filter
        await page.check('input[name="layered_id_attribute_group_1"]');
        await expect(page.locator('.product-container').first()).toBeVisible();
    });

    test('TC-013: Search with special characters', async ({ page }) => {
        await page.fill('#search_query_top', '@#$%^&');
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.alert-warning')).toBeVisible();
        await expect(page.locator('.alert-warning')).toContainText('No results were found');
    });

    test('TC-014: Case-insensitive search', async ({ page }) => {
        await page.fill('#search_query_top', 'DRESS');
        await page.click('button[name="submit_search"]');

        await expect(page.locator('.product-count')).toBeVisible();
        const productCount = await page.locator('.product-container').count();
        expect(productCount).toBeGreaterThan(0);
    });
});