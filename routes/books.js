const express = require("express");
const db = require("../db");

const router = express.Router();

// GET /api/books  — public catalog
router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM books").all());
});

// GET /api/books/:id
router.get("/:id", (req, res) => {
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
  if (!book) return res.status(404).json({ error: "Not found" });
  res.json(book);
});

module.exports = router;
