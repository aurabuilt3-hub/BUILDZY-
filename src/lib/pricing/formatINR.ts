/**
 * Indian Rupee & Indian Numbering System Formatter
 * Complies with RBI / Indian standard notation: ₹12,34,567.00
 * Handles Lakhs (L) and Crores (Cr) for large construction figures.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const inrFormatterWithDecimals = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const indianNumberFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

/**
 * Format an amount in INR: e.g. 150000 -> "₹1,50,000"
 */
export function formatINR(amount: number | null | undefined, showDecimals: boolean = false): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  return showDecimals ? inrFormatterWithDecimals.format(amount) : inrFormatter.format(amount);
}

/**
 * Format a number according to the Indian numbering system without currency symbol:
 * e.g. 1500000 -> "15,00,000"
 */
export function formatIndianNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) {
    return '0';
  }
  return indianNumberFormatter.format(val);
}

/**
 * Compact Indian notation for large construction amounts:
 * e.g. 7500000 -> "₹75.0 L" or "₹0.75 Cr"
 * e.g. 15000000 -> "₹1.50 Cr"
 */
export function formatCompactINR(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₹0';
  }
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (abs >= 10000000) {
    // 1 Crore = 10,000,000
    const crores = abs / 10000000;
    return `${sign}₹${crores.toFixed(2)} Cr`;
  }
  if (abs >= 100000) {
    // 1 Lakh = 100,000
    const lakhs = abs / 100000;
    return `${sign}₹${lakhs.toFixed(2)} L`;
  }
  if (abs >= 1000) {
    // 1 Thousand = 1,000
    const thousands = abs / 1000;
    return `${sign}₹${thousands.toFixed(1)}k`;
  }
  return formatINR(amount);
}

/**
 * Standard Indian construction units display
 */
export function formatUnit(unit: string): string {
  if (!unit) return '';
  return unit
    .replace(/\bsq\s*ft\b/gi, 'sq. ft')
    .replace(/\bsqft\b/gi, 'sq. ft')
    .replace(/\brft\b/gi, 'running ft')
    .replace(/\bcft\b/gi, 'cu. ft');
}
