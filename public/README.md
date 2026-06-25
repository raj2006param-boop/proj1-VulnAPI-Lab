# EthicalHack.dev — Security Research & Education

A complete static website covering real-world ethical hacking techniques, the CBSE breach case study, CERT-In advisories, and responsible disclosure — built for students, bug bounty researchers, and security learners in India.

## Live Pages

| Page | Description |
|------|-------------|
| `index.html` | Home — overview of all modules |
| `level2.html` | Level 2 — XSS, IDOR, Broken Auth, Exposed API Keys |
| `level3.html` | Level 3 — SQL Injection, RCE, Auth Bypass, Data Breach |
| `cbse-case.html` | CBSE breach case study — 5 flaws, 27M records, IIT Kanpur |
| `cert-in.html` | CERT-In Advisory CIAD-2026-0031 — Adobe vulnerabilities |
| `disclose.html` | Responsible disclosure guide for Indian researchers |

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

## What's Covered

### Level 2 — Medium (CVSS 4.0–6.9)
- **XSS** — Reflected, Stored, DOM-based with real payloads and CSP defenses
- **IDOR** — Burp Suite fuzzing workflow, UUID IDOR, server-side ownership checks
- **Broken Authentication** — JWT alg:none attack, credential stuffing, session fixation
- **Exposed API Keys** — TruffleHog / GitLeaks scanning, GitHub dorks, pre-commit hooks

### Level 3 — High/Critical (CVSS 7.0–10.0)
- **SQL Injection** — Auth bypass, UNION dump, blind boolean & time-based, sqlmap
- **Remote Code Execution** — SSTI (Jinja2), file upload bypass, deserialization (pickle/Java)
- **Authentication Bypass** — JWT none alg, 2FA response manipulation, OAuth state flaw
- **Data Breach Discovery** — responsible handling, real bounty payout table

### CBSE Case Study
All 5 vulnerabilities with full technical breakdown:
1. Hardcoded master password in JS bundle (CWE-259)
2. OTP value returned in server response (CWE-602)
3. No old-password verification on reset (CWE-620)
4. SQL injection on login portal (CWE-89)
5. Public AWS S3 bucket — answer sheets & question papers (CWE-284)

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

## How to Run

This is a pure static site — no build step, no dependencies, no server required.

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/ethicalhack-site.git
cd ethicalhack-site

# Open directly in browser
start index.html          # Windows
open index.html           # macOS
xdg-open index.html       # Linux

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

Then go to: **GitHub repo → Settings → Pages → Source: Deploy from branch → main / root**

Your site will be live at `https://YOUR_USERNAME.github.io/ethicalhack-site/`

## Legal Disclaimer

**This website is for educational purposes only.**

All vulnerability techniques shown are for:
- Authorized penetration testing engagements
- CTF (Capture the Flag) competitions
- Registered bug bounty programs
- Security research on systems you own

Unauthorized access to computer systems is illegal under:
- India IT Act 2000, Section 66 — 3 years imprisonment + ₹5 lakh fine
- India IT Act 2000, Section 70 — 10 years for protected (government) systems
- Computer Fraud and Abuse Act (CFAA) — USA
- Computer Misuse Act 1990 — UK

Always obtain **written authorization** before testing any system you do not own.

## Reporting Real Vulnerabilities

If you find a vulnerability in an Indian government portal:

| Target | Contact |
|--------|---------|
| Any Indian website | incident@cert-in.org.in |
| NIC / gov.in portals | ciso-nic@nic.in |
| CBSE portals | it@cbse.gov.in |
| Critical infrastructure | info@nciipc.gov.in |

See [disclose.html](disclose.html) for the full step-by-step guide and email template.

---

Built for educational use. No exploit tools are included. All code examples are documented from public CVEs, bug bounty disclosures, and CERT-In advisories.
