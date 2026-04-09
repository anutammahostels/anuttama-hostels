

## Plan: Fix HDFC SmartGateway — PEM Key Handling & End-to-End Test

### Root Cause

The edge function crashes at boot time (before handling any request) because Deno's `node:crypto` `createPrivateKey()` does not support PKCS#1 format (`BEGIN RSA PRIVATE KEY`). Your private key is PKCS#1, but the function needs PKCS#8 (`BEGIN PRIVATE KEY`).

### What Gets Fixed

**1. Update secrets with the freshly uploaded keys**

- Re-set `HDFC_PRIVATE_KEY` with the content of `privateKey-2.pem`
- Re-set `HDFC_PUBLIC_KEY` with the content of `key_385b0968089c4138983d281b33c0676c-2.pem`
- Verify `HDFC_MERCHANT_ID` = `SG4845`, `HDFC_KEY_UUID` = `key_385b0968089c4138983d281b33c0676c`, `HDFC_CLIENT_ID` = `hdfcmaster`

**2. Rewrite `hdfc-create-order/index.ts` — replace `node:crypto` with Web Crypto API**

Remove all `node:crypto` imports (`createPrivateKey`, `createPublicKey`, `createSign`, `publicEncrypt`, `createCipheriv`, etc.). Replace with Deno-native Web Crypto API:

- **PKCS#1 → PKCS#8 conversion**: Add an in-code wrapper that prepends the PKCS#8 ASN.1 header to the raw PKCS#1 key bytes so `crypto.subtle.importKey("pkcs8", ...)` works
- **JWS signing**: Use `crypto.subtle.sign("RSASSA-PKCS1-v1_5", ...)` instead of `createSign`
- **JWE encryption (CEK wrapping)**: Use `crypto.subtle.encrypt("RSA-OAEP", bankPublicKey, cek)` instead of `publicEncrypt`
- **AES-256-GCM encryption**: Use `crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData }, aesKey, plaintext)` — this returns ciphertext+tag concatenated (last 16 bytes = tag)
- **JWE decryption** (for gateway response): Use `crypto.subtle.decrypt("RSA-OAEP", merchantKey, encryptedKey)` + `crypto.subtle.decrypt("AES-GCM", ...)`
- **Lazy key import**: Import keys inside the request handler (not at module top level) so a bad key doesn't crash the entire function at boot

**3. Deploy and test end-to-end**

- Deploy `hdfc-create-order` and `hdfc-payment-callback`
- Call `hdfc-create-order` with a test invoice to verify the HDFC `/v4/session` call succeeds and returns a payment URL
- Verify the student "Pay Online" flow redirects correctly

### Files Changed

| File | Action |
|---|---|
| `supabase/functions/hdfc-create-order/index.ts` | Rewrite — replace `node:crypto` with Web Crypto API |

### Technical Detail: PKCS#1 → PKCS#8 Wrapping

```text
PKCS#8 = SEQUENCE {
  INTEGER 0,
  SEQUENCE { OID rsaEncryption, NULL },
  OCTET STRING { <raw PKCS#1 DER bytes> }
}
```

This is a well-known 26-byte ASN.1 prefix prepended to the PKCS#1 DER, then re-encoded. No external libraries needed.

