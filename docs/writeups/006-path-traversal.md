# Path Traversal (Directory Traversal)

**Target:** VulnAPI-Lab (Educational API Security Lab)

## Summary

A Path Traversal vulnerability allows attackers to access files outside the intended application directory by manipulating file path parameters with traversal sequences such as `../`.

## Vulnerability Type

* CWE-22: Improper Limitation of a Pathname to a Restricted Directory ('Path Traversal')
* OWASP Top 10: Security Misconfiguration

## Severity

**High (CVSS v3.1: 7.5)**

## Root Cause

The application accepts user-controlled file paths without validating or restricting access to the intended directory, allowing traversal to arbitrary locations on the server.

## Proof of Concept

Example request:

```http
GET /download?file=../../../../etc/passwd
```

On Windows:

```http
GET /download?file=..\..\..\Windows\win.ini
```

If successful, the application returns sensitive files located outside the application's directory.

## Impact

* Disclosure of sensitive system files
* Exposure of application source code
* Leakage of configuration files and secrets
* Potential compromise of API keys, database credentials, and environment variables

## Mitigation

* Validate file names against an allowlist.
* Use secure path normalization.
* Reject any path containing `../` or `..\`.
* Restrict file access to a dedicated directory.
* Run the application with least-privilege permissions.

## Educational Note

This vulnerability is intentionally included in **VulnAPI-Lab** to demonstrate Path Traversal attacks in a safe educational environment. It is intended solely for learning secure development and defensive security practices.
