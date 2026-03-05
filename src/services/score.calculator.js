/**
 * Score Calculator Service
 *
 * Implements the assignment formula:
 *   Matching Score = (Matched JD Skills / Total JD Skills) × 100
 *
 * Uses a Set for O(1) per-skill lookup.
 *
 * Time Complexity : O(M)   where M = number of JD skills
 * Space Complexity: O(K)   where K = number of resume skills
 * Output Range    : 0 – 100
 */

/**
 * @param {string[]} jdSkills      – required skills from parsed JD
 * @param {string[]} resumeSkills  – skills extracted from résumé
 * @returns {number} – integer score in [0, 100]
 */
function calculateScore(jdSkills, resumeSkills) {
  if (!jdSkills || jdSkills.length === 0) return 0;

  const resumeSkillSet = new Set(resumeSkills);

  const matched = jdSkills.filter(skill =>
    resumeSkillSet.has(skill)
  ).length;

  return Math.round((matched / jdSkills.length) * 100);
}

module.exports = calculateScore;
