/**
 * passwordGenerator.js
 *
 * Generates a cryptographically random, strong temporary password.
 * Uses window.crypto.getRandomValues for better randomness than Math.random().
 *
 * Password composition (default 14 chars):
 *   - At least 1 uppercase letter
 *   - At least 1 lowercase letter
 *   - At least 2 digits
 *   - At least 1 special character
 *   - Remaining positions filled from the full charset
 */

const UPPERCASE   = 'ABCDEFGHJKLMNPQRSTUVWXYZ';   // removed I, O (ambiguous)
const LOWERCASE   = 'abcdefghjkmnpqrstuvwxyz';     // removed i, l, o (ambiguous)
const DIGITS      = '23456789';                     // removed 0, 1 (ambiguous)
const SPECIAL     = '!@#$%&*_+?';
const ALL         = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

/**
 * Returns a random integer in [0, max) using crypto.getRandomValues.
 * @param {number} max
 * @returns {number}
 */
function secureRandInt(max) {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] % max;
}

/**
 * Picks a random character from a string.
 * @param {string} charset
 * @returns {string}
 */
function pick(charset) {
  return charset[secureRandInt(charset.length)];
}

/**
 * Fisher-Yates shuffle for an array, using crypto-secure randomness.
 * @param {string[]} arr
 * @returns {string[]}
 */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Generates a strong temporary password.
 *
 * @param {number} [length=14] - Total password length (minimum 8).
 * @returns {string} A randomly generated password string.
 */
export function generatePassword(length = 14) {
  const safeLength = Math.max(length, 8);

  // Guarantee at least one of each required type
  const mandatory = [
    pick(UPPERCASE),
    pick(LOWERCASE),
    pick(DIGITS),
    pick(DIGITS),
    pick(SPECIAL),
  ];

  // Fill remaining positions from the full charset
  const remaining = Array.from(
    { length: safeLength - mandatory.length },
    () => pick(ALL)
  );

  // Shuffle all characters so mandatory ones don't cluster at the start
  return shuffle([...mandatory, ...remaining]).join('');
}
