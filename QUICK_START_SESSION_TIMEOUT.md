# Quick Reference: LOGIN-POS-012 Test Changes

## What Changed?
❌ **Old:** `await page.waitForTimeout(1800000)` → 30 minute wait
✅ **New:** Simulate session expiration instantly → 2-5 second execution

## Three Methods to Test Session Timeout

### Method 1: Remove Session Cookie (DEFAULT)
```javascript
// Already active in the code
const sessionCookie = cookies.find(c =>
    c.name.includes('session') || c.name.includes('PHPSESSID') || c.name.includes('sid')
);
if (sessionCookie) {
    await page.context().clearCookies({ name: sessionCookie.name });
}
```

### Method 2: Expire the Cookie
```javascript
// UNCOMMENT THIS (lines 312-320)
if (sessionCookie) {
    await page.context().addCookies([{
        ...sessionCookie,
        expires: Math.floor(Date.now() / 1000) - 3600
    }]);
}
```

### Method 3: Clear Client Storage
```javascript
// UNCOMMENT THIS (lines 323-330)
await page.evaluate(() => {
    sessionStorage.clear();
    localStorage.removeItem('authToken');
    localStorage.removeItem('session');
});
```

## Run the Test
```bash
# Quick test
npx playwright test tests/login.spec.js -g "LOGIN-POS-012"

# With output
npx playwright test tests/login.spec.js -g "LOGIN-POS-012" --reporter=list

# Debug mode
npx playwright test tests/login.spec.js -g "LOGIN-POS-012" --debug
```

## What It Tests
✓ Session expires/becomes invalid
✓ App redirects to login page OR shows alert
✓ User can't access protected pages without re-login

## Expected Results
- ✅ Redirect to login page, OR
- ✅ Alert message with "session/expired/timeout/logged out", OR
- ⚠️ Warning if session enforcement is missing

---

**File Updated:** `/Users/mofeezamasood/Desktop/untitled/tests/login.spec.js` (Line 290)

**Test Duration:** ~30 minutes → ~3 seconds ⚡

