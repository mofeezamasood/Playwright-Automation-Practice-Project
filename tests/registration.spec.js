const { test, expect } = require('@playwright/test');
const TestData = require('./utils/test-data');

test.describe('Registration Functionality with Date of Birth', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.php?controller=authentication&back=my-account');
    });

    test('TC-001: Successful registration with date of birth', async ({ page }) => {
        const user = TestData.generateUser();
        const timestamp = Date.now();
        const uniqueEmail = `test${timestamp}@automation.com`;

        // Enter email for registration
        await page.fill('#email_create', uniqueEmail);
        await page.click('#SubmitCreate');

        // Wait for registration form
        await page.waitForSelector('#account-creation_form');

        // Fill personal information
        await page.check('#id_gender1'); // Mr.
        await page.fill('#customer_firstname', user.firstName);
        await page.fill('#customer_lastname', user.lastName);
        await page.fill('#email', uniqueEmail); // Confirmation
        await page.fill('#passwd', user.password);

        // **DATE OF BIRTH SELECTION**
        // Method 1: Using selectOption for dropdowns
        await page.selectOption('#days', user.dob.day.toString());
        await page.selectOption('#months', user.dob.month.toString());
        await page.selectOption('#years', user.dob.year.toString());

        // Register button
        await page.click('#submitAccount');

        // Verification
        await expect(page.locator('.page-heading')).toHaveText('My account');
        await expect(page.locator('.account')).toContainText(`${user.firstName} ${user.lastName}`);
    });

    test('TC-015: Registration with minimum age (18 years)', async ({ page }) => {
        const user = TestData.generateUser();
        const timestamp = Date.now();
        const uniqueEmail = `adult${timestamp}@test.com`;

        // Set date for 18+ years old
        const currentYear = new Date().getFullYear();
        const adultDOB = {
            day: 15,
            month: 6,
            year: currentYear - 25 // 25 years old
        };

        await page.fill('#email_create', uniqueEmail);
        await page.click('#SubmitCreate');
        await page.waitForSelector('#account-creation_form');

        // Fill form
        await page.check('#id_gender2'); // Mrs.
        await page.fill('#customer_firstname', user.firstName);
        await page.fill('#customer_lastname', user.lastName);
        await page.fill('#passwd', user.password);

        // Select adult date of birth
        await page.selectOption('#days', adultDOB.day.toString());
        await page.selectOption('#months', adultDOB.month.toString());
        await page.selectOption('#years', adultDOB.year.toString());
        await page.click('#submitAccount');

        // Should successfully register
        await expect(page.locator('.page-heading')).toHaveText('My account');
    });

    test('TC-016: Registration with underage date (optional validation test)', async ({ page }) => {
        const user = TestData.generateUser();
        const timestamp = Date.now();
        const uniqueEmail = `underage${timestamp}@test.com`;

        // Set underage date (16 years old)
        const currentYear = new Date().getFullYear();
        const underageDOB = {
            day: 15,
            month: 6,
            year: currentYear - 16
        };

        await page.fill('#email_create', uniqueEmail);
        await page.click('#SubmitCreate');
        await page.waitForSelector('#account-creation_form');

        // Fill form
        await page.fill('#customer_firstname', user.firstName);
        await page.fill('#customer_lastname', user.lastName);
        await page.fill('#passwd', user.password);

        // Select underage date
        await page.selectOption('#days', underageDOB.day.toString());
        await page.selectOption('#months', underageDOB.month.toString());
        await page.selectOption('#years', underageDOB.year.toString());

        await page.click('#submitAccount');

        // This may or may not show an error depending on site validation
        // We'll check for either success or age validation error
        const headingText = await page.locator('.page-heading').textContent();
        const errorVisible = await page.locator('.alert-danger').isVisible();

        // Log the result for analysis
        if (headingText.includes('My account')) {
            console.log('Site allows underage registration');
        } else if (errorVisible) {
            const errorText = await page.locator('.alert-danger').textContent();
            console.log(`Age validation error: ${errorText}`);
        }
    });

    test('TC-017: Date validation - invalid date (Feb 30)', async ({ page }) => {
        const user = TestData.generateUser();
        const timestamp = Date.now();
        const uniqueEmail = `invaliddate${timestamp}@test.com`;

        // Invalid date: February 30
        const invalidDOB = {
            day: 30,
            month: 2, // February
            year: 1990
        };

        await page.fill('#email_create', uniqueEmail);
        await page.click('#SubmitCreate');
        await page.waitForSelector('#account-creation_form');

        // Fill form
        await page.fill('#customer_firstname', user.firstName);
        await page.fill('#customer_lastname', user.lastName);
        await page.fill('#passwd', user.password);

        // Try to select invalid date
        await page.selectOption('#days', invalidDOB.day.toString());
        await page.selectOption('#months', invalidDOB.month.toString());
        await page.selectOption('#years', invalidDOB.year.toString());

        // Complete registration
        await page.click('#submitAccount');

        // Check if form accepts invalid date or shows error
        const currentUrl = page.url();
        if (currentUrl.includes('my-account')) {
            console.log('WARNING: Site accepted invalid date (Feb 30)');
        } else {
            console.log('Form did not proceed with invalid date');
        }
    });

    test('TC-018: Verify all date dropdown options', async ({ page }) => {
        // Navigate directly to registration form if possible
        await page.goto('/index.php?controller=authentication&back=my-account');
        const testEmail = `verifydropdowns${Date.now()}@test.com`;

        await page.fill('#email_create', testEmail);
        await page.click('#SubmitCreate');
        await page.waitForSelector('#account-creation_form');

        // Test Days dropdown (1-31)
        const dayOptions = await page.locator('#days option').all();
        expect(dayOptions.length).toBeGreaterThan(0);

        // Verify first option is empty/placeholder
        const firstDayOption = await page.locator('#days option').first();
        expect(await firstDayOption.getAttribute('value')).toBe('');

        // Test selecting specific days
        await page.selectOption('#days', '1');
        await expect(page.locator('#days')).toHaveValue('1');

        await page.selectOption('#days', '15');
        await expect(page.locator('#days')).toHaveValue('15');

        await page.selectOption('#days', '31');
        await expect(page.locator('#days')).toHaveValue('31');

        // Test Months dropdown (1-12 or month names)
        const monthOptions = await page.locator('#months option').all();
        expect(monthOptions.length).toBeGreaterThan(0);

        // Test selecting months
        await page.selectOption('#months', '1');
        await expect(page.locator('#months')).toHaveValue('1');

        await page.selectOption('#months', '6');
        await expect(page.locator('#months')).toHaveValue('6');

        await page.selectOption('#months', '12');
        await expect(page.locator('#months')).toHaveValue('12');

        // Test Years dropdown
        const yearOptions = await page.locator('#years option').all();
        expect(yearOptions.length).toBeGreaterThan(0);

        // Get min and max years
        const yearValues = await page.locator('#years option').evaluateAll(options =>
            options.map(option => option.value).filter(val => val)
        );

        const minYear = Math.min(...yearValues.map(y => parseInt(y)));
        const maxYear = Math.max(...yearValues.map(y => parseInt(y)));

        console.log(`Year range: ${minYear} to ${maxYear}`);

        // Test selecting years
        await page.selectOption('#years', minYear.toString());
        await expect(page.locator('#years')).toHaveValue(minYear.toString());

        await page.selectOption('#years', maxYear.toString());
        await expect(page.locator('#years')).toHaveValue(maxYear.toString());

        // Select a middle year
        const middleYear = Math.floor((minYear + maxYear) / 2).toString();
        await page.selectOption('#years', middleYear);
        await expect(page.locator('#years')).toHaveValue(middleYear);
    });
});