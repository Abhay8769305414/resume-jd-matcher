/**
 * Extracts salary information from résumé text using regex patterns.
 *
 * Supported formats:
 *  - "12 LPA", "12LPA"          (Indian LPA notation)
 *  - "₹12,00,000"               (INR with commas)
 *  - "$120,000"                  (USD)
 *  - "12-15 LPA" (range)
 *
 * Time Complexity : O(n)  – single pass per pattern
 * Space Complexity: O(1)  – only the matched string is stored
 */

const salaryPatterns = [
  /\b\d+(\.\d+)?\s?[-–]?\s?\d*(\.\d+)?\s?LPA\b/i,   // 12 LPA / 12-15 LPA
  /₹\s?\d{1,3}(,\d{2,3})*(\.\d+)?/,                  // ₹12,00,000
  /\$\s?\d{1,3}(,\d{3})*(\.\d+)?/                     // $120,000
];

/**
 * @param {string} text – lowercase résumé text
 * @returns {string|null} – first salary string found, or null
 */
function extractSalary(text) {
  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return null;
}

module.exports = extractSalary;
