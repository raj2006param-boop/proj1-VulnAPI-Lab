const express = require("express");
const db = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const VULN = process.env.VULN_MODE !== "false";

// ─────────────────────────────────────────────────────────────────────────────
// VULNERABILITY 2: Broken Function-Level Authorization  (OWASP API5)
//
// VULNERABLE: requireAuth confirms the caller has a valid JWT (is logged in)
// but requireAdmin is missing — so any regular user can list all accounts,
// see password hashes, emails, and roles.
//
// FIX: chain requireAdmin after requireAuth. The check must be explicit on
// every sensitive route — "security by default" doesn't exist in Express.
// ─────────────────────────────────────────────────────────────────────────────

const adminMiddleware = VULN
  ? [requireAuth]               // VULN: missing role check
  : [requireAuth, requireAdmin]; // FIX: both checks required

// GET /api/admin/users
router.get("/users", ...adminMiddleware, (req, res) => {
  const users = db
    .prepare("SELECT id, username, email, role FROM users")
    .all();
  res.json(users);
});

// DELETE /api/admin/users/:id  (hardened only — just to show admin can do more)
router.delete("/users/:id", requireAuth, requireAdmin, (req, res) => {
  const target = parseInt(req.params.id, 10);
  if (target === req.user.sub) {
    return res.status(400).json({ error: "Cannot delete yourself" });
  }
  db.prepare("DELETE FROM users WHERE id = ?").run(target);
  res.json({ message: "User deleted" });
});

// GET /api/admin/orders  — all orders across all users
router.get("/orders", ...adminMiddleware, (req, res) => {
  const orders = db
    .prepare(`
      SELECT o.*, u.username, b.title
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN books b ON b.id = o.book_id
    `)
    .all();
  res.json(orders);
});

module.exports = router;
