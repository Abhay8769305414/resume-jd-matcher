/**
 * Match Controller
 *
 * Orchestrates the complete résumé-matching pipeline:
 *   1. Parse uploaded PDF résumé
 *   2. Iterate pre-cached JDs (parsed at startup — no disk I/O per request)
 *   3. Run skill analysis and score calculation per JD
 *   4. Return unified JSON response
 *
 * The `parsedJDCache` is injected by app.js to avoid repeated computation.
 */

const parseResume = require("../services/resume.parser");
const analyzeSkills = require("../services/skill.matcher");
const calculateScore = require("../services/score.calculator");

/**
 * POST /api/match
 *
 * @param {import("express").Request}  req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 * @param {Array} parsedJDCache – pre-parsed JD array injected from app.js
 */
async function matchResume(req, res, next, parsedJDCache) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No résumé file uploaded. Use field name 'resume'." });
    }

    // Step 1: Parse the résumé PDF from memory buffer
    const resumeData = await parseResume(req.file.buffer);

    // Step 2: Match against every cached JD
    const matchingJobs = parsedJDCache.map(({ jobId, role, aboutRole, requiredSkills }) => {
      const skillsAnalysis = analyzeSkills(requiredSkills, resumeData.resumeSkills);
      const matchingScore = calculateScore(requiredSkills, resumeData.resumeSkills);

      return {
        jobId,
        role,
        aboutRole,
        skillsAnalysis,
        matchingScore
      };
    });

    // Sort by score descending for better UX
    matchingJobs.sort((a, b) => b.matchingScore - a.matchingScore);

    // Step 3: Return unified response
    return res.status(200).json({
      salary: resumeData.salary,
      yearOfExperience: resumeData.yearOfExperience,
      resumeSkills: resumeData.resumeSkills,
      matchingJobs
    });
  } catch (err) {
    next(err);
  }
}

module.exports = matchResume;
