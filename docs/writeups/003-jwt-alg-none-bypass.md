# JWT Authentication Bypass (alg:none)

**Target:** VulnAPI-Lab (Educational API Security Lab)

## Summary

The application accepts JSON Web Tokens using the `alg: none` algorithm, allowing an attacker to forge authentication tokens without knowing the server's secret key.

## Vulnerability Type

* Broken Authentication
* CWE-347: Improper Verification of Cryptographic Signature

## Severity

**Critical (CVSS v3.1: 9.8)**

## Root Cause

The server decodes JWTs without enforcing signature verification and trusts tokens using the insecure `alg:none` algorithm.

## Proof of Concept

Forged JWT payload:

```json
{
  "id": 1,
  "username": "admin",
  "role": "admin"
}
```

By creating a token with `alg:none`, an attacker can access administrator-only functionality.

## Impact

* Complete authentication bypass
* Privilege escalation
* Administrative access
* Unauthorized modification of application data

## Mitigation

* Reject `alg:none`.
* Always verify JWT signatures.
* Explicitly whitelist approved algorithms (e.g., HS256).
* Rotate signing secrets when compromise is suspected.

## Educational Note

This vulnerability exists intentionally within **VulnAPI-Lab** for educational purposes and should never be deployed in production systems.
