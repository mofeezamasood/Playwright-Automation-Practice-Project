// const { faker } = require('@faker-js/faker');
//
// class TestData {
//     static generateUser() {
//         return {
//             firstName: faker.person.firstName(),
//             lastName: faker.person.lastName(),
//             email: faker.internet.email(),
//             password: 'Test@123456',
//             dob: {
//                 day: Math.floor(Math.random() * 28) + 1,
//                 month: Math.floor(Math.random() * 12) + 1,
//                 year: Math.floor(Math.random() * 30) + 1970
//             },
//             company: faker.company.name(),
//             address: faker.location.streetAddress(),
//             city: faker.location.city(),
//             state: faker.location.state(),
//             postcode: faker.location.zipCode(),
//             phone: faker.phone.number()
//         };
//     }
//
//     static generateWeakPasswords() {
//         return [
//             '123456',
//             'password',
//             'abc123',
//             'qwerty',
//             'letmein',
//             'admin',
//             'welcome',
//             'monkey',
//             '123456789',
//             'password1'
//         ];
//     }
//
//     static generateStrongPasswords() {
//         return [
//             'Str0ngP@ssw0rd!',
//             'C0mpl3x#P@ss2024',
//             'My$3cur3P@ss!',
//             'P@ssw0rdW1thSymb0ls',
//             'V3ry$tr0ngP@ss123'
//         ];
//     }
//
//     static generateInvalidEmails() {
//         return [
//             'invalid-email',
//             'test@',
//             '@test.com',
//             'test@test',
//             'test test@test.com',
//             'test@test..com',
//             'test@.com',
//             '.test@test.com',
//             'test@test.c',
//             'test@test.123'
//         ];
//     }
//
//     static generateSpecialCharacterNames() {
//         return [
//             { first: "O'Connor", last: "Smith-Jones" },
//             { first: "Renée", last: "Müller" },
//             { first: "José", last: "García" },
//             { first: "Anna-Maria", last: "van den Berg" },
//             { first: "John", last: "O'Reilly-Smith" },
//             { first: "Björn", last: "Andrén" },
//             { first: "Chloë", last: "Moretz-Éclair" },
//             { first: "Héctor", last: "Sánchez-López" }
//         ];
//     }
//
//     static generateXSSPayloads() {
//         return [
//             '<script>alert("xss")</script>',
//             '"><script>alert(1)</script>',
//             'javascript:alert("XSS")',
//             'onmouseover=alert(1)',
//             '<img src=x onerror=alert(1)>',
//             '<svg onload=alert(1)>',
//             '<body onload=alert(1)>',
//             '<iframe src=javascript:alert(1)>'
//         ];
//     }
//
//     static generateSQLInjectionPayloads() {
//         return [
//             "' OR '1'='1",
//             "'; DROP TABLE users; --",
//             "' OR 1=1--",
//             "admin'--",
//             "' UNION SELECT * FROM users--",
//             "' OR 'a'='a",
//             "') OR ('1'='1",
//             "' OR EXISTS(SELECT * FROM users)--"
//         ];
//     }
//
//     static getAgeTestDates() {
//         const currentYear = new Date().getFullYear();
//         return {
//             exactly18: { day: 15, month: 6, year: currentYear - 18 },
//             almost18: { day: 16, month: 6, year: currentYear - 18 }, // 17 years 364 days
//             exactly21: { day: 15, month: 6, year: currentYear - 21 },
//             over100: { day: 15, month: 6, year: currentYear - 100 },
//             under13: { day: 15, month: 6, year: currentYear - 12 }
//         };
//     }
//
//     // Rest of your existing methods...
// }
//
// class DateHelpers {
//     static async selectDateOfBirth(page, day, month, year) {
//         if (day) await page.selectOption('#days', day.toString());
//         if (month) await page.selectOption('#months', month.toString());
//         if (year) await page.selectOption('#years', year.toString());
//
//         const selectedDay = await page.locator('#days').inputValue();
//         const selectedMonth = await page.locator('#months').inputValue();
//         const selectedYear = await page.locator('#years').inputValue();
//
//         return { day: selectedDay, month: selectedMonth, year: selectedYear };
//     }
//
//     static getRandomDOB(minAge = 18, maxAge = 65) {
//         const currentYear = new Date().getFullYear();
//         const year = currentYear - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
//         const month = Math.floor(Math.random() * 12) + 1;
//         const day = Math.floor(Math.random() * 28) + 1;
//         return { day, month, year };
//     }
//
//     static getFormattedDate(day, month, year) {
//         const date = new Date(year, month - 1, day);
//         return date.toLocaleDateString('en-US', {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric'
//         });
//     }
// }
//
// module.exports = TestData;