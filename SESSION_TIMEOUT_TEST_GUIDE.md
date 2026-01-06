# LOGIN-POS-012: Session Timeout Test - Quick Testing Guide

## Problem
The original test waited 30 minutes in real time using `await page.waitForTimeout(1800000)`, which is impractical for automated testing.

## Solution
The updated test now simulates session timeout **instantly** without waiting. Instead of waiting for the actual timeout, we simulate an expired session and verify the application's response.

## Three Approaches Available

### ✅ Approach 1: Remove Session Cookie (RECOMMENDED - Default)
**Currently Active in the test**

```javascript
const sessionCookie = cookies.find(c =>
    c.name.includes('session') || c.name.includes('PHPSESSID') || c.name.includes('sid')
);

if (sessionCookie) {
    await page.context().clearCookies({ name: sessionCookie.name });
}
```

**Best for:** Server-side session management
- Simulates what happens when a session cookie is deleted/expired
- Works instantly (no waiting)
- Tests if the server properly validates session cookies
- Recommended if your app uses traditional HTTP cookies for sessions

---

### 🔄 Approach 2: Set Cookie Expiration to Past
**Alternative - Commented out in the test**

```javascript
if (sessionCookie) {
    await page.context().addCookies([{
        ...sessionCookie,
        expires: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
    }]);
}
```

**Best for:** Browsers that respect cookie expiration
- Sets the cookie's expiration date to the past
- Browser treats it as expired
- Works instantly (no waiting)
- More realistic simulation of natural timeout

**To use this approach:**
1. Comment out Approach 1 (lines 305-310)
2. Uncomment Approach 2 (lines 312-320)

---

### 💾 Approach 3: Clear Client-Side Storage
**Alternative - Commented out in the test**

```javascript
await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    localStorage.removeItem('session');
});
```

**Best for:** Modern SPA applications with JWT/token-based auth
- Clears session storage and localStorage
- Simulates client-side token/session loss
- Works instantly (no waiting)
- Ideal for React, Angular, Vue apps with local storage tokens

**To use this approach:**
1. Comment out Approach 1 (lines 305-310)
2. Uncomment Approach 3 (lines 323-330)

---

## Running the Test

### Run just this test:
```bash
npx playwright test tests/login.spec.js -g "LOGIN-POS-012"
```

### Run with detailed output:
```bash
npx playwright test tests/login.spec.js -g "LOGIN-POS-012" --reporter=list
```

### Run in debug mode:
```bash
npx playwright test tests/login.spec.js -g "LOGIN-POS-012" --debug
```

---

## Expected Test Results

### ✅ Session properly expired - Test Passes
One of these conditions should be true:

1. **Redirected to login page**
   - User attempts to access `/index.php?controller=history`
   - Application redirects to `/index.php?controller=authentication`
   - Login page is displayed

2. **Alert message shown**
   - Application displays alert with keywords: "session", "expired", "timeout", or "logged out"
   - User remains informed of why they're logged out

### ⚠️ Session NOT properly validated - Test Warns
If the user:
- Still has access to protected pages after session expiration
- Application doesn't enforce session validation
- No redirect or alert is shown

---

## How to Choose the Right Approach

| Approach | Use When | Session Type |
|----------|----------|--------------|
| **Approach 1** (Remove Cookie) | Server manages session | PHP Sessions, Session Cookies |
| **Approach 2** (Expire Cookie) | Browser respects expiration | Standard HTTP Cookies |
| **Approach 3** (Clear Storage) | Client stores auth token | JWT, OAuth, Token-based |

**Unsure?** Start with **Approach 1** (default) - it works for most web applications.

---

## Execution Time

- **Original test:** ~30 minutes (waiting for real timeout)
- **Updated test:** ~2-5 seconds (instant session simulation)

**Time saved:** ~99.7% faster! ⚡

---

## Troubleshooting

### Test still fails?
1. Check that the session cookie exists: Look for `PHPSESSID`, `session_id`, or `sid` cookies
2. Verify your app has a protected route: `/index.php?controller=history` should require login
3. Check the console logs for detailed output messages

### Try a different approach:
- If Approach 1 doesn't work → Try Approach 2
- If Approach 2 doesn't work → Try Approach 3
- If none work → Your app may not implement proper session timeout

### Debug the session:
```javascript
// Add this before clearing cookies
const cookies = await page.context().cookies();
console.log('All cookies:', cookies);
console.log('Session cookie:', sessionCookie);
```

---

## Additional Notes

- All three approaches skip the actual 30-minute wait
- The test validates that the application responds correctly to expired sessions
- No changes needed to the application being tested
- The test is now suitable for CI/CD pipelines and quick feedback

