/**
 * JD Parser Service
 *
 * Parses a Job Description text and extracts required skills using the
 * predefined skill dictionary. Pure, synchronous function – suitable for
 * pre-caching on server startup.
 *
 * Time Complexity : O(N × M) — same as resume parser
 * Space Complexity: O(M)
 */

const cleanText = require("../utils/text.cleaner");
const skillDictionary = require("../utils/skill.dictionary");

/**
 * @param {string} jdText  – raw JD description string
 * @param {string} jobId   – unique identifier for the job
 * @returns {{ jobId: string, requiredSkills: string[] }}
 */
function parseJD(jdText, jobId) {
  const text = cleanText(jdText);

  const requiredSkills = skillDictionary.filter(skill =>
    text.includes(skill)
  );

  return {
    jobId,
    requiredSkills
  };
}

module.exports = parseJD;
