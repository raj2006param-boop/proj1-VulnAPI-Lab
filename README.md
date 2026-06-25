```markdown
# Security Research & Education Portfolio

> Two projects. One goal: understand offensive security by doing it — legally, ethically, and thoroughly.

---

## Projects

| Project | What it is |
|---------|-----------|
| [VulnAPI-Lab](#vulnapi-lab) | Deliberately broken bookstore REST API — exploit 5 OWASP API Top 10 vulnerabilities hands-on |
| [EthicalHack.dev](#ethicalhackdev) | Static education site — XSS, SQLi, RCE, JWT attacks, CBSE breach case study, CERT-In advisory |

---

# VulnAPI-Lab

> A fake bookstore API with **5 deliberately coded vulnerabilities**. Each one has the broken code, the exploit, the fix, and an explanation of why the fix works — all in the same repo.

## Setup

```bash
# Requires Node.js 18+
npm install

# Run vulnerable server (port 3000)
VULN_MODE=true node server.js

# Run hardened server side-by-side (port 3001)
PORT=3001 VULN_MODE=false node server.js
```

### Docker (recommended — runs both versions at once)

```bash
docker compose up
# Vulnerable  → http://localhost:3000
# Hardened    → http://localhost:3001
```

---

## Seed Accounts

| Username | Password     | Role  |
|----------|-------------|-------|
| alice    | alice123    | user  |
| bob      | bob123      | user  |
| admin    | supersecret | admin |

---

## The 5 Vulnerabilities

### API1 — BOLA (Broken Object Level Authorization)
**File:** `routes/orders.js` → `GET /api/orders/:id`

Alice is logged in. She owns order 1. She requests `/api/orders/2` — Bob's order. The server never checks `order.user_id === req.user.sub`. She gets Bob's data.

```bash
bash exploits/01_bola.sh
```

**Fix:** After fetching the row, assert ownership before responding.

---

### API5 — Broken Function-Level Authorization
**File:** `routes/admin.js` → `GET /api/admin/users`

The endpoint requires a valid JWT but does **not** check that the caller is an admin. Any regular user can dump the full user table.

```bash
bash exploits/02_broken_func_auth.sh
```

**Fix:** Chain `requireAdmin` middleware after `requireAuth` on every sensitive route. Don't assume a route is protected just because it has "admin" in the URL.

---

### API2 — JWT Algorithm Confusion (`alg:none` bypass)
**File:** `middleware/auth.js`

`jwt.verify(token, SECRET)` without `{ algorithms: ['HS256'] }` trusts whatever the token itself claims its algorithm is. An attacker:

1. Takes any valid JWT
2. Decodes it (base64 — no key needed)
3. Changes the payload: `"role": "admin"`
4. Changes the header: `"alg": "none"`
5. Removes the signature entirely
6. Server accepts it — the `none` algorithm means *no* signature check

```bash
bash exploits/03_jwt_none.sh
```

**Fix:** `jwt.verify(token, SECRET, { algorithms: ['HS256'] })` — one argument, completely blocks the attack.

---

### API6 — Mass Assignment
**File:** `routes/auth.js` → `POST /api/auth/register`

The register endpoint passes `req.body` straight to the INSERT including the `role` field. Send `"role":"admin"` in the JSON body and your new account is an admin.

```bash
bash exploits/04_mass_assignment.sh
```

**Fix:** Whitelist only `username`, `password`, `email` from the body. Hardcode `role = 'user'` — never accept it from client input.

---

### API4 — Rate-Limit Bypass (X-Forwarded-For Spoofing)
**File:** `routes/auth.js` + `server.js`

There is a rate limiter: 5 login attempts per IP per 60 seconds. But `app.set('trust proxy', true)` makes Express resolve `req.ip` from the `X-Forwarded-For` header. An attacker rotates that header per request — the limiter sees a new IP every time.

```bash
bash exploits/05_rate_limit_bypass.sh
```

**Fix:** Use `req.socket.remoteAddress` (the real TCP peer address) as the rate-limit key. No HTTP header can forge this.

---

## Security Testing Evidence

All vulnerabilities were reproduced in the vulnerable environment and verified using custom exploit scripts.

| Vulnerability | Exploit Script | Result |
|---|---|---|
| BOLA | `exploits/01_bola.sh` | Alice accessed Bob's order |
| Broken Function-Level Authorization | `exploits/02_broken_func_auth.sh` | User accessed admin endpoint |
| JWT alg:none | `exploits/03_jwt_none.sh` | Unsigned admin token accepted |
| Mass Assignment | `exploits/04_mass_assignment.sh` | User created admin account |
| Rate Limit Bypass | `exploits/05_rate_limit_bypass.sh` | IP rotation bypassed limiter |

## Exploit Evidence

| Vulnerability | Screenshot |
|---|---|
| BOLA | ![BOLA](screenshots/01_bola) |
| Broken Function-Level Authorization | ![Broken Auth](screenshots/02_broken_func_auth) |
| JWT alg:none | ![JWT](screenshots/03_jwt_none) |
| Mass Assignment | ![Mass Assignment](screenshots/04_mass_assignment) |
| Rate Limit Bypass | ![Rate Limit](screenshots/05_rate_limit) |

---

## Postman Collection

Import `VulnAPI_Lab.postman_collection.json` into Postman.

18 requests organised as:

| Folder | Requests |
|--------|----------|
| `0 — Setup` | Login, token capture, catalog (4) |
| `1 — BOLA` | Exploit + hardened verify (3) |
| `2 — Broken Func Auth` | Exploit + hardened verify (3) |
| `3 — JWT alg:none` | Exploit + hardened verify (2) |
| `4 — Mass Assignment` | Exploit, confirm, hardened verify (3) |
| `5 — Rate-Limit Bypass` | Baseline, bypass, hardened verify (3) |

Variables `alice_token`, `bob_token`, `eve_token` are set automatically by test scripts on the login requests.

---

## Project Structure

```
vulnapi-lab/
├── server.js                    # Express entry — VULN_MODE switch
├── db.js                        # SQLite in-memory + seed data
├── middleware/auth.js           # JWT verify (vuln + fix side by side)
├── routes/
│   ├── auth.js                  # login, register (Mass Assignment, Rate Limit)
│   ├── books.js                 # public catalog
│   ├── orders.js                # BOLA vulnerability
│   └── admin.js                 # Broken Function-Level Auth
├── exploits/
│   ├── 01_bola.sh
│   ├── 02_broken_func_auth.sh
│   ├── 03_jwt_none.sh           # includes inline Python JWT forger
│   ├── 04_mass_assignment.sh
│   └── 05_rate_limit_bypass.sh
├── VulnAPI_Lab.postman_collection.json
├── Dockerfile
└── docker-compose.yml
```

## Tools Used

`Node.js` `Express` `SQLite` `JWT` `Bash` `cURL` `Postman` `Docker` `Git`

---

## Learning Path

1. Start the vulnerable server
2. Hit `GET /` — read the vulnerability list
3. Run each exploit script in order — read the comments as you go
4. Stop the server, start the hardened server (`VULN_MODE=false`)
5. Run the same exploits — confirm each one is blocked
6. Read the diff between vulnerable and fixed code in each file

> The fix is always 1–3 lines. The vulnerability is always 1 wrong assumption.

## Attack Flow

```
Authenticate as normal user
        ↓
  Obtain JWT token
        ↓
