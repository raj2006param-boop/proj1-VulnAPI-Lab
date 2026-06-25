# Stored Cross-Site Scripting (XSS)

**Target:** VulnAPI-Lab (Educational API Security Lab)

## Summary

A Stored Cross-Site Scripting (XSS) vulnerability exists in the user profile functionality. User-supplied input is stored without proper sanitization and later rendered in other users' browsers, allowing arbitrary JavaScript execution.

## Vulnerability Type

* CWE-79: Improper Neutralization of Input During Web Page Generation (Cross-site Scripting)
* OWASP Top 10: A03 – Injection

## Severity

**Medium (CVSS v3.1: 6.1)**

## Root Cause

The application stores user-controlled HTML/JavaScript without sanitization or output encoding before rendering it back to clients.

## Proof of Concept

Payload:

```html
<script>alert(document.cookie)</script>
```

When another user loads the affected page, the browser executes the injected JavaScript.

## Impact

* Session theft
* Account takeover
* Phishing
* Malicious JavaScript execution
* Credential theft

## Mitigation

* Sanitize all user input.
* Encode output before rendering.
* Use a strict Content Security Policy (CSP).
* Validate allowed HTML if rich text is required.

## Educational Note

This vulnerability was intentionally demonstrated inside **VulnAPI-Lab**, a deliberately vulnerable application created for cybersecurity education and defensive learning.
