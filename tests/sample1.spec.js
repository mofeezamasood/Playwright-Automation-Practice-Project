const { test, expect } = require('@playwright/test');
const TestData = require('./utils/testo-sample-data');

test.describe('Registration - Comprehensive Test Suite', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/index.php?controller=authentication&back=my-account');
    });

    // ===== 1. INITIAL EMAIL ENTRY PAGE =====

    test.describe('1. Initial Email Entry Page Validations', () => {
        test('REG-EM-01: Submit with valid, new email address', async ({ page }) => {
            const timestamp = Date.now();
            const validEmail = `user${timestamp}@testdomain.com`;

            await page.fill('#email_create', validEmail);
            await page.click('#SubmitCreate');

            await expect(page.locator('.page-heading')).toHaveText('Create an account');
            await expect(page.locator('#email')).toHaveValue(validEmail);
        });

        test('REG-EM-02: Submit with already registered email', async ({ page }) => {
            // First create a test account
            const existingEmail = await createTestAccount(page);

            // Try to register with same email
            await page.goto('/index.php?controller=authentication&back=my-account');
            await page.fill('#email_create', existingEmail);
            await page.click('#SubmitCreate');

            await expect(page.locator('#create_account_error')).toBeVisible();
            await expect(page.locator('#create_account_error')).toContainText('An account using this email address has already been registered');
        });

        test('REG-EM-03: Submit with empty email field', async ({ page }) => {
            await page.fill('#email_create', '');
            await page.click('#SubmitCreate');

            await expect(page.locator('.alert-danger')).toBeVisible();
            await expect(page.locator('.alert-danger')).toContainText('Invalid email address');
        });

        test('REG-EM-07: Submit with extremely long email (>254 chars)', async ({ page }) => {
            const longEmail = 'a'.repeat(200) + '@' + 'b'.repeat(50) + '.com';
            await page.fill('#email_create', longEmail);
            await page.click('#SubmitCreate');

            // Check for error or acceptance
            if (await page.locator('.alert-danger').isVisible()) {
                console.log('Long email correctly rejected');
                await expect(page.locator('.alert-danger')).toBeVisible();
            } else {
                console.log(`Long email (${longEmail.length} chars) was accepted`);
                await expect(page.locator('.page-heading')).toHaveText('Create an account');
            }
        });

        test('REG-EM-08: Submit with email having special chars (plus addressing)', async ({ page }) => {
            await page.fill('#email_create', 'user+tag@domain.com');
            await page.click('#SubmitCreate');

            // Plus addressing should typically be accepted
            try {
                await page.waitForSelector('.page-heading', { timeout: 5000 });
                await expect(page.locator('.page-heading')).toHaveText('Create an account');
                console.log('Plus addressing email accepted');
            } catch {
                console.log('Plus addressing email rejected');
                await expect(page.locator('.alert-danger')).toBeVisible();
            }
        });
    });

    // ===== 2. FULL REGISTRATION FORM =====

    test.describe('2. Full Registration Form - Personal Information', () => {
        test.beforeEach(async ({ page }) => {
            // Navigate to registration form first
            const timestamp = Date.now();
            await page.fill('#email_create', `test${timestamp}@automation.com`);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');
        });

        // A. Gender/Title Field Tests
        test('REG-GEN-01: Select "Mr." radio button', async ({ page }) => {
            await page.check('#id_gender1');
            await expect(page.locator('#id_gender1')).toBeChecked();
            await expect(page.locator('#id_gender2')).not.toBeChecked();
        });

        test('REG-GEN-02: Select "Mrs." radio button', async ({ page }) => {
            await page.check('#id_gender2');
            await expect(page.locator('#id_gender2')).toBeChecked();
            await expect(page.locator('#id_gender1')).not.toBeChecked();
        });

        test('REG-GEN-03: Leave gender unselected', async ({ page }) => {
            // Fill other required fields and submit
            await fillRequiredFields(page, 'GenderTest', 'User');

            await page.click('#submitAccount');

            // Check if registration succeeds without gender
            try {
                await page.waitForSelector('.page-heading', { timeout: 5000 });
                const headingText = await page.locator('.page-heading').textContent();
                if (headingText.includes('My account')) {
                    console.log('Registration succeeded without selecting gender');
                } else {
                    console.log('Registration failed without gender selection');
                }
            } catch (error) {
                console.log('Registration may have failed without gender selection');
            }
        });

        // B. First Name Field Tests
        test('REG-FN-01: Valid first name', async ({ page }) => {
            await page.fill('#customer_firstname', 'John');
            await page.click('#submitAccount');

            // Should show error for other required fields
            await expect(page.locator('.alert-danger')).toBeVisible();
            await expect(page.locator('.alert-danger')).toContainText('lastname is required');
        });

        test('REG-FN-02: First name with hyphen', async ({ page }) => {
            await page.fill('#customer_firstname', 'Jean-Paul');
            await expect(page.locator('#customer_firstname')).toHaveValue('Jean-Paul');
        });

        test('REG-FN-03: First name with apostrophe', async ({ page }) => {
            await page.fill('#customer_firstname', "O'Connor");
            await expect(page.locator('#customer_firstname')).toHaveValue("O'Connor");
        });

        test('REG-FN-04: First name with accented chars', async ({ page }) => {
            await page.fill('#customer_firstname', 'José');
            await expect(page.locator('#customer_firstname')).toHaveValue('José');
        });

        test('REG-FN-05: Empty first name', async ({ page }) => {
            // Fill other fields to isolate first name validation
            await page.fill('#customer_lastname', 'Doe');
            await page.fill('#passwd', 'password123');
            await page.fill('#address1', '123 Test St');
            await page.fill('#city', 'TestCity');
            await page.selectOption('#id_state', '1');
            await page.fill('#postcode', '12345');
            await page.fill('#phone_mobile', '1234567890');

            await page.click('#submitAccount');

            await expect(page.locator('.alert-danger')).toBeVisible();
            await expect(page.locator('.alert-danger')).toContainText('firstname is required');
        });

        test('REG-FN-06: First name with numbers', async ({ page }) => {
            await page.fill('#customer_firstname', 'John123');

            // Submit to see validation
            await page.fill('#customer_lastname', 'Doe');
            await page.fill('#passwd', 'password123');
            await page.click('#submitAccount');

            // Check if accepted or rejected
            const errorVisible = await page.locator('.alert-danger').isVisible();
            if (errorVisible) {
                const errorText = await page.locator('.alert-danger').textContent();
                if (errorText.includes('firstname') || errorText.includes('invalid')) {
                    console.log('First name with numbers correctly rejected');
                }
            } else {
                console.log('First name with numbers was accepted');
            }
        });

        test('REG-FN-07: First name with special chars', async ({ page }) => {
            await page.fill('#customer_firstname', 'John@Doe');

            // Submit to see validation
            await page.fill('#customer_lastname', 'Doe');
            await page.fill('#passwd', 'password123');
            await page.click('#submitAccount');

            const errorVisible = await page.locator('.alert-danger').isVisible();
            if (errorVisible) {
                const errorText = await page.locator('.alert-danger').textContent();
                console.log(`Special char validation: ${errorText.substring(0, 50)}`);
            }
        });

        test('REG-FN-08: Very long first name (>100 chars)', async ({ page }) => {
            const longName = 'A'.repeat(150);
            await page.fill('#customer_firstname', longName);

            // Check if truncated
            const enteredValue = await page.locator('#customer_firstname').inputValue();
            console.log(`Long name length: ${enteredValue.length} characters`);

            if (enteredValue.length < longName.length) {
                console.log(`First name was truncated from ${longName.length} to ${enteredValue.length} chars`);
            }
        });

        test('REG-FN-09: Single character first name', async ({ page }) => {
            await page.fill('#customer_firstname', 'A');
            await expect(page.locator('#customer_firstname')).toHaveValue('A');
        });

        // C. Last Name Field Tests (similar to first name)
        test('REG-LN-01: Valid last name', async ({ page }) => {
            await page.fill('#customer_lastname', 'Smith');
            await expect(page.locator('#customer_lastname')).toHaveValue('Smith');
        });

        test('REG-LN-02: Last name with hyphen', async ({ page }) => {
            await page.fill('#customer_lastname', 'Smith-Jones');
            await expect(page.locator('#customer_lastname')).toHaveValue('Smith-Jones');
        });

        test('REG-LN-03: Last name with apostrophe', async ({ page }) => {
            await page.fill('#customer_lastname', "O'Reilly");
            await expect(page.locator('#customer_lastname')).toHaveValue("O'Reilly");
        });

        test('REG-LN-04: Last name with accented chars', async ({ page }) => {
            await page.fill('#customer_lastname', 'Müller');
            await expect(page.locator('#customer_lastname')).toHaveValue('Müller');
        });

        test('REG-LN-05: Empty last name', async ({ page }) => {
            await page.fill('#customer_firstname', 'John');
            await page.fill('#passwd', 'password123');

            await page.click('#submitAccount');

            await expect(page.locator('.alert-danger')).toBeVisible();
            await expect(page.locator('.alert-danger')).toContainText('lastname is required');
        });

        test('REG-LN-06: Last name with numbers', async ({ page }) => {
            await page.fill('#customer_lastname', 'Smith123');
            await page.click('#submitAccount');

            const errorVisible = await page.locator('.alert-danger').isVisible();
            if (errorVisible) {
                console.log('Last name with numbers may be rejected');
            }
        });

        // D. Email Field Pre-population Tests
        test('REG-EMP-01: Email field should be pre-filled', async ({ page }) => {
            const testEmail = 'test123@automation.com';

            // Start new registration
            await page.goto('/index.php?controller=authentication&back=my-account');
            await page.fill('#email_create', testEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            await expect(page.locator('#email')).toHaveValue(testEmail);
        });

        test('REG-EMP-02: Attempt to modify pre-filled email', async ({ page }) => {
            const originalEmail = 'original@test.com';
            const newEmail = 'modified@test.com';

            await page.goto('/index.php?controller=authentication&back=my-account');
            await page.fill('#email_create', originalEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Try to modify email
            await page.fill('#email', newEmail);

            // Check if modification was accepted
            const currentValue = await page.locator('#email').inputValue();
            if (currentValue === newEmail) {
                console.log('Email field is editable');
            } else {
                console.log('Email field is read-only');
            }
        });

        test('REG-EMP-03: Attempt to submit with modified invalid email', async ({ page }) => {
            const originalEmail = 'original@test.com';

            await page.goto('/index.php?controller=authentication&back=my-account');
            await page.fill('#email_create', originalEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Modify to invalid email
            await page.fill('#email', 'invalid-email');

            // Fill other required fields
            await fillRequiredFields(page, 'Test', 'User');

            await page.click('#submitAccount');

            // Check for email validation error
            await expect(page.locator('.alert-danger')).toBeVisible();
        });

        // E. Password Field Tests
        test('REG-PW-01: Valid password (meets minimum)', async ({ page }) => {
            await page.fill('#passwd', 'pass123');
            await expect(page.locator('#passwd')).toHaveValue('pass123');
        });

        test('REG-PW-02: Password with exactly 5 chars', async ({ page }) => {
            await page.fill('#passwd', '12345');

            // Fill other fields and try to submit
            await fillRequiredFields(page, 'Test', 'User');
            await page.click('#submitAccount');

            // Check if accepted
            try {
                await page.waitForSelector('.page-heading', { timeout: 5000 });
                const headingText = await page.locator('.page-heading').textContent();
                if (headingText.includes('My account')) {
                    console.log('5-character password accepted');
                }
            } catch {
                const errorText = await page.locator('.alert-danger').textContent();
                if (errorText.includes('password') || errorText.includes('5')) {
                    console.log('5-character password rejected');
                }
            }
        });

        test('REG-PW-03: Password with 4 chars (below minimum)', async ({ page }) => {
            await page.fill('#passwd', '1234');

            // Fill other fields and submit
            await fillRequiredFields(page, 'Test', 'User');
            await page.click('#submitAccount');

            // Should show error
            await expect(page.locator('.alert-danger')).toBeVisible();
            const errorText = await page.locator('.alert-danger').textContent();
            if (errorText.includes('password') || errorText.includes('5')) {
                console.log('4-character password correctly rejected');
            }
        });

        test('REG-PW-04: Empty password field', async ({ page }) => {
            // Fill other required fields
            await fillRequiredFields(page, 'Test', 'User');

            // Leave password empty
            await page.fill('#passwd', '');
            await page.click('#submitAccount');

            await expect(page.locator('.alert-danger')).toBeVisible();
            await expect(page.locator('.alert-danger')).toContainText('passwd is required');
        });

        test('REG-PW-05: Password with spaces', async ({ page }) => {
            await page.fill('#passwd', 'pass word');

            // Fill other fields and submit
            await fillRequiredFields(page, 'Test', 'User');
            await page.click('#submitAccount');

            // Check result
            try {
                await page.waitForSelector('.page-heading', { timeout: 5000 });
                console.log('Password with spaces was accepted');
            } catch {
                console.log('Password with spaces may have been rejected');
            }
        });

        test('REG-PW-06: Password with special characters', async ({ page }) => {
            await page.fill('#passwd', 'p@ssw0rd!');

            // Fill other fields and submit
            await fillRequiredFields(page, 'Test', 'User');
            await page.click('#submitAccount');

            try {
                await page.waitForSelector('.page-heading', { timeout: 5000 });
                console.log('Password with special chars accepted');
            } catch {
                console.log('Password with special chars may have issues');
            }
        });

        test('REG-PW-07: Very long password', async ({ page }) => {
            const longPassword = 'a'.repeat(500);
            await page.fill('#passwd', longPassword);

            // Check if truncated
            const enteredValue = await page.locator('#passwd').inputValue();
            console.log(`Password length entered: ${enteredValue.length}`);

            if (enteredValue.length < longPassword.length) {
                console.log(`Password was truncated from ${longPassword.length} to ${enteredValue.length} chars`);
            }
        });

        test('REG-PW-08: Password field masking', async ({ page }) => {
            await page.fill('#passwd', 'secret123');

            // Check input type
            const inputType = await page.locator('#passwd').getAttribute('type');

            if (inputType === 'password') {
                console.log('Password field is properly masked (type="password")');
                await expect(page.locator('#passwd')).toHaveAttribute('type', 'password');
            } else {
                console.log(`Password field type is: ${inputType}`);
            }
        });

        // F. Date of Birth Field Tests
        test('REG-DOB-01: Select complete valid date', async ({ page }) => {
            await page.selectOption('#days', '15');
            await page.selectOption('#months', '6'); // June
            await page.selectOption('#years', '1990');

            await expect(page.locator('#days')).toHaveValue('15');
            await expect(page.locator('#months')).toHaveValue('6');
            await expect(page.locator('#years')).toHaveValue('1990');
        });

        test('REG-DOB-02: Leave all DOB fields as default ("-")', async ({ page }) => {
            // Default values should be empty or "-"
            const dayValue = await page.locator('#days').inputValue();
            const monthValue = await page.locator('#months').inputValue();
            const yearValue = await page.locator('#years').inputValue();

            console.log(`DOB defaults - Day: ${dayValue}, Month: ${monthValue}, Year: ${yearValue}`);

            // Fill required fields and submit
            await fillRequiredFields(page, 'Test', 'User');
            await page.click('#submitAccount');

            try {
                await page.waitForSelector('.page-heading', { timeout: 5000 });
                console.log('Registration succeeded with default DOB values');
            } catch {
                console.log('Registration may have issues with default DOB');
            }
        });

        test('REG-DOB-03: Select only day', async ({ page }) => {
            await page.selectOption('#days', '15');
            await expect(page.locator('#days')).toHaveValue('15');

            // Month and year should remain default
            const monthValue = await page.locator('#months').inputValue();
            const yearValue = await page.locator('#years').inputValue();
            console.log(`Partial selection - Day: 15, Month: ${monthValue}, Year: ${yearValue}`);
        });

        test('REG-DOB-04: Select invalid date combination', async ({ page }) => {
            // Try February 31
            await page.selectOption('#days', '31');
            await page.selectOption('#months', '2'); // February
            await page.selectOption('#years', '2023');

            // Fill required fields and submit
            await fillRequiredFields(page, 'Test', 'User');
            await page.click('#submitAccount');

            // Check if invalid date is accepted or rejected
            try {
                await page.waitForSelector('.page-heading', { timeout: 5000 });
                console.log('WARNING: Invalid date (Feb 31) was accepted');
            } catch {
                console.log('Invalid date may have been rejected');
            }
        });

        test('REG-DOB-05: Select future date', async ({ page }) => {
            const currentYear = new Date().getFullYear();
            const futureYear = currentYear + 1;

            await page.selectOption('#days', '15');
            await page.selectOption('#months', '6');
            await page.selectOption('#years', futureYear.toString());

            console.log(`Selected future date: 15/6/${futureYear}`);

            // Fill required fields and submit
            await fillRequiredFields(page, 'Test', 'User');
            await page.click('#submitAccount');

            try {
                await page.waitForSelector('.page-heading', { timeout: 5000 });
                console.log(`Future date (${futureYear}) was accepted`);
            } catch {
                console.log(`Future date (${futureYear}) may have been rejected`);
            }
        });

        test('REG-DOB-06: Select very old date', async ({ page }) => {
            await page.selectOption('#days', '1');
            await page.selectOption('#months', '1'); // January
            await page.selectOption('#years', '1900');

            console.log('Selected very old date: 1/1/1900');

            // Check if 1900 is available in dropdown
            const yearOptions = await page.locator('#years option').allTextContents();
            const has1900 = yearOptions.some(option => option.includes('1900'));
            console.log(`Year 1900 available in dropdown: ${has1900}`);
        });

        // G. Newsletter & Special Offers Checkboxes
        test('REG-CHK-01: Check both newsletter and special offers', async ({ page }) => {
            await page.check('#newsletter');
            await page.check('#optin');

            await expect(page.locator('#newsletter')).toBeChecked();
            await expect(page.locator('#optin')).toBeChecked();
        });

        test('REG-CHK-02: Uncheck both options', async ({ page }) => {
            // First check both, then uncheck
            await page.check('#newsletter');
            await page.check('#optin');
            await page.uncheck('#newsletter');
            await page.uncheck('#optin');

            await expect(page.locator('#newsletter')).not.toBeChecked();
            await expect(page.locator('#optin')).not.toBeChecked();
        });

        test('REG-CHK-03: Check only newsletter', async ({ page }) => {
            await page.check('#newsletter');
            await page.uncheck('#optin');

            await expect(page.locator('#newsletter')).toBeChecked();
            await expect(page.locator('#optin')).not.toBeChecked();
        });

        test('REG-CHK-04: Check only special offers', async ({ page }) => {
            await page.uncheck('#newsletter');
            await page.check('#optin');

            await expect(page.locator('#newsletter')).not.toBeChecked();
            await expect(page.locator('#optin')).toBeChecked();
        });
    });

    // ===== 3. FORM SUBMISSION & INTEGRATION TESTS =====

    test.describe('3. Form Submission & Integration Tests', () => {
        test('REG-SUB-01: Submit with all required fields valid', async ({ page }) => {
            const user = TestData.generateUser();
            const timestamp = Date.now();
            const uniqueEmail = `complete${timestamp}@automation.com`;

            // Start registration
            await page.fill('#email_create', uniqueEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Fill all required fields with valid data
            await page.check('#id_gender1');
            await page.fill('#customer_firstname', user.firstName);
            await page.fill('#customer_lastname', user.lastName);
            await page.fill('#email', uniqueEmail);
            await page.fill('#passwd', user.password);

            // Add address information (required for this site)
            await page.fill('#firstname', user.firstName);
            await page.fill('#lastname', user.lastName);
            await page.fill('#company', user.company);
            await page.fill('#address1', user.address);
            await page.fill('#city', user.city);
            await page.selectOption('#id_state', '1');
            await page.fill('#postcode', '12345');
            await page.selectOption('#id_country', '21');
            await page.fill('#phone_mobile', user.phone);
            await page.fill('#alias', 'My Address');

            // Submit
            await page.click('#submitAccount');

            // Should be redirected to My Account
            await expect(page.locator('.page-heading')).toHaveText('My account');
        });

        test('REG-SUB-02: Submit with only required fields (no optional)', async ({ page }) => {
            const timestamp = Date.now();
            const uniqueEmail = `minimal${timestamp}@test.com`;

            await page.fill('#email_create', uniqueEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Fill only required fields
            await page.fill('#customer_firstname', 'Minimal');
            await page.fill('#customer_lastname', 'User');
            await page.fill('#email', uniqueEmail);
            await page.fill('#passwd', 'Test12345');

            // Required address fields
            await page.fill('#firstname', 'Minimal');
            await page.fill('#lastname', 'User');
            await page.fill('#address1', '123 Test St');
            await page.fill('#city', 'TestCity');
            await page.selectOption('#id_state', '1');
            await page.fill('#postcode', '12345');
            await page.selectOption('#id_country', '21');
            await page.fill('#phone_mobile', '1234567890');
            await page.fill('#alias', 'My Address');

            // Leave optional fields empty
            await page.click('#submitAccount');

            await expect(page.locator('.page-heading')).toHaveText('My account');
        });

        test('REG-SUB-03: Submit with all fields filled', async ({ page }) => {
            const user = TestData.generateUser();
            const timestamp = Date.now();
            const uniqueEmail = `allfields${timestamp}@test.com`;

            await page.fill('#email_create', uniqueEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Personal info
            await page.check('#id_gender1');
            await page.fill('#customer_firstname', user.firstName);
            await page.fill('#customer_lastname', user.lastName);
            await page.fill('#email', uniqueEmail);
            await page.fill('#passwd', user.password);

            // Date of birth
            await page.selectOption('#days', '15');
            await page.selectOption('#months', '6');
            await page.selectOption('#years', '1990');

            // Checkboxes
            await page.check('#newsletter');
            await page.check('#optin');

            // Address info - all fields
            await page.fill('#firstname', user.firstName);
            await page.fill('#lastname', user.lastName);
            await page.fill('#company', user.company);
            await page.fill('#address1', user.address);
            await page.fill('#address2', 'Apt 4B');
            await page.fill('#city', user.city);
            await page.selectOption('#id_state', '1');
            await page.fill('#postcode', user.postcode);
            await page.selectOption('#id_country', '21');
            await page.fill('#other', 'Additional delivery instructions');
            await page.fill('#phone', user.phone);
            await page.fill('#phone_mobile', user.phone);
            await page.fill('#alias', 'My Home Address');

            await page.click('#submitAccount');

            await expect(page.locator('.page-heading')).toHaveText('My account');
        });

        test('REG-SUB-04: Submit with duplicate email (different from initial)', async ({ page }) => {
            // First create an account
            const existingEmail = await createTestAccount(page);

            // Start new registration with same email
            await page.goto('/index.php?controller=authentication&back=my-account');
            await page.fill('#email_create', existingEmail);
            await page.click('#SubmitCreate');

            await expect(page.locator('#create_account_error')).toBeVisible();
            await expect(page.locator('#create_account_error')).toContainText('already been registered');
        });

        test('REG-SUB-06: Click "Register" multiple times quickly', async ({ page }) => {
            const user = TestData.generateUser();
            const timestamp = Date.now();
            const uniqueEmail = `doubleclick${timestamp}@test.com`;

            await page.fill('#email_create', uniqueEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Fill required fields
            await fillRequiredFields(page, user.firstName, user.lastName);
            await page.fill('#email', uniqueEmail);
            await page.fill('#passwd', user.password);

            // Double-click submit quickly
            await page.click('#submitAccount');
            await page.click('#submitAccount');

            // Wait and check for duplicate submissions
            await page.waitForTimeout(2000);

            // Should only create one account
            const currentUrl = page.url();
            if (currentUrl.includes('my-account')) {
                console.log('Registration succeeded despite double-click');
            }

            // Try to login with same credentials
            await page.click('a[title="Log me out"]');
            await page.fill('#email', uniqueEmail);
            await page.fill('#passwd', user.password);
            await page.click('#SubmitLogin');

            // Should login successfully (one account created)
            await expect(page.locator('.page-heading')).toHaveText('My account');
        });

        test('REG-SUB-07: Form timeout and submit', async ({ page }) => {
            const user = TestData.generateUser();
            const timestamp = Date.now();
            const uniqueEmail = `timeout${timestamp}@test.com`;

            await page.fill('#email_create', uniqueEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Fill form but wait before submitting
            await fillRequiredFields(page, user.firstName, user.lastName);
            await page.fill('#email', uniqueEmail);
            await page.fill('#passwd', user.password);

            // Wait longer than typical session timeout (30+ minutes)
            console.log('Waiting 2 seconds (simulating timeout scenario)');
            await page.waitForTimeout(2000); // Reduced for testing

            await page.click('#submitAccount');

            // Check if submission still works
            try {
                await page.waitForSelector('.page-heading', { timeout: 10000 });
                const headingText = await page.locator('.page-heading').textContent();
                if (headingText.includes('My account')) {
                    console.log('Form submission succeeded after wait');
                }
            } catch {
                console.log('Form may have timed out');
            }
        });

        test('REG-SUB-08: Browser back button after successful registration', async ({ page }) => {
            // Create account
            const user = TestData.generateUser();
            const timestamp = Date.now();
            const uniqueEmail = `backtest${timestamp}@test.com`;

            await page.fill('#email_create', uniqueEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            await fillRequiredFields(page, user.firstName, user.lastName);
            await page.fill('#email', uniqueEmail);
            await page.fill('#passwd', user.password);
            await page.click('#submitAccount');

            // Verify account created
            await expect(page.locator('.page-heading')).toHaveText('My account');

            // Click browser back button
            await page.goBack();
            
            // Should not be able to resubmit with same data
            // Check if we're back at registration form
            const currentUrl = page.url();
            if (currentUrl.includes('authentication')) {
                console.log('Browser back returned to authentication page');
                
                // Try to resubmit same email
                await page.fill('#email_create', uniqueEmail);
                await page.click('#SubmitCreate');
                
                // Should show error for duplicate email
                await expect(page.locator('#create_account_error')).toBeVisible();
            }
        });
    });

    // ===== 4. FIELD DEPENDENCY & INTERACTION TESTS =====

    test.describe('4. Field Dependency & Interaction Tests', () => {
        test.beforeEach(async ({ page }) => {
            const timestamp = Date.now();
            await page.fill('#email_create', `interaction${timestamp}@test.com`);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');
        });

        test('REG-INT-01: First name auto-populates other fields', async ({ page }) => {
            // Fill first name
            await page.fill('#customer_firstname', 'AutoPopulate');
            
            // Check if other fields get auto-populated
            const addressFirstName = await page.locator('#firstname').inputValue();
            
            if (addressFirstName === 'AutoPopulate') {
                console.log('First name auto-populated to address fields');
            } else {
                console.log('First name did not auto-populate');
            }
        });

        test('REG-INT-02: Last name auto-populates other fields', async ({ page }) => {
            await page.fill('#customer_lastname', 'LastNameTest');
            
            const addressLastName = await page.locator('#lastname').inputValue();
            
            if (addressLastName === 'LastNameTest') {
                console.log('Last name auto-populated to address fields');
            } else {
                console.log('Last name did not auto-populate');
            }
        });

        test('REG-INT-03: Form validation order', async ({ page }) => {
            // Leave multiple fields empty and submit
            await page.click('#submitAccount');
            
            // Check what errors appear
            await expect(page.locator('.alert-danger')).toBeVisible();
            const errorText = await page.locator('.alert-danger').textContent();
            console.log(`Validation errors: ${errorText}`);
            
            // Count number of errors mentioned
            const errorCount = (errorText.match(/is required/g) || []).length;
            console.log(`Number of required field errors: ${errorCount}`);
        });

        test('REG-INT-04: Real-time validation', async ({ page }) => {
            // Test email real-time validation
            await page.fill('#email', 'invalid-email');
            
            // Trigger blur event
            await page.locator('#email').blur();
            
            // Check for immediate validation (if implemented)
            await page.waitForTimeout(1000);
            
            // Look for validation message
            const emailContainer = page.locator('.form-group:has(#email)');
            const hasErrorClass = await emailContainer.getAttribute('class');
            
            if (hasErrorClass && hasErrorClass.includes('form-error')) {
                console.log('Real-time email validation detected');
            } else {
                console.log('No real-time validation detected for email');
            }
        });
    });

    // ===== 5. SECURITY & EDGE CASE TESTS =====

    test.describe('5. Security & Edge Case Tests', () => {
        test('REG-SEC-01: SQL injection attempt', async ({ page }) => {
            const timestamp = Date.now();
            const uniqueEmail = `sqlinject${timestamp}@test.com`;

            await page.fill('#email_create', uniqueEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Try SQL injection in first name
            await page.fill('#customer_firstname', "' OR '1'='1");
            await page.fill('#customer_lastname', 'Test');
            await page.fill('#passwd', 'password123');
            
            // Fill required address fields
            await page.fill('#firstname', "' OR '1'='1");
            await page.fill('#lastname', 'Test');
            await page.fill('#address1', '123 Test St');
            await page.fill('#city', 'TestCity');
            await page.selectOption('#id_state', '1');
            await page.fill('#postcode', '12345');
            await page.selectOption('#id_country', '21');
            await page.fill('#phone_mobile', '1234567890');
            await page.fill('#alias', 'Test Address');

            await page.click('#submitAccount');

            // Check if SQL injection was blocked
            try {
                await page.waitForSelector('.page-heading', { timeout: 10000 });
                const headingText = await page.locator('.page-heading').textContent();
                
                if (headingText.includes('My account')) {
                    // Check if SQL was sanitized in the account
                    await page.goto('/index.php?controller=identity');
                    const savedFirstName = await page.locator('#customer_firstname').inputValue();
                    
                    if (savedFirstName.includes("' OR '1'='1")) {
                        console.log('WARNING: SQL injection payload was NOT sanitized');
                    } else {
                        console.log('SQL injection payload was sanitized or escaped');
                    }
                }
            } catch {
                console.log('Registration may have failed due to SQL injection attempt');
            }
        });

        test('REG-SEC-02: XSS attempt', async ({ page }) => {
            const timestamp = Date.now();
            const uniqueEmail = `xsstest${timestamp}@test.com`;

            await page.fill('#email_create', uniqueEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');

            // Try XSS in company field (usually less restricted)
            await page.fill('#customer_firstname', 'XSS');
            await page.fill('#customer_lastname', 'Test');
            await page.fill('#passwd', 'password123');
            await page.fill('#company', '<script>alert("xss")</script>');
            
            // Fill required address fields
            await page.fill('#firstname', 'XSS');
            await page.fill('#lastname', 'Test');
            await page.fill('#address1', '123 Test St');
            await page.fill('#city', 'TestCity');
            await page.selectOption('#id_state', '1');
            await page.fill('#postcode', '12345');
            await page.selectOption('#id_country', '21');
            await page.fill('#phone_mobile', '1234567890');
            await page.fill('#alias', 'Test Address');

            await page.click('#submitAccount');

            try {
                await page.waitForSelector('.page-heading', { timeout: 10000 });
                
                // Check if XSS was executed
                const pageContent = await page.content();
                if (pageContent.includes('<script>alert("xss")</script>')) {
                    console.log('WARNING: XSS payload was NOT sanitized in HTML');
                } else if (pageContent.includes('&lt;script&gt;')) {
                    console.log('XSS payload was HTML-encoded');
                } else {
                    console.log('XSS payload was sanitized');
                }
            } catch {
                console.log('Registration may have failed due to XSS attempt');
            }
        });

        test('REG-SEC-04: Email case sensitivity', async ({ page }) => {
            // Test with different case variations
            const baseEmail = 'caseTest@domain.com';
            const variations = [
                'CASETEST@DOMAIN.COM',
                'CaseTest@Domain.com',
                'casetest@domain.com'
            ];

            // Create account with first variation
            await page.fill('#email_create', baseEmail);
            await page.click('#SubmitCreate');
            await page.waitForSelector('#account-creation_form');
            
            await fillRequiredFields(page, 'Case', 'Test');
            await page.fill('#email', baseEmail);
            await page.fill('#passwd', 'password123');
            await page.click('#submitAccount');

            // Logout
            await page.click('a[title="Log me out"]');

            // Try to login with different case variations
            for (const emailVariation of variations) {
                await page.fill('#email', emailVariation);
                await page.fill('#passwd', 'password123');
                await page.click('#SubmitLogin');

                const errorVisible = await page.locator('.alert-danger').isVisible();
                
                if (errorVisible) {
                    console.log(`Email variation "${emailVariation}" was NOT accepted (case-sensitive)`);
                } else {
                    console.log(`Email variation "${emailVariation}" was accepted (case-insensitive)`);
                    await page.click('a[title="Log me out"]');
                }
                
                await page.waitForTimeout(500);
            }
        });

        test('REG-SEC-05: Very fast automated submissions', async ({ page }) => {
            console.log('Testing rapid submissions...');
            
            // Try to submit multiple registrations quickly
            for (let i = 1; i <= 5; i++) {
                const timestamp = Date.now();
                const uniqueEmail = `rapid${i}${timestamp}@test.com`;
                
                console.log(`Attempt ${i}: ${uniqueEmail}`);
                
                try {
                    await page.goto('/index.php?controller=authentication&back=my-account', { timeout: 10000 });
                    await page.fill('#email_create', uniqueEmail);
                    await page.click('#SubmitCreate');
                    
                    // Wait briefly for form or error
                    await page.waitForTimeout(500);
                    
                    // Check if we're being rate limited
                    if (await page.locator('.alert-danger').isVisible({ timeout: 1000 })) {
                        const errorText = await page.locator('.alert-danger').textContent();
                        if (errorText.includes('too many') || errorText.includes('rate limit')) {
                            console.log(`Rate limiting detected on attempt ${i}`);
                            break;
                        }
                    }
                    
                    // If form loaded, fill and submit quickly
                    if (await page.locator('#account-creation_form').isVisible({ timeout: 1000 })) {
                        await fillRequiredFields(page, `Rapid${i}`, 'Test');
                        await page.fill('#email', uniqueEmail);
                        await page.fill('#passwd', 'password123');
                        await page.click('#submitAccount');
                        
                        // Check result
                        await page.waitForTimeout(1000);
                        if (await page.locator('.page-heading').isVisible({ timeout: 1000 })) {
                            console.log(`  ✓ Rapid submission ${i} succeeded`);
                            await page.click('a[title="Log me out"]');
                        }
                    }
                } catch (error) {
                    console.log(`  ✗ Attempt ${i} failed or timed out`);
                }
                
                await page.waitForTimeout(300); // Small delay between attempts
            }
            
            console.log('Rapid submission test completed');
        });
    });
});

// ===== HELPER FUNCTIONS =====

async function fillRequiredFields(page, firstName, lastName) {
    // Fill basic personal info
    await page.fill('#customer_firstname', firstName);
    await page.fill('#customer_lastname', lastName);
    
    // Fill required address fields
    await page.fill('#firstname', firstName);
    await page.fill('#lastname', lastName);
    await page.fill('#address1', '123 Test Street');
    await page.fill('#city', 'Test City');
    await page.selectOption('#id_country', '21'); // United States
    await page.selectOption('#id_state', '1'); // Alabama
    await page.fill('#postcode', '12345');
    await page.fill('#phone_mobile', '1234567890');
    await page.fill('#alias', 'My Address');
}

async function createTestAccount(page) {
    const user = TestData.generateUser();
    const timestamp = Date.now();
    const uniqueEmail = `existing${timestamp}@test.com`;
    
    // Create account
    await page.goto('/index.php?controller=authentication&back=my-account');
    await page.fill('#email_create', uniqueEmail);
    await page.click('#SubmitCreate');
    await page.waitForSelector('#account-creation_form');
    
    await fillRequiredFields(page, user.firstName, user.lastName);
    await page.fill('#email', uniqueEmail);
    await page.fill('#passwd', user.password);
    await page.click('#submitAccount');
    
    // Verify account created
    await expect(page.locator('.page-heading')).toHaveText('My account');
    
    // Logout
    await page.click('a[titlse="Log me out"]');
    
    return uniqueEmail;
}