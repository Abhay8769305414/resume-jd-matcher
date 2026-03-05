/**
 * Extracts years of professional experience from résumé text.
 *
 * Strategy 1 – Direct mention:
 *   "4 years", "5+ years", "3.5 years of experience"
 *
 * Strategy 2 – Date range:
 *   "Jan 2018 – Present", "2017 - 2023"
 *   Calculated as: currentYear − earliestStartYear
 *
 * Returns the MAXIMUM value found across all strategies.
 *
 * Time Complexity : O(n)
 * Space Complexity: O(1)
 */

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Strategy 1: Direct numeric mention
 * @param {string} text
 * @returns {number}
 */
function extractDirectExperience(text) {
  // Matches: "4 years", "5+ years", "3.5 years"
  const regex = /(\d+(\.\d+)?)\s*\+?\s*years?\s*(of\s*(experience|exp))?/gi;
  let max = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const years = parseFloat(match[1]);
    if (years > max && years < 60) max = years; // sanity cap
  }
  return max;
}

/**
 * Strategy 2: Date range parsing
 * @param {string} text
 * @returns {number}
 */
function extractDateRangeExperience(text) {
  // Matches: "2018 – Present", "Jan 2018 – Dec 2022", "2018-2024"
  const regex = /(20\d{2})\s*[-–to]+\s*(present|current|now|20\d{2})/gi;
  let earliest = null;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const start = parseInt(match[1], 10);
    if (earliest === null || start < earliest) earliest = start;
  }
  if (earliest !== null) {
    return Math.max(0, CURRENT_YEAR - earliest);
  }
  return 0;
}

/**
 * @param {string} text – lowercase résumé text
 * @returns {number} – estimated years of experience (0 if none found)
 */
function extractExperience(text) {
  const direct = extractDirectExperience(text);
  const dateRange = extractDateRangeExperience(text);
  return Math.max(direct, dateRange);
}

module.exports = extractExperience;