Manipulate request / token / input
        ↓
Access unauthorized resources
        ↓
     Verify impact
        ↓
  Apply security fix
        ↓
 Retest to confirm mitigation
```

---

## Legal

This server is designed to be attacked. Only run it on `localhost` or in an isolated Docker network. **Do not expose it to the internet.**

---
---

# EthicalHack.dev

> A complete static website covering real-world ethical hacking techniques, the CBSE breach case study, CERT-In advisories, and responsible disclosure — built for students, bug bounty researchers, and security learners in India.

## Live Pages

| Page | Description |
|------|-------------|
| `index.html` | Home — overview of all modules |
| `level2.html` | Level 2 — XSS, IDOR, Broken Auth, Exposed API Keys |
| `level3.html` | Level 3 — SQL Injection, RCE, Auth Bypass, Data Breach |
| `cbse-case.html` | CBSE breach case study — 5 flaws, 27M records, IIT Kanpur |
| `cert-in.html` | CERT-In Advisory CIAD-2026-0031 — Adobe vulnerabilities |
| `disclose.html` | Responsible disclosure guide for Indian researchers |

---

## What's Covered

### Level 2 — Medium (CVSS 4.0–6.9)

| Topic | Details |
|-------|---------|
| **XSS** | Reflected, Stored, DOM-based — real payloads and CSP defenses |
| **IDOR** | Burp Suite fuzzing workflow, UUID IDOR, server-side ownership checks |
| **Broken Authentication** | JWT alg:none attack, credential stuffing, session fixation |
| **Exposed API Keys** | TruffleHog / GitLeaks scanning, GitHub dorks, pre-commit hooks |

### Level 3 — High / Critical (CVSS 7.0–10.0)

| Topic | Details |
|-------|---------|
| **SQL Injection** | Auth bypass, UNION dump, blind boolean & time-based, sqlmap |
| **Remote Code Execution** | SSTI (Jinja2), file upload bypass, deserialization (pickle/Java) |
| **Authentication Bypass** | JWT none alg, 2FA response manipulation, OAuth state flaw |
| **Data Breach Discovery** | Responsible handling, real bounty payout table |

### CBSE Case Study

All 5 vulnerabilities with full technical breakdown:

| # | Flaw | CWE |
|---|------|-----|
| 1 | Hardcoded master password in JS bundle | CWE-259 |
| 2 | OTP value returned in server response | CWE-602 |
| 3 | No old-password verification on reset | CWE-620 |
| 4 | SQL injection on login portal | CWE-89 |
| 5 | Public AWS S3 bucket — answer sheets & question papers | CWE-284 |

Includes: attack chain timeline, responsible disclosure actions, what made it ethical vs criminal.

### CERT-In Advisory CIAD-2026-0031

Full breakdown of the June 11, 2026 advisory on Adobe products:
- Improper input validation → RCE
- Memory corruption (use-after-free, heap overflow)
- XSS in AEM Cloud & Content Credentials SDK
- Security bypass in ColdFusion & Acrobat sandbox
- All 11 affected products with patch bulletin links

### Responsible Disclosure

- 5-step process with email template
- Day 1 / Day 7 / Day 30 / Day 90 timeline
- Official Indian contacts (CERT-In, NCIIPC, NIC CISO, CBSE IT Cell)
- Do vs Don't quick reference
- India IT Act 2000 legal context (§66, §70)

---

## Project Structure

```
ethicalhack-site/
├── index.html
├── level2.html
├── level3.html
├── cbse-case.html
├── cert-in.html
├── disclose.html
├── assets/
│   ├── css/
│   │   ├── style.css       # Full dark-theme design system
│   │   └── prism.css       # Code syntax token colours
│   └── js/
│       └── nav.js          # Nav toggle, accordions, tabs, copy buttons
└── README.md
```

---

## How to Run

Pure static site — no build step, no dependencies, no server required.

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ethicalhack-site.git
cd ethicalhack-site

# Open directly in browser
start index.html       # Windows
open index.html        # macOS
xdg-open index.html    # Linux

# Or serve locally
python -m http.server 8080
# then open http://localhost:8080
```

