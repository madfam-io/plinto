# MFA API Mapping - Documentation to Implementation

**Purpose**: Map documented MFA API calls to actual SDK implementation  
**Date**: November 14, 2025  
**Status**: Reference for MFA guide rewrite

---

## API Namespace Change

**DOCUMENTED** (WRONG):
```typescript
janua.auth.mfa.*  // Nested namespace - DOES NOT EXIST
```

**ACTUAL** (CORRECT):
```typescript
janua.auth.*  // Flat namespace - ALL MFA methods are directly on auth
```

---

## Method Mapping Table

| Documented Method | Actual Method | Parameter Changes | Notes |
|-------------------|---------------|-------------------|-------|
| `janua.auth.mfa.setup()` | `janua.auth.enableMFA()` | method param required | Renamed: setup → enableMFA |
| `janua.auth.mfa.verify()` | `janua.auth.verifyMFA()` | code param required | Renamed: verify → verifyMFA |
| `janua.auth.mfa.getStatus()` | `janua.auth.getMFAStatus()` | No userId param | No parameters needed |
| `janua.auth.mfa.disable()` | `janua.auth.disableMFA()` | password param required | No confirmationCode |
| `janua.auth.mfa.generateBackupCodes()` | `janua.auth.regenerateMFABackupCodes()` | password param required | Renamed: generate → regenerate |
| `janua.auth.mfa.challenge()` | NOT EXISTS | - | Remove from documentation |
| `janua.auth.mfa.verifySetup()` | USE `verifyMFA()` | - | Combined into verifyMFA |
| `janua.auth.mfa.requestNewCode()` | NOT EXISTS | - | Remove from documentation |
| `janua.auth.mfa.webauthn.*` | USE passkey methods | See below | Wrong namespace |

---

## Detailed Method Replacements

### 1. Setup/Enable MFA

**DOCUMENTED**:
```typescript
const mfaSetup = await janua.auth.mfa.setup({
  userId: user.id,
  method: 'totp',
  phoneNumber: '+1234567890',  // For SMS
  label: 'My Account'
});
```

**ACTUAL**:
```typescript
const mfaSetup = await janua.auth.enableMFA('totp');
// Returns: { qr_code, secret, backup_codes }
// No userId needed (uses authenticated user)
// No phoneNumber support yet
// No label parameter
```

### 2. Verify MFA Code

**DOCUMENTED**:
```typescript
const result = await janua.auth.mfa.verify({
  sessionId: session.id,
  method: 'totp',
  code: '123456'
});
```

**ACTUAL**:
```typescript
const result = await janua.auth.verifyMFA({
  code: '123456'
});
// Returns: AuthResponse with tokens
// No sessionId needed
// No method parameter (inferred from setup)
```

### 3. Get MFA Status

**DOCUMENTED**:
```typescript
const status = await janua.auth.mfa.getStatus({
  userId: user.id
});
```

**ACTUAL**:
```typescript
const status = await janua.auth.getMFAStatus();
// No parameters needed (uses authenticated user)
// Returns: { enabled, method, backup_codes_remaining }
```

### 4. Disable MFA

**DOCUMENTED**:
```typescript
await janua.auth.mfa.disable({
  userId: user.id,
  password: 'userPassword',
  confirmationCode: '123456'
});
```

**ACTUAL**:
```typescript
await janua.auth.disableMFA('userPassword');
// Only password needed for confirmation
// No userId or confirmationCode parameters
```

### 5. Generate/Regenerate Backup Codes

**DOCUMENTED**:
```typescript
const backupCodes = await janua.auth.mfa.generateBackupCodes({
  userId: user.id,
  count: 10
});
```

**ACTUAL**:
```typescript
const backupCodes = await janua.auth.regenerateMFABackupCodes('userPassword');
// Returns fixed number of codes (usually 8-10)
// Requires password for security
// No count parameter
```

### 6. WebAuthn/Passkey Methods

**DOCUMENTED** (WRONG):
```typescript
// Documented as nested under mfa.webauthn:
const challenge = await janua.auth.mfa.webauthn.generateChallenge({
  userId: user.id,
  type: 'platform'
});

const verification = await janua.auth.mfa.webauthn.verify({
  challengeId: challenge.id,
  credential: publicKeyCredential
});
```

**ACTUAL** (CORRECT):
```typescript
// Passkey methods are directly on auth:
const options = await janua.auth.getPasskeyRegistrationOptions({
  authenticator_attachment: 'platform'  // optional
});

const verified = await janua.auth.verifyPasskeyRegistration(
  credential,
  'My Passkey'  // optional name
);

// For authentication:
const authOptions = await janua.auth.getPasskeyAuthenticationOptions(email);
const authResult = await janua.auth.verifyPasskeyAuthentication(
  credential,
  challenge,
  email
);
```

---

## Additional Methods (Not Documented but Available)

These bonus methods exist in the SDK but aren't documented:

```typescript
// MFA Recovery
await janua.auth.validateMFACode(code);
await janua.auth.getMFARecoveryOptions(email);
await janua.auth.initiateMFARecovery(email);

// Passkey Management
await janua.auth.checkPasskeyAvailability();
await janua.auth.listPasskeys();
await janua.auth.updatePasskey(passkeyId, newName);
await janua.auth.deletePasskey(passkeyId, password);
await janua.auth.regeneratePasskeySecret(passkeyId);
```

---

## Search & Replace Guide

For updating the MFA guide, use these regex patterns:

### Pattern 1: Basic namespace change
```regex
janua\.auth\.mfa\.
→
janua.auth.
```

### Pattern 2: Method renames
```regex
janua\.auth\.mfa\.setup\(
→
janua.auth.enableMFA(

janua\.auth\.mfa\.verify\(
→
janua.auth.verifyMFA(

janua\.auth\.mfa\.getStatus\(
→
janua.auth.getMFAStatus(

janua\.auth\.mfa\.disable\(
→
janua.auth.disableMFA(

janua\.auth\.mfa\.generateBackupCodes\(
→
janua.auth.regenerateMFABackupCodes(
```

### Pattern 3: Remove userId parameters
```regex
\{\s*userId:\s*[^,}]+,\s*
→
{

\{\s*userId:\s*[^}]+\}
→
()
```

### Pattern 4: WebAuthn namespace
```regex
janua\.auth\.mfa\.webauthn\.
→
janua.auth.
```

---

## Parameter Structure Changes

### Old Structure (Documented)
Most methods used object parameters with explicit userId:
```typescript
{ userId, method, code }
```

### New Structure (Actual)
Methods use authenticated user context, simpler params:
```typescript
(method)  // for enableMFA
{ code }  // for verifyMFA
()        // for getMFAStatus
(password) // for disableMFA
```

---

## Testing Changes

After updating documentation, verify:

1. ✅ All code examples compile without TypeScript errors
2. ✅ Method signatures match SDK implementation
3. ✅ No references to non-existent methods (challenge, requestNewCode, verifySetup)
4. ✅ No nested mfa.* or mfa.webauthn.* namespaces remain
5. ✅ Parameter structures match actual SDK requirements

---

**Status**: Ready for MFA guide rewrite  
**Next Step**: Apply systematic replacements to apps/docs/content/guides/authentication/mfa.md
