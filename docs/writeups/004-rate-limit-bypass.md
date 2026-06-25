# Rate-Limit Bypass via X-Forwarded-For

**Target:** VulnAPI-Lab (Educational API Security Lab)

## Summary

The application trusts the client-supplied `X-Forwarded-For` header when applying login rate limits. An attacker can continuously change this header to bypass brute-force protection.

## Vulnerability Type

* OWASP API Security: Unrestricted Resource Consumption
* Security Misconfiguration

## Severity

**High (CVSS v3.1: 7.3)**

## Root Cause

The server identifies clients using the `X-Forwarded-For` HTTP header without verifying that the request actually originated from a trusted reverse proxy.

## Proof of Concept

Request:

```http
POST /api/auth/login
X-Forwarded-For: 1.1.1.1
```

Repeat the same request while changing the IP:

```http
X-Forwarded-For: 2.2.2.2
X-Forwarded-For: 3.3.3.3
X-Forwarded-For: 4.4.4.4
```

Each request bypasses the configured rate limit.

## Impact

* Unlimited password guessing
* Credential stuffing attacks
* Increased attack surface
* Authentication abuse

## Mitigation

* Trust `X-Forwarded-For` only behind a trusted reverse proxy.
* Apply server-side IP validation.
* Use account-based and IP-based rate limiting together.
* Implement CAPTCHA or MFA after repeated failures.

## Educational Note

This behavior exists intentionally in **VulnAPI-Lab** to demonstrate insecure API rate-limiting implementations for educational purposes only.