## Deploy to GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit — EthicalHack.dev"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ethicalhack-site.git
git push -u origin main
```

Then: **GitHub repo → Settings → Pages → Source: Deploy from branch → main / root**

Your site will be live at `https://YOUR_USERNAME.github.io/ethicalhack-site/`

---

## Reporting Real Vulnerabilities

If find a vulnerability in an Indian government portal:

| Target | Contact |
|--------|---------|
| Any Indian website | |
| NIC / gov.in portals | |
| CBSE portals | |
| Critical infrastructure |  |

---

## Legal Disclaimer

**This repository is for educational purposes only.**

All vulnerability techniques shown are for:
- Authorized penetration testing engagements
- CTF (Capture the Flag) competitions
- Registered bug bounty programs
- Security research on systems you own

Unauthorized access to computer systems is illegal under:

| Law | Penalty |
|-----|---------|
| India IT Act 2000, §66 | 3 years imprisonment + ₹5 lakh fine |
| India IT Act 2000, §70 | 10 years for protected (government) systems |
| Computer Fraud and Abuse Act (CFAA) | USA federal prosecution |
| Computer Misuse Act 1990 | UK prosecution |

> Always obtain **written authorization** before testing any system you do not own.

---

Built for educational use. No exploit tools are included. All code examples are documented from public CVEs, bug bounty disclosures, and CERT-In advisories.
```
