/**
 * Skill Matcher Service
 *
 * Compares JD required skills against résumé skills using a Set
 * for O(1) per-skill lookup (vs O(n) with Array.includes).
 *
 * Time Complexity : O(M)   where M = number of JD skills
 * Space Complexity: O(K)   where K = number of resume skills
 */

/**
 * @param {string[]} jdSkills      – required skills from parsed JD
 * @param {string[]} resumeSkills  – skills extracted from résumé
 * @returns {{ skill: string, presentInResume: boolean }[]}
 */
function analyzeSkills(jdSkills, resumeSkills) {
  // Build a Set for O(1) lookup instead of O(n) includes
  const resumeSkillSet = new Set(resumeSkills);

  return jdSkills.map(skill => ({
    skill,
    presentInResume: resumeSkillSet.has(skill)
  }));
}

module.exports = analyzeSkills;
