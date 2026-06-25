# SQL Injection Authentication Bypass

**Target:** VulnAPI-Lab (Educational API Security Lab)

## Summary

The login endpoint constructs SQL queries using unsanitized user input, allowing SQL Injection that can bypass authentication and potentially expose database contents.

## Vulnerability Type

* CWE-89: SQL Injection
* OWASP Top 10: Injection

## Severity

**Critical (CVSS v3.1: 9.8)**

## Root Cause

User-controlled input is concatenated directly into SQL statements instead of using parameterized queries.

## Proof of Concept

Example payload:

```sql
' OR '1'='1' --
```

Example login:

```text
Username: admin
Password: ' OR '1'='1' --
```

The injected SQL causes the authentication check to always evaluate as true.

## Impact

* Authentication bypass
* Database disclosure
* Data modification
* Complete database compromise

## Mitigation

* Use prepared statements (parameterized queries).
* Validate and sanitize user input.
* Apply least-privilege database permissions.
* Log and monitor suspicious SQL activity.

## Educational Note

This SQL Injection example is intentionally included in **VulnAPI-Lab** for cybersecurity education and secure coding practice. It must never be used against systems without authorization.
