/**
 * Normalizes raw PDF-extracted text for consistent parsing.
 *
 * Operations:
 *  1. Collapse multiple whitespace / newlines into a single space
 *  2. Remove special Unicode characters that pdf-parse sometimes emits
 *  3. Convert to lowercase (for case-insensitive matching)
 *  4. Trim leading/trailing whitespace
 *
 * Time Complexity : O(n)
 * Space Complexity: O(n) – returns a new string
 */

/**
 * @param {string} rawText – raw text from pdf-parse
 * @returns {string} – normalized lowercase text
 */
function cleanText(rawText) {
  return rawText
    .replace(/[\r\n\t]+/g, " ")          // newlines / tabs → space
    .replace(/\s{2,}/g, " ")             // collapse multiple spaces
    .replace(/[^\x20-\x7E₹\u2013\u2014]/g, " ") // keep ASCII + ₹ + em/en dash
    .toLowerCase()
    .trim();
}

module.exports = cleanText;
