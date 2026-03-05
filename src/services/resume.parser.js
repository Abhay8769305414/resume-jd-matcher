/**
 * Resume Parser Service
 *
 * Accepts a PDF file buffer, extracts raw text using pdf-parse,
 * then delegates to utility extractors for salary, experience, and skills.
 *
 * Skill matching uses a Set for O(1) deduplication.
 *
 * Time Complexity:
 *   Skill matching → O(N × M) where N = text length, M = dictionary size.
 *   Optimizable to O(N + M) via Aho-Corasick / Trie if dictionary grows large.
 *
 * Space Complexity: O(M) for the matched skill set
 */

const pdf = require("pdf-parse");
const cleanText = require("../utils/text.cleaner");
const extractSalary = require("../utils/salary.extractor");
const extractExperience = require("../utils/experience.extractor");
const skillDictionary = require("../utils/skill.dictionary");

/**
 * @param {Buffer} fileBuffer – raw PDF buffer from Multer memoryStorage
 * @returns {Promise<{salary: string|null, yearOfExperience: number, resumeSkills: string[]}>}
 */
async function parseResume(fileBuffer) {
  const data = await pdf(fileBuffer);
  const text = cleanText(data.text);

  const salary = extractSalary(text);
  const yearOfExperience = extractExperience(text);

  // Use Set for O(1) deduplication
  const skillSet = new Set();
  for (const skill of skillDictionary) {
    if (text.includes(skill)) {
      skillSet.add(skill);
    }
  }

  return {
    salary,
    yearOfExperience,
    resumeSkills: Array.from(skillSet)
  };
}

module.exports = parseResume;
