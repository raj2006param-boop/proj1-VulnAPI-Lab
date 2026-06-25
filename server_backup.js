const express = require("express");

const VULN = process.env.VULN_MODE !== "false";
const PORT = process.env.PORT || 3000;

const app = express();

// In a real deployment behind a reverse proxy you'd set this to 1 (or the
// number of proxies). Setting it to true makes Express trust ALL
// X-Forwarded-For headers — required to demonstrate the rate-limit bypass.
if (VULN) {
  app.set("trust proxy", true); // VULN: enables X-Forwarded-For spoofing
}

app.use(express.json());

// ── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",   require("./routes/auth"));
app.use("/api/books",  require("./routes/books"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin",  require("./routes/admin"));

// ── Mode banner ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    app: "VulnAPI-Lab — Fake Bookstore",
    mode: VULN ? "VULNERABLE (VULN_MODE=true)" : "HARDENED (VULN_MODE=false)",
    vulnerabilities: VULN ? [
      "API1 - BOLA: GET /api/orders/:id",
      "API2 - JWT alg:none bypass: any authenticated route",
      "API4 - Rate-limit bypass: POST /api/auth/login (spoof X-Forwarded-For)",
      "API5 - Broken Function-Level Auth: GET /api/admin/users",
      "API6 - Mass Assignment: POST /api/auth/register",
    ] : ["All five vulnerabilities are patched in this mode."],
    docs: "See /docs/ folder and VulnAPI_Lab.postman_collection.json",
  });
});

app.listen(PORT, () => {
  console.log(`[VulnAPI-Lab] mode=${VULN ? "VULNERABLE" : "HARDENED"} port=${PORT}`);
});

module.exports = app;
