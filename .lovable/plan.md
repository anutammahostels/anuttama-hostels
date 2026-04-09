

## Update Return URL to Use Custom Domain

### Problem
The payment return URL currently falls back to `hostylia.lovable.app`, but your custom domain is `hostylia.com`. The redirect after HDFC payment should go to your custom domain.

### Change

**`src/pages/student/StudentInvoices.tsx`** — Update the return URL logic:
- When running in the Lovable preview (`lovableproject.com` or `lovable.app` origins), use `https://hostylia.com` as the base URL
- When running on production (custom domain), use `window.location.origin` as-is (which will already be `hostylia.com`)

The updated line will be:
```typescript
const isDevPreview = window.location.origin.includes('lovableproject.com') || window.location.origin.includes('lovable.app');
const baseUrl = isDevPreview ? 'https://hostylia.com' : window.location.origin;
// return_url: `${baseUrl}/student/payment/status`
```

No backend or database changes needed.

