/**
 * Server Entry Point
 *
 * Starts the HTTP server on the configured PORT (default: 3000).
 * Separating server.js from app.js makes the app.js easily testable
 * without side-effects (a common senior-level Node.js pattern).
 */

const app  = require("./app");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀  Resume-JD Matcher running at http://localhost:${PORT}`);
  console.log(`   POST /api/match   → upload PDF résumé`);
  console.log(`   GET  /api/skills  → list supported skills`);
  console.log(`   GET  /api/health  → liveness check`);
});
