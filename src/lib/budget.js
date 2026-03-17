/**
 * Parses a budget value into the smallest unit of USDC (6 decimals).
 *
 * @param {string | number} value - The budget value to parse.
 * @param {string} [currency='USDC'] - The currency of the budget. Currently only supports USDC.
 * @returns {bigint} The parsed budget value in the smallest unit (6 decimals).
 *
 * @example
 * // Returns 1000000n (1 USDC)
 * parseBudget('1', 'USDC')
 */
export function parseBudget(value, currency = 'USDC') {
  if (currency !== 'USDC') throw new Error('Only USDC is supported');
  const numberValue = Number(value);
  if (isNaN(numberValue)) throw new Error('Invalid number');
  return BigInt(Math.round(numberValue * 1e6));
}

/**
 * Formats a budget value from the smallest unit of USDC to a human-readable string.
 *
 * @param {bigint | string} value - The budget value to format, in the smallest unit.
 * @param {string} [currency='USDC'] - The currency of the budget. Currently only supports USDC.
 * @returns {string} The formatted budget value as a string.
 *
 * @example
 * // Returns "1.0" (1 USDC)
 * formatBudget('1000000', 'USDC')
 */
export function formatBudget(value, currency = 'USDC') {
  if (currency !== 'USDC') throw new Error('Only USDC is supported');
  const numberValue = Number(value) / 1e6;
  return numberValue.toString();
}
