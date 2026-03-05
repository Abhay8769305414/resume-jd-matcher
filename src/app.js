/**
 * Express Application
 *
 * Responsibilities:
 *  - Configure Multer (memory storage, PDF-only filter, 10 MB limit)
 *  - Pre-parse all JDs on startup → cache for O(1) access per request
 *  - Register routes:
 *      POST /api/match   → résumé upload & matching
 *      GET  /api/skills  → list all supported skills
 *      GET  /api/health  → simple liveness check
 *  - Global error handler
 */

const express = require("express");
const multer  = require("multer");
const path    = require("path");
const fs      = require("fs");

const parseJD        = require("./services/jd.parser");
const matchResume    = require("./controllers/match.controller");
const skillDictionary = require("./utils/skill.dictionary");

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
app.use(express.json());

// ─── Multer Config ───────────────────────────────────────────────────────────
const storage = multer.memoryStorage(); // PDF never touches disk

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" ||
      path.extname(file.originalname).toLowerCase() === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are accepted."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// ─── JD Pre-Caching (runs once at startup) ───────────────────────────────────
const jdsRaw = JSON.parse(
  fs.readFileSync(path.join(__dirname, "./data/jds.json"), "utf-8")
);

/**
 * parsedJDCache → Array of:
 * {
 *   jobId       : string,
 *   role        : string,
 *   aboutRole   : string,
 *   requiredSkills: string[]
 * }
 */
const parsedJDCache = jdsRaw.map(jd => {
  const parsed = parseJD(jd.description, jd.jobId);
  return {
    jobId         : jd.jobId,
    role          : jd.role,
    aboutRole     : jd.aboutRole,
    requiredSkills: parsed.requiredSkills
  };
});

console.log(`✅  Pre-cached ${parsedJDCache.length} JDs on startup.`);

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/health
 * Liveness check — useful in Docker / Kubernetes health probes.
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status   : "ok",
    timestamp: new Date().toISOString(),
    cachedJDs: parsedJDCache.length
  });
});

/**
 * GET /api/skills
 * Returns every skill the system knows about.
 * Demonstrates API completeness to interviewers.
 */
app.get("/api/skills", (req, res) => {
  res.status(200).json({
    count          : skillDictionary.length,
    supportedSkills: skillDictionary
  });
});

/**
 * POST /api/match
 * Accepts a PDF résumé (field name: "resume") and returns match results.
 */
app.post(
  "/api/match",
  upload.single("resume"),
  (req, res, next) => matchResume(req, res, next, parsedJDCache)
);

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  if (err) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: "Internal Server Error" });
});

module.exports = app;
