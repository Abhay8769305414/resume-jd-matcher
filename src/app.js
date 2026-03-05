/**
 * Express Application
 *
 * Responsibilities:
 *  - Configure Multer (memory storage, PDF-only filter, 10 MB limit)
 *  - Lazy-load JDs on first request (serverless-friendly)
 *  - Register routes:
 *      GET  /           → API info
 *      POST /api/match  → résumé upload & matching
 *      GET  /api/skills → list all supported skills
 *      GET  /api/health → simple liveness check
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

// ─── Lazy JD Loading (serverless-friendly) ────────────────────────────────────
let cachedJDs = null;

/**
 * Loads and parses JDs on first call, caches for subsequent requests.
 * Uses process.cwd() instead of __dirname for Vercel compatibility.
 */
function loadJDs() {
  if (!cachedJDs) {
    const filePath = path.join(process.cwd(), "src/data/jds.json");
    const jdsRaw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

    cachedJDs = jdsRaw.map(jd => {
      const parsed = parseJD(jd.description, jd.jobId);
      return {
        jobId         : jd.jobId,
        role          : jd.role,
        aboutRole     : jd.aboutRole,
        requiredSkills: parsed.requiredSkills
      };
    });

    console.log(`✅  Lazy-loaded ${cachedJDs.length} JDs.`);
  }
  return cachedJDs;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * GET /
 * Root endpoint — API info for Vercel discovery.
 */
app.get("/", (req, res) => {
  res.json({
    message: "Resume-JD Matcher API",
    endpoints: {
      health: "/api/health",
      skills: "/api/skills",
      match: "POST /api/match"
    }
  });
});

/**
 * GET /api/health
 * Fast liveness check — no heavy dependencies loaded.
 */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Resume-JD Matcher API running",
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/skills
 * Returns every skill the system knows about.
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
 * JDs are lazy-loaded on first call.
 */
app.post(
  "/api/match",
  upload.single("resume"),
  (req, res, next) => matchResume(req, res, next, loadJDs())
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
