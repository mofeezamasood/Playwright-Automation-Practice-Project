const { test, expect } = require('@playwright/test');
const TestData = require('./utils/testo-sample-data');

test.describe('Registration Functionality - Comprehensive Test Suite', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.php?controller=authentication&back=my-account');
    });

    // ===== POSITIVE TEST CASES =====

    test('TC-001: Successful registration with complete profile data', async ({ page }) => {
        const user = TestData.generateUser();
        const timestamp = Date.now();
        const uniqueEmail = `complete${timestamp}@automation.com`;

        // Enter email for registration
        await page.fill('#email_create', uniqueEmail);
        await page.click('#SubmitCreate');

        await expect(page.locator('.page-heading')).toHaveText('Create an account');

        // Fill personal information - Mr.
        await page.check('#id_gender1');
        await page.fill('#customer_firstname', user.firstName);
        await page.fill('#customer_lastname', user.lastName);
        await page.fill('#email', uniqueEmail);
        await page.fill('#passwd', user.password);

        // Date of birth
        await page.selectOption('#days', user.dob.day.toString());
        await page.selectOption('#months', user.dob.month.toString());
        await page.selectOption('#years', user.dob.year.toString());

        // Newsletter subscription
        await page.check('#newsletter');
        await page.check('#optin');

        // Submit registration
        await page.click('#submitAccount');

        // Add Address
        await page.click('a[title="Add my first address"]');

        // Fill address information
        await page.fill('#firstname', user.firstName);
        await page.fill('#lastname', user.lastName);
        await page.fill('#company', 'Test Company Inc.');
        await page.fill('#address1', '123 Main Street');
        await page.fill('#address2', 'Suite 400');
        await page.fill('#city', 'New York');

        await page.selectOption('#id_country', 'United States');
        await expect(page.locator('#id_country')).toHaveValue('21');

        await page.selectOption('#id_state', 'New York');
        await expect(page.locator('#id_state')).toHaveValue('32');

        await page.fill('#postcode', '10001');

        await page.fill('#other', 'Additional delivery instructions');
        await page.fill('#phone', '212-555-0123');
        await page.fill('#phone_mobile', '917-555-0123');
        await page.fill('#alias', 'My Home Address');

        await page.click('#submitAddress');

        // Verification
        await expect(page.locator('.page-heading')).toHaveText('My addresses');
    });

    test('TC-002: Registration as Mrs. (Female)', async ({ page }) => {
        const user = TestData.generateUser();
        const timestamp = Date.now();
        const uniqueEmail = 'mrs${timestamp}@automation.com';

        await page.fill('#email_create', uniqueEmail);
        await page.click('#SubmitCreate');
        await page.waitForSelector('#account-creation_form');

        // Select Mrs. (female)
        await page.check('#id_gender2');
        await page.fill('#customer_firstname', user.firstName);
        await page.fill('#customer_lastname', user.lastName);
        await page.fill('#passwd', user.password);

        // Set date to 25 years old
        const currentYear = new Date().getFullYear();
        await page.selectOption('#days', '10');
        await page.selectOption('#months', '5');
        await page.selectOption('#years', (currentYear - 25).toString());

        await page.click('#submitAccount');

        await expect(page.locator('.page-heading')).toHaveText('My account');
        await expect(page.locator('.account')).toContainText(user.firstName);
    });

    // test('TC-003: Registration with minimal required fields only', async ({ page }) => {
    //     const timestamp = Date.now();
    //     const uniqueEmail = 'minimal${timestamp}@test.com';
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     // Only fill required fields
    //     await page.fill('#customer_firstname', 'Minimal');
    //     await page.fill('#customer_lastname', 'User');
    //     await page.fill('#passwd', 'Test@123456');
    //     await page.fill('#address1', '123 Test St');
    //     await page.fill('#city', 'TestCity');
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //     await page.fill('#phone_mobile', '123-456-7890');
    //
    //     await page.click('#submitAccount');
    //
    //     await expect(page.locator('.page-heading')).toHaveText('My account');
    // });
    //
    // test('TC-004: Registration on specific important dates', async ({ page }) => {
    //     const testDates = [
    //         { day: 1, month: 1, year: 1990, desc: 'New Year Day' },
    //         { day: 29, month: 2, year: 2000, desc: 'Leap Year' },
    //         { day: 31, month: 12, year: 1999, desc: 'Millennium Eve' },
    //         { day: 15, month: 8, year: 1985, desc: 'Mid-month' }
    //     ];
    //
    //     for (const date of testDates) {
    //         const user = TestData.generateUser();
    //         const uniqueEmail = 'date${date.month}${date.day}${Date.now()}@test.com';
    //
    //         console.log('Testing registration for: ${date.desc} (${date.day}/${date.month}/${date.year})');
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //         await page.waitForSelector('#account-creation_form');
    //
    //         await page.fill('#customer_firstname', user.firstName);
    //         await page.fill('#customer_lastname', user.lastName);
    //         await page.fill('#passwd', user.password);
    //
    //         // Test specific date
    //         await page.selectOption('#days', date.day.toString());
    //         await page.selectOption('#months', date.month.toString());
    //         await page.selectOption('#years', date.year.toString());
    //
    //         await page.fill('#address1', '123 Test St');
    //         await page.fill('#city', 'TestCity');
    //         await page.selectOption('#id_state', '1');
    //         await page.fill('#postcode', '12345');
    //         await page.fill('#phone_mobile', '123-456-7890');
    //
    //         await page.click('#submitAccount');
    //
    //         await expect(page.locator('.page-heading')).toHaveText('My account');
    //
    //         // Verify date is saved correctly
    //         await page.goto('/index.php?controller=identity');
    //         await expect(page.locator('#days')).toHaveValue(date.day.toString());
    //         await expect(page.locator('#months')).toHaveValue(date.month.toString());
    //         await expect(page.locator('#years')).toHaveValue(date.year.toString());
    //
    //         // Logout for next iteration
    //         await page.click('a[title="Log me out"]');
    //     }
    // });
    //
    // // ===== NEGATIVE TEST CASES =====
    //
    // test('TC-005: Registration with existing email address', async ({ page }) => {
    //     // First, create a user
    //     const user = TestData.generateUser();
    //     const existingEmail = 'existing${Date.now()}@test.com';
    //
    //     // Create account
    //     await page.fill('#email_create', existingEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //     await page.fill('#customer_firstname', user.firstName);
    //     await page.fill('#customer_lastname', user.lastName);
    //     await page.fill('#passwd', user.password);
    //     await page.fill('#address1', '123 Test St');
    //     await page.fill('#city', 'TestCity');
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //     await page.fill('#phone_mobile', '123-456-7890');
    //     await page.click('#submitAccount');
    //     await page.click('a[title="Log me out"]');
    //
    //     // Now try to register with same email
    //     await page.goto('/index.php?controller=authentication&back=my-account');
    //     await page.fill('#email_create', existingEmail);
    //     await page.click('#SubmitCreate');
    //
    //     await expect(page.locator('#create_account_error')).toBeVisible();
    //     await expect(page.locator('#create_account_error')).toContainText('An account using this email address has already been registered');
    // });
    //
    // test('TC-006: Registration with invalid email formats', async ({ page }) => {
    //     const invalidEmails = [
    //         'invalid-email',
    //         'test@',
    //         '@test.com',
    //         'test@test',
    //         'test test@test.com',
    //         'test@test..com',
    //         'test@.com',
    //         '.test@test.com'
    //     ];
    //
    //     for (const email of invalidEmails) {
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', email);
    //         await page.click('#SubmitCreate');
    //
    //         await expect(page.locator('.alert-danger')).toBeVisible();
    //         await expect(page.locator('.alert-danger')).toContainText('Invalid email address');
    //     }
    // });
    //
    // test('TC-007: Registration with weak passwords', async ({ page }) => {
    //     const weakPasswords = [
    //         '123456',
    //         'password',
    //         'abc123',
    //         'qwerty',
    //         'letmein'
    //     ];
    //
    //     for (const password of weakPasswords) {
    //         const uniqueEmail = 'weakpass${Date.now()}@test.com';
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //         await page.waitForSelector('#account-creation_form');
    //
    //         await page.fill('#customer_firstname', 'Test');
    //         await page.fill('#customer_lastname', 'User');
    //         await page.fill('#passwd', password);
    //         await page.fill('#address1', '123 Test St');
    //         await page.fill('#city', 'TestCity');
    //         await page.selectOption('#id_state', '1');
    //         await page.fill('#postcode', '12345');
    //         await page.fill('#phone_mobile', '123-456-7890');
    //
    //         await page.click('#submitAccount');
    //
    //         // Check if weak password is accepted (should fail validation if implemented)
    //         const currentUrl = page.url();
    //         if (currentUrl.includes('my-account')) {
    //             console.log('WARNING: Weak password "${password}" was accepted');
    //         }
    //
    //         // Logout if successful
    //         if (await page.locator('a[title="Log me out"]').isVisible()) {
    //             await page.click('a[title="Log me out"]');
    //         }
    //     }
    // });
    //
    // test('TC-008: Registration with missing required fields', async ({ page }) => {
    //     const testScenarios = [
    //         { field: '#customer_firstname', desc: 'Missing first name' },
    //         { field: '#customer_lastname', desc: 'Missing last name' },
    //         { field: '#passwd', desc: 'Missing password' },
    //         { field: '#address1', desc: 'Missing address' },
    //         { field: '#city', desc: 'Missing city' },
    //         { field: '#postcode', desc: 'Missing postal code' },
    //         { field: '#phone_mobile', desc: 'Missing mobile phone' }
    //     ];
    //
    //     for (const scenario of testScenarios) {
    //         const uniqueEmail = 'missing${Date.now()}@test.com';
    //
    //         console.log('Testing: ${scenario.desc}');
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //         await page.waitForSelector('#account-creation_form');
    //
    //         // Fill all fields except the one being tested
    //         if (scenario.field !== '#customer_firstname') await page.fill('#customer_firstname', 'Test');
    //         if (scenario.field !== '#customer_lastname') await page.fill('#customer_lastname', 'User');
    //         if (scenario.field !== '#passwd') await page.fill('#passwd', 'Test@123456');
    //         if (scenario.field !== '#address1') await page.fill('#address1', '123 Test St');
    //         if (scenario.field !== '#city') await page.fill('#city', 'TestCity');
    //         if (scenario.field !== '#postcode') await page.fill('#postcode', '12345');
    //         if (scenario.field !== '#phone_mobile') await page.fill('#phone_mobile', '123-456-7890');
    //
    //         await page.selectOption('#id_state', '1');
    //
    //         await page.click('#submitAccount');
    //
    //         await expect(page.locator('.alert-danger')).toBeVisible();
    //         const errorText = await page.locator('.alert-danger').textContent();
    //         console.log('Error for ${scenario.desc}: ${errorText.substring(0, 100)}...');
    //     }
    // });
    //
    // test('TC-009: Registration with invalid postal codes', async ({ page }) => {
    //     const invalidPostcodes = [
    //         '1234',      // Too short
    //         '123456',    // Too long
    //         'abcde',     // Letters only
    //         '12 345',    // With space
    //         '1234-5',    // With hyphen
    //         '00000',     // All zeros
    //     ];
    //
    //     for (const postcode of invalidPostcodes) {
    //         const uniqueEmail = 'postcode${Date.now()}@test.com';
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //         await page.waitForSelector('#account-creation_form');
    //
    //         await page.fill('#customer_firstname', 'Test');
    //         await page.fill('#customer_lastname', 'User');
    //         await page.fill('#passwd', 'Test@123456');
    //         await page.fill('#address1', '123 Test St');
    //         await page.fill('#city', 'TestCity');
    //         await page.selectOption('#id_state', '1');
    //         await page.fill('#postcode', postcode);
    //         await page.fill('#phone_mobile', '123-456-7890');
    //
    //         await page.click('#submitAccount');
    //
    //         // Check result
    //         const currentUrl = page.url();
    //         if (currentUrl.includes('my-account')) {
    //             console.log('WARNING: Invalid postal code "${postcode}" was accepted');
    //         } else {
    //             console.log('Invalid postal code "${postcode}" correctly rejected');
    //         }
    //     }
    // });
    //
    // test('TC-010: Registration with invalid phone numbers', async ({ page }) => {
    //     const invalidPhones = [
    //         '123',                 // Too short
    //         '1234567890123456',   // Too long
    //         'abc-def-ghij',       // Letters
    //         '123-45-6789',        // Invalid format
    //         '(123) 456-7890',     // With parentheses
    //         '+1 123 456 7890',    // With plus sign
    //         '123 456 7890',       // With spaces
    //     ];
    //
    //     for (const phone of invalidPhones) {
    //         const uniqueEmail = 'phone${Date.now()}@test.com';
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //         await page.waitForSelector('#account-creation_form');
    //
    //         await page.fill('#customer_firstname', 'Test');
    //         await page.fill('#customer_lastname', 'User');
    //         await page.fill('#passwd', 'Test@123456');
    //         await page.fill('#address1', '123 Test St');
    //         await page.fill('#city', 'TestCity');
    //         await page.selectOption('#id_state', '1');
    //         await page.fill('#postcode', '12345');
    //         await page.fill('#phone_mobile', phone);
    //
    //         await page.click('#submitAccount');
    //
    //         const currentUrl = page.url();
    //         if (currentUrl.includes('my-account')) {
    //             console.log('WARNING: Invalid phone "${phone}" was accepted');
    //         }
    //     }
    // });
    //
    // // ===== EDGE CASE TEST CASES =====
    //
    // test('TC-011: Registration with maximum length inputs', async ({ page }) => {
    //     const uniqueEmail = 'maxlength${Date.now()}@test.com';
    //     const longString = 'A'.repeat(255); // Maximum typical length
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     // Test maximum length fields
    //     await page.fill('#customer_firstname', longString.substring(0, 32));
    //     await page.fill('#customer_lastname', longString.substring(0, 32));
    //     await page.fill('#passwd', longString.substring(0, 32));
    //     await page.fill('#company', longString);
    //     await page.fill('#address1', longString);
    //     await page.fill('#address2', longString);
    //     await page.fill('#city', longString.substring(0, 64));
    //     await page.fill('#other', longString);
    //     await page.fill('#phone', longString.substring(0, 32));
    //     await page.fill('#phone_mobile', longString.substring(0, 32));
    //     await page.fill('#alias', longString.substring(0, 32));
    //
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //
    //     await page.click('#submitAccount');
    //
    //     await expect(page.locator('.page-heading')).toHaveText('My account');
    //     console.log('Maximum length inputs accepted successfully');
    // });
    //
    // test('TC-012: Registration with special characters in name fields', async ({ page }) => {
    //     const testNames = [
    //         { first: "O'Connor", last: "Smith-Jones" },
    //         { first: "Renée", last: "Müller" },
    //         { first: "José", last: "García" },
    //         { first: "Anna-Maria", last: "van den Berg" },
    //         { first: "John", last: "O'Reilly-Smith" }
    //     ];
    //
    //     for (const name of testNames) {
    //         const uniqueEmail = 'special${Date.now()}@test.com';
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //         await page.waitForSelector('#account-creation_form');
    //
    //         await page.fill('#customer_firstname', name.first);
    //         await page.fill('#customer_lastname', name.last);
    //         await page.fill('#passwd', 'Test@123456');
    //         await page.fill('#address1', '123 Test St');
    //         await page.fill('#city', 'TestCity');
    //         await page.selectOption('#id_state', '1');
    //         await page.fill('#postcode', '12345');
    //         await page.fill('#phone_mobile', '123-456-7890');
    //
    //         await page.click('#submitAccount');
    //
    //         await expect(page.locator('.page-heading')).toHaveText('My account');
    //         await expect(page.locator('.account')).toContainText(name.first);
    //
    //         // Logout for next test
    //         await page.click('a[title="Log me out"]');
    //     }
    // });
    //
    // test('TC-013: Registration with same shipping/billing address checkbox', async ({ page }) => {
    //     const uniqueEmail = 'shipping${Date.now()}@test.com';
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     // Fill basic info
    //     await page.fill('#customer_firstname', 'Shipping');
    //     await page.fill('#customer_lastname', 'Test');
    //     await page.fill('#passwd', 'Test@123456');
    //
    //     // Fill billing address
    //     await page.fill('#address1', '123 Billing St');
    //     await page.fill('#city', 'BillingCity');
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //     await page.fill('#phone_mobile', '123-456-7890');
    //
    //     // Check the "Use same address for shipping" if it exists
    //     const sameAddressCheckbox = page.locator('input[name="same_address"]');
    //     if (await sameAddressCheckbox.isVisible()) {
    //         await sameAddressCheckbox.check();
    //     }
    //
    //     await page.click('#submitAccount');
    //
    //     await expect(page.locator('.page-heading')).toHaveText('My account');
    // });
    //
    // test('TC-014: Rapid sequential registrations', async ({ page }) => {
    //     // Test system handling of rapid registrations
    //     for (let i = 1; i <= 5; i++) {
    //         const user = TestData.generateUser();
    //         const uniqueEmail = 'rapid${i}${Date.now()}@test.com';
    //
    //         console.log('Rapid registration ${i}/5 with email: ${uniqueEmail}');
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //
    //         // Handle potential timeout
    //         try {
    //             await page.waitForSelector('#account-creation_form', { timeout: 10000 });
    //         } catch (error) {
    //             console.log('Timeout on registration ${i}, continuing...');
    //             continue;
    //         }
    //
    //         await page.fill('#customer_firstname', user.firstName);
    //         await page.fill('#customer_lastname', user.lastName);
    //         await page.fill('#passwd', user.password);
    //         await page.fill('#address1', '123 Test St');
    //         await page.fill('#city', 'TestCity');
    //         await page.selectOption('#id_state', '1');
    //         await page.fill('#postcode', '12345');
    //         await page.fill('#phone_mobile', '123-456-7890');
    //
    //         await page.click('#submitAccount');
    //
    //         // Verify success
    //         const headingText = await page.locator('.page-heading').textContent();
    //         if (headingText.includes('My account')) {
    //             console.log('✓ Registration ${i} successful');
    //
    //             // Logout if not the last iteration
    //             if (i < 5) {
    //                 await page.click('a[title="Log me out"]');
    //                 await page.waitForTimeout(500); // Small delay between tests
    //             }
    //         } else {
    //             console.log('✗ Registration ${i} failed');
    //         }
    //     }
    // });
    //
    // // ===== AGE VALIDATION TEST CASES =====
    //
    // test('TC-015: Registration with exact 18 years old today', async ({ page }) => {
    //     const user = TestData.generateUser();
    //     const uniqueEmail = 'exact18${Date.now()}@test.com';
    //
    //     const today = new Date();
    //     const exact18YearsAgo = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     await page.fill('#customer_firstname', user.firstName);
    //     await page.fill('#customer_lastname', user.lastName);
    //     await page.fill('#passwd', user.password);
    //
    //     await page.selectOption('#days', exact18YearsAgo.getDate().toString());
    //     await page.selectOption('#months', (exact18YearsAgo.getMonth() + 1).toString());
    //     await page.selectOption('#years', exact18YearsAgo.getFullYear().toString());
    //
    //     await page.fill('#address1', '123 Test St');
    //     await page.fill('#city', 'TestCity');
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //     await page.fill('#phone_mobile', '123-456-7890');
    //
    //     await page.click('#submitAccount');
    //
    //     // Should accept 18-year-olds
    //     await expect(page.locator('.page-heading')).toHaveText('My account');
    // });
    //
    // test('TC-016: Registration with 17 years 364 days old', async ({ page }) => {
    //     const user = TestData.generateUser();
    //     const uniqueEmail = 'almost18${Date.now()}@test.com';
    //
    //     const today = new Date();
    //     const almost18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate() + 1);
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     await page.fill('#customer_firstname', user.firstName);
    //     await page.fill('#customer_lastname', user.lastName);
    //     await page.fill('#passwd', user.password);
    //
    //     await page.selectOption('#days', almost18.getDate().toString());
    //     await page.selectOption('#months', (almost18.getMonth() + 1).toString());
    //     await page.selectOption('#years', almost18.getFullYear().toString());
    //
    //     await page.fill('#address1', '123 Test St');
    //     await page.fill('#city', 'TestCity');
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //     await page.fill('#phone_mobile', '123-456-7890');
    //
    //     await page.click('#submitAccount');
    //
    //     // Check result - may or may not be accepted
    //     const currentUrl = page.url();
    //     if (currentUrl.includes('my-account')) {
    //         console.log('WARNING: Underage (17y 364d) registration accepted');
    //     } else {
    //         console.log('Underage (17y 364d) registration correctly rejected');
    //     }
    // });
    //
    // test('TC-017: Registration with very old age (100+ years)', async ({ page }) => {
    //     const user = TestData.generateUser();
    //     const uniqueEmail = 'centenarian${Date.now()}@test.com';
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     await page.fill('#customer_firstname', user.firstName);
    //     await page.fill('#customer_lastname', user.lastName);
    //     await page.fill('#passwd', user.password);
    //
    //     // Set age to 100 years
    //     const currentYear = new Date().getFullYear();
    //     await page.selectOption('#days', '15');
    //     await page.selectOption('#months', '6');
    //     await page.selectOption('#years', (currentYear - 100).toString());
    //
    //     await page.fill('#address1', '123 Test St');
    //     await page.fill('#city', 'TestCity');
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //     await page.fill('#phone_mobile', '123-456-7890');
    //
    //     await page.click('#submitAccount');
    //
    //     await expect(page.locator('.page-heading')).toHaveText('My account');
    //     console.log('Centenarian registration accepted');
    // });
    //
    // // ===== FORM INTERACTION TESTS =====
    //
    // test('TC-018: Form field tab order and keyboard navigation', async ({ page }) => {
    //     const uniqueEmail = 'keyboard${Date.now()}@test.com';
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     // Test tab navigation through form
    //     await page.keyboard.press('Tab'); // Should focus first gender radio
    //     await page.keyboard.press('Space'); // Select Mr.
    //
    //     await page.keyboard.press('Tab');
    //     await page.keyboard.type('Keyboard');
    //
    //     await page.keyboard.press('Tab');
    //     await page.keyboard.type('Navigator');
    //
    //     await page.keyboard.press('Tab');
    //     await page.keyboard.type(uniqueEmail);
    //
    //     await page.keyboard.press('Tab');
    //     await page.keyboard.type('Test@123456');
    //
    //     // Continue tabbing through date fields
    //     for (let i = 0; i < 3; i++) {
    //         await page.keyboard.press('Tab');
    //     }
    //
    //     // Fill required address fields
    //     await page.fill('#address1', '123 Test St');
    //     await page.fill('#city', 'TestCity');
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //     await page.fill('#phone_mobile', '123-456-7890');
    //
    //     // Submit with keyboard
    //     await page.keyboard.press('Enter');
    //
    //     await expect(page.locator('.page-heading')).toHaveText('My account');
    // });
    //
    // test('TC-019: Form reset/cancel functionality', async ({ page }) => {
    //     const uniqueEmail = 'cancel${Date.now()}@test.com';
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     // Fill some fields
    //     await page.fill('#customer_firstname', 'Test');
    //     await page.fill('#customer_lastname', 'User');
    //     await page.fill('#passwd', 'Test@123456');
    //
    //     // Look for cancel/reset button
    //     const cancelButton = page.locator('input[type="reset"], button[type="reset"], a.cancel');
    //
    //     if (await cancelButton.isVisible()) {
    //         await cancelButton.click();
    //
    //         // Verify fields are cleared
    //         await expect(page.locator('#customer_firstname')).toHaveValue('');
    //         await expect(page.locator('#customer_lastname')).toHaveValue('');
    //     } else {
    //         console.log('No cancel/reset button found on registration form');
    //     }
    // });
    //
    // test('TC-020: Back button navigation during registration', async ({ page }) => {
    //     const uniqueEmail = 'backbutton${Date.now()}@test.com';
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     // Fill some data
    //     await page.fill('#customer_firstname', 'Back');
    //     await page.fill('#customer_lastname', 'ButtonTest');
    //     await page.fill('#passwd', 'Test@123456');
    //
    //     // Click browser back button
    //     await page.goBack();
    //
    //     // Should be back at authentication page
    //     await expect(page.locator('.page-heading')).toContainText('Authentication');
    //
    //     // Email field should still have the email
    //     await expect(page.locator('#email_create')).toHaveValue(uniqueEmail);
    // });
    //
    // // ===== PERFORMANCE & LOAD TESTS =====
    //
    // test('TC-021: Registration under slow network conditions', async ({ page }) => {
    //     // Simulate slow network (if supported by your Playwright setup)
    //     const client = await page.context().newCDPSession(page);
    //     await client.send('Network.emulateNetworkConditions', {
    //         offline: false,
    //         downloadThroughput: 500 * 1024 / 8, // 500 Kbps
    //         uploadThroughput: 500 * 1024 / 8,
    //         latency: 200 // 200ms
    //     });
    //
    //     const user = TestData.generateUser();
    //     const uniqueEmail = 'slow${Date.now()}@test.com';
    //
    //     const startTime = Date.now();
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form', { timeout: 30000 });
    //
    //     await page.fill('#customer_firstname', user.firstName);
    //     await page.fill('#customer_lastname', user.lastName);
    //     await page.fill('#passwd', user.password);
    //     await page.fill('#address1', '123 Test St');
    //     await page.fill('#city', 'TestCity');
    //     await page.selectOption('#id_state', '1');
    //     await page.fill('#postcode', '12345');
    //     await page.fill('#phone_mobile', '123-456-7890');
    //
    //     await page.click('#submitAccount');
    //
    //     const endTime = Date.now();
    //     const duration = endTime - startTime;
    //
    //     await expect(page.locator('.page-heading')).toHaveText('My account');
    //     console.log('Registration completed in ${duration}ms under slow network');
    // });
    //
    // // ===== SECURITY TESTS =====
    //
    // test('TC-022: XSS injection attempt in form fields', async ({ page }) => {
    //     const xssPayloads = [
    //         '<script>alert("xss")</script>',
    //         '"><script>alert(1)</script>',
    //         'javascript:alert("XSS")',
    //         'onmouseover=alert(1)',
    //         '<img src=x onerror=alert(1)>'
    //     ];
    //
    //     for (const payload of xssPayloads) {
    //         const uniqueEmail = 'xss${Date.now()}@test.com';
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //         await page.waitForSelector('#account-creation_form');
    //
    //         // Try XSS in various fields
    //         await page.fill('#customer_firstname', payload);
    //         await page.fill('#customer_lastname', 'Test');
    //         await page.fill('#passwd', 'Test@123456');
    //         await page.fill('#address1', '123 Test St');
    //         await page.fill('#city', 'TestCity');
    //         await page.selectOption('#id_state', '1');
    //         await page.fill('#postcode', '12345');
    //         await page.fill('#phone_mobile', '123-456-7890');
    //
    //         await page.click('#submitAccount');
    //
    //         // Check if page is still functional
    //         const currentUrl = page.url();
    //         if (currentUrl.includes('my-account')) {
    //             console.log('WARNING: XSS payload "${payload.substring(0, 20)}..." accepted in first name');
    //
    //             // Verify the payload wasn't executed
    //             const pageContent = await page.content();
    //             if (!pageContent.includes(payload)) {
    //                 console.log('✓ XSS payload was sanitized');
    //             }
    //
    //             await page.click('a[title="Log me out"]');
    //         }
    //     }
    // });
    //
    // test('TC-023: SQL injection attempt in form fields', async ({ page }) => {
    //     const sqlPayloads = [
    //         "' OR '1'='1",
    //         "'; DROP TABLE users; --",
    //         "' OR 1=1--",
    //         "admin'--",
    //         "' UNION SELECT * FROM users--"
    //     ];
    //
    //     for (const payload of sqlPayloads) {
    //         const uniqueEmail = 'sql${Date.now()}@test.com';
    //
    //         await page.goto('/index.php?controller=authentication&back=my-account');
    //         await page.fill('#email_create', uniqueEmail);
    //         await page.click('#SubmitCreate');
    //         await page.waitForSelector('#account-creation_form');
    //
    //         await page.fill('#customer_firstname', 'Test');
    //         await page.fill('#customer_lastname', payload);
    //         await page.fill('#passwd', 'Test@123456');
    //         await page.fill('#address1', '123 Test St');
    //         await page.fill('#city', 'TestCity');
    //         await page.selectOption('#id_state', '1');
    //         await page.fill('#postcode', '12345');
    //         await page.fill('#phone_mobile', '123-456-7890');
    //
    //         await page.click('#submitAccount');
    //
    //         const currentUrl = page.url();
    //         if (currentUrl.includes('my-account')) {
    //             console.log('SQL payload "${payload}" did not break registration');
    //         } else if (await page.locator('.alert-danger').isVisible()) {
    //             console.log('SQL payload "${payload}" correctly rejected');
    //         }
    //     }
    // });
    //
    // // ===== DATA PERSISTENCE TESTS =====
    //
    // test('TC-024: Verify all user data is saved correctly', async ({ page }) => {
    //     const user = TestData.generateUser();
    //     const uniqueEmail = 'verifydata${Date.now()}@test.com';
    //
    //     // Test data with all fields
    //     const testData = {
    //         firstName: 'DataVerification',
    //         lastName: 'TestUser',
    //         password: 'Test@123456',
    //         dob: { day: 15, month: 6, year: 1985 },
    //         company: 'Test Company LLC',
    //         address1: '123 Verification Street',
    //         address2: 'Apt 4B',
    //         city: 'Testville',
    //         state: '1', // Alabama
    //         postcode: '35004',
    //         country: '21', // United States
    //         additionalInfo: 'Special delivery instructions here',
    //         homePhone: '205-555-0123',
    //         mobilePhone: '205-555-0124',
    //         addressAlias: 'My Work Address'
    //     };
    //
    //     await page.fill('#email_create', uniqueEmail);
    //     await page.click('#SubmitCreate');
    //     await page.waitForSelector('#account-creation_form');
    //
    //     // Fill all fields
    //     await page.check('#id_gender1');
    //     await page.fill('#customer_firstname', testData.firstName);
    //     await page.fill('#customer_lastname', testData.lastName);
    //     await page.fill('#email', uniqueEmail);
    //     await page.fill('#passwd', testData.password);
    //
    //     await page.selectOption('#days', testData.dob.day.toString());
    //     await page.selectOption('#months', testData.dob.month.toString());
    //     await page.selectOption('#years', testData.dob.year.toString());
    //
    //     await page.check('#newsletter');
    //     await page.check('#optin');
    //
    //     await page.fill('#company', testData.company);
    //     await page.fill('#address1', testData.address1);
    //     await page.fill('#address2', testData.address2);
    //     await page.fill('#city', testData.city);
    //     await page.selectOption('#id_state', testData.state);
    //     await page.fill('#postcode', testData.postcode);
    //     await page.selectOption('#id_country', testData.country);
    //     await page.fill('#other', testData.additionalInfo);
    //     await page.fill('#phone', testData.homePhone);
    //     await page.fill('#phone_mobile', testData.mobilePhone);
    //     await page.fill('#alias', testData.addressAlias);
    //
    //     await page.click('#submitAccount');
    //
    //     await expect(page.locator('.page-heading')).toHaveText('My account');
    //
    //     // Navigate to account information page
    //     await page.goto('/index.php?controller=identity');
    //
    //     // Verify all data was saved correctly
    //     await expect(page.locator('#customer_firstname')).toHaveValue(testData.firstName);
    //     await expect(page.locator('#customer_lastname')).toHaveValue(testData.lastName);
    //     await expect(page.locator('#email')).toHaveValue(uniqueEmail);
    //     await expect(page.locator('#days')).toHaveValue(testData.dob.day.toString());
    //     await expect(page.locator('#months')).toHaveValue(testData.dob.month.toString());
    //     await expect(page.locator('#years')).toHaveValue(testData.dob.year.toString());
    //     await expect(page.locator('#newsletter')).toBeChecked();
    //     await expect(page.locator('#optin')).toBeChecked();
    //
    //     // Verify address information
    //     await page.goto('/index.php?controller=addresses');
    //     await expect(page.locator('.address_address1')).toContainText(testData.address1);
    //     await expect(page.locator('.address_city')).toContainText(testData.city);
    //     await expect(page.locator('.address_phone_mobile')).toContainText(testData.mobilePhone);
    // });
    //
    // // ===== CONCURRENCY TESTS =====
    //
    // test('TC-025: Multiple browser tab registration', async ({ context }) => {
    //     // Open two tabs
    //     const page1 = await context.newPage();
    //     const page2 = await context.newPage();
    //
    //     const email1 = 'tab1${Date.now()}@test.com';
    //     const email2 = 'tab2${Date.now() + 1}@test.com';
    //
    //     // Register in first tab
    //     await page1.goto('/index.php?controller=authentication&back=my-account');
    //     await page1.fill('#email_create', email1);
    //     await page1.click('#SubmitCreate');
    //     await page1.waitForSelector('#account-creation_form');
    //     await page1.fill('#customer_firstname', 'Tab1');
    //     await page1.fill('#customer_lastname', 'User');
    //     await page1.fill('#passwd', 'Test@123456');
    //     await page1.fill('#address1', '123 Test St');
    //     await page1.fill('#city', 'TestCity');
    //     await page1.selectOption('#id_state', '1');
    //     await page1.fill('#postcode', '12345');
    //     await page1.fill('#phone_mobile', '123-456-7890');
    //
    //     // Start registration in second tab simultaneously
    //     await page2.goto('/index.php?controller=authentication&back=my-account');
    //     await page2.fill('#email_create', email2);
    //     await page2.click('#SubmitCreate');
    //     await page2.waitForSelector('#account-creation_form');
    //     await page2.fill('#customer_firstname', 'Tab2');
    //     await page2.fill('#customer_lastname', 'User');
    //     await page2.fill('#passwd', 'Test@123456');
    //     await page2.fill('#address1', '456 Test St');
    //     await page2.fill('#city', 'TestCity2');
    //     await page2.selectOption('#id_state', '2'); // Alaska
    //     await page2.fill('#postcode', '99501');
    //     await page2.fill('#phone_mobile', '907-555-0123');
    //
    //     // Submit both
    //     await page1.click('#submitAccount');
    //     await page2.click('#submitAccount');
    //
    //     // Verify both succeeded
    //     await expect(page1.locator('.page-heading')).toHaveText('My account');
    //     await expect(page2.locator('.page-heading')).toHaveText('My account');
    //
    //     await page1.close();
    //     await page2.close();
    // });
});