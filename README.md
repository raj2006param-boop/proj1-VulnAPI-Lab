# VulnAPI-Lab — Deliberately Broken Bookstore REST API

> Built to understand OWASP API Security Top 10 by actually exploiting it.

A fake bookstore API with **5 deliberately coded vulnerabilities**. Each one
has the broken code, the exploit, the fix, and an explanation of why the fix
works — all in the same repo.

---

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

## Seed accounts

| Username | Password     | Role  |
|----------|-------------|-------|
| alice    | alice123    | user  |
| bob      | bob123      | user  |
| admin    | supersecret | admin |

---

## The 5 Vulnerabilities

### API1 — BOLA (Broken Object Level Authorization)
**File:** `routes/orders.js` → `GET /api/orders/:id`

Alice is logged in. She owns order 1. She requests `/api/orders/2` — Bob's
order. The server never checks `order.user_id === req.user.sub`. She gets
Bob's data.

```bash
bash exploits/01_bola.sh
```

**Fix:** After fetching the row, assert ownership before responding.

---

### API5 — Broken Function-Level Authorization
**File:** `routes/admin.js` → `GET /api/admin/users`

The endpoint requires a valid JWT (you must be logged in) but does **not**
check that the caller is an admin. Any regular user can dump the full user
table.

```bash
bash exploits/02_broken_func_auth.sh
```

**Fix:** Chain `requireAdmin` middleware after `requireAuth` on every
sensitive route. Don't assume a route is protected just because it has "admin"
in the URL.

---

### API2 — JWT Algorithm Confusion (alg:none bypass)
**File:** `middleware/auth.js`

`jwt.verify(token, SECRET)` without `{ algorithms: ['HS256'] }` trusts
whatever the token itself claims its algorithm is. An attacker:

1. Takes any valid JWT.
2. Decodes it (base64 — no key needed).
3. Changes the payload: `"role": "admin"`.
4. Changes the header: `"alg": "none"`.
5. Removes the signature entirely.
6. Server accepts it — the "none" algorithm means *no* signature check.

```bash
bash exploits/03_jwt_none.sh
```

**Fix:** `jwt.verify(token, SECRET, { algorithms: ['HS256'] })`.
One argument. Completely blocks the attack.

---

### API6 — Mass Assignment
**File:** `routes/auth.js` → `POST /api/auth/register`

The register endpoint destructures `req.body` including the `role` field and
passes it straight to the INSERT. Send `"role":"admin"` in the JSON body and
your new account is an admin.

```bash
bash exploits/04_mass_assignment.sh
```

**Fix:** Whitelist only `username`, `password`, `email` from the body.
Hardcode `role = 'user'` — never accept it from client input.

---

### API4 — Rate-Limit bypass (X-Forwarded-For spoofing)
**File:** `routes/auth.js` + `server.js`

There is a rate limiter: 5 login attempts per IP per 60 seconds.
But `app.set('trust proxy', true)` makes Express resolve `req.ip` from the
`X-Forwarded-For` header. An attacker rotates that header per request —
the limiter sees a new IP every time.

```bash
bash exploits/05_rate_limit_bypass.sh
```

**Fix:** Use `req.socket.remoteAddress` (the real TCP peer address) as the
rate-limit key. No HTTP header can forge this.

---

## Postman Collection

Import `VulnAPI_Lab.postman_collection.json` into Postman.

18 requests organised as:
- `0 — Setup` (4 requests): login, token capture, catalog
- `1 — BOLA` (3): exploit + hardened verify
- `2 — Broken Func Auth` (3): exploit + hardened verify
- `3 — JWT alg:none` (2): exploit + hardened verify
- `4 — Mass Assignment` (3): exploit, confirm, hardened verify
- `5 — Rate-Limit bypass` (3): baseline, bypass, hardened verify

Variables `alice_token`, `bob_token`, `eve_token` are set automatically
by test scripts on the login requests.

---
## Tools Used
- Node.js + Express
- SQLite
- JWT
- Bash scripting
- cURL
- Postman
- Git
- Docker

## Project structure
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

## Learning path

1. Start the vulnerable server.
2. Hit `GET /` — read the vulnerability list.
3. Run each exploit script in order. Read the comments as you go.
4. Stop the server. Start the hardened server (`VULN_MODE=false`).
5. Run the same exploits — confirm each one is blocked.
6. Read the diff between the vulnerable and fixed code in each file.
   The fix is always 1-3 lines. The vulnerability is always 1 wrong assumption.

## Attack Flow

1. Authenticate as a normal user.
2. Obtain JWT token.
3. Manipulate request/token/input.
4. Access unauthorized resources.
5. Verify impact.
6. Apply security fix.
7. Retest to confirm mitigation.

## Security Testing Evidence
All vulnerabilities were reproduced in the vulnerable environment and verified using custom exploit scripts.

| Vulnerability | Exploit Script | Result |
|---|---|---|
| BOLA | exploits/01_bola.sh | Alice accessed Bob's order |
| Broken Function-Level Authorization | exploits/02_broken_func_auth.sh | User accessed admin endpoint |
| JWT alg:none | exploits/03_jwt_none.sh | Unsigned admin token accepted |
| Mass Assignment | exploits/04_mass_assignment.sh | User created admin account |
| Rate Limit Bypass | exploits/05_rate_limit_bypass.sh | IP rotation bypassed limiter |

## Legal

This server is designed to be attacked. Only run it on `localhost` or
in an isolated Docker network. Do **not** expose it to the internet.
---

## Exploit Evidence

| Vulnerability | Evidence |
|---|---|
| BOLA | ![BOLA](screenshots 01_bola) name-03.1 |
| Broken Function-Level Authorization | ![Broken Auth](screenshots 02_broken_func_auth) name-03.2|
| JWT alg:none | ![JWT](screenshots 03_jwt_none) name-03.3|
| Mass Assignment | ![Mass Assignment](screenshots 04_mass_assignment)name-03.4 |
| Rate Limit Bypass | ![Rate Limit](screenshots 05_rate_) name-03.5|
