export function getSmallestNonZeroNumericString(decimal: number) {
  const d = Math.max(0, decimal); // can't be negative

  return d === 0 ? '1' : '0' + '.' + '0'.repeat(d - 1) + '1';
}
