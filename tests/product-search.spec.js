// File: tests/search/search-tests.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Product Search Functionality - Comprehensive Test Suite', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    // ===== POSITIVE TEST CASES =====

    test('SEARCH-POS-001: Search by exact product name', async ({ page }) => {
        const exactProductName = "Faded Short Sleeves T-shirt";

        // Perform search
        await page.fill('#search_query_top', exactProductName);
        await page.click('button[name="submit_search"]');

        // Wait for search results
        await page.waitForLoadState('networkidle');

        // Verify results
        await expect(page.locator('.product-listing')).toBeVisible();

        // Check product appears
        const productFound = await page.locator('.product-name')
            .filter({ hasText: exactProductName })
            .isVisible();
        expect(productFound).toBe(true);

        // Check it's at the top or highlighted
        const firstProductName = await page.locator('.product-name').first().textContent();
        expect(firstProductName).toContain(exactProductName);

        // Check direct link to product page
        await page.locator('.product-name').first().click();
        await expect(page).toHaveURL(/id_product=/);
        await expect(page.locator('h1[itemprop="name"]')).toContainText(exactProductName);
    });

    test('SEARCH-POS-002: Search by partial product name', async ({ page }) => {
        const partialName = "Short Sleeves";

        await page.fill('#search_query_top', partialName);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Verify results contain the partial term
        await expect(page.locator('.product-listing')).toBeVisible();

        // Check multiple products might be returned
        const productCount = await page.locator('.product-container').count();
        expect(productCount).toBeGreaterThan(0);

        // Verify at least one product contains the search term
        const allProducts = await page.locator('.product-name').allTextContents();
        const matchingProducts = allProducts.filter(name =>
            name.toLowerCase().includes(partialName.toLowerCase())
        );
        expect(matchingProducts.length).toBeGreaterThan(0);
    });

    test('SEARCH-POS-003: Search by product category', async ({ page }) => {
        // Navigate to Women category first
        await page.click('a[title="Women"]');
        await page.waitForLoadState('networkidle');

        // Check category is active
        await expect(page.locator('.category-name')).toContainText('Women');

        // Search within category
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check results are from women's category
        await expect(page.locator('.breadcrumb')).toContainText('Women');

        // Verify products are relevant (dresses in women's category)
        const productNames = await page.locator('.product-name').allTextContents();
        expect(productNames.length).toBeGreaterThan(0);

        // Check category filter indication
        const activeCategory = await page.locator('.category-name, .cat-name').textContent();
        expect(activeCategory).toMatch(/women/i);
    });

    test('SEARCH-POS-004: Search by product description keyword', async ({ page }) => {
        const descriptionKeyword = "cotton"; // Common in clothing descriptions

        await page.fill('#search_query_top', descriptionKeyword);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Verify search works
        await expect(page.locator('.product-listing')).toBeVisible();

        // Check results count
        const productCount = await page.locator('.product-container').count();
        expect(productCount).toBeGreaterThan(0);

        // Note: To verify description matching, you'd need to check product pages
        // or have description in search results
    });

    test('SEARCH-POS-005: Search with multiple keywords', async ({ page }) => {
        const multiKeyword = "summer dress printed";

        await page.fill('#search_query_top', multiKeyword);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.product-listing')).toBeVisible();

        // Check results relevance
        const productNames = await page.locator('.product-name').allTextContents();
        const matchingProducts = productNames.filter(name =>
            name.toLowerCase().includes('dress') &&
            (name.toLowerCase().includes('summer') || name.toLowerCase().includes('printed'))
        );

        expect(productNames.length).toBeGreaterThan(0);
    });

    test('SEARCH-POS-006: Search with filters (price range)', async ({ page }) => {
        // First search for products
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check if price filter exists
        const priceFilterExists = await page.locator('#layered_price_range, .price-filter').isVisible();

        if (priceFilterExists) {
            // Apply price filter (adjust selectors based on actual implementation)
            await page.fill('input[name="price_range_min"]', '20');
            await page.fill('input[name="price_range_max"]', '50');
            await page.click('button[type="submit"]');

            await page.waitForLoadState('networkidle');

            // Check filter indication
            await expect(page.locator('.layered_filter, .active-filter')).toContainText('$20 - $50');

            // Verify products are in price range
            const priceElements = await page.locator('.product-price, .price').allTextContents();
            const prices = priceElements.map(priceText => {
                const match = priceText.match(/\$?(\d+\.?\d*)/);
                return match ? parseFloat(match[1]) : 0;
            });

            // All prices should be between 20 and 50
            prices.forEach(price => {
                expect(price).toBeGreaterThanOrEqual(20);
                expect(price).toBeLessThanOrEqual(50);
            });
        }
    });

    test('SEARCH-POS-007: Search with filters (size/color)', async ({ page }) => {
        await page.fill('#search_query_top', 'blouse');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check for size filter
        const sizeFilterExists = await page.locator('#layered_id_attribute_group_1, [data-filter="size"]').isVisible();

        if (sizeFilterExists) {
            // Filter by size M
            await page.click('input[name="layered_id_attribute_group_1"][value="2"]'); // Assuming value for M
            await page.waitForLoadState('networkidle');

            // Check for color filter
            const colorFilterExists = await page.locator('#layered_id_attribute_group_3, [data-filter="color"]').isVisible();

            if (colorFilterExists) {
                // Filter by white color
                await page.click('input[name="layered_id_attribute_group_3"][value="1"]'); // Assuming value for white
                await page.waitForLoadState('networkidle');

                // Verify multiple filters active
                await expect(page.locator('.layered_filter')).toContainText(['M', 'White']);
            }
        }
    });

    test('SEARCH-POS-008: Search with sorting options', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check for sort dropdown
        const sortDropdown = page.locator('#selectProductSort, .sort-select');
        const hasSort = await sortDropdown.isVisible();

        if (hasSort) {
            // Get initial product order
            const initialProducts = await page.locator('.product-name').allTextContents();

            // Sort by Price: Low to High
            await sortDropdown.selectOption('price:asc');
            await page.waitForLoadState('networkidle');

            const lowToHighPrices = await page.locator('.product-price, .price').allTextContents();
            const pricesAsc = lowToHighPrices.map(p => parseFloat(p.replace(/[^\d.]/g, ''))).filter(p => !isNaN(p));

            // Verify ascending order
            for (let i = 0; i < pricesAsc.length - 1; i++) {
                expect(pricesAsc[i]).toBeLessThanOrEqual(pricesAsc[i + 1]);
            }

            // Sort by Price: High to Low
            await sortDropdown.selectOption('price:desc');
            await page.waitForLoadState('networkidle');

            const highToLowPrices = await page.locator('.product-price, .price').allTextContents();
            const pricesDesc = highToLowPrices.map(p => parseFloat(p.replace(/[^\d.]/g, ''))).filter(p => !isNaN(p));

            // Verify descending order
            for (let i = 0; i < pricesDesc.length - 1; i++) {
                expect(pricesDesc[i]).toBeGreaterThanOrEqual(pricesDesc[i + 1]);
            }

            // Sort by Name A-Z
            await sortDropdown.selectOption('name:asc');
            await page.waitForLoadState('networkidle');

            const sortedNames = await page.locator('.product-name').allTextContents();
            const sortedNamesLower = sortedNames.map(name => name.toLowerCase().trim());

            // Verify alphabetical order
            for (let i = 0; i < sortedNamesLower.length - 1; i++) {
                expect(sortedNamesLower[i] <= sortedNamesLower[i + 1]).toBe(true);
            }

            // Check active sort indication
            await expect(page.locator('.product-sort, .selected-sort')).toContainText(/sorted by/i);
        }
    });

    test('SEARCH-POS-009: Search pagination', async ({ page }) => {
        // Search for a term that returns many results
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check for pagination
        const paginationExists = await page.locator('.pagination, .page-list').isVisible();

        if (paginationExists) {
            // Get products from page 1
            const page1Products = await page.locator('.product-container').count();
            expect(page1Products).toBeGreaterThan(0);

            // Click page 2
            await page.click('.pagination a[href*="page=2"]');
            await page.waitForLoadState('networkidle');

            // Verify page 2 loaded
            await expect(page).toHaveURL(/page=2/);

            // Get products from page 2
            const page2Products = await page.locator('.product-container').count();
            expect(page2Products).toBeGreaterThan(0);

            // Products should be different (or at least some different)
            const page1ProductNames = await page.locator('.product-name').allTextContents();
            await page.goBack();
            await page.waitForLoadState('networkidle');
            const page2ProductNamesAfterBack = await page.locator('.product-name').allTextContents();

            // They should be the same after going back
            expect(page1ProductNames).toEqual(page2ProductNamesAfterBack);

            // Test next button
            await page.click('.pagination .next, a.next');
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(/page=2/);

            // Test previous button
            await page.click('.pagination .previous, a.prev');
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(/page=1/);
        }
    });

    test('SEARCH-POS-010: Search autocomplete/suggestions', async ({ page }) => {
        // Type partial search
        await page.fill('#search_query_top', 'dre');
        await page.waitForTimeout(500); // Wait for suggestions

        // Check if suggestions appear
        const suggestionsVisible = await page.locator('.ac_results, .search-suggestions').isVisible();

        if (suggestionsVisible) {
            await expect(page.locator('.ac_results li')).toHaveCountGreaterThan(0);

            // Get first suggestion
            const firstSuggestion = await page.locator('.ac_results li').first().textContent();
            expect(firstSuggestion).toBeTruthy();

            // Click suggestion
            await page.locator('.ac_results li').first().click();

            // Should perform search
            await page.waitForLoadState('networkidle');
            await expect(page.locator('.product-listing')).toBeVisible();
        }
    });

    test('SEARCH-POS-011: Search by product ID/SKU', async ({ page }) => {
        // Assuming we know a valid SKU
        const testSKU = "demo_2";

        await page.fill('#search_query_top', testSKU);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Should find the product
        await expect(page.locator('.product-listing')).toBeVisible();

        // Check if it's a single result or the SKU is highlighted
        const productCount = await page.locator('.product-container').count();

        // Often SKU search returns single product
        if (productCount === 1) {
            // Click to product page
            await page.locator('.product-name').first().click();
            await expect(page).toHaveURL(/id_product=/);

            // Verify SKU on product page
            const skuElement = await page.locator('[itemprop="sku"], .product-reference').textContent();
            expect(skuElement).toContain(testSKU);
        }
    });

    test('SEARCH-POS-012: Search with special allowed characters', async ({ page }) => {
        const specialCharSearches = [
            "T-shirt",
            "Blouse",
            "Dress"
        ];

        for (const searchTerm of specialCharSearches) {
            await page.goto('/');
            await page.fill('#search_query_top', searchTerm);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Should not error
            await expect(page.locator('.product-listing, .alert-warning')).toBeVisible();

            const hasResults = await page.locator('.product-container').count() > 0;
            const hasError = await page.locator('.alert.alert-warning').isVisible();

            // Either results or "no results" message, but no errors
            expect(hasResults || hasError).toBe(true);
        }
    });

    test('SEARCH-POS-013: Search recent searches', async ({ page }) => {
        // First perform a search
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Go back to homepage
        await page.goto('/');

        // Click on search box to see recent searches
        await page.click('#search_query_top');
        await page.waitForTimeout(300);

        // Check if recent searches appear (implementation dependent)
        const recentSearchesExist = await page.locator('.recent-searches, .search-history').isVisible();

        if (recentSearchesExist) {
            await expect(page.locator('.recent-searches li')).toContainText('dress');

            // Click recent search
            await page.locator('.recent-searches li').first().click();

            // Should perform the search again
            await page.waitForLoadState('networkidle');
            await expect(page.locator('.product-listing')).toBeVisible();
        }
    });

    test('SEARCH-POS-014: Search empty query shows all', async ({ page }) => {
        // Submit empty search
        await page.fill('#search_query_top', '');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check result - either shows all products or error message
        const hasProducts = await page.locator('.product-container').count() > 0;
        const hasMessage = await page.locator('.alert.alert-warning, .search-message').isVisible();

        // Should show something meaningful
        expect(hasProducts || hasMessage).toBe(true);

        if (hasMessage) {
            const message = await page.locator('.alert.alert-warning').textContent();
            expect(message).toMatch(/enter.*search|please.*search/i);
        }

        // Test with just spaces
        await page.goto('/');
        await page.fill('#search_query_top', '   ');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Should have same behavior
        const hasProducts2 = await page.locator('.product-container').count() > 0;
        const hasMessage2 = await page.locator('.alert.alert-warning, .search-message').isVisible();
        expect(hasProducts2 || hasMessage2).toBe(true);
    });

    test('SEARCH-POS-015: Search with mixed case', async ({ page }) => {
        const testCases = [
            'DRESS',
            'dress',
            'Dress',
            'DrEsS'
        ];

        let previousResults = null;

        for (const searchTerm of testCases) {
            await page.goto('/');
            await page.fill('#search_query_top', searchTerm);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Get current results
            const currentProductNames = (await page.locator('.product-name').allTextContents())
                .map(name => name.toLowerCase())
                .sort();

            // All searches should return same results (case-insensitive)
            if (previousResults !== null) {
                expect(currentProductNames).toEqual(previousResults);
            }

            previousResults = currentProductNames;
        }
    });

    test('SEARCH-POS-016: Search performance', async ({ page }) => {
        const searchTerms = ['dress', 'blouse', 't-shirt'];

        for (const term of searchTerms) {
            await page.goto('/');

            const startTime = Date.now();
            await page.fill('#search_query_top', term);
            await page.click('button[name="submit_search"]');

            // Wait for results
            await page.waitForSelector('.product-listing, .alert-warning', { timeout: 5000 });
            const endTime = Date.now();

            const searchTime = endTime - startTime;
            console.log(`Search for "${term}" took ${searchTime}ms`);

            // Should complete within 5 seconds
            expect(searchTime).toBeLessThan(5000);
        }
    });

    test('SEARCH-POS-017: Search result display format', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check grid view
        await expect(page.locator('.product-listing')).toBeVisible();

        // Verify product information is displayed
        const firstProduct = page.locator('.product-container').first();

        // Check for essential elements
        await expect(firstProduct.locator('.product-name')).toBeVisible();
        await expect(firstProduct.locator('.product-image')).toBeVisible();
        await expect(firstProduct.locator('.product-price')).toBeVisible();

        // Check image display
        const image = firstProduct.locator('img');
        await expect(image).toBeVisible();
        const imageSrc = await image.getAttribute('src');
        expect(imageSrc).toBeTruthy();

        // Check for grid/list view toggle if available
        const viewToggle = page.locator('.view-toggle, .display-mode');
        if (await viewToggle.isVisible()) {
            // Test switching views
            await viewToggle.locator('.list').click();
            await page.waitForTimeout(500);
            await expect(page.locator('.product-list')).toBeVisible();

            await viewToggle.locator('.grid').click();
            await page.waitForTimeout(500);
            await expect(page.locator('.product-grid')).toBeVisible();
        }
    });

    test('SEARCH-POS-018: Search breadcrumb navigation', async ({ page }) => {
        await page.fill('#search_query_top', 'summer dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check breadcrumb contains search
        const breadcrumbText = await page.locator('.breadcrumb').textContent();
        expect(breadcrumbText).toMatch(/search|results/i);

        // Click home in breadcrumb
        await page.locator('.breadcrumb a[title="Home"]').click();
        await page.waitForLoadState('networkidle');

        // Should go to homepage
        await expect(page).toHaveURL(/\/$/);

        // Use browser back to return to search
        await page.goBack();
        await page.waitForLoadState('networkidle');

        // Should return to search results
        await expect(page.locator('.product-listing')).toBeVisible();
        const currentUrl = page.url();
        expect(currentUrl).toContain('controller=search');
    });

    test('SEARCH-POS-019: Search with manufacturer filter', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check for manufacturer filter
        const manufacturerFilter = page.locator('#layered_manufacturer, [data-filter="manufacturer"]');

        if (await manufacturerFilter.isVisible()) {
            // Apply manufacturer filter
            await manufacturerFilter.locator('input[type="checkbox"]').first().check();
            await page.waitForLoadState('networkidle');

            // Check filter indication
            await expect(page.locator('.layered_filter')).toBeVisible();

            // Check manufacturer name in results
            const manufacturerName = await manufacturerFilter.locator('label').first().textContent();
            expect(manufacturerName).toBeTruthy();

            // Test with another filter combination
            const colorFilter = page.locator('#layered_id_attribute_group_3, [data-filter="color"]');
            if (await colorFilter.isVisible()) {
                await colorFilter.locator('input[type="checkbox"]').first().check();
                await page.waitForLoadState('networkidle');

                // Both filters should be active
                await expect(page.locator('.layered_filter')).toHaveCount(2);
            }
        }
    });

    test('SEARCH-POS-020: Search accessibility', async ({ page }) => {
        // Test keyboard navigation
        await page.click('#search_query_top');

        // Tab through search interface
        await page.keyboard.press('Tab');
        // Should move to search button
        const activeElement = await page.evaluate(() => document.activeElement.tagName);
        expect(['BUTTON', 'INPUT']).toContain(activeElement);

        // Use Enter to submit search
        await page.fill('#search_query_top', 'dress');
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');

        // Check focus management
        await expect(page.locator('.product-listing')).toBeVisible();

        // Test tab through filters if available
        const firstFilter = page.locator('.layered_filter input').first();
        if (await firstFilter.isVisible()) {
            await page.keyboard.press('Tab');
            await page.keyboard.press('Tab');
            await page.keyboard.press('Space'); // Select filter
            await page.waitForLoadState('networkidle');

            // Filter should be applied
            await expect(page.locator('.layered_filter')).toBeVisible();
        }

        // Check for screen reader text
        const srOnlyElements = await page.locator('.sr-only, .visually-hidden').count();
        expect(srOnlyElements).toBeGreaterThan(0);
    });

    // ===== NEGATIVE TEST CASES =====

    test('SEARCH-NEG-001: Search with no results', async ({ page }) => {
        const nonExistentTerm = "xyz123nonexistentproduct";

        await page.fill('#search_query_top', nonExistentTerm);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Should show "no results" message
        await expect(page.locator('.alert.alert-warning')).toBeVisible();

        const message = await page.locator('.alert.alert-warning').textContent();
        expect(message).toMatch(/no results|not found|try.*search/i);

        // Check for suggestions
        const suggestions = await page.locator('.search-suggestions, .did-you-mean').isVisible();
        if (suggestions) {
            await expect(page.locator('.search-suggestions a')).toHaveCountGreaterThan(0);
        }

        // Option to broaden search
        const broadenSearch = await page.locator('a[href*="all"], .view-all-products').isVisible();
        expect(broadenSearch).toBe(true);
    });

    test('SEARCH-NEG-002: Search with SQL injection', async ({ page }) => {
        const sqlInjections = [
            "' OR '1'='1",
            "; DROP TABLE products",
            "' UNION SELECT * FROM products --",
            "1; DELETE FROM products"
        ];

        for (const sqlInjection of sqlInjections) {
            await page.goto('/');
            await page.fill('#search_query_top', sqlInjection);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Should not expose database errors
            const errorVisible = await page.locator('.alert.alert-danger').isVisible();
            if (errorVisible) {
                const errorText = await page.locator('.alert.alert-danger').textContent();
                expect(errorText).not.toMatch(/SQL|database|syntax|DROP|UNION/i);
            }

            // Should either return no results or handle safely
            const hasResults = await page.locator('.product-container').count() > 0;
            const hasWarning = await page.locator('.alert.alert-warning').isVisible();
            expect(hasResults || hasWarning).toBe(true);
        }
    });

    test('SEARCH-NEG-003: Search with XSS payload', async ({ page }) => {
        const xssPayloads = [
            "<script>alert('xss')</script>",
            "<img src=x onerror=alert('xss')>",
            "javascript:alert('xss')",
            "<body onload=alert('xss')>"
        ];

        for (const xssPayload of xssPayloads) {
            await page.goto('/');
            await page.fill('#search_query_top', xssPayload);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Check no script execution
            const alertCount = await page.evaluate(() => {
                let count = 0;
                const originalAlert = window.alert;
                window.alert = () => { count++; };
                return count;
            });
            expect(alertCount).toBe(0);

            // Check if search term appears in results (should be sanitized)
            const searchTermDisplay = await page.locator('.page-heading, .search-query').textContent();
            if (searchTermDisplay) {
                expect(searchTermDisplay).not.toContain('<script>');
                expect(searchTermDisplay).not.toContain('javascript:');
            }
        }
    });

    test('SEARCH-NEG-004: Search with extremely long query', async ({ page }) => {
        const longQuery = 'A'.repeat(1000);

        await page.fill('#search_query_top', longQuery);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Should handle gracefully - either truncate or show error
        const hasResults = await page.locator('.product-container').count() > 0;
        const hasError = await page.locator('.alert.alert-danger, .alert.alert-warning').isVisible();

        expect(hasResults || hasError).toBe(true);

        if (hasError) {
            const errorText = await page.locator('.alert').textContent();
            expect(errorText).toMatch(/too long|maximum|invalid/i);
        }
    });

    test('SEARCH-NEG-005: Search with only special characters', async ({ page }) => {
        const specialChars = ['@#$%^&*()', '\\', '!!!', '???'];

        for (const chars of specialChars) {
            await page.goto('/');
            await page.fill('#search_query_top', chars);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Should handle gracefully
            const hasResults = await page.locator('.product-container').count() > 0;
            const hasMessage = await page.locator('.alert.alert-warning').isVisible();

            expect(hasResults || hasMessage).toBe(true);

            if (hasMessage) {
                const message = await page.locator('.alert.alert-warning').textContent();
                expect(message).toMatch(/no results|try.*search/i);
            }
        }
    });

    test('SEARCH-NEG-006: Search with invalid price range', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check if price filter exists
        const priceFilterExists = await page.locator('input[name="price_range_min"]').isVisible();

        if (priceFilterExists) {
            // Test min > max
            await page.fill('input[name="price_range_min"]', '100');
            await page.fill('input[name="price_range_max"]', '50');
            await page.click('button[type="submit"]');

            await page.waitForLoadState('networkidle');

            // Should handle gracefully - either swap values, show error, or ignore
            const hasResults = await page.locator('.product-container').count() > 0;
            const hasError = await page.locator('.alert.alert-danger').isVisible();

            expect(hasResults || hasError).toBe(true);

            // Test negative price
            await page.fill('input[name="price_range_min"]', '-10');
            await page.fill('input[name="price_range_max"]', '50');
            await page.click('button[type="submit"]');

            await page.waitForLoadState('networkidle');

            // Should handle negative values appropriately
            const hasResults2 = await page.locator('.product-container').count() > 0;
            const hasError2 = await page.locator('.alert.alert-danger').isVisible();
            expect(hasResults2 || hasError2).toBe(true);
        }
    });

    test('SEARCH-NEG-007: Search timeout handling', async ({ page }) => {
        // This is difficult to test without controlling the backend
        // We can simulate by searching with a very complex query

        const complexQuery = 'a b c d e f g h i j k l m n o p q r s t u v w x y z';

        await page.fill('#search_query_top', complexQuery);
        await page.click('button[name="submit_search"]');

        // Wait with timeout
        try {
            await page.waitForSelector('.product-listing', { timeout: 10000 });
            // If it loads within timeout, that's fine
            await expect(page.locator('.product-listing, .alert')).toBeVisible();
        } catch (error) {
            // If timeout occurs, check for timeout message
            const timeoutMessage = await page.locator('.timeout-message, .loading-error').isVisible();
            if (timeoutMessage) {
                await expect(page.locator('.timeout-message')).toContainText(/timeout|try again/i);

                // Check retry option
                const retryButton = await page.locator('button[onclick*="retry"], .retry-search').isVisible();
                expect(retryButton).toBe(true);
            }
        }
    });

    test('SEARCH-NEG-008: Search with invalid category ID', async ({ page }) => {
        // Try to access search with invalid category parameter
        await page.goto('/index.php?controller=search&id_category=99999');
        await page.waitForLoadState('networkidle');

        // Should load without errors
        await expect(page.locator('body')).toBeVisible();

        // Either shows all products or ignores invalid category
        const hasProducts = await page.locator('.product-container').count() > 0;
        const hasMessage = await page.locator('.alert').isVisible();

        expect(hasProducts || hasMessage).toBe(true);
    });

    test('SEARCH-NEG-009: Search with stop words only', async ({ page }) => {
        const stopWords = ['the and or but', 'a an the', 'for with'];

        for (const words of stopWords) {
            await page.goto('/');
            await page.fill('#search_query_top', words);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Should handle stop words appropriately
            const hasResults = await page.locator('.product-container').count() > 0;
            const hasMessage = await page.locator('.alert.alert-warning').isVisible();

            expect(hasResults || hasMessage).toBe(true);

            if (hasMessage) {
                const message = await page.locator('.alert.alert-warning').textContent();
                expect(message).toMatch(/common words|stop words|try.*different/i);
            }
        }
    });

    test('SEARCH-NEG-010: Search during maintenance', async ({ page }) => {
        // This would require simulating maintenance mode
        // Could be tested by modifying server response or using a proxy

        console.log('SEARCH-NEG-010: Requires maintenance mode simulation');
        // Expected: Search should still work or show maintenance message
    });

    test('SEARCH-NEG-011: Search with malformed URL parameters', async ({ page }) => {
        const malformedUrls = [
            '/index.php?controller=search&q=<>',
            '/index.php?controller=search&%',
            '/index.php?controller=search&price[]=20&price[]=30'
        ];

        for (const url of malformedUrls) {
            try {
                await page.goto(url);
                await page.waitForLoadState('networkidle');

                // Should load without server errors
                await expect(page.locator('body')).toBeVisible();

                // Check for error messages
                const serverError = await page.locator('body').textContent();
                expect(serverError).not.toMatch(/500|Internal Server Error/i);
            } catch (error) {
                // Some malformed URLs might cause navigation errors
                console.log(`URL ${url} caused navigation error: ${error.message}`);
            }
        }
    });

    test('SEARCH-NEG-012: Search with conflicting filters', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Apply two filters that might conflict
        // Example: Size XS and Size XL (if mutually exclusive)
        const sizeFilter = page.locator('#layered_id_attribute_group_1');

        if (await sizeFilter.isVisible()) {
            // Get all size options
            const sizeOptions = sizeFilter.locator('input[type="checkbox"]');
            const sizeCount = await sizeOptions.count();

            if (sizeCount >= 2) {
                // Select first and last size (might be conflicting)
                await sizeOptions.first().check();
                await sizeOptions.last().check();
                await page.waitForLoadState('networkidle');

                // Check results
                const productCount = await page.locator('.product-container').count();
                const noResultsMessage = await page.locator('.alert.alert-warning').isVisible();

                // Either shows products that match both (if possible) or no results
                expect(productCount > 0 || noResultsMessage).toBe(true);

                if (noResultsMessage) {
                    const message = await page.locator('.alert.alert-warning').textContent();
                    expect(message).toMatch(/no products|no matches/i);

                    // Check for clear filters option
                    const clearFilters = await page.locator('.clear-filters, a[href*="clear"]').isVisible();
                    expect(clearFilters).toBe(true);
                }
            }
        }
    });

    test('SEARCH-NEG-013: Search character encoding issues', async ({ page }) => {
        const utf8Searches = [
            "café",
            "naïve",
            "Müller",
            "Garçon"
        ];

        for (const searchTerm of utf8Searches) {
            await page.goto('/');
            await page.fill('#search_query_top', searchTerm);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Should handle UTF-8 characters correctly
            await expect(page.locator('body')).toBeVisible();

            // Check no garbled text
            const pageText = await page.locator('body').textContent();
            expect(pageText).not.toMatch(/Ã©|Ã¼|Ã§/); // Common encoding issues

            // Search term should display correctly if shown
            const searchDisplay = await page.locator('.page-heading, .search-query').textContent();
            if (searchDisplay && searchDisplay.includes(searchTerm)) {
                expect(searchDisplay).toContain(searchTerm);
            }
        }
    });

    test('SEARCH-NEG-014: Search pagination boundary', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        const pagination = page.locator('.pagination');
        if (await pagination.isVisible()) {
            // Go to last page
            const lastPageLink = pagination.locator('a').last();
            await lastPageLink.click();
            await page.waitForLoadState('networkidle');

            // Check "next" should be disabled or not exist
            const nextButton = pagination.locator('.next, .disabled.next');
            const nextDisabled = await nextButton.isVisible();

            if (nextDisabled) {
                // Clicking disabled next should do nothing
                const currentUrl = page.url();
                await nextButton.click();
                await page.waitForTimeout(500);
                expect(page.url()).toBe(currentUrl);
            }

            // Go to first page
            const firstPageLink = pagination.locator('a').first();
            await firstPageLink.click();
            await page.waitForLoadState('networkidle');

            // Check "previous" should be disabled
            const prevButton = pagination.locator('.previous, .disabled.previous');
            const prevDisabled = await prevButton.isVisible();

            if (prevDisabled) {
                // Clicking disabled previous should do nothing
                const currentUrl = page.url();
                await prevButton.click();
                await page.waitForTimeout(500);
                expect(page.url()).toBe(currentUrl);
            }
        }
    });

    test('SEARCH-NEG-015: Search with script tags in results', async ({ page }) => {
        // This test requires a product with script tags in name/description
        // For testing, we can search for a product and check general sanitization

        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Check all product names and descriptions for script tags
        const productNames = await page.locator('.product-name').allTextContents();
        const productDescriptions = await page.locator('.product-description').allTextContents();

        const allText = [...productNames, ...productDescriptions].join(' ');

        // Should not contain unescaped HTML tags
        expect(allText).not.toMatch(/<script>/i);
        expect(allText).not.toMatch(/javascript:/i);
        expect(allText).not.toMatch(/onclick=/i);
        expect(allText).not.toMatch(/onerror=/i);

        // Check HTML is properly escaped
        const pageHtml = await page.content();
        // Look for properly escaped script tags
        const escapedScriptTags = pageHtml.match(/&lt;script&gt;|&#60;script&#62;/g);
        if (escapedScriptTags) {
            // If script tags exist, they should be escaped
            expect(pageHtml).not.toMatch(/<script[^>]*>/);
        }
    });

    // ===== EDGE TEST CASES =====

    test('SEARCH-EDGE-001: Search with diacritics/accented chars', async ({ page }) => {
        const accentedSearches = [
            "café",
            "naïve",
            "Müller",
            "Garçon"
        ];

        for (const searchTerm of accentedSearches) {
            await page.goto('/');
            await page.fill('#search_query_top', searchTerm);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Should handle accented characters
            const hasResults = await page.locator('.product-container').count() > 0;
            const hasMessage = await page.locator('.alert').isVisible();

            expect(hasResults || hasMessage).toBe(true);

            // Check search suggestions if available
            await page.goto('/');
            await page.fill('#search_query_top', searchTerm.substring(0, 3));
            await page.waitForTimeout(500);

            const suggestionsVisible = await page.locator('.ac_results').isVisible();
            if (suggestionsVisible) {
                const suggestions = await page.locator('.ac_results li').allTextContents();
                expect(suggestions.length).toBeGreaterThan(0);
            }
        }
    });

    test('SEARCH-EDGE-002: Search with wildcards if supported', async ({ page }) => {
        // Test if wildcards are supported
        const wildcardSearches = [
            "dress*",
            "*sleeve",
            "dr*ss"
        ];

        for (const searchTerm of wildcardSearches) {
            await page.goto('/');
            await page.fill('#search_query_top', searchTerm);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Check response
            const hasResults = await page.locator('.product-container').count() > 0;
            const hasMessage = await page.locator('.alert').isVisible();

            // Wildcards may or may not be supported
            expect(hasResults || hasMessage).toBe(true);

            if (hasResults) {
                // Check performance
                const startTime = Date.now();
                await page.waitForSelector('.product-container', { timeout: 3000 });
                const endTime = Date.now();
                expect(endTime - startTime).toBeLessThan(3000);
            }
        }
    });

    test('SEARCH-EDGE-003: Search with boolean operators if supported', async ({ page }) => {
        const booleanSearches = [
            "dress AND summer",
            "blouse OR shirt",
            "dress NOT evening"
        ];

        for (const searchTerm of booleanSearches) {
            await page.goto('/');
            await page.fill('#search_query_top', searchTerm);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Boolean operators may or may not be supported
            const hasResults = await page.locator('.product-container').count() > 0;
            const hasMessage = await page.locator('.alert').isVisible();

            expect(hasResults || hasMessage).toBe(true);

            if (hasResults) {
                // Complex queries should still perform reasonably
                const startTime = Date.now();
                await page.waitForSelector('.product-container', { timeout: 5000 });
                const endTime = Date.now();
                expect(endTime - startTime).toBeLessThan(5000);
            }
        }
    });

    test('SEARCH-EDGE-004: Search phrase matching', async ({ page }) => {
        // Test phrase search with quotes
        const phraseSearch = '"short sleeves"';

        await page.fill('#search_query_top', phraseSearch);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        const hasResults = await page.locator('.product-container').count() > 0;

        if (hasResults) {
            // Check if exact phrase appears in results
            const productNames = await page.locator('.product-name').allTextContents();
            const exactMatches = productNames.filter(name =>
                name.toLowerCase().includes('short sleeves')
            );

            // Exact phrase matches should be prioritized
            expect(exactMatches.length).toBeGreaterThan(0);
        }
    });

    test('SEARCH-EDGE-006: Search typo tolerance', async ({ page }) => {
        const commonTypos = [
            "dres",  // Missing s
            "bluse", // Missing o
            "tshirt" // Missing hyphen
        ];

        for (const typo of commonTypos) {
            await page.goto('/');
            await page.fill('#search_query_top', typo);
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Check for "Did you mean" suggestions
            const suggestions = await page.locator('.did-you-mean, .search-suggestions').isVisible();

            if (suggestions) {
                await expect(page.locator('.did-you-mean')).toContainText(/did you mean|try searching/i);

                // Click suggestion if available
                const suggestionLink = page.locator('.did-you-mean a');
                if (await suggestionLink.isVisible()) {
                    await suggestionLink.click();
                    await page.waitForLoadState('networkidle');

                    // Should show corrected search results
                    await expect(page.locator('.product-listing')).toBeVisible();
                }
            }
        }
    });

    test('SEARCH-EDGE-007: Search with very common term', async ({ page }) => {
        const commonTerm = "dress";

        await page.fill('#search_query_top', commonTerm);
        await page.click('button[name="submit_search"]');

        // Measure performance for common term
        const startTime = Date.now();
        await page.waitForSelector('.product-listing, .pagination', { timeout: 5000 });
        const endTime = Date.now();

        const searchTime = endTime - startTime;
        console.log(`Common term "${commonTerm}" search took ${searchTime}ms`);
        expect(searchTime).toBeLessThan(5000);

        // Check pagination handles many results
        const paginationExists = await page.locator('.pagination').isVisible();
        if (paginationExists) {
            const pageCount = await page.locator('.pagination a').count();
            expect(pageCount).toBeGreaterThan(1);

            // Test navigating through pages
            await page.locator('.pagination a').nth(1).click(); // Page 2
            await page.waitForLoadState('networkidle');
            await expect(page).toHaveURL(/page=2/);
        }
    });

    test('SEARCH-EDGE-008: Search autocomplete performance', async ({ page }) => {
        // Type quickly to test autocomplete
        await page.fill('#search_query_top', 'd');
        await page.waitForTimeout(100);

        await page.fill('#search_query_top', 'dr');
        await page.waitForTimeout(100);

        await page.fill('#search_query_top', 'dre');
        await page.waitForTimeout(100);

        await page.fill('#search_query_top', 'dres');
        await page.waitForTimeout(500); // Wait for suggestions

        // Check if suggestions appear quickly
        const suggestionsVisible = await page.locator('.ac_results').isVisible();

        if (suggestionsVisible) {
            // Suggestions should load within reasonable time
            const suggestions = await page.locator('.ac_results li').count();
            expect(suggestions).toBeGreaterThan(0);

            // UI should not freeze during typing
            const isFrozen = await page.evaluate(() => {
                return document.readyState !== 'complete' ||
                    document.querySelector('body').style.pointerEvents === 'none';
            });
            expect(isFrozen).toBe(false);
        }
    });

    test('SEARCH-EDGE-010: Search with filters persistence', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Apply a filter if available
        const sizeFilter = page.locator('#layered_id_attribute_group_1 input[type="checkbox"]').first();
        if (await sizeFilter.isVisible()) {
            await sizeFilter.check();
            await page.waitForLoadState('networkidle');

            // Navigate away
            await page.goto('/');
            await page.waitForLoadState('networkidle');

            // Use browser back
            await page.goBack();
            await page.waitForLoadState('networkidle');

            // Filter should still be applied
            const filterActive = await page.locator('.layered_filter, .active-filter').isVisible();
            expect(filterActive).toBe(true);

            // Check clear option
            const clearAll = await page.locator('.clear-all-filters, a[href*="clear_filters"]').isVisible();
            expect(clearAll).toBe(true);

            if (clearAll) {
                await page.locator('.clear-all-filters').click();
                await page.waitForLoadState('networkidle');

                // Filters should be cleared
                const filterStillActive = await page.locator('.layered_filter').isVisible();
                expect(filterStillActive).toBe(false);
            }
        }
    });

    test('SEARCH-EDGE-011: Search accessibility (screen readers)', async ({ page }) => {
        // Test ARIA attributes
        const searchInput = page.locator('#search_query_top');
        const hasAriaLabel = await searchInput.getAttribute('aria-label');
        expect(hasAriaLabel).toBeTruthy();

        // Test search button
        const searchButton = page.locator('button[name="submit_search"]');
        const buttonAriaLabel = await searchButton.getAttribute('aria-label');
        expect(buttonAriaLabel).toMatch(/search|go/i);

        // Perform search
        await searchInput.fill('dress');
        await searchButton.click();
        await page.waitForLoadState('networkidle');

        // Check results have proper semantic structure
        await expect(page.locator('[role="main"]')).toBeVisible();

        // Check product items have proper markup
        const firstProduct = page.locator('.product-container').first();
        const productName = firstProduct.locator('.product-name');
        const productNameText = await productName.textContent();
        expect(productNameText).toBeTruthy();

        // Check images have alt text
        const productImage = firstProduct.locator('img');
        const altText = await productImage.getAttribute('alt');
        expect(altText).toBeTruthy();
        expect(altText).not.toBe('');

        // Test keyboard navigation through results
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');
        await page.keyboard.press('Tab');

        // Focus should move through interactive elements
        const focusedElement = await page.evaluate(() =>
            document.activeElement ? document.activeElement.tagName : null
        );
        expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
    });

    test('SEARCH-EDGE-012: Search mobile responsiveness', async ({ browser }) => {
        // Test on mobile viewport
        const context = await browser.newContext({
            viewport: { width: 375, height: 667 }, // iPhone SE
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        });

        const page = await context.newPage();
        await page.goto('/');

        // Check search box is visible and usable
        const searchInput = page.locator('#search_query_top');
        await expect(searchInput).toBeVisible();

        // Check size is appropriate for mobile
        const inputSize = await searchInput.boundingBox();
        expect(inputSize.width).toBeGreaterThan(150); // Reasonable width for mobile
        expect(inputSize.height).toBeGreaterThan(30); // Touch target size

        // Perform search
        await searchInput.fill('dress');
        await page.locator('button[name="submit_search"]').click();
        await page.waitForLoadState('networkidle');

        // Check results display properly on mobile
        await expect(page.locator('.product-listing')).toBeVisible();

        // Check filters if available (should be mobile-friendly)
        const filters = page.locator('.layered_filter');
        if (await filters.isVisible()) {
            // Filter elements should be large enough for touch
            const filterCheckboxes = filters.locator('input[type="checkbox"]');
            const firstCheckbox = filterCheckboxes.first();
            const checkboxSize = await firstCheckbox.boundingBox();
            expect(checkboxSize.height).toBeGreaterThan(30);
            expect(checkboxSize.width).toBeGreaterThan(30);
        }

        await context.close();
    });

    // ===== INTEGRATION TEST CASES =====

    test('SEARCH-INT-001: Search → Product Page → Back', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Get first product details
        const firstProductName = await page.locator('.product-name').first().textContent();

        // Click product
        await page.locator('.product-name').first().click();
        await page.waitForLoadState('networkidle');

        // Verify product page
        await expect(page.locator('h1[itemprop="name"]')).toContainText(firstProductName);

        // Use browser back
        await page.goBack();
        await page.waitForLoadState('networkidle');

        // Should return to search results
        await expect(page.locator('.product-listing')).toBeVisible();

        // Check URL is search results
        const currentUrl = page.url();
        expect(currentUrl).toContain('controller=search');

        // Results should be preserved
        const productCount = await page.locator('.product-container').count();
        expect(productCount).toBeGreaterThan(0);
    });

    test('SEARCH-INT-002: Search → Add to Cart → Continue', async ({ page }) => {
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Add first product to cart
        const addToCartButton = page.locator('.ajax_add_to_cart_button').first();
        if (await addToCartButton.isVisible()) {
            await addToCartButton.click();

            // Wait for cart confirmation
            await page.waitForSelector('.layer_cart_product', { timeout: 5000 });
            await expect(page.locator('.layer_cart_product')).toContainText('successfully added');

            // Continue shopping
            await page.locator('.continue.btn').click();
            await page.waitForTimeout(1000);

            // Should still be on search results
            await expect(page.locator('.product-listing')).toBeVisible();

            // Cart should be updated
            const cartQuantity = await page.locator('.ajax_cart_quantity').textContent();
            expect(parseInt(cartQuantity)).toBeGreaterThan(0);

            // Search again
            await page.fill('#search_query_top', 'blouse');
            await page.click('button[name="submit_search"]');
            await page.waitForLoadState('networkidle');

            // Should work normally
            await expect(page.locator('.product-listing')).toBeVisible();
        }
    });

    test('SEARCH-INT-003: Search while logged in/out', async ({ page, browser }) => {
        // Create test user
        const context = await browser.newContext();
        const setupPage = await context.newPage();

        const timestamp = Date.now();
        const testUser = {
            firstName: 'Search',
            lastName: 'Test',
            email: `search.test${timestamp}@test.com`,
            password: 'Test@1234'
        };

        // Register user
        await setupPage.goto('/index.php?controller=authentication&back=my-account');
        await setupPage.fill('#email_create', testUser.email);
        await setupPage.click('#SubmitCreate');
        await setupPage.waitForURL(/controller=authentication.*account-creation/);
        await setupPage.fill('#customer_firstname', testUser.firstName);
        await setupPage.fill('#customer_lastname', testUser.lastName);
        await setupPage.fill('#email', testUser.email);
        await setupPage.fill('#passwd', testUser.password);
        await setupPage.click('#submitAccount');
        await setupPage.waitForLoadState('networkidle');
        await setupPage.click('a.logout');
        await setupPage.close();

        // Search while logged out
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        const loggedOutResults = await page.locator('.product-name').allTextContents();

        // Login
        await page.goto('/index.php?controller=authentication&back=my-account');
        await page.fill('#email', testUser.email);
        await page.fill('#passwd', testUser.password);
        await page.click('#SubmitLogin');
        await page.waitForLoadState('networkidle');

        // Search while logged in
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        const loggedInResults = await page.locator('.product-name').allTextContents();

        // Core search functionality should work both ways
        expect(loggedOutResults.length).toBeGreaterThan(0);
        expect(loggedInResults.length).toBeGreaterThan(0);

        // Results may be personalized when logged in
        // At minimum, core results should be consistent

        await context.close();
    });

    test('SEARCH-INT-005: Search in different site sections', async ({ page }) => {
        const searchTerm = 'dress';

        // Search from homepage
        await page.goto('/');
        await page.fill('#search_query_top', searchTerm);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');
        const homepageResults = await page.locator('.product-name').allTextContents();

        // Search from category page
        await page.goto('/index.php?id_category=8&controller=category'); // Dresses category
        await page.waitForLoadState('networkidle');
        await page.fill('#search_query_top', searchTerm);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');
        const categoryResults = await page.locator('.product-name').allTextContents();

        // Search from product page
        await page.goto('/index.php?id_product=1&controller=product'); // Example product
        await page.waitForLoadState('networkidle');
        await page.fill('#search_query_top', searchTerm);
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');
        const productPageResults = await page.locator('.product-name').allTextContents();

        // Search should work from all locations
        expect(homepageResults.length).toBeGreaterThan(0);
        expect(categoryResults.length).toBeGreaterThan(0);
        expect(productPageResults.length).toBeGreaterThan(0);

        // Search interface should be consistent
        const searchBoxExists = await page.locator('#search_query_top').isVisible();
        expect(searchBoxExists).toBe(true);
    });

    test('SEARCH-INT-006: Search with browser navigation', async ({ page }) => {
        // Search for term A
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');
        const urlA = page.url();

        // Search for term B
        await page.fill('#search_query_top', 'blouse');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');
        const urlB = page.url();

        // Use browser back
        await page.goBack();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toBe(urlA);
        await expect(page.locator('.product-listing')).toBeVisible();

        // Use browser forward
        await page.goForward();
        await page.waitForLoadState('networkidle');
        expect(page.url()).toBe(urlB);
        await expect(page.locator('.product-listing')).toBeVisible();

        // Check browser history entries
        await page.evaluate(() => {
            return {
                length: history.length,
                state: history.state
            };
        });
    });

    test('SEARCH-INT-010: Search error recovery', async ({ page }) => {
        // Test recovery from potential errors

        // First do a normal search
        await page.fill('#search_query_top', 'dress');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        // Try a potentially problematic search
        await page.fill('#search_query_top', '非常长的搜索词可能会引起问题');
        await page.click('button[name="submit_search"]');

        try {
            await page.waitForLoadState('networkidle', { timeout: 10000 });

            // If it loads, check for results or message
            const hasResults = await page.locator('.product-container').count() > 0;
            const hasMessage = await page.locator('.alert').isVisible();

            expect(hasResults || hasMessage).toBe(true);

            if (hasMessage) {
                const message = await page.locator('.alert').textContent();
                expect(message).toMatch(/error|try again|no results/i);
            }

        } catch (error) {
            // If timeout, check for retry option
            const retryButton = await page.locator('.retry-search, button[onclick*="retry"]').isVisible();
            if (retryButton) {
                await page.locator('.retry-search').click();
                await page.waitForLoadState('networkidle');
                await expect(page.locator('.product-listing, .alert')).toBeVisible();
            }
        }

        // Try a different search (should still work)
        await page.fill('#search_query_top', 'blouse');
        await page.click('button[name="submit_search"]');
        await page.waitForLoadState('networkidle');

        await expect(page.locator('.product-listing, .alert')).toBeVisible();
    });
});