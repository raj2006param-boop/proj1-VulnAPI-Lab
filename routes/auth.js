const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit");
const db = require("../db");
const { sign } = require("../middleware/auth");

const router = express.Router();
const VULN = process.env.VULN_MODE !== "false";

// ─────────────────────────────────────────────────────────────────────────────
// VULNERABILITY 5: Rate-Limit bypass via X-Forwarded-For spoofing
//
// VULNERABLE: the rate limiter uses req.ip, which Express resolves from
// X-Forwarded-For if app.set('trust proxy', true) is set (common in Docker
// behind nginx/load balancer). An attacker rotates this header per request
// and the limiter sees a "different" IP every time — unlimited login attempts.
//
// FIX: use a key generator that reads the real socket IP, never the header.
// In production: use a shared store (Redis) so limits survive restarts.
// ─────────────────────────────────────────────────────────────────────────────
const vulnLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  // VULN: req.ip can be spoofed via X-Forwarded-For
  keyGenerator: (req) => req.ip,
  message: { error: "Too many login attempts, wait 60s" },
});

const hardenedLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  // FIX: always use the real TCP socket address — not influenced by any header
  keyGenerator: (req) => req.socket.remoteAddress,
  message: { error: "Too many login attempts, wait 60s" },
  skip: () => false,
});

// POST /api/auth/login
router.post(
  "/login",
  VULN ? vulnLimiter : hardenedLimiter,
  (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "username and password required" });
    }
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Bad credentials" });
    }
    const token = sign({ sub: user.id, username: user.username, role: user.role });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// VULNERABILITY 4: Mass Assignment
//
// VULNERABLE: spread or destructure req.body directly into the INSERT.
// An attacker sends { "username":"eve","password":"pw","role":"admin" }
// and gets an admin account for free.
//
// FIX: whitelist only the fields you intend to accept from user input.
// Never let client-controlled input touch privileged fields like role/isAdmin.
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/auth/register
router.post("/register", (req, res) => {
  let username, password, email, role;

  if (VULN) {
    // VULN: role comes straight from the request body
    ({ username, password, email, role = "user" } = req.body);
  } else {
    // FIX: whitelist — role is ALWAYS 'user', never from client
    ({ username, password, email } = req.body);
    role = "user";
  }

  if (!username || !password || !email) {
    return res.status(400).json({ error: "username, password, email required" });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 chars" });
  }

  try {
    const hashed = bcrypt.hashSync(password, 10);
    const result = db
      .prepare("INSERT INTO users (username, password, email, role) VALUES (?,?,?,?)")
      .run(username, hashed, email, role);
    const token = sign({ sub: result.lastInsertRowid, username, role });
    res.status(201).json({
      token,
      user: { id: result.lastInsertRowid, username, role },
    });
  } catch (err) {
    if (err.message.includes("UNIQUE")) {
      return res.status(409).json({ error: "Username or email already taken" });
    }
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
