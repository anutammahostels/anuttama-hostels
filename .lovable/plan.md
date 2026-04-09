

## Fix Payment Callback 404 After HDFC Redirect

### Problem
After completing payment on the HDFC gateway, the browser redirects back to `https://43447d81-cefd-4f73-a479-52ab24d2f9c2.lovableproject.com/payment/callback`. This returns a 404 because the Lovable dev server sandbox may be idle when the external redirect arrives, and the static fallback doesn't find the path.

The route `/payment/callback` is correctly defined in `App.tsx` and `PaymentCallback.tsx` exists. This is a preview-environment limitation, not a code bug. On the **published** site (`hostylia.lovable.app`), SPA fallback handles this automatically.

### Fix
Update `StudentInvoices.tsx` to use the **published URL** as the return URL when running in the Lovable preview, so the callback always hits the published site where SPA routing works reliably. Alternatively, use the preview URL format (`id-preview--*.lovable.app`) which also has SPA fallback.

### Changes

**1. Update `src/pages/student/StudentInvoices.tsx`**
- Change the `return_url` construction to prefer the published domain when the current origin is the `.lovableproject.com` dev server
- Logic: if `window.location.origin` contains `lovableproject.com`, use the published URL `https://hostylia.lovable.app/payment/callback` instead
- For production deployments (custom domain), `window.location.origin` will be correct as-is

**2. No backend or database changes needed**

### Technical Detail
The `.lovableproject.com` origin is the live dev-server preview. When the browser navigates away (to HDFC) and comes back, the sandbox may not respond instantly, causing a 404. The `.lovable.app` published URL and `id-preview--*.lovable.app` URLs have built-in SPA fallback at the infrastructure level.

