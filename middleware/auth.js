const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "vuln-lab-secret-do-not-use-in-prod";
const VULN = process.env.VULN_MODE !== "false";

// ─────────────────────────────────────────────────────────────────────────────
// VULNERABILITY 3: JWT alg:none bypass
//
// VULNERABLE: jwt.verify() without { algorithms: [...] } accepts ANY algorithm
// the token header declares — including "none", which means NO signature check.
//
// Attack: decode any valid JWT, change payload (e.g. role→admin), set
// header.alg = "none", strip the signature, send the forged token.
// The server accepts it as authentic.
//
// FIX: always whitelist { algorithms: ['HS256'] }. The library then rejects
// any token whose header says "none" or "RS256" (algorithm confusion).
// ─────────────────────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token" });
  }
  const token = header.slice(7);
  try {
    let decoded;
    if (VULN) {
  // INTENTIONALLY VULNERABLE LAB CODE
  decoded = jwt.decode(token);
} else {
  // FIX: only HS256 is allowed
  decoded = jwt.verify(token, SECRET, { algorithms: ["HS256"] });
}
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token", detail: err.message });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Used by admin routes to enforce role
// ─────────────────────────────────────────────────────────────────────────────
function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin only" });
  }
  next();
}

function sign(payload) {
  return jwt.sign(payload, SECRET, { algorithm: "HS256", expiresIn: "2h" });
}

module.exports = { requireAuth, requireAdmin, sign };
