const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
const VULN = process.env.VULN_MODE !== "false";

// ─────────────────────────────────────────────────────────────────────────────
// VULNERABILITY 1: BOLA — Broken Object Level Authorization  (OWASP API1)
//
// VULNERABLE: the endpoint is authenticated (you need a valid JWT) but it
// never checks that the requested order belongs to the authenticated user.
// Alice can fetch /api/orders/2 and read Bob's order — just by guessing IDs.
//
// FIX: after fetching the row, assert order.user_id === req.user.sub.
// Use the identity from the JWT, never trust a user_id from the URL/body.
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/orders/:id
router.get("/:id", requireAuth, (req, res) => {
  const order = db
    .prepare(`
      SELECT o.*, b.title, b.author
      FROM orders o
      JOIN books b ON b.id = o.book_id
      WHERE o.id = ?
    `)
    .get(req.params.id);

  if (!order) return res.status(404).json({ error: "Order not found" });

  if (!VULN) {
    // FIX: ownership check
    if (order.user_id !== req.user.sub) {
      return res.status(403).json({ error: "You do not own this order" });
    }
  }
  // VULN: skips the ownership check above — any authenticated user gets any order

  res.json(order);
});

// GET /api/orders  — list caller's own orders
router.get("/", requireAuth, (req, res) => {
  const orders = db
    .prepare(`
      SELECT o.*, b.title, b.author
      FROM orders o
      JOIN books b ON b.id = o.book_id
      WHERE o.user_id = ?
    `)
    .all(req.user.sub);
  res.json(orders);
});

// POST /api/orders
router.post("/", requireAuth, (req, res) => {
  const { book_id, quantity = 1 } = req.body;
  if (!book_id) return res.status(400).json({ error: "book_id required" });

  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(book_id);
  if (!book) return res.status(404).json({ error: "Book not found" });
  if (book.stock < quantity) return res.status(409).json({ error: "Insufficient stock" });

  const total = book.price * quantity;
  const result = db
    .prepare("INSERT INTO orders (user_id, book_id, quantity, total) VALUES (?,?,?,?)")
    .run(req.user.sub, book_id, quantity, total);

  db.prepare("UPDATE books SET stock = stock - ? WHERE id = ?").run(quantity, book_id);
  res.status(201).json({ id: result.lastInsertRowid, book_id, quantity, total });
});

module.exports = router;
